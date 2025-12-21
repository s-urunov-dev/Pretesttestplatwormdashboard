import { useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import {
  QuestionGroup,
  GAP_FILLING_CRITERIA,
  bulkCreateReadingPassages,
  createReading,
  getTestDetail,
  PassageType,
  CriteriaType,
  VariantType
} from '../lib/api';

interface PassageData {
  title: string;
  body: string;
  groups: QuestionGroup[];
}

interface BulkReadingFormProps {
  testId?: number;
  onSubmit?: () => void;
  onBack?: () => void;
}

export function BulkReadingForm({ testId, onSubmit, onBack }: BulkReadingFormProps) {
  const [passages, setPassages] = useState<PassageData[]>([
    { title: '', body: '', groups: [] },
    { title: '', body: '', groups: [] },
    { title: '', body: '', groups: [] },
  ]);
  const [expandedPassages, setExpandedPassages] = useState<number[]>([0]);
  const [expandedGroups, setExpandedGroups] = useState<Record<number, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question type to field mapping
  const questionTypeToField: Record<string, 'gap_filling' | 'identify_info' | 'matching_item'> = {
    // Gap-filling types
    sentence_completion: 'gap_filling',
    summary_completion: 'gap_filling',
    table_completion: 'gap_filling',
    flowchart_completion: 'gap_filling',
    diagram_labeling: 'gap_filling',
    short_answer: 'gap_filling',
    
    // Identifying types
    true_false_not_given: 'identify_info',
    yes_no_not_given: 'identify_info',
    
    // Matching types
    matching_headings: 'matching_item',
    matching_information: 'matching_item',
    matching_sentence_endings: 'matching_item',
    matching_features: 'matching_item',
    multiple_choice: 'matching_item',
  };

  // Reading question types
  const readingQuestionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'true_false_not_given', label: 'True / False / Not Given' },
    { value: 'yes_no_not_given', label: 'Yes / No / Not Given' },
    { value: 'matching_headings', label: 'Matching Headings' },
    { value: 'matching_information', label: 'Matching Information' },
    { value: 'matching_sentence_endings', label: 'Matching Sentence Endings' },
    { value: 'matching_features', label: 'Matching Features' },
    { value: 'sentence_completion', label: 'Sentence Completion' },
    { value: 'summary_completion', label: 'Summary Completion' },
    { value: 'table_completion', label: 'Table Completion' },
    { value: 'flowchart_completion', label: 'Flow-chart Completion' },
    { value: 'diagram_labeling', label: 'Diagram Labelling' },
    { value: 'short_answer', label: 'Short Answer Questions' },
  ];

  const togglePassageExpanded = (index: number) => {
    if (expandedPassages.includes(index)) {
      setExpandedPassages(expandedPassages.filter(i => i !== index));
    } else {
      setExpandedPassages([...expandedPassages, index]);
    }
  };

  const toggleGroupExpanded = (passageIndex: number, groupIndex: string) => {
    const key = passageIndex;
    const currentGroups = expandedGroups[key] || [];
    
    if (currentGroups.includes(groupIndex)) {
      setExpandedGroups({
        ...expandedGroups,
        [key]: currentGroups.filter(g => g !== groupIndex),
      });
    } else {
      setExpandedGroups({
        ...expandedGroups,
        [key]: [...currentGroups, groupIndex],
      });
    }
  };

  const updatePassage = (index: number, updates: Partial<PassageData>) => {
    const updated = [...passages];
    updated[index] = { ...updated[index], ...updates };
    setPassages(updated);
  };

  const addQuestionGroup = (passageIndex: number) => {
    const updated = [...passages];
    updated[passageIndex].groups.push({
      question_type: '',
      from_value: 0,
      to_value: 0,
    });
    setPassages(updated);

    // Expand the new group
    const key = passageIndex;
    const groupIndex = (updated[passageIndex].groups.length - 1).toString();
    const currentGroups = expandedGroups[key] || [];
    setExpandedGroups({
      ...expandedGroups,
      [key]: [...currentGroups, groupIndex],
    });
  };

  const removeQuestionGroup = (passageIndex: number, groupIndex: number) => {
    const updated = [...passages];
    updated[passageIndex].groups = updated[passageIndex].groups.filter((_, i) => i !== groupIndex);
    setPassages(updated);
  };

  const updateQuestionGroup = (passageIndex: number, groupIndex: number, updates: Partial<QuestionGroup>) => {
    const updated = [...passages];
    updated[passageIndex].groups[groupIndex] = { 
      ...updated[passageIndex].groups[groupIndex], 
      ...updates 
    };
    setPassages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (let i = 0; i < passages.length; i++) {
      const passage = passages[i];
      if (!passage.title || !passage.body) {
        alert(`Iltimos, Passage ${i + 1} uchun barcha majburiy maydonlarni to'ldiring`);
        return;
      }

      if (passage.groups.length === 0) {
        alert(`Passage ${i + 1} uchun kamida 1 ta savol guruhi qo'shing`);
        return;
      }

      for (const group of passage.groups) {
        if (!group.question_type || group.from_value === 0 || group.to_value === 0) {
          alert(`Passage ${i + 1}: Barcha savol guruhlarini to'ldiring`);
          return;
        }
      }
    }

    if (!testId) {
      alert('Test ID mavjud emas. Iltimos, avval test yarating.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get test details to check if reading section already exists
      const testDetail = await getTestDetail(testId);
      
      let readingId: number;
      
      // Extract reading ID from test detail
      if (testDetail.reading) {
        readingId = testDetail.reading;
        console.log('✅ Reading section already exists:', readingId);
      } else {
        // Create reading section if it doesn't exist
        const readingSection = await createReading(testId);
        readingId = readingSection.id;
        console.log('✅ Created new reading section:', readingId);
      }

      // Prepare bulk create payload
      const payload = {
        reading_id: readingId,
        passages: passages.map((passage, index) => ({
          passage_type: `passage${index + 1}` as PassageType,
          title: passage.title,
          body: passage.body,
          groups: passage.groups,
        })),
      };

      console.log('📤 Sending bulk reading passages:', JSON.stringify(payload, null, 2));

      // Bulk create all passages
      await bulkCreateReadingPassages(payload);

      alert('Barcha reading passages muvaffaqiyatli yaratildi!');
      onSubmit?.();
    } catch (error) {
      console.error('Error creating reading passages:', error);
      alert(`Xatolik yuz berdi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGroupFields = (passageIndex: number, groupIndex: number, group: QuestionGroup) => {
    const fieldType = questionTypeToField[group.question_type];

    if (fieldType === 'gap_filling') {
      return (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-slate-700 mb-2">
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={group.gap_filling?.title || ''}
              onChange={(e) => updateQuestionGroup(passageIndex, groupIndex, {
                gap_filling: {
                  title: e.target.value,
                  principle: group.gap_filling?.principle || 'NMT_TWO',
                  body: group.gap_filling?.body || '',
                }
              })}
              placeholder="Masalan: Assessing mindfulness"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Javob Formati (Principle) <span className="text-red-500">*</span>
            </label>
            <select
              value={group.gap_filling?.principle || ''}
              onChange={(e) => {
                updateQuestionGroup(passageIndex, groupIndex, {
                  gap_filling: {
                    title: group.gap_filling?.title || '',
                    principle: e.target.value as CriteriaType,
                    body: group.gap_filling?.body || '',
                  }
                });
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
              required
            >
              <option value="">Tanlang...</option>
              {Object.entries(GAP_FILLING_CRITERIA).map(([key, { value, label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Matn (bo&apos;sh joylar uchun raqamlarni qavs ichida yozing) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={group.gap_filling?.body || ''}
              onChange={(e) => updateQuestionGroup(passageIndex, groupIndex, {
                gap_filling: {
                  title: group.gap_filling?.title || '',
                  principle: group.gap_filling?.principle || 'NMT_TWO',
                  body: e.target.value,
                }
              })}
              placeholder="Mindfulness has been proven to have a positive impact on people's wellbeing. One study in 2013 showed patients responding positively to (7) involving mindfulness..."
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Bo&apos;sh joylarni (7), (8), (9) kabi raqamlar bilan belgilang
            </p>
          </div>
        </div>
      );
    }

    if (fieldType === 'identify_info') {
      return (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-slate-700 mb-2">
              Ko&apos;rsatma <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={group.identify_info?.title || ''}
              onChange={(e) => updateQuestionGroup(passageIndex, groupIndex, {
                identify_info: {
                  title: e.target.value,
                  question: group.identify_info?.question || [],
                }
              })}
              placeholder="Choose TRUE if the statement agrees with the information..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Savollar (har bir qator alohida savol) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={(group.identify_info?.question || []).join('\n')}
              onChange={(e) => {
                const questions = e.target.value.split('\n').filter(q => q.trim());
                updateQuestionGroup(passageIndex, groupIndex, {
                  identify_info: {
                    title: group.identify_info?.title || '',
                    question: questions,
                  }
                });
              }}
              placeholder="Mindfulness is a relatively new topic of study.&#10;The original practice of mindfulness differed from its current application.&#10;Jon Kabat-Zinn came from a religious background."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Har bir savolni yangi qatordan kiriting
            </p>
          </div>
        </div>
      );
    }

    if (fieldType === 'matching_item') {
      return (
        <div className="space-y-4 border-t pt-4">
          <div>
            <label className="block text-slate-700 mb-2">
              Sarlavha <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={group.matching_item?.title || ''}
              onChange={(e) => updateQuestionGroup(passageIndex, groupIndex, {
                matching_item: {
                  title: e.target.value,
                  statement: group.matching_item?.statement || [],
                  option: group.matching_item?.option || [],
                  variant_type: group.matching_item?.variant_type || 'letter',
                  answer_count: group.matching_item?.answer_count || 1,
                }
              })}
              placeholder="Masalan: Match the headings"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Statements / Questions (har bir qator alohida) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={(group.matching_item?.statement || []).join('\n')}
              onChange={(e) => {
                const statements = e.target.value.split('\n').filter(s => s.trim());
                updateQuestionGroup(passageIndex, groupIndex, {
                  matching_item: {
                    title: group.matching_item?.title || '',
                    statement: statements,
                    option: group.matching_item?.option || [],
                    variant_type: group.matching_item?.variant_type || 'letter',
                    answer_count: group.matching_item?.answer_count || 1,
                  }
                });
              }}
              placeholder="Statement A&#10;Statement B&#10;Statement C"
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-2">
              Options / Choices (har bir qator alohida) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={(group.matching_item?.option || []).join('\n')}
              onChange={(e) => {
                const options = e.target.value.split('\n').filter(o => o.trim());
                updateQuestionGroup(passageIndex, groupIndex, {
                  matching_item: {
                    title: group.matching_item?.title || '',
                    statement: group.matching_item?.statement || [],
                    option: options,
                    variant_type: group.matching_item?.variant_type || 'letter',
                    answer_count: group.matching_item?.answer_count || 1,
                  }
                });
              }}
              placeholder="Heading 1&#10;Heading 2&#10;Heading 3&#10;Heading 4"
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-2">
                Variant Type <span className="text-red-500">*</span>
              </label>
              <select
                value={group.matching_item?.variant_type || 'letter'}
                onChange={(e) => {
                  updateQuestionGroup(passageIndex, groupIndex, {
                    matching_item: {
                      title: group.matching_item?.title || '',
                      statement: group.matching_item?.statement || [],
                      option: group.matching_item?.option || [],
                      variant_type: e.target.value as VariantType,
                      answer_count: group.matching_item?.answer_count || 1,
                    }
                  });
                }}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                required
              >
                <option value="letter">Letter (A, B, C...)</option>
                <option value="number">Number (1, 2, 3...)</option>
                <option value="romain">Roman (I, II, III...)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 mb-2">
                Answer Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={group.matching_item?.answer_count || 1}
                onChange={(e) => updateQuestionGroup(passageIndex, groupIndex, {
                  matching_item: {
                    title: group.matching_item?.title || '',
                    statement: group.matching_item?.statement || [],
                    option: group.matching_item?.option || [],
                    variant_type: group.matching_item?.variant_type || 'letter',
                    answer_count: parseInt(e.target.value) || 1,
                  }
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                required
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Info Box */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 mb-2">
            💡 <strong>3 ta passage birga yaratiladi:</strong>
          </p>
          <p className="text-sm text-blue-700 mb-1">
            • Har bir passage uchun alohida title, matn va savol guruhlari
          </p>
          <p className="text-sm text-blue-700">
            • Submit bosganda barcha passages bir vaqtda yuboriladi
          </p>
        </div>

        {/* Passages */}
        {passages.map((passage, pIndex) => {
          const isPassageExpanded = expandedPassages.includes(pIndex);
          const passageGroups = expandedGroups[pIndex] || [];

          return (
            <div
              key={pIndex}
              className="border-2 border-slate-200 rounded-xl overflow-hidden"
            >
              {/* Passage Header */}
              <div 
                className="bg-gradient-to-r from-[#042d62] to-[#053a75] p-5 flex items-center justify-between cursor-pointer"
                onClick={() => togglePassageExpanded(pIndex)}
              >
                <div className="flex items-center gap-3 text-white">
                  <button
                    type="button"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {isPassageExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <div>
                    <h3 className="font-bold">Passage {pIndex + 1}</h3>
                    {passage.title && (
                      <p className="text-sm text-blue-100">{passage.title}</p>
                    )}
                  </div>
                </div>
                <div className="text-white text-sm">
                  {passage.groups.length} guruh
                </div>
              </div>

              {/* Passage Content */}
              {isPassageExpanded && (
                <div className="p-5 bg-white space-y-4">
                  {/* Passage Title */}
                  <div>
                    <label className="block text-slate-700 mb-2">
                      Passage Sarlavhasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={passage.title}
                      onChange={(e) => updatePassage(pIndex, { title: e.target.value })}
                      placeholder="Masalan: Climate Change and Its Effects"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                      required
                    />
                  </div>

                  {/* Passage Text */}
                  <div>
                    <label className="block text-slate-700 mb-2">
                      Passage Matni <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={passage.body}
                      onChange={(e) => updatePassage(pIndex, { body: e.target.value })}
                      placeholder="Passage matnini kiriting..."
                      rows={12}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none"
                      required
                    />
                  </div>

                  {/* Question Groups */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-slate-900">Savol Guruhlari</h4>
                      <button
                        type="button"
                        onClick={() => addQuestionGroup(pIndex)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Guruh Qo&apos;shish
                      </button>
                    </div>

                    {passage.groups.map((group, gIndex) => {
                      const isGroupExpanded = passageGroups.includes(gIndex.toString());

                      return (
                        <div
                          key={gIndex}
                          className="border border-slate-200 rounded-lg overflow-hidden"
                        >
                          {/* Group Header */}
                          <div className="bg-slate-50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <button
                                type="button"
                                onClick={() => toggleGroupExpanded(pIndex, gIndex.toString())}
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                              >
                                {isGroupExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                )}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-sm">
                                    <strong>Guruh {gIndex + 1}</strong>
                                  </p>
                                  {group.from_value > 0 && group.to_value > 0 && (
                                    <span className="text-xs px-2 py-1 bg-[#042d62] text-white rounded">
                                      Q{group.from_value}-{group.to_value}
                                    </span>
                                  )}
                                  {group.question_type && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                      {readingQuestionTypes.find(t => t.value === group.question_type)?.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {passage.groups.length > 0 && (
                              <button
                                type="button"
                                onClick={() => removeQuestionGroup(pIndex, gIndex)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Group Content */}
                          {isGroupExpanded && (
                            <div className="p-4 bg-white space-y-4">
                              {/* Question Type */}
                              <div>
                                <label className="block text-slate-700 mb-2 text-sm">
                                  Savol Turi <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={group.question_type}
                                  onChange={(e) => {
                                    // Clear existing type-specific data when changing type
                                    updateQuestionGroup(pIndex, gIndex, { 
                                      question_type: e.target.value,
                                      gap_filling: undefined,
                                      identify_info: undefined,
                                      matching_item: undefined,
                                    });
                                  }}
                                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                                  required
                                >
                                  <option value="">Tanlang...</option>
                                  {readingQuestionTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Question Range */}
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-slate-700 mb-2 text-sm">
                                    From <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={group.from_value || ''}
                                    onChange={(e) => updateQuestionGroup(pIndex, gIndex, { from_value: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-700 mb-2 text-sm">
                                    To <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={group.to_value || ''}
                                    onChange={(e) => updateQuestionGroup(pIndex, gIndex, { to_value: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                                    required
                                  />
                                </div>
                              </div>

                              {/* Dynamic Fields Based on Question Type */}
                              {group.question_type && renderGroupFields(pIndex, gIndex, group)}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {passage.groups.length === 0 && (
                      <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-500 text-sm mb-3">Hali savol guruhlari yo&apos;q</p>
                        <button
                          type="button"
                          onClick={() => addQuestionGroup(pIndex)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Birinchi Guruhni Qo&apos;shish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
            disabled={isSubmitting}
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#042d62] text-white px-6 py-3 rounded-xl hover:bg-[#053a75] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {isSubmitting ? 'Saqlanmoqda...' : 'Barcha Passages Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}