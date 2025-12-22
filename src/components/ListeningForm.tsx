import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Upload, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  QuestionGroup,
  QuestionType,
  GAP_FILLING_CRITERIA,
  CriteriaType,
  createListeningAudio,
  updateListeningAudio,
  ListeningAudioResponse,
} from '../lib/api-cleaned';
import { TableCompletionEditor, TableCompletionData } from './TableCompletionEditor';
import { TableCompletionEditorIndexed, IndexedTableData } from './TableCompletionEditorIndexed';
import { deserializeTableData, serializeTableData, tableDataToBackend } from '../lib/tableCompletionHelper';
import { indexedTableDataToBackend, indexedTableDataFromBackend } from '../lib/tableCompletionHelperIndexed';
import { SuccessAnimation } from './SuccessAnimation';

interface ListeningFormProps {
  questionTypes: QuestionType[];
  initialTitle?: string;
  initialAudioId?: number;
  initialAudioUrl?: string;
  initialGroups?: QuestionGroup[];
  onSave: (data: { title: string; audioFile?: File; groups: QuestionGroup[] }) => Promise<void>;
  saving: boolean;
}

export function ListeningForm({
  questionTypes,
  initialTitle = '',
  initialAudioId,
  initialAudioUrl = '',
  initialGroups = [],
  onSave,
  saving,
}: ListeningFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioId, setAudioId] = useState<number | undefined>(initialAudioId);
  const [audioUrl, setAudioUrl] = useState(initialAudioUrl);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [updatingAudio, setUpdatingAudio] = useState(false);
  const [groups, setGroups] = useState<QuestionGroup[]>(initialGroups);
  const [expandedGroups, setExpandedGroups] = useState<number[]>(initialGroups.map((_, i) => i));
  const [selectedQuestionType, setSelectedQuestionType] = useState<number | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Track original values to detect changes
  const [originalTitle, setOriginalTitle] = useState(initialTitle);
  const [originalGroups, setOriginalGroups] = useState<QuestionGroup[]>(initialGroups);

  // Sync with initial values when they change - use JSON.stringify to avoid infinite loops
  React.useEffect(() => {
    setTitle(initialTitle);
    setAudioId(initialAudioId);
    setAudioUrl(initialAudioUrl);
    setOriginalTitle(initialTitle);
    if (JSON.stringify(initialGroups) !== JSON.stringify(groups)) {
      setGroups(initialGroups);
      setExpandedGroups(initialGroups.map((_, i) => i));
      setOriginalGroups(initialGroups);
    }
  }, [initialTitle, initialAudioId, initialAudioUrl]); // Remove initialGroups from deps

  // Handle audio file selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const addQuestionGroup = (questionType: QuestionType) => {
    const newGroup: QuestionGroup = {
      question_type: questionType.type,
      from_value: 1, // Changed from 0 to 1 (minimum valid value)
      to_value: 1,   // Changed from 0 to 1 (minimum valid value)
    };

    setGroups([...groups, newGroup]);
    setExpandedGroups([...expandedGroups, groups.length]);
    setSelectedQuestionType(questionType.id);
  };

  const toggleGroupExpanded = (index: number) => {
    if (expandedGroups.includes(index)) {
      setExpandedGroups(expandedGroups.filter((i) => i !== index));
    } else {
      setExpandedGroups([...expandedGroups, index]);
    }
  };

  const updateGroup = (index: number, updates: Partial<QuestionGroup>) => {
    const updated = [...groups];
    updated[index] = { ...updated[index], ...updates };
    setGroups(updated);
  };

  const removeGroup = (index: number) => {
    setGroups(groups.filter((_, i) => i !== index));
  };
  
  // Check if form data has changed from original
  const hasChanges = () => {
    if (!initialAudioId) {
      // CREATE mode - always allow submit if form is valid
      return true;
    }
    
    // UPDATE mode - check if anything changed
    const titleChanged = title.trim() !== originalTitle.trim();
    const audioChanged = audioFile !== null; // User selected new audio
    const groupsChanged = JSON.stringify(groups) !== JSON.stringify(originalGroups);
    
    return titleChanged || audioChanged || groupsChanged;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Part sarlavhasini to\'ldiring');
      return;
    }

    if (!audioFile && !audioUrl) {
      alert('Audio faylni tanlang');
      return;
    }

    if (groups.length === 0) {
      alert('Kamida bitta savol guruhi qo\'shing');
      return;
    }

    // Validate each group's from_value and to_value
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      
      if (!group.from_value || group.from_value <= 0) {
        alert(`Guruh ${i + 1}: "Dan" qiymatini to'ldiring (1 dan katta bo'lishi kerak)`);
        return;
      }
      
      if (!group.to_value || group.to_value <= 0) {
        alert(`Guruh ${i + 1}: "Gacha" qiymatini to'ldiring (1 dan katta bo'lishi kerak)`);
        return;
      }
      
      if (group.to_value < group.from_value) {
        alert(`Guruh ${i + 1}: "Gacha" qiymati "Dan" qiymatidan katta yoki teng bo'lishi kerak`);
        return;
      }
      
      // Validate map_diagram if it's map_diagram_labeling
      if (group.question_type === 'map_diagram_labeling') {
        if (!group.map_diagram) {
          alert(`Guruh ${i + 1}: Map/Diagram ma'lumotlari to'ldirilmagan`);
          return;
        }
        if (!group.map_diagram.title || group.map_diagram.title.trim().length === 0) {
          alert(`Guruh ${i + 1}: Map/Diagram sarlavhasini to'ldiring`);
          return;
        }
        if (!group.map_diagram.image) {
          alert(`Guruh ${i + 1}: Map/Diagram rasmini yuklang`);
          return;
        }
      }
    }

    // Clean up groups before saving
    const cleanedGroups = groups.map((group, index) => {
      console.log(`\n🧹 Cleaning group ${index}:`, {
        question_type: group.question_type,
        from_value: group.from_value,
        to_value: group.to_value,
        has_map_diagram: !!group.map_diagram,
        map_diagram_title: group.map_diagram?.title,
        map_diagram_image_type: group.map_diagram?.image instanceof File ? 'File' : typeof group.map_diagram?.image,
      });
      
      const cleanedGroup = { ...group };

      if (cleanedGroup.identify_info?.question) {
        cleanedGroup.identify_info = {
          ...cleanedGroup.identify_info,
          question: cleanedGroup.identify_info.question.filter((q) => q.trim()),
        };
      }

      if (cleanedGroup.matching_item) {
        cleanedGroup.matching_item = {
          ...cleanedGroup.matching_item,
          statement: (cleanedGroup.matching_item.statement || []).filter((s) => s.trim()),
          option: (cleanedGroup.matching_item.option || []).filter((o) => o.trim()),
        };
      }

      console.log(`✅ Cleaned group ${index}:`, {
        question_type: cleanedGroup.question_type,
        from_value: cleanedGroup.from_value,
        to_value: cleanedGroup.to_value,
        has_map_diagram: !!cleanedGroup.map_diagram,
      });

      return cleanedGroup;
    });

    console.log('\n📦 Final cleaned groups before onSave:', cleanedGroups);

    await onSave({
      title: title.trim(),
      audioFile: audioFile || undefined,
      groups: cleanedGroups,
    });
    
    // Show success animation
    setShowSuccessAnimation(true);
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'form_completion': 'Form Completion',
      'note_completion': 'Note Completion',
      'table_completion': 'Table Completion',
      'sentence_completion': 'Sentence Completion',
      'multiple_choice_one': 'Multiple Choice (One answer)',
      'multiple_choice_multiple': 'Multiple Choice (Multiple answers)',
      'matching': 'Matching',
      'map_diagram_labeling': 'Map / Diagram Labelling',
      'flowchart_completion': 'Flow-chart Completion',
      'summary_completion': 'Summary Completion',
      'pick_from_list': 'Pick from a List',
    };
    return labels[type] || type;
  };

  const getQuestionTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'form_completion': 'Complete form with information',
      'note_completion': 'Complete notes with key details',
      'table_completion': 'Fill in missing table information',
      'sentence_completion': 'Complete sentences with correct words',
      'multiple_choice_one': 'Choose one correct answer',
      'multiple_choice_multiple': 'Choose multiple correct answers',
      'matching': 'Match items to categories',
      'map_diagram_labeling': 'Label map or diagram parts',
      'flowchart_completion': 'Complete flowchart steps',
      'summary_completion': 'Fill in summary gaps',
      'pick_from_list': 'Select correct options from list',
    };
    return descriptions[type] || '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Part Title */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-lg text-slate-900">Part Ma'lumotlari</h3>

        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Part Sarlavhasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Part 1 - Social Needs"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent"
          />
        </div>
      </div>

      {/* Audio Upload Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-lg text-slate-900">Audio Fayl</h3>

        {/* Current Audio Display */}
        {audioUrl && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900 mb-2">
              ✅ <strong>Audio yuklangan (ID: {audioId})</strong>
            </p>
            <audio controls className="w-full mt-2">
              <source src={audioUrl} type="audio/mpeg" />
              Brauzeringiz audio ni qo'llab-quvvatlamaydi.
            </audio>
          </div>
        )}

        {/* File Input */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Audio Faylni Tanlang <span className="text-red-500">*</span>
          </label>
          <input
            id="audio-file-input"
            type="file"
            accept="audio/*"
            onChange={handleAudioFileChange}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent"
          />
          {audioFile && (
            <p className="text-sm text-slate-600 mt-2">
              Tanlangan fayl: <strong>{audioFile.name}</strong> ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <p className="text-xs text-slate-600">
          💡 Audio fayl "Part ni Saqlash" tugmasini bosganda avtomatik yuklanadi.
        </p>
      </div>

      {/* Question Type Selection */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-slate-900">Savol Turini Tanlang</h3>
          <button
            type="button"
            onClick={() => {
              const allExpanded = groups.map((_, i) => i);
              if (expandedGroups.length === groups.length) {
                setExpandedGroups([]);
              } else {
                setExpandedGroups(allExpanded);
              }
            }}
            className="text-sm text-[#042d62] hover:underline"
          >
            {expandedGroups.length === groups.length ? 'Hammasini yopish' : 'Hammasini ochish'}
          </button>
        </div>

        {groups.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Maslahat:</strong> Bir xil savol turini bir necha marta qo'shishingiz mumkin. Har bir guruh mustaqil.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {questionTypes.map((qType) => (
            <button
              key={qType.id}
              type="button"
              onClick={() => {
                setSelectedQuestionType(qType.id);
                addQuestionGroup(qType);
              }}
              className={`group relative px-4 py-2 border rounded-lg transition-all text-sm ${
                selectedQuestionType === qType.id
                  ? 'border-[#042d62] bg-[#042d62] text-white'
                  : 'border-slate-200 hover:border-[#042d62] hover:bg-[#042d62] hover:text-white'
              }`}
              title={getQuestionTypeDescription(qType.type)}
            >
              <span className={`transition-colors ${
                selectedQuestionType === qType.id
                  ? 'text-white/70'
                  : 'text-slate-400 group-hover:text-white/70'
              }`}>
                {qType.id}.
              </span>{' '}
              <span className={`transition-colors ${
                selectedQuestionType === qType.id
                  ? 'text-white'
                  : 'text-slate-700 group-hover:text-white'
              }`}>
                {getQuestionTypeLabel(qType.type)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Added Question Groups */}
      {groups.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg text-slate-900 mb-4">Qo'shilgan Savol Guruhlari</h3>

          <div className="space-y-6">
            {groups.map((group, index) => {
              const qType = questionTypes.find((qt) => qt.type === group.question_type);
              const questionTypeName = qType?.type || group.question_type;
              const isExpanded = expandedGroups.includes(index);

              const isGapFilling = [
                'sentence_completion',
                'summary_completion',
                'table_completion',
                'flowchart_completion',
                'diagram_labeling',
                'short_answer',
              ].includes(questionTypeName);

              const isIdentifyInfo = [
                'true_false_not_given',
                'yes_no_not_given',
              ].includes(questionTypeName);

              const isMatchingItem = [
                'matching_headings',
                'matching_information',
                'matching_sentence_endings',
                'matching_features',
                'multiple_choice',
              ].includes(questionTypeName);

              const isMapDiagram = questionTypeName === 'map_diagram_labeling';

              return (
                <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroupExpanded(index)}
                    className="bg-slate-50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button type="button" className="p-1 hover:bg-slate-200 rounded transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm">
                            <strong>Guruh {index + 1}</strong>
                          </p>
                          {group.from_value > 0 && group.to_value > 0 && (
                            <span className="text-xs px-2 py-1 bg-[#042d62] text-white rounded">
                              Q{group.from_value}-{group.to_value}
                            </span>
                          )}
                          {group.question_type && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {getQuestionTypeLabel(group.question_type)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGroup(index);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Group Content */}
                  {isExpanded && (
                    <div className="p-4 bg-white space-y-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">
                          Savol Turi <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={group.question_type}
                          onChange={(e) =>
                            updateGroup(index, {
                              question_type: e.target.value,
                              gap_filling: undefined,
                              identify_info: undefined,
                              matching_item: undefined,
                            })
                          }
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                        >
                          <option value="">Tanlang...</option>
                          {questionTypes.map((qType) => (
                            <option key={qType.id} value={qType.type}>
                              {getQuestionTypeLabel(qType.type)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-700 mb-2">
                            Dan <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={group.from_value || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              // If empty or NaN, keep as is for user to type
                              // If valid number, ensure it's at least 1
                              updateGroup(index, { 
                                from_value: isNaN(value) ? 0 : Math.max(1, value) 
                              });
                            }}
                            onBlur={(e) => {
                              // On blur, ensure minimum value of 1
                              const value = parseInt(e.target.value);
                              if (isNaN(value) || value < 1) {
                                updateGroup(index, { from_value: 1 });
                              }
                            }}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                            min="1"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-700 mb-2">
                            Gacha <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={group.to_value || ''}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              // If empty or NaN, keep as is for user to type
                              // If valid number, ensure it's at least 1
                              updateGroup(index, { 
                                to_value: isNaN(value) ? 0 : Math.max(1, value) 
                              });
                            }}
                            onBlur={(e) => {
                              // On blur, ensure minimum value of 1 or from_value (whichever is greater)
                              const value = parseInt(e.target.value);
                              const minValue = Math.max(1, group.from_value || 1);
                              if (isNaN(value) || value < minValue) {
                                updateGroup(index, { to_value: minValue });
                              }
                            }}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                            min={Math.max(1, group.from_value || 1)}
                            placeholder={String(Math.max(1, group.from_value || 1))}
                          />
                        </div>
                      </div>

                      {/* Gap Filling Fields */}
                      {isGapFilling && (
                        <div className="space-y-4 pt-4 border-t border-slate-300">
                          <div>
                            <label className="block text-sm text-slate-700 mb-2">Savol Sarlavhasi</label>
                            <input
                              type="text"
                              value={group.gap_filling?.title || ''}
                              onChange={(e) =>
                                updateGroup(index, {
                                  gap_filling: {
                                    ...group.gap_filling,
                                    title: e.target.value,
                                    principle: group.gap_filling?.principle || 'NMT_TWO',
                                    body: group.gap_filling?.body || '',
                                  },
                                })
                              }
                              placeholder="Masalan: Complete the sentences"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                            />
                          </div>

                          {/* Table Completion Editor or Regular Text */}
                          {questionTypeName === 'table_completion' ? (
                            <div>
                              <label className="block text-sm text-slate-700 mb-2">Table Tuzilishi</label>
                              <TableCompletionEditor
                                data={{
                                  principle: group.table_completion?.principle || 'ONE_WORD',
                                  instruction: (group.table_completion?.table_details as any)?.instruction,
                                  rows: (group.table_completion?.table_details as any)?.rows || [],
                                  questionNumberStart: group.from_value || 1,
                                }}
                                onChange={(tableData) => {
                                  // Store full structure in table_details
                                  updateGroup(index, {
                                    table_completion: {
                                      principle: tableData.principle,
                                      table_details: {
                                        instruction: tableData.instruction,
                                        rows: tableData.rows,
                                      },
                                    } as any,
                                  });
                                }}
                                mode="edit"
                              />
                            </div>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm text-slate-700 mb-2">So'z Cheklovi</label>
                                <select
                                  value={group.gap_filling?.principle || 'NMT_TWO'}
                                  onChange={(e) =>
                                    updateGroup(index, {
                                      gap_filling: {
                                        ...group.gap_filling,
                                        title: group.gap_filling?.title || '',
                                        principle: e.target.value as CriteriaType,
                                        body: group.gap_filling?.body || '',
                                      },
                                    })
                                  }
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                >
                                  {Object.entries(GAP_FILLING_CRITERIA).map(([key, { value, label }]) => (
                                    <option key={value} value={value}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm text-slate-700 mb-2">Savol Matni</label>
                                <textarea
                                  value={group.gap_filling?.body || ''}
                                  onChange={(e) =>
                                    updateGroup(index, {
                                      gap_filling: {
                                        ...group.gap_filling,
                                        title: group.gap_filling?.title || '',
                                        principle: group.gap_filling?.principle || 'NMT_TWO',
                                        body: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="Savol matnini kiriting..."
                                  rows={4}
                                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] resize-none"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Identify Info Fields */}
                      {isIdentifyInfo && (
                        <div className="space-y-4 pt-4 border-t border-slate-300">
                          <div>
                            <label className="block text-sm text-slate-700 mb-2">Savol Sarlavhasi</label>
                            <input
                              type="text"
                              value={group.identify_info?.title || ''}
                              onChange={(e) =>
                                updateGroup(index, {
                                  identify_info: {
                                    title: e.target.value,
                                    question: group.identify_info?.question || [''],
                                  },
                                })
                              }
                              placeholder="Masalan: Do the following statements agree with..."
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm text-slate-700 mb-2">
                              Savollar (har bir qatorda bittadan)
                            </label>
                            <textarea
                              value={(group.identify_info?.question || ['']).join('\n')}
                              onChange={(e) =>
                                updateGroup(index, {
                                  identify_info: {
                                    title: group.identify_info?.title || '',
                                    question: e.target.value.split('\n'),
                                  },
                                })
                              }
                              placeholder="Har bir savolni yangi qatordan yozing..."
                              rows={6}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] resize-none"
                            />
                          </div>
                        </div>
                      )}

                      {/* Matching Item Fields */}
                      {isMatchingItem && (
                        <div className="space-y-4 pt-4 border-t border-slate-300">
                          <div>
                            <label className="block text-sm text-slate-700 mb-2">Savol Sarlavhasi</label>
                            <input
                              type="text"
                              value={group.matching_item?.title || ''}
                              onChange={(e) =>
                                updateGroup(index, {
                                  matching_item: {
                                    ...group.matching_item,
                                    title: e.target.value,
                                    statement: group.matching_item?.statement || [''],
                                    option: group.matching_item?.option || [''],
                                    variant_type: group.matching_item?.variant_type || 'letter',
                                    answer_count: group.matching_item?.answer_count || 1,
                                  },
                                })
                              }
                              placeholder="Masalan: Match each heading with..."
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-slate-700 mb-2">
                                Savollar (har qatorda bittadan)
                              </label>
                              <textarea
                                value={(group.matching_item?.statement || ['']).join('\n')}
                                onChange={(e) =>
                                  updateGroup(index, {
                                    matching_item: {
                                      ...group.matching_item,
                                      title: group.matching_item?.title || '',
                                      statement: e.target.value.split('\n').filter((s) => s.trim()),
                                      option: group.matching_item?.option || [''],
                                      variant_type: group.matching_item?.variant_type || 'letter',
                                      answer_count: group.matching_item?.answer_count || 1,
                                    },
                                  })
                                }
                                placeholder="1. First statement&#10;2. Second statement"
                                rows={5}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] resize-none"
                              />
                            </div>

                            <div>
                              <label className="block text-sm text-slate-700 mb-2">
                                Variantlar (har qatorda bittadan)
                              </label>
                              <textarea
                                value={(group.matching_item?.option || ['']).join('\n')}
                                onChange={(e) =>
                                  updateGroup(index, {
                                    matching_item: {
                                      ...group.matching_item,
                                      title: group.matching_item?.title || '',
                                      statement: group.matching_item?.statement || [''],
                                      option: e.target.value.split('\n').filter((o) => o.trim()),
                                      variant_type: group.matching_item?.variant_type || 'letter',
                                      answer_count: group.matching_item?.answer_count || 1,
                                    },
                                  })
                                }
                                placeholder="A. First option&#10;B. Second option"
                                rows={5}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] resize-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-slate-700 mb-2">Variant Turi</label>
                              <select
                                value={group.matching_item?.variant_type || 'letter'}
                                onChange={(e) =>
                                  updateGroup(index, {
                                    matching_item: {
                                      ...group.matching_item,
                                      title: group.matching_item?.title || '',
                                      statement: group.matching_item?.statement || [''],
                                      option: group.matching_item?.option || [''],
                                      variant_type: e.target.value as any,
                                      answer_count: group.matching_item?.answer_count || 1,
                                    },
                                  })
                                }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                              >
                                <option value="letter">Alifbo (A, B, C)</option>
                                <option value="romain">Rim raqamlari (I, II, III)</option>
                                <option value="number">Raqamlar (1, 2, 3)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm text-slate-700 mb-2">Javoblar Soni</label>
                              <input
                                type="number"
                                value={group.matching_item?.answer_count || 1}
                                onChange={(e) =>
                                  updateGroup(index, {
                                    matching_item: {
                                      ...group.matching_item,
                                      title: group.matching_item?.title || '',
                                      statement: group.matching_item?.statement || [''],
                                      option: group.matching_item?.option || [''],
                                      variant_type: group.matching_item?.variant_type || 'letter',
                                      answer_count: parseInt(e.target.value) || 1,
                                    },
                                  })
                                }
                                min="1"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Map Diagram Labeling Fields */}
                      {isMapDiagram && (
                        <div className="space-y-4 pt-4 border-t border-slate-300">
                          <div>
                            <label className="block text-sm text-slate-700 mb-2">
                              Sarlavha <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={group.map_diagram?.title || ''}
                              onChange={(e) =>
                                updateGroup(index, {
                                  map_diagram: {
                                    title: e.target.value,
                                    image: group.map_diagram?.image || '',
                                  },
                                })
                              }
                              placeholder="Masalan: Label the following map..."
                              maxLength={25}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                            />
                            <p className="text-xs text-slate-500 mt-1">Maksimal 25 ta belgi</p>
                          </div>

                          <div>
                            <label className="block text-sm text-slate-700 mb-2">
                              Map/Diagram Rasmi <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-3">
                              {group.map_diagram?.image && (
                                <div className="relative border-2 border-slate-300 rounded-xl overflow-hidden shadow-md">
                                  <img
                                    src={typeof group.map_diagram.image === 'string' ? group.map_diagram.image : URL.createObjectURL(group.map_diagram.image)}
                                    alt="Map/Diagram"
                                    className="w-full max-h-96 object-contain bg-slate-50"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateGroup(index, {
                                        map_diagram: {
                                          title: group.map_diagram?.title || '',
                                          image: '',
                                        },
                                      })
                                    }
                                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                              
                              {!group.map_diagram?.image && (
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                                  <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-slate-500" />
                                  </div>
                                  <p className="text-slate-600 mb-4">Rasm yuklang</p>
                                  <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] cursor-pointer transition-all shadow-md hover:shadow-lg">
                                    <Upload className="w-4 h-4" />
                                    Fayl Tanlash
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          updateGroup(index, {
                                            map_diagram: {
                                              title: group.map_diagram?.title || '',
                                              image: file,
                                            },
                                          });
                                        }
                                      }}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !hasChanges()}
          className="flex items-center gap-3 px-8 py-3.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Saqlanmoqda...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">{initialAudioId ? 'Yangilash' : 'Saqlash'}</span>
            </>
          )}
        </button>
      </div>

      {/* Success Animation */}
      <SuccessAnimation 
        show={showSuccessAnimation}
        onClose={() => setShowSuccessAnimation(false)}
        title={initialAudioId ? "Muvaffaqiyatli yangilandi!" : "Muvaffaqiyatli saqlandi!"}
        message={`Listening part muvaffaqiyatli ${initialAudioId ? 'yangilandi' : 'saqlandi'}`}
      />
    </div>
  );
}