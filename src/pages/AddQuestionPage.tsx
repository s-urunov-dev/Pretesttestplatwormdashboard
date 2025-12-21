import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Headphones, PenTool, ChevronLeft, Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getReadingQuestionTypes,
  getListeningQuestionTypes,
  createReadingPassage,
  getReadingPassages,
  getListeningParts,
  createListeningPartWithQuestions,
  QuestionType,
  CreateReadingPassageRequest,
  CreateListeningPartRequest,
  QuestionGroup,
  PassageType,
  PartType,
  GAP_FILLING_CRITERIA,
  getTestDetail,
  CriteriaType,
  VariantType,
  WritingType,
  getWritingTasksForTest,
} from '../lib/api';
import { BulkReadingForm } from '../components/BulkReadingForm';
import { WritingForm } from '../components/WritingForm';
import { ListeningForm } from '../components/ListeningForm';

type SectionType = 'reading' | 'listening' | 'writing';
type SubType = 'passage1' | 'passage2' | 'passage3' | 'part_1' | 'part_2' | 'part_3' | 'part_4' | 'task1' | 'task2' | 'bulk_passages';

export function AddQuestionPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  
  const [testName, setTestName] = useState('');
  const [readingId, setReadingId] = useState<number | undefined>();
  const [listeningId, setListeningId] = useState<number | undefined>();
  
  const [selectedSection, setSelectedSection] = useState<SectionType>('reading');
  const [selectedSubType, setSelectedSubType] = useState<SubType>('passage1');
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPassages, setLoadingPassages] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [passages, setPassages] = useState<any[]>([]);
  
  // Listening parts state (similar to passages)
  const [parts, setParts] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [loadingParts, setLoadingParts] = useState(false);
  
  // Writing tasks state
  const [writingTasks, setWritingTasks] = useState<any[]>([]);
  const [loadingWritingTasks, setLoadingWritingTasks] = useState(false);

  // Accordion state for question groups
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);

  // Load test details and question types on mount
  useEffect(() => {
    if (!testId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        const [testDetail, types] = await Promise.all([
          getTestDetail(parseInt(testId)),
          getReadingQuestionTypes(),
        ]);
        
        setTestName(testDetail.name);
        setReadingId(
          typeof testDetail.reading === 'object' && testDetail.reading !== null 
            ? testDetail.reading.id 
            : testDetail.reading
        );
        setListeningId(
          typeof testDetail.listening === 'object' && testDetail.listening !== null 
            ? testDetail.listening.id 
            : testDetail.listening
        );
        setQuestionTypes(types);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [testId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load passages when reading section is selected and readingId is available
  useEffect(() => {
    if (selectedSection === 'reading' && readingId) {
      loadPassages();
    }
  }, [readingId, selectedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load writing tasks when writing section is selected
  useEffect(() => {
    if (selectedSection === 'writing' && testId) {
      loadWritingTasks();
    }
  }, [testId, selectedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load listening parts when listening section is selected
  useEffect(() => {
    if (selectedSection === 'listening' && listeningId) {
      loadParts();
      // Load listening question types
      loadListeningQuestionTypes();
    }
  }, [listeningId, selectedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const [listeningQuestionTypes, setListeningQuestionTypes] = useState<QuestionType[]>([]);

  const loadListeningQuestionTypes = async () => {
    try {
      const types = await getListeningQuestionTypes();
      console.log('📦 Listening question types:', types);
      setListeningQuestionTypes(types);
    } catch (error) {
      console.error('Error loading listening question types:', error);
    }
  };

  // Load existing part data when sub type changes
  useEffect(() => {
    if (selectedSection === 'listening' && parts.length > 0) {
      loadPartData();
    }
  }, [selectedSubType, parts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing passage data when sub type changes
  useEffect(() => {
    console.log('🎯 useEffect triggered for loadPassageData');
    console.log('🎯 selectedSection:', selectedSection);
    console.log('🎯 passages.length:', passages.length);
    console.log('🎯 passages:', passages);
    
    if (selectedSection === 'reading' && passages.length > 0) {
      console.log('✅ Calling loadPassageData...');
      loadPassageData();
    } else {
      console.log('❌ Not calling loadPassageData - conditions not met');
    }
  }, [selectedSubType, passages]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPassages = async () => {
    if (!readingId) return;
    
    try {
      setLoadingPassages(true);
      const response = await getReadingPassages(readingId);
      console.log('📦 Passages response:', response);
      console.log('📦 Passages results:', response.results);
      setPassages(response.results || []);
    } catch (error) {
      console.error('Error loading passages:', error);
    } finally {
      setLoadingPassages(false);
    }
  };

  const loadPassageData = () => {
    console.log('🔍 loadPassageData called');
    console.log('🔍 selectedSubType:', selectedSubType);
    console.log('🔍 passages:', passages);
    
    // Find passage matching current sub type
    const currentPassage = passages.find(
      (p) => p.passage_type === selectedSubType
    );

    console.log('🔍 currentPassage:', currentPassage);

    if (currentPassage) {
      console.log('📄 Loading passage data:', currentPassage);
      console.log('📄 Groups in passage:', currentPassage.groups);
      
      // Load title and body
      setTitle(currentPassage.title || '');
      setBody(currentPassage.body || '');

      // Convert backend groups to frontend format
      const convertedGroups: QuestionGroup[] = (currentPassage.groups || []).map((group: any) => {
        console.log('🔄 Converting group:', group);
        
        // Backend returns reading_question_type as string
        const questionType = typeof group.reading_question_type === 'string' 
          ? group.reading_question_type 
          : group.reading_question_type?.type;
        
        const convertedGroup: QuestionGroup = {
          question_type: questionType,
          from_value: group.from_value,
          to_value: group.to_value,
        };

        // ✅ NEW: Backend now returns single objects (not arrays)
        
        // Convert gap_containers to gap_filling (now it's an object)
        if (group.gap_containers) {
          convertedGroup.gap_filling = {
            title: group.gap_containers.title || '',
            principle: group.gap_containers.principle || group.gap_containers.criteria || 'NMT_TWO',
            body: group.gap_containers.body || '',
          };
        }

        // Convert identify_info (now it's an object)
        if (group.identify_info) {
          convertedGroup.identify_info = {
            title: group.identify_info.title || '',
            question: group.identify_info.question || [],
          };
        }

        // Convert matching (now it's an object)
        if (group.matching) {
          convertedGroup.matching_item = {
            title: group.matching.title || '',
            statement: group.matching.statement || [],
            option: group.matching.option || [],
            variant_type: group.matching.variant_type || 'letter',
            answer_count: group.matching.answer_count || 1,
          };
        }

        console.log('✨ Converted group:', convertedGroup);
        return convertedGroup;
      });

      console.log('🎯 All converted groups:', convertedGroups);
      setGroups(convertedGroups);
      
      // Expand all groups when loading existing data
      const allGroupIndexes = convertedGroups.map((_, index) => index);
      setExpandedGroups(allGroupIndexes);
      
      console.log('✅ Groups state updated. Current groups length:', convertedGroups.length);
    } else {
      console.log('❌ No passage found for selectedSubType:', selectedSubType);
      console.log('🧹 Clearing form fields...');
      
      // Clear form if passage doesn't exist
      setTitle('');
      setBody('');
      setGroups([]);
      setExpandedGroups([]);
    }
  };

  const loadWritingTasks = async () => {
    if (!testId) return;
    
    try {
      setLoadingWritingTasks(true);
      const response = await getWritingTasksForTest(parseInt(testId));
      console.log('📦 Writing tasks response:', response);
      console.log('📦 Writing tasks:', response);
      setWritingTasks(response || []);
    } catch (error) {
      console.error('Error loading writing tasks:', error);
    } finally {
      setLoadingWritingTasks(false);
    }
  };

  const loadParts = async () => {
    if (!listeningId) return;
    
    try {
      setLoadingParts(true);
      const response = await getListeningParts(listeningId);
      console.log('📦 Parts response:', response);
      console.log('📦 Parts results:', response.results);
      setParts(response.results || []);
    } catch (error) {
      console.error('Error loading parts:', error);
    } finally {
      setLoadingParts(false);
    }
  };

  const loadPartData = () => {
    console.log('🔍 loadPartData called');
    console.log('🔍 selectedSubType:', selectedSubType);
    console.log('🔍 parts:', parts);
    
    // Find part matching current sub type
    const currentPart = parts.find(
      (p) => p.part_type === selectedSubType
    );

    console.log('🔍 currentPart:', currentPart);

    if (currentPart) {
      console.log('📄 Loading part data:', currentPart);
      console.log('📄 Groups in part:', currentPart.groups);
      
      // Load title and audio
      setTitle(currentPart.title || '');
      setAudioUrl(currentPart.audio || '');

      // Convert backend groups to frontend format
      const convertedGroups: QuestionGroup[] = (currentPart.groups || []).map((group: any) => {
        console.log('🔄 Converting group:', group);
        
        // Backend returns listening_question_type as string (for listening parts)
        const questionType = typeof group.listening_question_type === 'string' 
          ? group.listening_question_type 
          : group.listening_question_type?.type;
        
        const convertedGroup: QuestionGroup = {
          question_type: questionType,
          from_value: group.from_value,
          to_value: group.to_value,
        };

        // ✅ NEW: Backend now returns single objects (not arrays)
        
        // Convert gap_containers to gap_filling (now it's an object)
        if (group.gap_containers) {
          convertedGroup.gap_filling = {
            title: group.gap_containers.title || '',
            principle: group.gap_containers.principle || group.gap_containers.criteria || 'NMT_TWO',
            body: group.gap_containers.body || '',
          };
        }

        // Convert identify_info (now it's an object)
        if (group.identify_info) {
          convertedGroup.identify_info = {
            title: group.identify_info.title || '',
            question: group.identify_info.question || [],
          };
        }

        // Convert matching (now it's an object)
        if (group.matching) {
          convertedGroup.matching_item = {
            title: group.matching.title || '',
            statement: group.matching.statement || [],
            option: group.matching.option || [],
            variant_type: group.matching.variant_type || 'letter',
            answer_count: group.matching.answer_count || 1,
          };
        }

        console.log('✨ Converted group:', convertedGroup);
        return convertedGroup;
      });

      console.log('🎯 All converted groups:', convertedGroups);
      setGroups(convertedGroups);
      
      // Expand all groups when loading existing data
      const allGroupIndexes = convertedGroups.map((_, index) => index);
      setExpandedGroups(allGroupIndexes);
      
      console.log('✅ Groups state updated. Current groups length:', convertedGroups.length);
    } else {
      console.log('❌ No part found for selectedSubType:', selectedSubType);
      console.log('🧹 Clearing form fields...');
      
      // Clear form if part doesn't exist
      setTitle('');
      setAudioUrl('');
      setGroups([]);
      setExpandedGroups([]);
    }
  };

  const addQuestionGroup = (questionType: QuestionType) => {
    const lastGroup = groups[groups.length - 1];
    const fromValue = lastGroup ? lastGroup.to_value + 1 : 1;
    
    const newGroup: QuestionGroup = {
      question_type: questionType.type,
      from_value: fromValue,
      to_value: fromValue,
    };

    setGroups([...groups, newGroup]);
    
    // Auto-expand new group
    setExpandedGroups([...expandedGroups, groups.length]);
  };

  const toggleGroupExpanded = (index: number) => {
    if (expandedGroups.includes(index)) {
      setExpandedGroups(expandedGroups.filter(i => i !== index));
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

  const handleSave = async () => {
    if (!readingId) {
      alert('Reading ID mavjud emas. Avval test yarating.');
      return;
    }

    if (!title.trim() || !body.trim()) {
      alert('Title va Body to\'ldirish majburiy');
      return;
    }

    if (groups.length === 0) {
      alert('Kamida bitta savol guruhi qo\'shing');
      return;
    }

    setSaving(true);
    try {
      // Clean up groups before saving - remove empty lines from arrays
      const cleanedGroups = groups.map(group => {
        const cleanedGroup = { ...group };
        
        // Clean identify_info questions - remove empty strings
        if (cleanedGroup.identify_info?.question) {
          cleanedGroup.identify_info = {
            ...cleanedGroup.identify_info,
            question: cleanedGroup.identify_info.question.filter(q => q.trim()),
          };
        }
        
        // Clean matching_item statements and options - remove empty strings
        if (cleanedGroup.matching_item) {
          cleanedGroup.matching_item = {
            ...cleanedGroup.matching_item,
            statement: (cleanedGroup.matching_item.statement || []).filter(s => s.trim()),
            option: (cleanedGroup.matching_item.option || []).filter(o => o.trim()),
          };
        }
        
        return cleanedGroup;
      });

      const data: CreateReadingPassageRequest = {
        reading: readingId,
        passage_type: selectedSubType as PassageType,
        title: title.trim(),
        body: body.trim(),
        groups: cleanedGroups,
      };

      await createReadingPassage(data);
      alert('Passage muvaffaqiyatli saqlandi!');
      
      // Reset form
      setTitle('');
      setBody('');
      setGroups([]);
      
      // Navigate back to test detail
      navigate(`/test/${testId}`);
    } catch (error) {
      console.error('Error saving passage:', error);
      alert(`Xatolik: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleListeningSave = async (data: { title: string; audioFile?: File; groups: QuestionGroup[] }) => {
    if (!listeningId) {
      alert('Listening ID mavjud emas. Avval test yarating.');
      return;
    }

    setSaving(true);
    try {
      console.log('🔄 Creating listening part with groups...');
      
      // Convert QuestionGroup[] to ListeningQuestionGroup[]
      const listeningGroups = data.groups.map(group => ({
        listening_question_type: group.question_type,
        from_value: group.from_value,
        to_value: group.to_value,
        gap_filling: group.gap_filling,
        identify_info: group.identify_info,
        matching_item: group.matching_item,
      }));
      
      // Step 1: Create Part (without audio)
      const partRequest: CreateListeningPartRequest = {
        listening: listeningId,
        part_type: selectedSubType as PartType,
        groups: listeningGroups,
      };

      const partResult = await createListeningPartWithQuestions(partRequest);
      console.log('✅ Part created with ID:', partResult.id);
      
      // Step 2: Upload audio (if provided) with part_id
      if (data.audioFile) {
        console.log('🔄 Uploading audio for part:', partResult.id);
        const { createListeningAudio } = await import('../lib/api');
        await createListeningAudio(data.audioFile, partResult.id);
        console.log('✅ Audio uploaded and linked to part');
      }

      alert('Part muvaffaqiyatli saqlandi!');
      
      // Navigate back to test detail
      navigate(`/test/${testId}`);
    } catch (error) {
      console.error('Error saving part:', error);
      alert(`Xatolik: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      // Reading types
      'multiple_choice': 'Multiple Choice',
      'true_false_not_given': 'True / False / Not Given',
      'yes_no_not_given': 'Yes / No / Not Given',
      'matching_headings': 'Matching Headings',
      'matching_information': 'Matching Information',
      'matching_sentence_endings': 'Matching Sentence Endings',
      'matching_features': 'Matching Features',
      'sentence_completion': 'Sentence Completion',
      'summary_completion': 'Summary Completion',
      'table_completion': 'Table Completion',
      'flowchart_completion': 'Flow-chart Completion',
      'diagram_labeling': 'Diagram Labeling',
      'short_answer': 'Short Answer Questions',
      
      // Listening types
      'form_completion': 'Form Completion',
      'note_completion': 'Note Completion',
      'multiple_choice_one': 'Multiple Choice (One answer)',
      'multiple_choice_multiple': 'Multiple Choice (Multiple answers)',
      'matching': 'Matching',
      'map_diagram_labeling': 'Map / Diagram Labelling',
      'pick_from_list': 'Pick from a List',
    };
    return labels[type] || type;
  };

  const getQuestionTypeDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      // Reading types
      'multiple_choice': 'Choose correct answer',
      'true_false_not_given': 'Factual information',
      'yes_no_not_given': 'Writer\'s views',
      'matching_headings': 'Match headings to paragraphs',
      'matching_information': 'Find information in paragraphs',
      'matching_sentence_endings': 'Complete sentences with endings',
      'matching_features': 'Match items to categories',
      'sentence_completion': 'Complete sentences',
      'summary_completion': 'Fill in summary',
      'table_completion': 'Complete table',
      'flowchart_completion': 'Complete flowchart',
      'diagram_labeling': 'Label diagram parts',
      'short_answer': 'Answer in 3 words max',
      
      // Listening types
      'form_completion': 'Complete form with information',
      'note_completion': 'Complete notes with key details',
      'multiple_choice_one': 'Choose one correct answer',
      'multiple_choice_multiple': 'Choose multiple correct answers',
      'matching': 'Match items to categories',
      'map_diagram_labeling': 'Label map or diagram parts',
      'pick_from_list': 'Select correct options from list',
    };
    return descriptions[type] || '';
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <button
            onClick={() => navigate(`/test/${testId}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-[#042d62] transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Orqaga</span>
          </button>
          <h2 className="text-slate-900">{testName}</h2>
          <p className="text-sm text-slate-600 mt-1">Savol qo'shish</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => {
              setSelectedSection('reading');
              setSelectedSubType('passage1'); // Default to passage1 when switching to reading
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              selectedSection === 'reading'
                ? 'bg-gradient-to-r from-[#042d62] to-[#0369a1] text-white shadow-lg'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Reading</span>
          </button>

          <button
            onClick={() => {
              setSelectedSection('listening');
              setSelectedSubType('part_1'); // Default to part_1 when switching to listening
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              selectedSection === 'listening'
                ? 'bg-gradient-to-r from-[#042d62] to-[#0369a1] text-white shadow-lg'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <Headphones className="w-5 h-5" />
            <span>Listening</span>
          </button>

          <button
            onClick={() => {
              setSelectedSection('writing');
              setSelectedSubType('task1'); // Default to task1 when switching to writing
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              selectedSection === 'writing'
                ? 'bg-gradient-to-r from-[#042d62] to-[#0369a1] text-white shadow-lg'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
          >
            <PenTool className="w-5 h-5" />
            <span>Writing</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation - Passage/Part/Task Selection */}
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center gap-4">
            {selectedSection === 'reading' && (
              <>
                {(['passage1', 'passage2', 'passage3', 'bulk_passages'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSubType(type)}
                    className={`px-6 py-2 rounded-lg transition-all ${
                      selectedSubType === type
                        ? 'bg-[#042d62] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'bulk_passages' ? 'Bulk Passages' : `Passage ${type.slice(-1)}`}
                  </button>
                ))}
              </>
            )}

            {selectedSection === 'listening' && (
              <>
                {(['part_1', 'part_2', 'part_3', 'part_4'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSubType(type)}
                    className={`px-6 py-2 rounded-lg transition-all ${
                      selectedSubType === type
                        ? 'bg-[#042d62] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Part {type.slice(-1)}
                  </button>
                ))}
              </>
            )}

            {selectedSection === 'writing' && (
              <>
                {(['task1', 'task2'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedSubType(type)}
                    className={`px-6 py-2 rounded-lg transition-all ${
                      selectedSubType === type
                        ? 'bg-[#042d62] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Task{type.slice(-1)}
                  </button>
                ))}
              </>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          {selectedSection === 'reading' && selectedSubType === 'bulk_passages' && (
            <BulkReadingForm
              testId={testId ? parseInt(testId) : undefined}
              onSubmit={() => navigate(`/test/${testId}`)}
              onBack={() => navigate(`/test/${testId}`)}
            />
          )}

          {selectedSection === 'reading' && selectedSubType !== 'bulk_passages' && (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Loading Indicator */}
              {loadingPassages && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-[#042d62] mb-4" />
                    <p className="text-slate-600">Passage ma'lumotlari yuklanmoqda...</p>
                  </div>
                </div>
              )}

              {!loadingPassages && (
                <>
                  {/* Passage Title & Body */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                    <h3 className="text-lg text-slate-900">Passage Ma'lumotlari</h3>
                    
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">Sarlavha</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Passage sarlavhasini kiriting"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-700 mb-2">Matn</label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Passage matnini kiriting"
                        rows={8}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent resize-none"
                      />
                    </div>
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
                    
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-[#042d62]" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {questionTypes.map((qType) => (
                          <button
                            key={qType.id}
                            type="button"
                            onClick={() => addQuestionGroup(qType)}
                            className="group relative px-4 py-2 border border-slate-200 rounded-lg hover:border-[#042d62] hover:bg-[#042d62] hover:text-white transition-all text-sm"
                            title={getQuestionTypeDescription(qType.type)}
                          >
                            <span className="text-slate-400 group-hover:text-white/70 transition-colors">{qType.id}.</span>{' '}
                            <span className="text-slate-700 group-hover:text-white transition-colors">{getQuestionTypeLabel(qType.type)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Added Question Groups */}
                  {groups.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <h3 className="text-lg text-slate-900 mb-4">Qo'shilgan Savol Guruhlari</h3>
                      
                      <div className="space-y-6">
                        {groups.map((group, index) => {
                          const qType = questionTypes.find(qt => qt.type === group.question_type);
                          const questionTypeName = qType?.type || group.question_type;
                          const isExpanded = expandedGroups.includes(index);
                          
                          // Determine which fields to show based on question type
                          const isGapFilling = ['sentence_completion', 'summary_completion', 'table_completion', 'flowchart_completion', 'diagram_labeling', 'short_answer'].includes(questionTypeName);
                          const isIdentifyInfo = ['matching_information', 'true_false_not_given', 'yes_no_not_given'].includes(questionTypeName);
                          const isMatchingItem = ['matching_headings', 'matching_sentence_endings', 'matching_features', 'multiple_choice'].includes(questionTypeName);
                          
                          return (
                            <div key={index} className="border border-slate-200 rounded-lg overflow-hidden">
                              {/* Group Header - Clickable */}
                              <div 
                                onClick={() => toggleGroupExpanded(index)}
                                className="bg-slate-50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <button
                                    type="button"
                                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                                  >
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

                              {/* Group Content - Collapsible */}
                              {isExpanded && (
                                <div className="p-4 bg-white space-y-4">
                                  {/* Question Type Selector */}
                                  <div>
                                    <label className="block text-sm text-slate-700 mb-2">
                                      Savol Turi <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                      value={group.question_type}
                                      onChange={(e) => {
                                        // Clear existing type-specific data when changing type
                                        updateGroup(index, { 
                                          question_type: e.target.value,
                                          gap_filling: undefined,
                                          identify_info: undefined,
                                          matching_item: undefined,
                                        });
                                      }}
                                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                                      required
                                    >
                                      <option value="">Tanlang...</option>
                                      {questionTypes.map((qType) => (
                                        <option key={qType.id} value={qType.type}>
                                          {getQuestionTypeLabel(qType.type)}
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* From/To Values */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm text-slate-700 mb-2">
                                        Dan <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        value={group.from_value}
                                        onChange={(e) => updateGroup(index, { from_value: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                        min="1"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm text-slate-700 mb-2">
                                        Gacha <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        value={group.to_value}
                                        onChange={(e) => updateGroup(index, { to_value: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                        min={group.from_value}
                                        required
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
                                          onChange={(e) => updateGroup(index, {
                                            gap_filling: {
                                              ...group.gap_filling,
                                              title: e.target.value,
                                              principle: group.gap_filling?.principle || 'NMT_TWO',
                                              body: group.gap_filling?.body || '',
                                            }
                                          })}
                                          placeholder="Masalan: Complete the sentences"
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm text-slate-700 mb-2">So'z Cheklovi</label>
                                        <select
                                          value={group.gap_filling?.principle || 'NMT_TWO'}
                                          onChange={(e) => updateGroup(index, {
                                            gap_filling: {
                                              ...group.gap_filling,
                                              title: group.gap_filling?.title || '',
                                              principle: e.target.value as any,
                                              body: group.gap_filling?.body || '',
                                            }
                                          })}
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
                                          onChange={(e) => updateGroup(index, {
                                            gap_filling: {
                                              ...group.gap_filling,
                                              title: group.gap_filling?.title || '',
                                              principle: group.gap_filling?.principle || 'NMT_TWO',
                                              body: e.target.value,
                                            }
                                          })}
                                          placeholder="Savol matnini kiriting..."
                                          rows={4}
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] resize-none"
                                        />
                                      </div>
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
                                          onChange={(e) => updateGroup(index, {
                                            identify_info: {
                                              title: e.target.value,
                                              question: group.identify_info?.question || [''],
                                            }
                                          })}
                                          placeholder="Masalan: Do the following statements agree with..."
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm text-slate-700 mb-2">Savollar (har bir qatorda bittadan)</label>
                                        <textarea
                                          value={(group.identify_info?.question || ['']).join('\n')}
                                          onChange={(e) => updateGroup(index, {
                                            identify_info: {
                                              title: group.identify_info?.title || '',
                                              question: e.target.value.split('\n'), // ✅ Remove .filter() to allow Enter key
                                            }
                                          })}
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
                                          onChange={(e) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: e.target.value,
                                              statement: group.matching_item?.statement || [''],
                                              option: group.matching_item?.option || [''],
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                          placeholder="Masalan: Match each heading with..."
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                        />
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm text-slate-700 mb-2">Savollar (har qatorda bittadan)</label>
                                          <textarea
                                            value={(group.matching_item?.statement || ['']).join('\n')}
                                            onChange={(e) => updateGroup(index, {
                                              matching_item: {
                                                ...group.matching_item,
                                                title: group.matching_item?.title || '',
                                                statement: e.target.value.split('\n').filter(s => s.trim()),
                                                option: group.matching_item?.option || [''],
                                                variant_type: group.matching_item?.variant_type || 'letter',
                                                answer_count: group.matching_item?.answer_count || 1,
                                              }
                                            })}
                                            placeholder="1. First statement\n2. Second statement"
                                            rows={5}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] resize-none"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-sm text-slate-700 mb-2">Variantlar (har qatorda bittadan)</label>
                                          <textarea
                                            value={(group.matching_item?.option || ['']).join('\n')}
                                            onChange={(e) => updateGroup(index, {
                                              matching_item: {
                                                ...group.matching_item,
                                                title: group.matching_item?.title || '',
                                                statement: group.matching_item?.statement || [''],
                                                option: e.target.value.split('\n').filter(o => o.trim()),
                                                variant_type: group.matching_item?.variant_type || 'letter',
                                                answer_count: group.matching_item?.answer_count || 1,
                                              }
                                            })}
                                            placeholder="A. First option\nB. Second option"
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
                                            onChange={(e) => updateGroup(index, {
                                              matching_item: {
                                                ...group.matching_item,
                                                title: group.matching_item?.title || '',
                                                statement: group.matching_item?.statement || [''],
                                                option: group.matching_item?.option || [''],
                                                variant_type: e.target.value as any,
                                                answer_count: group.matching_item?.answer_count || 1,
                                              }
                                            })}
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
                                            onChange={(e) => updateGroup(index, {
                                              matching_item: {
                                                ...group.matching_item,
                                                title: group.matching_item?.title || '',
                                                statement: group.matching_item?.statement || [''],
                                                option: group.matching_item?.option || [''],
                                                variant_type: group.matching_item?.variant_type || 'letter',
                                                answer_count: parseInt(e.target.value) || 1,
                                              }
                                            })}
                                            min="1"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                          />
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
                      onClick={handleSave}
                      disabled={saving || !title.trim() || !body.trim() || groups.length === 0}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#042d62] to-[#0369a1] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Saqlanmoqda...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>Saqlash</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {selectedSection === 'listening' && (
            <div className="max-w-5xl mx-auto">
              {/* Loading Indicator */}
              {loadingParts || loading || listeningQuestionTypes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-[#042d62] mb-4" />
                    <p className="text-slate-600">Yuklanmoqda...</p>
                  </div>
                </div>
              ) : (
                <ListeningForm
                  questionTypes={listeningQuestionTypes}
                  onSave={handleListeningSave}
                  saving={saving}
                />
              )}
            </div>
          )}

          {selectedSection === 'writing' && (() => {
            // Find existing task for current taskType
            const existingTask = writingTasks.find(task => task.type === selectedSubType);
            console.log('🔍 Existing writing task:', existingTask);
            console.log('🔍 Task type:', selectedSubType);
            console.log('🔍 All writing tasks:', writingTasks);
            
            return (
              <WritingForm 
                testId={testId ? parseInt(testId) : 0}
                taskType={selectedSubType as WritingType}
                existingData={existingTask ? {
                  id: existingTask.id,
                  question: existingTask.question || '',
                  image: existingTask.image || null,
                } : undefined}
                onSuccess={() => {
                  alert('✅ Writing task saqlandi!');
                  // Reload writing tasks to update the form
                  loadWritingTasks();
                }}
              />
            );
          })()}
        </main>
      </div>
    </div>
  );
}
