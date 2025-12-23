import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Headphones, PenTool, ChevronLeft, Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import {
  getReadingQuestionTypes,
  getListeningQuestionTypes,
  createReadingPassage,
  updateReadingPassage,
  getReadingPassages,
  getListeningParts,
  getListening,
  getListeningPartById,
  QuestionType,
  CreateReadingPassageRequest,
  UpdateReadingPassageRequest,
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
  createListeningPartWithQuestions,
} from '../lib/api-cleaned';
import { BulkReadingForm } from '../components/BulkReadingForm';
import { WritingForm } from '../components/WritingForm';
import { ListeningForm } from '../components/ListeningForm';
import { SuccessAnimation } from '../components/SuccessAnimation';
import { QuestionTypeSelector } from '../components/QuestionTypeSelector';
import { MatchingItemInputs } from '../components/MatchingItemInputs';
import { MatchingHeadingsInputs } from '../components/MatchingHeadingsInputs';
import { MatchingInformationInputs } from '../components/MatchingInformationInputs';
import { MatchingSentenceEndingsInputs } from '../components/MatchingSentenceEndingsInputs';
import { MatchingFeaturesInputs } from '../components/MatchingFeaturesInputs';

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
  const [currentPassageId, setCurrentPassageId] = useState<number | undefined>();
  
  // Listening parts state (similar to passages)
  const [parts, setParts] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [loadingParts, setLoadingParts] = useState(false);
  
  // Writing tasks state
  const [writingTasks, setWritingTasks] = useState<any[]>([]);
  const [loadingWritingTasks, setLoadingWritingTasks] = useState(false);

  // Success animation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Accordion state for question groups
  const [expandedGroups, setExpandedGroups] = useState<number[]>([]);
  
  // Selected question types for Reading passage
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>([]);



  // Load test details and question types on mount
  useEffect(() => {
    if (!testId) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Clear all state when testId changes (new test selected)
        setReadingId(undefined);
        setListeningId(undefined);
        setPassages([]);
        setParts([]);
        setWritingTasks([]);
        setTitle('');
        setBody('');
        setGroups([]);
        setExpandedGroups([]);
        
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
      console.log('📄 Passage ID:', currentPassage.id);
      
      // Set passage ID for update mode
      setCurrentPassageId(currentPassage.id);
      
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
      setCurrentPassageId(undefined);
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
      const response = await getListening(listeningId);
      console.log('📦 Listening response:', response);
      
      // Extract parts from response (part_1, part_2, part_3, part_4)
      const partsArray = [];
      
      // Each part should contain the full part object with groups
      // If it's just an ID (number), we need to fetch the full part separately
      const partTypes: PartType[] = ['part_1', 'part_2', 'part_3', 'part_4'];
      
      for (const partType of partTypes) {
        const partData = response[partType];
        
        if (partData) {
          // Check if it's a full object or just an ID
          if (typeof partData === 'object' && partData !== null) {
            // Full object - use it directly
            console.log(`✅ Part ${partType} is a full object:`, partData);
            partsArray.push({
              ...partData,
              part_type: partType,
            });
          } else if (typeof partData === 'number') {
            // Just an ID - fetch the full part
            console.log(`🔄 Part ${partType} is ID only (${partData}), fetching full data...`);
            try {
              const fullPartData = await getListeningPartById(partData);
              console.log(`✅ Full part data fetched for ${partType}:`, fullPartData);
              partsArray.push({
                ...fullPartData,
                part_type: partType,
              });
            } catch (fetchError) {
              console.error(`❌ Failed to fetch full data for part ${partType}:`, fetchError);
              // Fallback: add minimal data
              partsArray.push({
                id: partData,
                part_type: partType,
                groups: [],
              });
            }
          }
        }
      }
      
      console.log('📦 Parts array with part_type:', partsArray);
      setParts(partsArray);
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

        // Convert completion to gap_filling (new API structure)
        if (group.completion) {
          convertedGroup.gap_filling = {
            title: group.completion.title || '',
            principle: group.completion.principle || 'NMT_TWO',
            body: group.completion.body || '',
          };
        }
        // Fallback: Convert gap_containers to gap_filling (old structure)
        else if (group.gap_containers) {
          convertedGroup.gap_filling = {
            title: group.gap_containers.title || '',
            principle: group.gap_containers.principle || group.gap_containers.criteria || 'NMT_TWO',
            body: group.gap_containers.body || '',
          };
        }

        // Convert matching_statement to matching_item (new API structure)
        if (group.matching_statement && Array.isArray(group.matching_statement) && group.matching_statement.length > 0) {
          const firstStatement = group.matching_statement[0];
          convertedGroup.matching_item = {
            title: firstStatement.title || '',
            statement: firstStatement.statement || [],
            option: firstStatement.option || [],
            variant_type: firstStatement.variant_type || 'letter',
            answer_count: firstStatement.answer_count || 1,
          };
        }
        // Fallback: Convert matching (old structure)
        else if (group.matching) {
          convertedGroup.matching_item = {
            title: group.matching.title || '',
            statement: group.matching.statement || [],
            option: group.matching.option || [],
            variant_type: group.matching.variant_type || 'letter',
            answer_count: group.matching.answer_count || 1,
          };
        }

        // Convert identify_info (same in both structures)
        if (group.identify_info) {
          convertedGroup.identify_info = {
            title: group.identify_info.title || '',
            question: group.identify_info.question || [],
          };
        }

        // Convert table_completion (new API: index-based table_details)
        if (group.table_completion) {
          console.log('🔄 Converting table_completion:', group.table_completion);
          
          let tableDetails: any = group.table_completion.table_details;
          
          // New API format: table_details is object with numeric keys
          if (typeof tableDetails === 'string') {
            try {
              tableDetails = JSON.parse(tableDetails);
            } catch (e) {
              console.error('Failed to parse table_details:', e);
              tableDetails = {};
            }
          }
          
          // Ensure tableDetails is object
          if (!tableDetails || typeof tableDetails !== 'object') {
            tableDetails = {};
          }

          console.log('✅ Parsed table_details:', tableDetails);

          // Store in new format (will be used by TableCompletionEditorIndexed)
          convertedGroup.table_completion = {
            principle: group.table_completion.principle || 'ONE_WORD',
            table_details: tableDetails,
          } as any;
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

  const addQuestionGroup = () => {
    // Check if a question type is selected
    if (selectedQuestionTypes.length === 0) {
      alert('Iltimos, avval savol turini tanlang!');
      return;
    }
    
    const lastGroup = groups[groups.length - 1];
    const fromValue = lastGroup ? lastGroup.to_value + 1 : 1;
    
    const newGroup: QuestionGroup = {
      question_type: selectedQuestionTypes[0], // Use selected question type from selector
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

    // Validate matching_item groups have title
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group.matching_item && (!group.matching_item.title || !group.matching_item.title.trim())) {
        alert(`Guruh ${i + 1}: Matching savol uchun sarlavha to'ldirish majburiy!`);
        return;
      }
      if (group.identify_info && (!group.identify_info.title || !group.identify_info.title.trim())) {
        alert(`Guruh ${i + 1}: Identify Info savol uchun sarlavha to'ldirish majburiy!`);
        return;
      }
      if (group.gap_filling && (!group.gap_filling.title || !group.gap_filling.title.trim())) {
        alert(`Guruh ${i + 1}: Gap Filling savol uchun sarlavha to'ldirish majburiy!`);
        return;
      }
    }

    setSaving(true);
    try {
      // 🔍 DEBUG: Log groups before cleaning
      console.log('📦 BEFORE CLEANING - Raw groups:', JSON.stringify(groups, null, 2));
      
      // Clean up groups before saving - remove empty lines from arrays
      const cleanedGroups = groups.map(group => {
        const cleanedGroup = { ...group };
        
        // Clean identify_info questions - remove empty strings
        if (cleanedGroup.identify_info?.question) {
          cleanedGroup.identify_info = {
            ...cleanedGroup.identify_info,
            question: cleanedGroup.identify_info.question.filter(q => typeof q === 'string' && q.trim()),
          };
        }
        
        // Clean matching_item statements and options - FILTER EMPTY ARRAYS
        if (cleanedGroup.matching_item) {
          console.log('🔍 DEBUG - Matching item BEFORE clean:', cleanedGroup.matching_item);
          
          const cleanedStatements = (cleanedGroup.matching_item.statement || []).filter(s => typeof s === 'string' && s.trim());
          const cleanedOptions = (cleanedGroup.matching_item.option || [])
            .map((arr: string[]) => (arr || []).filter((s: string) => typeof s === 'string' && s.trim()))
            .filter((arr: string[]) => arr.length > 0);
          
          cleanedGroup.matching_item = {
            title: cleanedGroup.matching_item.title || '', // ✅ KEEP title
            statement: cleanedStatements,
            option: cleanedOptions,
            variant_type: cleanedGroup.matching_item.variant_type || 'letter', // ✅ KEEP variant_type
            answer_count: cleanedGroup.matching_item.answer_count || 1, // ✅ KEEP answer_count
          };
          
          console.log('🔍 DEBUG - Matching item AFTER clean:', cleanedGroup.matching_item);
        }
        
        // Convert table_completion to coordinate-based format (row:col)
        if (cleanedGroup.table_completion) {
          const tableDetailsCoordinate: { [key: string]: string } = {};
          
          if (cleanedGroup.table_completion.table_details && typeof cleanedGroup.table_completion.table_details === 'object') {
            const details = cleanedGroup.table_completion.table_details as any;
            
            // Check if it's already coordinate-based (has "row:col" keys)
            if (Object.keys(details).some(key => key.includes(':'))) {
              // Already coordinate-based
              Object.assign(tableDetailsCoordinate, details);
            } else if (details.rows && Array.isArray(details.rows)) {
              // Convert rows to coordinate-based format (row:col)
              details.rows.forEach((row: any[], rowIndex: number) => {
                if (Array.isArray(row)) {
                  row.forEach((cell: any, colIndex: number) => {
                    // Extract content from TableCell object
                    const content = typeof cell === 'object' && cell !== null 
                      ? (cell.content || '') 
                      : String(cell || '');
                    // Use "row:col" format as key
                    tableDetailsCoordinate[`${rowIndex}:${colIndex}`] = content;
                  });
                }
              });
            }
          }
          
          cleanedGroup.table_completion = {
            principle: cleanedGroup.table_completion.principle,
            table_details: tableDetailsCoordinate,
          } as any;
        }
        
        return cleanedGroup;
      });

      // Check if we're updating an existing passage or creating a new one
      if (currentPassageId) {
        // UPDATE mode
        const updateData: UpdateReadingPassageRequest = {
          title: title.trim(),
          body: body.trim(),
          groups: cleanedGroups,
        };
        
        await updateReadingPassage(currentPassageId, updateData);
        
        setSuccessMessage({
          title: 'Passage yangilandi! 🎉',
          message: 'O\'zgarishlar muvaffaqiyatli saqlandi'
        });
      } else {
        // CREATE mode
        const data: CreateReadingPassageRequest = {
          reading: readingId,
          passage_type: selectedSubType as PassageType,
          title: title.trim(),
          body: body.trim(),
          groups: cleanedGroups,
        };

        await createReadingPassage(data);
        
        const passageTypeMap: Record<string, string> = {
          'passage1': 'Passage 1',
          'passage2': 'Passage 2',
          'passage3': 'Passage 3',
        };
        
        setSuccessMessage({
          title: 'Passage saqlandi! 🎉',
          message: `${passageTypeMap[selectedSubType] || selectedSubType} muvaffaqiyatli yaratildi`
        });
      }
      
      setShowSuccess(true);
      
      // Reload passages list to reflect the new passage
      await loadPassages();
      
      // Reset form
      setCurrentPassageId(undefined);
      setTitle('');
      setBody('');
      setGroups([]);
      setExpandedGroups([]);
      
      // Navigate back to test detail after animation
      setTimeout(() => {
        navigate(`/test/${testId}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving passage:', error);
      
      // Check if error is about all passages existing
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists all')) {
        const existingPassages = passages.map((p: any) => `Passage ${p.passage_type.slice(-1)}`).join(', ');
        alert(
          `⚠️ Bu Reading uchun barcha 3 ta passage allaqachon yaratilgan!\n\n` +
          `Mavjud passages: ${existingPassages}\n\n` +
          `📝 Yangi passage qo'shish uchun yangi Test yarating.`
        );
      } else {
        alert(`Xatolik: ${errorMessage}`);
      }
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
      console.log('📊 Input groups:', JSON.stringify(data.groups, null, 2));
      
      // Convert QuestionGroup[] to ListeningQuestionGroup[] (new API structure)
      const listeningGroups = data.groups.map(group => {
        console.log(`🔍 Processing group:`, {
          question_type: group.question_type,
          from_value: group.from_value,
          to_value: group.to_value,
          has_map_diagram: !!group.map_diagram,
        });
        
        // ⚠️ CRITICAL VALIDATION - Ensure values are not 0 or undefined
        if (!group.from_value || group.from_value <= 0) {
          console.error('❌ VALIDATION FAILED: from_value is 0 or invalid!', group);
          throw new Error('from_value must be greater than 0');
        }
        if (!group.to_value || group.to_value <= 0) {
          console.error('❌ VALIDATION FAILED: to_value is 0 or invalid!', group);
          throw new Error('to_value must be greater than 0');
        }
        if (!group.question_type || (typeof group.question_type === 'string' && group.question_type.trim() === '')) {
          console.error('❌ VALIDATION FAILED: question_type is empty!', group);
          throw new Error('question_type is required');
        }
        
        const listeningGroup: any = {
          listening_question_type: group.question_type,
          from_value: group.from_value,
          to_value: group.to_value,
        };

        // Map gap_filling to completion
        if (group.gap_filling) {
          listeningGroup.completion = {
            title: group.gap_filling.title,
            principle: group.gap_filling.principle,
            body: group.gap_filling.body,
          };
        }

        // Map matching_item to matching_statement (as array)
        if (group.matching_item) {
          listeningGroup.matching_statement = [{
            title: group.matching_item.title,
            statement: group.matching_item.statement,
            option: group.matching_item.option,
            variant_type: group.matching_item.variant_type,
            answer_count: group.matching_item.answer_count,
          }];
        }

        // Map table_completion (new API: coordinate-based table_details)
        if (group.table_completion) {
          // Convert table_details to coordinate-based format (row:col)
          const tableDetailsCoordinate: { [key: string]: string } = {};
          
          if (group.table_completion.table_details && typeof group.table_completion.table_details === 'object') {
            const details = group.table_completion.table_details as any;
            
            // Check if it's already coordinate-based (has "row:col" keys)
            if (Object.keys(details).some(key => key.includes(':'))) {
              // Already coordinate-based
              Object.assign(tableDetailsCoordinate, details);
            } else if (details.rows && Array.isArray(details.rows)) {
              // Convert rows to coordinate-based format (row:col)
              details.rows.forEach((row: any[], rowIndex: number) => {
                if (Array.isArray(row)) {
                  row.forEach((cell: any, colIndex: number) => {
                    // Extract content from TableCell object
                    const content = typeof cell === 'object' && cell !== null 
                      ? (cell.content || '') 
                      : String(cell || '');
                    // Use "row:col" format as key
                    tableDetailsCoordinate[`${rowIndex}:${colIndex}`] = content;
                  });
                }
              });
            }
          }
          
          listeningGroup.table_completion = {
            principle: group.table_completion.principle,
            table_details: tableDetailsCoordinate,
          };
        }

        // Map map_diagram to listening_map (as single object, not array)
        if (group.map_diagram) {
          console.log(`🗺️ Processing map_diagram:`, {
            title: group.map_diagram.title,
            title_length: group.map_diagram.title?.length,
            image_type: group.map_diagram.image instanceof File ? 'File' : typeof group.map_diagram.image,
            image_name: group.map_diagram.image instanceof File ? group.map_diagram.image.name : group.map_diagram.image,
            image_size: group.map_diagram.image instanceof File ? group.map_diagram.image.size : 'N/A',
          });
          
          listeningGroup.listening_map = {
            title: group.map_diagram.title,
            image: group.map_diagram.image,
          };
          
          console.log(`✅ Added listening_map to listeningGroup:`, {
            title: listeningGroup.listening_map.title,
            has_image: !!listeningGroup.listening_map.image,
          });
        } else {
          console.log(`⚠️ No map_diagram found in this group`);
        }

        console.log(`✅ Mapped listening group ${listeningGroup.listening_question_type}:`, {
          listening_question_type: listeningGroup.listening_question_type,
          from_value: listeningGroup.from_value,
          to_value: listeningGroup.to_value,
          has_listening_map: !!listeningGroup.listening_map,
        });
        return listeningGroup;
      });
      
      console.log('📤 Final listeningGroups:', JSON.stringify(listeningGroups, null, 2));
      
      // Step 1: Create Part (without audio)
      const partRequest: CreateListeningPartRequest = {
        listening: listeningId,
        part_type: selectedSubType as PartType,
        groups: listeningGroups,
      };

      console.log('📦 Part request:', JSON.stringify(partRequest, null, 2));

      const partResult = await createListeningPartWithQuestions(partRequest);
      console.log('✅ Part created with ID:', partResult.id);
      
      // Step 2: Upload audio (if provided) with part_id
      if (data.audioFile) {
        console.log('🔄 Uploading audio for part:', partResult.id);
        const { createListeningAudio } = await import('../lib/api-cleaned');
        await createListeningAudio(data.audioFile, partResult.id);
        console.log('✅ Audio uploaded and linked to part');
      }

      // Show success animation
      const partNumber = selectedSubType.slice(-1);
      setSuccessMessage({
        title: 'Part saqlandi! 🎉',
        message: `Part ${partNumber} ${data.audioFile ? 'audio bilan' : ''} muvaffaqiyatli yaratildi`
      });
      setShowSuccess(true);
      
      // Reload parts list to reflect the new part
      await loadParts();
      
      // Navigate back to test detail after animation
      setTimeout(() => {
        navigate(`/test/${testId}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving part:', error);
      
      // Check if error is about all parts existing
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('already exists all')) {
        const existingParts = parts.map((p: any) => `Part ${p.part_type.slice(-1)}`).join(', ');
        alert(
          `⚠️ Bu Listening uchun barcha 4 ta part allaqachon yaratilgan!\n\n` +
          `Mavjud partlar: ${existingParts}\n\n` +
          `📝 Yangi part qo'shish uchun yangi Test yarating.`
        );
        /*alert(
          '⚠️ Bu Listening uchun barcha 4 ta part allaqachon yaratilgan!\\n\\n' +
          'Har bir Listening faqat 4 ta part (Part 1, 2, 3, 4) ga ega bo\\'lishi mumkin.\\n\\n' +
          '📝 Variantlar:\\n' +
          '1. Yangi Test yaratib, yangi Listening qo\\'shing\\n' +
          '2. Mavjud Part\\'ni tahrirlang (keyingi versiyada qo\\'shiladi)\\n' +
          '3. Boshqa Test\\'ni tanlang'
        );*/
      } else {
        alert(`Xatolik: ${errorMessage}`);
      }
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
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          {/* Reading Passages */}
          {selectedSection === 'reading' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Reading Passage</h3>
              <div className="flex flex-wrap gap-3">
                {(['passage1', 'passage2', 'passage3', 'bulk_passages'] as const).map((type) => {
                  const passageExists = type !== 'bulk_passages' && passages.some((p: any) => p.passage_type === type);
                  const isSelected = selectedSubType === type;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedSubType(type)}
                      className={`
                        group relative px-5 py-3 rounded-xl text-sm font-medium 
                        transition-all duration-200 ease-out
                        flex items-center gap-3 border-2
                        ${isSelected
                          ? 'bg-[#042d62] text-white border-[#042d62] shadow-lg shadow-[#042d62]/20 scale-105'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-[#042d62] hover:shadow-md hover:scale-102'
                        }
                      `}
                    >
                      {/* Number Badge */}
                      <span className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-white text-[#042d62]'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-[#042d62] group-hover:text-white'
                        }
                      `}>
                        {type === 'bulk_passages' ? 'B' : type.slice(-1)}
                      </span>
                      
                      {/* Label */}
                      <span className="whitespace-nowrap">
                        {type === 'bulk_passages' ? 'Bulk Passages' : `Passage ${type.slice(-1)}`}
                      </span>

                      {/* Completion Badge */}
                      {passageExists && (
                        <span className={`
                          ml-1 text-xs
                          ${isSelected ? 'text-green-300' : 'text-green-600'}
                        `}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Listening Parts */}
          {selectedSection === 'listening' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Listening Part</h3>
              <div className="flex flex-wrap gap-3">
                {(['part_1', 'part_2', 'part_3', 'part_4'] as const).map((type) => {
                  const partExists = parts.some((p: any) => p.part_type === type);
                  const isSelected = selectedSubType === type;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedSubType(type)}
                      className={`
                        group relative px-5 py-3 rounded-xl text-sm font-medium 
                        transition-all duration-200 ease-out
                        flex items-center gap-3 border-2
                        ${isSelected
                          ? 'bg-[#042d62] text-white border-[#042d62] shadow-lg shadow-[#042d62]/20 scale-105'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-[#042d62] hover:shadow-md hover:scale-102'
                        }
                      `}
                    >
                      {/* Number Badge */}
                      <span className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-white text-[#042d62]'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-[#042d62] group-hover:text-white'
                        }
                      `}>
                        {type.slice(-1)}
                      </span>
                      
                      {/* Label */}
                      <span className="whitespace-nowrap">
                        Part {type.slice(-1)}
                      </span>

                      {/* Completion Badge */}
                      {partExists && (
                        <span className={`
                          ml-1 text-xs
                          ${isSelected ? 'text-green-300' : 'text-green-600'}
                        `}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Writing Tasks */}
          {selectedSection === 'writing' && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Writing Task</h3>
              <div className="flex flex-wrap gap-3">
                {(['task1', 'task2'] as const).map((type) => {
                  const taskExists = writingTasks.some((t: any) => t.type === type);
                  const isSelected = selectedSubType === type;
                  
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedSubType(type)}
                      className={`
                        group relative px-5 py-3 rounded-xl text-sm font-medium 
                        transition-all duration-200 ease-out
                        flex items-center gap-3 border-2
                        ${isSelected
                          ? 'bg-[#042d62] text-white border-[#042d62] shadow-lg shadow-[#042d62]/20 scale-105'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-[#042d62] hover:shadow-md hover:scale-102'
                        }
                      `}
                    >
                      {/* Number Badge */}
                      <span className={`
                        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        transition-all duration-200
                        ${isSelected
                          ? 'bg-white text-[#042d62]'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-[#042d62] group-hover:text-white'
                        }
                      `}>
                        {type.slice(-1)}
                      </span>
                      
                      {/* Label */}
                      <span className="whitespace-nowrap">
                        Task {type.slice(-1)}
                      </span>

                      {/* Completion Badge */}
                      {taskExists && (
                        <span className={`
                          ml-1 text-xs
                          ${isSelected ? 'text-green-300' : 'text-green-600'}
                        `}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
                  <QuestionTypeSelector 
                    selectedTypes={selectedQuestionTypes}
                    onTypesChange={setSelectedQuestionTypes}
                  />
                  
                  {/* Add Question Group Button */}
                  {selectedQuestionTypes.length > 0 && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={addQuestionGroup}
                        className="flex items-center gap-2 px-6 py-3 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Guruh Qo'shish</span>
                      </button>
                    </div>
                  )}

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
                          const isIdentifyInfo = ['true_false_not_given', 'yes_no_not_given'].includes(questionTypeName);
                          const isMatchingItem = ['matching_headings', 'matching_information', 'matching_sentence_endings', 'matching_features', 'multiple_choice'].includes(questionTypeName);
                          
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
                                        <label className="block text-sm text-slate-700 mb-2">
                                          Savol Sarlavhasi <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                          type="text"
                                          value={group.matching_item?.title || ''}
                                          onChange={(e) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: e.target.value,
                                              statement: group.matching_item?.statement || [''],
                                              option: group.matching_item?.option || [],
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                          placeholder={
                                            questionTypeName === 'matching_headings' 
                                              ? "Match the following paragraphs with the appropriate headings" 
                                              : questionTypeName === 'matching_information'
                                              ? "Which paragraph contains the following information?"
                                              : questionTypeName === 'matching_sentence_endings'
                                              ? "Complete each sentence with the correct ending"
                                              : questionTypeName === 'matching_features'
                                              ? "Match each statement with the correct person"
                                              : "Masalan: Match each statement with..."
                                          }
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                          required
                                        />
                                      </div>

                                      {/* CHECK QUESTION TYPE - Use specific component */}
                                      {questionTypeName === 'matching_headings' ? (
                                        <MatchingHeadingsInputs
                                          value={group.matching_item}
                                          variantType={group.matching_item?.variant_type || 'letter'}
                                          onChange={(data) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: group.matching_item?.title || '',
                                              statement: data.statement,
                                              option: data.option,
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                        />
                                      ) : questionTypeName === 'matching_information' ? (
                                        <MatchingInformationInputs
                                          value={group.matching_item}
                                          variantType={group.matching_item?.variant_type || 'letter'}
                                          onChange={(data) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: group.matching_item?.title || '',
                                              statement: data.statement,
                                              option: data.option,
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                        />
                                      ) : questionTypeName === 'matching_sentence_endings' ? (
                                        <MatchingSentenceEndingsInputs
                                          value={group.matching_item}
                                          variantType={group.matching_item?.variant_type || 'letter'}
                                          onChange={(data) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: group.matching_item?.title || '',
                                              statement: data.statement,
                                              option: data.option,
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                        />
                                      ) : questionTypeName === 'matching_features' ? (
                                        <MatchingFeaturesInputs
                                          value={group.matching_item}
                                          variantType={group.matching_item?.variant_type || 'letter'}
                                          onChange={(data) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: group.matching_item?.title || '',
                                              statement: data.statement,
                                              option: data.option,
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                        />
                                      ) : (
                                        <MatchingItemInputs
                                          value={group.matching_item}
                                          variantType={group.matching_item?.variant_type || 'letter'}
                                          onChange={(data) => updateGroup(index, {
                                            matching_item: {
                                              ...group.matching_item,
                                              title: group.matching_item?.title || '',
                                              statement: data.statement,
                                              option: data.option,
                                              variant_type: group.matching_item?.variant_type || 'letter',
                                              answer_count: group.matching_item?.answer_count || 1,
                                            }
                                          })}
                                        />
                                      )}



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
                          <span>{currentPassageId ? 'Yangilanmoqda...' : 'Saqlanmoqda...'}</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          <span>{currentPassageId ? 'Yangilash' : 'Saqlash'}</span>
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
              {loadingParts || loading ? (
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

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successMessage.title}
        message={successMessage.message}
        autoClose={true}
        autoCloseDelay={2000}
      />
    </div>
  );
}
