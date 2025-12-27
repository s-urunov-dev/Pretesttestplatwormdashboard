import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Headphones, PenTool, ChevronLeft, Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp, X, Upload, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
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
import { TrueFalseNotGivenInputs } from '../components/TrueFalseNotGivenInputs';
import { SentenceCompletionInputs } from '../components/SentenceCompletionInputs';
import { SummaryCompletionInputs } from '../components/SummaryCompletionInputs';
import { FlowChartCompletionInputs } from '../components/FlowChartCompletionInputs';
import { DiagramLabelingInputs } from '../components/DiagramLabelingInputs';
import { ShortAnswerInputs } from '../components/ShortAnswerInputs';
import { FormCompletionInputs } from '../components/FormCompletionInputs';
import { convertSentenceCompletionToGapFilling } from '../utils/sentenceCompletionConverter';
import { convertGapFillingToSentenceCompletion } from '../utils/gapFillingToSentenceCompletion';
import { convertSummaryCompletionToGapFilling, convertGapFillingToSummaryCompletion } from '../utils/summaryCompletionConverter';
import { convertFlowChartCompletionToGapFilling, convertGapFillingToFlowChartCompletion } from '../utils/flowChartCompletionConverter';
import { convertDiagramLabelingToGapFilling, convertGapFillingToDiagramLabeling } from '../utils/diagramLabelingConverter';
import { convertShortAnswerToGapFilling, convertGapFillingToShortAnswer } from '../utils/shortAnswerConverter';
import { convertFormCompletionToBackend, validateFormCompletionData, convertBackendToFormCompletion } from '../utils/formCompletionConverter';
import { BackendErrorAlert } from '../components/BackendErrorAlert';

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
  const [passagesError, setPassagesError] = useState<Error | null>(null);
  
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
  const [currentPartId, setCurrentPartId] = useState<number | undefined>();
  
  // Track which subType we've loaded data for (to prevent duplicate loads)
  const lastLoadedSubTypeRef = useRef<string>('');
  
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
      // ✅ Clear state before loading new data
      setTitle('');
      setBody('');
      setGroups([]);
      setExpandedGroups([]);
      
      loadPassages();
    } else if (selectedSection !== 'reading') {
      // Clear passages when switching away from reading section
      setPassages([]);
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
      // ✅ Clear state before loading new data
      setTitle('');
      setBody('');
      setGroups([]);
      setExpandedGroups([]);
      setAudioUrl('');
      lastLoadedSubTypeRef.current = ''; // Reset tracking
      
      loadParts();
      // Load listening question types
      loadListeningQuestionTypes();
    } else if (selectedSection !== 'listening') {
      // Clear parts when switching away from listening section
      setParts([]);
      setAudioUrl('');
      lastLoadedSubTypeRef.current = ''; // Reset tracking
    }
  }, [listeningId, selectedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  const [listeningQuestionTypes, setListeningQuestionTypes] = useState<QuestionType[]>([]);

  const loadListeningQuestionTypes = async () => {
    try {
      const types = await getListeningQuestionTypes();
      setListeningQuestionTypes(types);
    } catch (error) {
      console.error('Error loading listening question types:', error);
    }
  };

  // Load existing part data when sub type changes
  useEffect(() => {
    if (selectedSection === 'listening') {
      const subTypeKey = `${selectedSubType}-${parts.length}`;
      if (lastLoadedSubTypeRef.current === subTypeKey) {
        return;
      }
      
      setTitle('');
      setAudioUrl('');
      setGroups([]);
      setExpandedGroups([]);
      
      if (parts.length > 0) {
        loadPartData();
        lastLoadedSubTypeRef.current = subTypeKey;
      } else {
        lastLoadedSubTypeRef.current = '';
      }
    }
  }, [selectedSubType, parts.length, selectedSection]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load existing passage data when sub type changes
  useEffect(() => {
    console.log('🎯 useEffect triggered for loadPassageData');
    console.log('🎯 selectedSection:', selectedSection);
    console.log('🎯 passages.length:', passages.length);
    console.log('🎯 passages:', passages);
    
    if (selectedSection === 'reading' && passages.length > 0) {
      console.log('✅ Calling loadPassageData...');
      
      // ✅ Clear form first, then load new data
      setTitle('');
      setBody('');
      setGroups([]);
      setExpandedGroups([]);
      
      loadPassageData();
    } else {
      console.log('❌ Not calling loadPassageData - conditions not met');
    }
  }, [selectedSubType, passages]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPassages = async () => {
    if (!readingId) return;
    
    try {
      setLoadingPassages(true);
      setPassagesError(null); // Clear previous errors
      const response = await getReadingPassages(readingId);
      console.log('📦 Passages response:', response);
      console.log('📦 Passages results:', response.results);
      setPassages(response.results || []);
    } catch (error) {
      // If error occurs, just set empty passages array - don't show error
      console.log('ℹ️ No passages data available yet');
      setPassages([]);
      setPassagesError(null); // Don't set error for missing data
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
          const gapFillingData = {
            title: group.gap_containers.title || '',
            principle: group.gap_containers.principle || group.gap_containers.criteria || 'NMT_TWO',
            body: group.gap_containers.body || '',
          };
          
          convertedGroup.gap_filling = gapFillingData;
          
          // 🔄 SPECIAL: If question_type is sentence_completion AND no explicit sentence_completion data
          if (questionType === 'sentence_completion' && !group.sentence_completion) {
            convertedGroup.sentence_completion = convertGapFillingToSentenceCompletion(gapFillingData);
          }
          
          // 🔄 SPECIAL: If question_type is summary_completion AND no explicit summary_completion data
          if (questionType === 'summary_completion' && !group.summary_completion) {
            convertedGroup.summary_completion = convertGapFillingToSummaryCompletion(gapFillingData);
          }
          
          // 🔄 SPECIAL: If question_type is flowchart_completion AND no explicit flowchart_completion data
          if (questionType === 'flowchart_completion' && !group.flowchart_completion) {
            convertedGroup.flowchart_completion = convertGapFillingToFlowChartCompletion(gapFillingData);
          }
          
          // 🔄 SPECIAL: If question_type is diagram_labeling AND no explicit diagram_labeling data
          if (questionType === 'diagram_labeling' && !group.diagram_labeling) {
            convertedGroup.diagram_labeling = convertGapFillingToDiagramLabeling(gapFillingData);
          }
          
          // 🔄 SPECIAL: If question_type is short_answer AND no explicit short_answer data
          if (questionType === 'short_answer' && !group.short_answer) {
            convertedGroup.short_answer = convertGapFillingToShortAnswer(gapFillingData);
          }
        }

        // Convert identify_info (now it's an object)
        if (group.identify_info) {
          convertedGroup.identify_info = {
            title: group.identify_info.title || '',
            question: group.identify_info.question || [],
          };
        }

        // Convert sentence_completion (if explicitly provided by backend)
        if (group.sentence_completion) {
          convertedGroup.sentence_completion = {
            title: group.sentence_completion.title || '',
            instruction: group.sentence_completion.instruction || '',
            sentences: group.sentence_completion.sentences || [],
          };
        }

        // Convert summary_completion (if explicitly provided by backend)
        if (group.summary_completion) {
          convertedGroup.summary_completion = {
            title: group.summary_completion.title || '',
            instruction: group.summary_completion.instruction || '',
            summary: group.summary_completion.summary || '',
            options: group.summary_completion.options || [],
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
          
          // 🔄 NEW: Convert matching to multiple_choice_data for multiple_choice question types (Reading)
          if (questionType === 'multiple_choice_one' || questionType === 'multiple_choice_multiple') {
            const statements = group.matching.statement || [];
            const options = group.matching.option || [];
            
            // Build questions array from statements and options
            const questions = statements.map((statement: string, idx: number) => {
              // Get options for this question (array format: ["text1", "text2", ...])
              const questionOptionsArray = options[idx] || [];
              
              // Determine variant type
              const variantType = group.matching.variant_type || 'letter';
              
              // Generate keys based on variant type
              const generateKey = (index: number) => {
                if (variantType === 'letter') {
                  return String.fromCharCode(65 + index); // A, B, C...
                } else if (variantType === 'number') {
                  return String(index + 1); // 1, 2, 3...
                } else {
                  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                  return romanNumerals[index] || String(index + 1);
                }
              };
              
              // Convert from ["text1", "text2"] to [{key: "A", text: "text1"}, ...]
              const optionsFormatted = questionOptionsArray.map((text: string, optIdx: number) => ({
                key: generateKey(optIdx),
                text: text
              }));
              
              return {
                question: statement,
                options: optionsFormatted,
                correctAnswer: group.matching.answer_count > 1 ? [] : '' // Will be set by user
              };
            });
            
            convertedGroup.multiple_choice_data = {
              title: group.matching.title || '',
              variant_type: group.matching.variant_type || 'letter',
              answer_count: group.matching.answer_count || 1,
              questions: questions,
            };
            
            console.log('🔄 Converted matching to multiple_choice_data for Reading:', {
              questions_count: questions.length,
              variant_type: group.matching.variant_type,
              answer_count: group.matching.answer_count,
            });
          }
        }

        console.log('✨ Converted group:', convertedGroup);
        return convertedGroup;
      });

      console.log('🎯 All converted groups:', convertedGroups);
      console.log('🔄 Calling setGroups with:', convertedGroups.length, 'groups');
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
      // If error occurs, just set empty writing tasks array - don't show error
      console.log('ℹ️ No writing tasks data available yet');
      setWritingTasks([]);
    } finally {
      setLoadingWritingTasks(false);
    }
  };

  const loadParts = async () => {
    if (!listeningId) {
      return;
    }
    
    try {
      setLoadingParts(true);
      
      const response = await getListening(listeningId);
      console.log('🎯 LISTENING RESPONSE:', response);
      
      let partsArray = [];
      
      if (response.parts && Array.isArray(response.parts)) {
        console.log('✅ Using response.parts array');
        partsArray = response.parts.map((part: any) => ({
          ...part,
          part_type: part.part_type || `part_${part.id}`,
        }));
      } else {
        console.log('⚠️ No response.parts array, checking individual part fields');
        const partTypes: PartType[] = ['part_1', 'part_2', 'part_3', 'part_4'];
        
        for (const partType of partTypes) {
          const partData = response[partType];
          
          if (partData) {
            if (typeof partData === 'object' && partData !== null) {
              partsArray.push({
                ...partData,
                part_type: partType,
              });
            } else if (typeof partData === 'number') {
              try {
                const fullPartData = await getListeningPartById(partData);
                partsArray.push({
                  ...fullPartData,
                  part_type: partType,
                });
              } catch (fetchError) {
                console.error(`Failed to fetch part ${partType}:`, fetchError);
                partsArray.push({
                  id: partData,
                  part_type: partType,
                  groups: [],
                });
              }
            }
          }
        }
      }
      
      console.log('📦 FINAL PARTS ARRAY:', partsArray);
      setParts(partsArray);
    } catch (error) {
      // If error occurs, just set empty parts array - don't show error
      console.log('ℹ️ No parts data available yet');
      setParts([]);
    } finally {
      setLoadingParts(false);
    }
  };

  const loadPartData = () => {
    console.log('━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 loadPartData called');
    console.log('🔍 selectedSubType:', selectedSubType);
    console.log('🔍 parts array length:', parts.length);
    console.log('🔍 parts array:', parts);
    
    // Find part matching current sub type
    const currentPart = parts.find(
      (p) => p.part_type === selectedSubType
    );

    console.log('🔍 currentPart found:', !!currentPart);
    console.log('🔍 currentPart:', currentPart);

    if (currentPart) {
      // ✅ Set current part ID for updates
      setCurrentPartId(currentPart.id);
      
      // Load title and audio
      setTitle(currentPart.title || '');
      // Handle audio - API returns audio as object with audio field, or direct URL
      const audioUrlFromPart = typeof currentPart.audio === 'object' && currentPart.audio?.audio
        ? currentPart.audio.audio
        : currentPart.audio || '';
      setAudioUrl(audioUrlFromPart);

      // ✅ Convert backend groups to frontend format
      const backendGroups = currentPart.groups || currentPart.question_groups || [];
      
      const convertedGroups: QuestionGroup[] = backendGroups.map((group: any) => {
        const questionType = typeof group.listening_question_type === 'string' 
          ? group.listening_question_type 
          : group.listening_question_type?.type;
        
        const convertedGroup: QuestionGroup = {
          question_type: questionType,
          from_value: group.from_value,
          to_value: group.to_value,
        };

        const gapData = group.gap_containers || group.completion || group.gap_filling;
        
        if (gapData) {
          const gapFillingData = {
            title: gapData.title || '',
            principle: gapData.principle || gapData.criteria || 'NMT_TWO',
            body: gapData.body || '',
          };
          
          convertedGroup.gap_filling = gapFillingData;
          
          if (questionType === 'sentence_completion' && !group.sentence_completion) {
            convertedGroup.sentence_completion = convertGapFillingToSentenceCompletion(gapFillingData);
          }
          
          if (questionType === 'form_completion') {
            convertedGroup.form_completion = {
              title: gapFillingData.title || 'Complete the form below',
              body: gapFillingData.body || '',
              principle: gapFillingData.principle || 'NMT_TWO',
            };
          }
          
          if (questionType === 'summary_completion' && !group.summary_completion) {
            convertedGroup.summary_completion = {
              title: gapFillingData.title || 'Complete the summary below.',
              body: gapFillingData.body || '',
              principle: gapFillingData.principle || 'NMT_TWO',
            };
          }
          
          if (questionType === 'flow_chart_completion' && !group.flow_chart_completion) {
            convertedGroup.flow_chart_completion = {
              title: gapFillingData.title || 'Complete the flow chart below.',
              body: gapFillingData.body || '',
              principle: gapFillingData.principle || 'NMT_TWO',
            };
          }
        }

        // Convert matching_statement to matching_item OR multiple_choice_data (new API structure)
        if (group.matching_statement && Array.isArray(group.matching_statement) && group.matching_statement.length > 0) {
          const firstStatement = group.matching_statement[0];
          
          // Check if this is multiple_choice (multiple_choice_one or multiple_choice_multiple)
          if (questionType === 'multiple_choice_one' || questionType === 'multiple_choice_multiple') {
            // Convert to multiple_choice_data format
            const statements = firstStatement.statement || [];
            const options = firstStatement.option || [];
            
            // Build questions array from statements and options
            const questions = statements.map((statement: string, idx: number) => {
              // Get options for this question (array of strings)
              const questionOptionsArray = options[idx] || [];
              
              // Generate keys based on variant_type
              const variantType = firstStatement.variant_type || 'letter';
              const optionsArray = questionOptionsArray.map((text: string, optIdx: number) => {
                let key = '';
                if (variantType === 'letter') {
                  key = String.fromCharCode(65 + optIdx); // A, B, C, D...
                } else if (variantType === 'number') {
                  key = String(optIdx + 1); // 1, 2, 3, 4...
                } else {
                  // Roman numerals
                  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                  key = romanNumerals[optIdx] || String(optIdx + 1);
                }
                return { key, text };
              });
              
              return {
                question: statement,
                options: optionsArray,
                correctAnswer: firstStatement.answer_count > 1 ? [] : '' // Will be set by user
              };
            });
            
            convertedGroup.multiple_choice_data = {
              title: firstStatement.title || '',
              variant_type: firstStatement.variant_type || 'letter',
              answer_count: firstStatement.answer_count || 1,
              questions: questions,
            };
          } else {
            // Regular matching_item
            convertedGroup.matching_item = {
              title: firstStatement.title || '',
              statement: firstStatement.statement || [],
              option: firstStatement.option || [],
              variant_type: firstStatement.variant_type || 'letter',
              answer_count: firstStatement.answer_count || 1,
            };
          }
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

        // Convert sentence_completion
        if (group.sentence_completion) {
          convertedGroup.sentence_completion = {
            title: group.sentence_completion.title || '',
            instruction: group.sentence_completion.instruction || '',
            sentences: group.sentence_completion.sentences || [],
          };
        }

        if (group.table_completion) {
          let tableDetails: any = group.table_completion.table_details;
          
          if (typeof tableDetails === 'string') {
            try {
              tableDetails = JSON.parse(tableDetails);
            } catch (e) {
              tableDetails = {};
            }
          }
          
          if (!tableDetails || typeof tableDetails !== 'object') {
            tableDetails = {};
          }

          convertedGroup.table_completion = {
            principle: group.table_completion.principle || 'ONE_WORD',
            table_details: tableDetails,
          } as any;
        }

        return convertedGroup;
      });

      setGroups(convertedGroups);
      
      const allGroupIndexes = convertedGroups.map((_, index) => index);
      setExpandedGroups(allGroupIndexes);
    } else {
      // Clear form if part doesn't exist
      setCurrentPartId(undefined);
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
      if (group.sentence_completion) {
        if (!group.sentence_completion.title || !group.sentence_completion.title.trim()) {
          alert(`Guruh ${i + 1}: Sentence Completion uchun title to'ldirish majburiy!`);
          return;
        }
        if (!group.sentence_completion.sentences || group.sentence_completion.sentences.length === 0) {
          alert(`Guruh ${i + 1}: Sentence Completion uchun kamida bitta jumla qo'shing!`);
          return;
        }
      }
      if (group.form_completion) {
        const validation = validateFormCompletionData(group.form_completion);
        if (!validation.valid) {
          alert(`Guruh ${i + 1}: Form Completion xatolari:\n${validation.errors.join('\n')}`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      // 🔍 DEBUG: Log groups before cleaning
      console.log('📦 BEFORE CLEANING - Raw groups:', JSON.stringify(groups, null, 2));
      
      // Clean up groups before saving - remove empty lines from arrays
      const cleanedGroups = groups.map(group => {
        const cleanedGroup = { ...group };
        
        // Convert sentence_completion to gap_filling for backend compatibility
        if (cleanedGroup.sentence_completion && cleanedGroup.question_type === 'sentence_completion') {
          cleanedGroup.gap_filling = convertSentenceCompletionToGapFilling(
            cleanedGroup.sentence_completion,
            cleanedGroup.from_value
          );
          
          // Delete sentence_completion - backend only needs gap_filling
          delete cleanedGroup.sentence_completion;
        }
        
        // Convert summary_completion to gap_filling for backend compatibility
        if (cleanedGroup.summary_completion && cleanedGroup.question_type === 'summary_completion') {
          cleanedGroup.gap_filling = convertSummaryCompletionToGapFilling(
            cleanedGroup.summary_completion
          );
          
          // Delete summary_completion - backend only needs gap_filling
          delete cleanedGroup.summary_completion;
        }
        
        // Convert flowchart_completion to gap_filling for backend compatibility
        if (cleanedGroup.flowchart_completion && cleanedGroup.question_type === 'flowchart_completion') {
          console.log('🔄 Converting flowchart_completion:', cleanedGroup.flowchart_completion);
          const converted = convertFlowChartCompletionToGapFilling(
            cleanedGroup.flowchart_completion
          );
          console.log('✅ Converted to gap_filling:', converted);
          cleanedGroup.gap_filling = converted;
          
          // Delete flowchart_completion - backend only needs gap_filling
          delete cleanedGroup.flowchart_completion;
        }
        
        // Convert diagram_labeling to gap_filling for backend compatibility
        if (cleanedGroup.diagram_labeling && cleanedGroup.question_type === 'diagram_labeling') {
          console.log('🔄 Converting diagram_labeling:', cleanedGroup.diagram_labeling);
          const converted = convertDiagramLabelingToGapFilling(
            cleanedGroup.diagram_labeling
          );
          console.log('✅ Converted to gap_filling:', converted);
          cleanedGroup.gap_filling = converted;
          
          // Delete diagram_labeling - backend only needs gap_filling
          delete cleanedGroup.diagram_labeling;
        }
        
        // Convert short_answer to gap_filling for backend compatibility
        if (cleanedGroup.short_answer && cleanedGroup.question_type === 'short_answer') {
          cleanedGroup.gap_filling = convertShortAnswerToGapFilling(
            cleanedGroup.short_answer
          );
          
          // Delete short_answer - backend only needs gap_filling
          delete cleanedGroup.short_answer;
        }
        
        // Convert form_completion to gap_filling for backend compatibility
        if (cleanedGroup.form_completion && cleanedGroup.question_type === 'form_completion') {
          console.log('🔄 Converting form_completion:', cleanedGroup.form_completion);
          
          // Validate before converting
          const validation = validateFormCompletionData(cleanedGroup.form_completion);
          if (!validation.valid) {
            console.error('❌ Form Completion validation failed:', validation.errors);
            throw new Error(`Form Completion xatolari:\n${validation.errors.join('\n')}`);
          }
          
          const converted = convertFormCompletionToGapFilling(
            cleanedGroup.form_completion
          );
          console.log('✅ Converted to gap_filling:', converted);
          cleanedGroup.gap_filling = converted;
          
          // Delete form_completion - backend only needs gap_filling
          delete cleanedGroup.form_completion;
        }
        
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

    // ✅ CHECK: If part exists, show warning about UPDATE not being supported yet
    const existingPart = parts.find((p: any) => p.part_type === selectedSubType);
    if (existingPart) {
      alert(
        `⚠️ Ogohlantirish!\n\n` +
        `Part ${selectedSubType.slice(-1)} allaqachon mavjud (ID: ${existingPart.id}).\n\n` +
        `🚧 Part'ni yangilash (UPDATE) funksiyasi hozircha qo'llab-quvvatlanmaydi.\n\n` +
        `💡 Iltimos:\n` +
        `• Boshqa part tanlang va yangi part yarating, YOKI\n` +
        `• Backend'da UPDATE API endpoint'ini yoqing`
      );
      return;
    }

    // ✅ CRITICAL: Check if all 4 parts already exist
    if (parts.length >= 4) {
      const existingParts = parts.map((p: any) => `Part ${p.part_type.slice(-1)}`).join(', ');
      alert(
        `⚠️ Bu Listening uchun barcha 4 ta part allaqachon yaratilgan!\n\n` +
        `Mavjud partlar: ${existingParts}\n\n` +
        `📝 Yangi part qo'shish uchun yangi Test yarating.`
      );
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

        // Convert sentence_completion to gap_filling first (if applicable)
        let gapFillingData = group.gap_filling;
        
        if (!gapFillingData && group.sentence_completion && group.question_type === 'sentence_completion') {
          gapFillingData = convertSentenceCompletionToGapFilling(
            group.sentence_completion,
            group.from_value
          );
        }
        
        // Convert form_completion to completion (body directly - no need for questions array)
        if (!gapFillingData && group.form_completion && group.question_type === 'form_completion') {
          gapFillingData = {
            title: group.form_completion.title || 'Complete the form below',
            principle: 'NMT_TWO' as CriteriaType,
            body: group.form_completion.body || '',
          };
          console.log('🔄 Converted form_completion to gap_filling:', gapFillingData);
        }

        // Map gap_filling to completion
        if (gapFillingData) {
          listeningGroup.completion = {
            title: gapFillingData.title,
            principle: gapFillingData.principle,
            body: gapFillingData.body,
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

        // Map multiple_choice_data to matching_statement (convert dynamic format to backend format)
        if (group.multiple_choice_data) {
          const mcData = group.multiple_choice_data;
          
          // Convert questions array to statement array (question texts)
          const statements = mcData.questions.map((q: any) => q.question);
          
          // Convert options from array of {key, text} to array of arrays
          // Backend expects: [["text1", "text2", "text3"], ...]
          const optionsFormatted = mcData.questions.map((q: any) => {
            return q.options.map((opt: any) => opt.text);
          });
          
          listeningGroup.matching_statement = [{
            title: mcData.title || '',
            statement: statements,
            option: optionsFormatted,
            variant_type: mcData.variant_type,
            answer_count: mcData.answer_count,
          }];
          
          console.log('🔄 Converted multiple_choice_data to matching_statement:', {
            questions_count: statements.length,
            variant_type: mcData.variant_type,
            answer_count: mcData.answer_count,
          });
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
              lastLoadedSubTypeRef.current = ''; // Clear tracking
              // ✅ SMART SELECTION: Choose first non-created part
              const allPartTypes: PartType[] = ['part_1', 'part_2', 'part_3', 'part_4'];
              const availablePart = allPartTypes.find(
                type => !parts.some((p: any) => p.part_type === type)
              );
              setSelectedSubType(availablePart || 'part_1');
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
              
              {/* Loading indicator */}
              {loadingParts && (
                <div className="p-6 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-[#042d62] animate-spin" />
                  <span className="text-slate-600">Part'lar yuklanmoqda...</span>
                </div>
              )}
              
              {/* Show warning if all 4 parts exist */}
              {!loadingParts && parts.length >= 4 ? (
                <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-amber-900 mb-2">
                        ✅ Barcha Partlar Yaratilgan!
                      </h4>
                      <p className="text-sm text-amber-800 mb-3">
                        Bu Listening test uchun barcha 4 ta part muvaffaqiyatli yaratildi. IELTS Listening testida faqat 4 ta part bo'ladi.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {parts.map((p: any) => (
                          <span key={p.id} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                            ✓ Part {p.part_type.slice(-1)}
                          </span>
                        ))}
                      </div>
                      <div className="p-3 bg-white/80 rounded-lg border border-amber-200">
                        <p className="text-sm text-slate-700 mb-2">
                          <strong>💡 Keyingi Qadamlar:</strong>
                        </p>
                        <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc">
                          <li>Mavjud Partlarni tahrirlash uchun pastdan birini tanlang</li>
                          <li>Yoki yangi Test yarating va yangi Listening qo'shing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Editing interface for existing parts */}
                  <div className="mt-6 pt-6 border-t border-amber-200">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Mavjud Partlarni tahrirlash:</h4>
                    <div className="flex flex-wrap gap-3">
                      {(['part_1', 'part_2', 'part_3', 'part_4'] as const).map((type) => {
                        const partExists = parts.some((p: any) => p.part_type === type);
                        const isSelected = selectedSubType === type;
                        
                        if (!partExists) return null;
                        
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              lastLoadedSubTypeRef.current = ''; // Clear tracking
                              setSelectedSubType(type);
                            }}
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
                            <span className="whitespace-nowrap">
                              Part {type.slice(-1)}
                            </span>
                            <span className={`ml-1 text-xs ${isSelected ? 'text-green-300' : 'text-green-600'}`}>
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : !loadingParts ? (
                <div>
                  <div className="flex flex-wrap gap-3">
                    {(['part_1', 'part_2', 'part_3', 'part_4'] as const).map((type) => {
                      const partExists = parts.some((p: any) => p.part_type === type);
                      const isSelected = selectedSubType === type;
                      
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            lastLoadedSubTypeRef.current = ''; // Clear tracking
                            setSelectedSubType(type);
                          }}
                          disabled={partExists}
                          className={`
                            group relative px-5 py-3 rounded-xl text-sm font-medium 
                            transition-all duration-200 ease-out
                            flex items-center gap-3 border-2
                            ${partExists
                              ? 'bg-green-50 text-green-700 border-green-300 cursor-not-allowed opacity-75'
                              : isSelected
                                ? 'bg-[#042d62] text-white border-[#042d62] shadow-lg shadow-[#042d62]/20 scale-105'
                                : 'bg-white text-slate-700 border-slate-300 hover:border-[#042d62] hover:shadow-md hover:scale-102'
                            }
                          `}
                        >
                          <span className={`
                            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                            transition-all duration-200
                            ${partExists
                              ? 'bg-green-200 text-green-800'
                              : isSelected
                                ? 'bg-white text-[#042d62]'
                                : 'bg-slate-100 text-slate-600 group-hover:bg-[#042d62] group-hover:text-white'
                            }
                          `}>
                            {type.slice(-1)}
                          </span>
                          <span className="whitespace-nowrap">
                            Part {type.slice(-1)}
                          </span>
                          {partExists && (
                            <span className="ml-1 text-xs text-green-600 font-semibold">
                              ✓ Yaratilgan
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Info message when some parts exist */}
                  {parts.length > 0 && parts.length < 4 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                      <p className="text-sm text-blue-900">
                        💡 <strong>{parts.length} ta part yaratilgan</strong> - Yana {4 - parts.length} ta part qo'shishingiz mumkin.
                      </p>
                    </div>
                  )}
                  
                  {/* Editing interface for existing parts */}
                  {parts.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">Mavjud Partlarni tahrirlash:</h4>
                      <div className="flex flex-wrap gap-3">
                        {(['part_1', 'part_2', 'part_3', 'part_4'] as const).map((type) => {
                          const partExists = parts.some((p: any) => p.part_type === type);
                          const isSelected = selectedSubType === type;
                          
                          if (!partExists) return null;
                          
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
                              <span className="whitespace-nowrap">
                                Part {type.slice(-1)}
                              </span>
                              <span className={`ml-1 text-xs ${isSelected ? 'text-green-300' : 'text-green-600'}`}>
                                ✓
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
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

              {/* Error Display */}
              {!loadingPassages && passagesError && (
                <BackendErrorAlert 
                  error={passagesError} 
                  onRetry={() => loadPassages()}
                />
              )}

              {!loadingPassages && !passagesError && (
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
                          const isGapFilling = questionTypeName === 'table_completion';
                          const isFlowChartCompletion = questionTypeName === 'flowchart_completion';
                          const isDiagramLabeling = questionTypeName === 'diagram_labeling';
                          const isShortAnswer = questionTypeName === 'short_answer';
                          const isIdentifyInfo = ['true_false_not_given', 'yes_no_not_given'].includes(questionTypeName);
                          const isMatchingItem = ['matching_headings', 'matching_information', 'matching_sentence_endings', 'matching_features', 'multiple_choice'].includes(questionTypeName);
                          const isSentenceCompletion = questionTypeName === 'sentence_completion';
                          const isSummaryCompletion = questionTypeName === 'summary_completion';
                          const isFormCompletion = questionTypeName === 'form_completion';
                          
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
                                              diagram_chart: group.gap_filling?.diagram_chart,
                                            }
                                          })}
                                          placeholder="Masalan: Complete the sentences"
                                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                        />
                                      </div>

                                      {/* Diagram/Flowchart Image Upload - Only for specific types */}
                                      {(isDiagramLabeling || isFlowChartCompletion) && (
                                        <div>
                                          <label className="block text-sm text-slate-700 mb-2 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            Diagram / Flowchart Image (ixtiyoriy)
                                          </label>

                                          {!group.gap_filling?.diagram_chart?.image ? (
                                            <div className="space-y-3">
                                              {/* File Upload */}
                                              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors">
                                                <label className="flex flex-col items-center gap-3 cursor-pointer">
                                                  <div className="w-16 h-16 rounded-full bg-[#042d62] flex items-center justify-center">
                                                    <Upload className="w-8 h-8 text-white" />
                                                  </div>
                                                  <div className="text-center">
                                                    <p className="text-sm font-medium text-slate-700">
                                                      Kompyuterdan rasm yuklash
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                      PNG, JPG yoki WEBP (Max 5MB)
                                                    </p>
                                                  </div>
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (!file) return;

                                                      if (!file.type.startsWith('image/')) {
                                                        alert('Iltimos, faqat rasm fayli yuklang!');
                                                        return;
                                                      }

                                                      if (file.size > 5 * 1024 * 1024) {
                                                        alert('Rasm hajmi 5MB dan kichik bo\'lishi kerak!');
                                                        return;
                                                      }

                                                      const reader = new FileReader();
                                                      reader.onload = (event) => {
                                                        const base64String = event.target?.result as string;
                                                        updateGroup(index, {
                                                          gap_filling: {
                                                            ...group.gap_filling,
                                                            title: group.gap_filling?.title || '',
                                                            principle: group.gap_filling?.principle || 'NMT_TWO',
                                                            body: group.gap_filling?.body || '',
                                                            diagram_chart: { image: base64String }
                                                          }
                                                        });
                                                      };
                                                      reader.readAsDataURL(file);
                                                    }}
                                                    className="hidden"
                                                  />
                                                </label>
                                              </div>

                                              <div className="text-center text-sm text-slate-500">yoki</div>
                                              <input
                                                type="text"
                                                value={group.gap_filling?.diagram_chart?.image || ''}
                                                onChange={(e) => {
                                                  const imageUrl = e.target.value;
                                                  updateGroup(index, {
                                                    gap_filling: {
                                                      ...group.gap_filling,
                                                      title: group.gap_filling?.title || '',
                                                      principle: group.gap_filling?.principle || 'NMT_TWO',
                                                      body: group.gap_filling?.body || '',
                                                      diagram_chart: imageUrl ? { image: imageUrl } : undefined
                                                    }
                                                  });
                                                }}
                                                placeholder="Rasm URL manzilini kiriting"
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                                              />
                                            </div>
                                          ) : (
                                            <div className="relative border border-slate-200 rounded-lg p-4 bg-slate-50">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  updateGroup(index, {
                                                    gap_filling: {
                                                      ...group.gap_filling,
                                                      title: group.gap_filling?.title || '',
                                                      principle: group.gap_filling?.principle || 'NMT_TWO',
                                                      body: group.gap_filling?.body || '',
                                                      diagram_chart: undefined
                                                    }
                                                  });
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                              <img 
                                                src={group.gap_filling?.diagram_chart?.image} 
                                                alt="Diagram/Flowchart preview" 
                                                className="max-w-full h-auto rounded"
                                                onError={(e) => {
                                                  e.currentTarget.style.display = 'none';
                                                }}
                                              />
                                              <div className="mt-2 text-xs text-slate-600 text-center">
                                                ✓ Rasm yuklandi
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}

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
                                              diagram_chart: group.gap_filling?.diagram_chart,
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
                                              diagram_chart: group.gap_filling?.diagram_chart,
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
                                      <TrueFalseNotGivenInputs
                                        value={group.identify_info}
                                        onChange={(data) => updateGroup(index, {
                                          identify_info: {
                                            title: data.title,
                                            question: data.questions.map(q => q.text) // Backend expects question array of strings
                                          }
                                        })}
                                      />
                                    </div>
                                  )}

                                  {/* Sentence Completion Fields */}
                                  {isSentenceCompletion && (
                                    <div className="space-y-4 pt-4 border-t border-slate-300">
                                      <SentenceCompletionInputs
                                        value={group.sentence_completion}
                                        onChange={(data) => updateGroup(index, {
                                          sentence_completion: data
                                        })}
                                      />
                                    </div>
                                  )}

                                  {/* Summary Completion Fields */}
                                  {isSummaryCompletion && (
                                    <div className="space-y-4 pt-4 border-t border-slate-300">
                                      <SummaryCompletionInputs
                                        value={group.summary_completion}
                                        onChange={(data) => updateGroup(index, {
                                          summary_completion: data
                                        })}
                                      />
                                    </div>
                                  )}

                                  {/* Flow Chart Completion Fields */}
                                  {isFlowChartCompletion && (
                                    <div className="space-y-4 pt-4 border-t border-slate-300">
                                      <FlowChartCompletionInputs
                                        value={group.flowchart_completion}
                                        onChange={(data) => updateGroup(index, {
                                          flowchart_completion: data
                                        })}
                                      />
                                    </div>
                                  )}

                                  {/* Diagram Labeling Fields */}
                                  {isDiagramLabeling && (
                                    <div className="space-y-4 pt-4 border-t border-slate-300">
                                      <DiagramLabelingInputs
                                        value={group.diagram_labeling}
                                        onChange={(data) => updateGroup(index, {
                                          diagram_labeling: data
                                        })}
                                      />
                                    </div>
                                  )}

                                  {/* Short Answer Fields */}
                                  {isShortAnswer && (
                                    <div className="space-y-4 pt-4 border-t border-slate-300">
                                      <ShortAnswerInputs
                                        value={group.short_answer}
                                        onChange={(data) => updateGroup(index, {
                                          short_answer: data
                                        })}
                                      />
                                    </div>
                                  )}

                                  {/* Form Completion Fields */}
                                  {isFormCompletion && (
                                    <div className="space-y-4 pt-4 border-t border-slate-300">
                                      <FormCompletionInputs
                                        value={group.form_completion}
                                        onChange={(data) => updateGroup(index, {
                                          form_completion: data
                                        })}
                                      />
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

          {selectedSection === 'listening' && (() => {
            // Find existing part for current partType
            const currentPart = parts.find((p: any) => p.part_type === selectedSubType);
            const partExists = !!currentPart;
            
            // Check if all 4 parts already exist
            const allPartsExist = parts.length >= 4;
            
            // If all parts exist and user selected a non-existing part, show message
            if (allPartsExist && !partExists) {
              return (
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Barcha Partlar Yaratilgan
                      </h3>
                      <p className="text-slate-600 max-w-md">
                        Bu Listening test uchun barcha 4 ta part allaqachon yaratilgan. 
                        Mavjud partni tahrirlash uchun yuqoridan tanlang.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            
            // If part already exists, show read-only view
            if (partExists) {
              return (
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Warning Banner */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            ✅ Part {selectedSubType.slice(-1)} Allaqachon Yaratilgan
                          </h4>
                          <p className="text-sm text-blue-800 mb-3">
                            Bu part allaqachon saqlangan. Hozircha tahrirlash funksiyasi mavjud emas.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => navigate(`/test/${testId}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              ← Test sahifasiga qaytish
                            </button>
                            <button
                              onClick={() => {
                                // Select a non-existing part
                                const availablePart = (['part_1', 'part_2', 'part_3', 'part_4'] as const).find(
                                  type => !parts.some((p: any) => p.part_type === type)
                                );
                                if (availablePart) {
                                  lastLoadedSubTypeRef.current = ''; // Clear tracking
                                  setSelectedSubType(availablePart);
                                }
                              }}
                              className="px-4 py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                              disabled={parts.length >= 4}
                            >
                              Yangi Part Yaratish
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Part Details (Read-only) */}
                    <div className="p-6">
                      <div className="space-y-6">
                        {/* Part Title */}
                        {currentPart?.title && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Part Sarlavhasi</label>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                              {currentPart.title}
                            </div>
                          </div>
                        )}
                        
                        {/* Audio File */}
                        {currentPart?.audio && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Audio Fayl</label>
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                              <audio controls className="w-full">
                                <source src={currentPart.audio} type="audio/mpeg" />
                                Your browser does not support the audio element.
                              </audio>
                            </div>
                          </div>
                        )}
                        
                        {/* Question Groups */}
                        {currentPart?.groups && currentPart.groups.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Savol Guruhlari</label>
                            <div className="space-y-3">
                              {currentPart.groups.map((group: any, index: number) => (
                                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 bg-[#042d62] text-white rounded-full text-sm font-medium">
                                      Guruh {index + 1}
                                    </span>
                                    <span className="text-sm text-slate-600">
                                      Savollar {group.from_value} - {group.to_value}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                      {group.listening_question_type?.type || group.listening_question_type}
                                    </span>
                                  </div>
                                  {group.completion?.title && (
                                    <p className="text-sm text-slate-600 mt-2">
                                      <strong>Sarlavha:</strong> {group.completion.title}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            
            // Part doesn't exist - show creation form
            // ✅ EXTRA SAFETY: Double check before showing form
            if (parts.length >= 4 || partExists) {
              return (
                <div className="max-w-5xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Part Allaqachon Mavjud
                      </h3>
                      <p className="text-slate-600 max-w-md mb-4">
                        Bu part allaqachon yaratilgan. Tahrirlash uchun yuqoridan tanlang.
                      </p>
                      <button
                        onClick={() => navigate(`/test/${testId}`)}
                        className="px-6 py-3 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-colors"
                      >
                        ← Test sahifasiga qaytish
                      </button>
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="max-w-5xl mx-auto">
                {/* Loading Indicator */}
                {loadingParts || loading ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-12 h-12 animate-spin text-[#042d62] mb-4" />
                      <p className="text-slate-600">Yuklanmoqda...</p>
                    </div>
                  </div>
                ) : parts.length >= 4 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">
                        ✅ Barcha 4 ta part yaratilgan!
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md">
                        Bu Listening test uchun barcha partlar muvaffaqiyatli yaratildi. Yangi part qo'shish uchun yangi Test yarating.
                      </p>
                      <button
                        onClick={() => navigate(`/test/${testId}`)}
                        className="px-6 py-3 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-colors"
                      >
                        Test Sahifasiga Qaytish
                      </button>
                    </div>
                  </div>
                ) : parts.length >= 4 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-3">
                        ✅ Barcha 4 ta part yaratilgan!
                      </h3>
                      <p className="text-slate-600 mb-6 max-w-md">
                        Bu Listening uchun barcha partlar (Part 1, 2, 3, 4) allaqachon yaratilgan. 
                        Yangi part qo&apos;shish uchun yangi Test yarating.
                      </p>
                      <button
                        onClick={() => navigate(`/test/${testId}`)}
                        className="px-6 py-3 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-colors"
                      >
                        Test Sahifasiga Qaytish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-5xl mx-auto">
                    <ListeningForm
                      questionTypes={listeningQuestionTypes}
                      initialTitle={title}
                      initialAudioUrl={audioUrl}
                      initialGroups={groups}
                      onSave={handleListeningSave}
                      saving={saving || loadingParts}
                    />
                  </div>
                )}
              </div>
            );
          })()}

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
