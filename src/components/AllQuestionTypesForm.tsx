import { useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp, Upload, Image as ImageIcon, X } from 'lucide-react';
import { Question } from './QuestionPanel';
import { QuestionGroupForm } from './QuestionGroupForm';
import { ImageUploader } from './ImageUploader';

interface AllQuestionTypesFormProps {
  // For QuestionPanel mode
  selectedType?: 'reading' | 'listening' | 'writing';
  selectedSection?: string;
  onSubmit?: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  onBack?: () => void;
  allSectionsComplete?: boolean;
  
  // For TestDetailPage mode
  sectionType?: 'reading' | 'listening' | 'writing';
  sectionLabel?: string;
  sectionData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

interface QuestionGroup {
  id: string;
  questionRange: string;
  questionType: string;
  category: string;
  instructions: string;
  answerFormat: string;
  passage?: string;
  imageUrl?: string;
  tableData?: { headers: string[]; rows: string[][] };
  multipleChoiceOptions?: string[];
  matchingData?: { items: string[]; options: string[] };
  subQuestions: { number: string; text: string; answer: string | string[] }[];
}

export function AllQuestionTypesForm({ 
  selectedType, 
  selectedSection, 
  onSubmit, 
  onBack, 
  allSectionsComplete,
  sectionType,
  sectionLabel,
  sectionData,
  onSave,
  onCancel
}: AllQuestionTypesFormProps) {
  // Determine which mode we're in
  const isTestDetailMode = !!sectionType;
  const currentType = sectionType || selectedType!;
  const currentSection = sectionLabel || selectedSection!;
  
  const [title, setTitle] = useState(sectionData?.title || '');
  
  // Section-specific fields
  const [passageText, setPassageText] = useState(sectionData?.passageText || '');
  const [audioFile, setAudioFile] = useState<File | null>(sectionData?.audioFile || null);
  const [taskImage, setTaskImage] = useState(sectionData?.taskImage || '');
  const [essayPrompt, setEssayPrompt] = useState(sectionData?.essayPrompt || '');
  
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([
    {
      id: '1',
      questionRange: '',
      questionType: '',
      category: '',
      instructions: '',
      answerFormat: '',
      subQuestions: [],
    },
  ]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['1']);

  const addQuestionGroup = () => {
    const newId = (questionGroups.length + 1).toString();
    setQuestionGroups([
      ...questionGroups,
      {
        id: newId,
        questionRange: '',
        questionType: '',
        category: '',
        instructions: '',
        answerFormat: '',
        subQuestions: [],
      },
    ]);
    setExpandedGroups([...expandedGroups, newId]);
  };

  const removeQuestionGroup = (id: string) => {
    setQuestionGroups(questionGroups.filter(g => g.id !== id));
    setExpandedGroups(expandedGroups.filter(gId => gId !== id));
  };

  const updateQuestionGroup = (id: string, updatedGroup: Partial<QuestionGroup>) => {
    setQuestionGroups(questionGroups.map(g => g.id === id ? { ...g, ...updatedGroup } : g));
  };

  const toggleGroupExpanded = (id: string) => {
    if (expandedGroups.includes(id)) {
      setExpandedGroups(expandedGroups.filter(gId => gId !== id));
    } else {
      setExpandedGroups([...expandedGroups, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine all question groups into one question
    const allSubQuestions = questionGroups.flatMap(group => 
      group.subQuestions.map(sq => ({
        ...sq,
        groupId: group.id,
        groupType: group.questionType,
        groupInstructions: group.instructions,
      }))
    );

    const question: Omit<Question, 'id' | 'createdAt'> = {
      type: currentType,
      section: currentSection,
      category: title || questionGroups[0]?.category || 'Mixed Questions',
      title: title,
      content: JSON.stringify(questionGroups), // Save all groups as JSON
      questionType: 'mixed', // Special type for multiple question types
      points: 1,
      timeLimit: 180,
      subQuestions: allSubQuestions as any,
    };

    if (isTestDetailMode) {
      onSave?.(question);
    } else {
      onSubmit?.(question);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Title */}
        <div>
          <label className="block text-slate-700 mb-2">
            {currentType === 'reading' && 'Passage Sarlavhasi'}
            {currentType === 'listening' && 'Part Sarlavhasi'}
            {currentType === 'writing' && 'Task Sarlavhasi'}
            {' '}<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              currentType === 'reading' 
                ? "Masalan: Climate Change and Its Effects"
                : currentType === 'listening'
                ? "Masalan: University Campus Tour"
                : currentSection.includes('task-1')
                ? "Masalan: Graph Analysis - Population Growth"
                : "Masalan: The Impact of Technology on Education"
            }
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50"
            required
          />
        </div>

        {/* Reading-specific: Passage Text */}
        {currentType === 'reading' && (
          <div>
            <label className="block text-slate-700 mb-2">
              Passage Matni <span className="text-red-500">*</span>
            </label>
            <textarea
              value={passageText}
              onChange={(e) => setPassageText(e.target.value)}
              placeholder="Passage matnini kiriting..."
              rows={12}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50 resize-none"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Talabalar o'qishlari uchun to'liq passage matnini kiriting
            </p>
          </div>
        )}

        {/* Listening-specific: Audio File */}
        {currentType === 'listening' && (
          <div>
            <label className="block text-slate-700 mb-2">
              Audio Fayl <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#042d62] transition-colors">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
                id="audio-upload"
              />
              <label htmlFor="audio-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 bg-slate-100 rounded-xl">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-700">
                      {audioFile ? audioFile.name : 'Audio faylni yuklang'}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      MP3, WAV yoki boshqa audio formatlar
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Writing-specific: Task 1 - Image */}
        {currentType === 'writing' && currentSection.includes('task-1') && (
          <div>
            <label className="block text-slate-700 mb-2">
              Graph/Chart/Diagram Rasmi <span className="text-red-500">*</span>
            </label>
            <ImageUploader
              imageUrl={taskImage}
              onImageChange={setTaskImage}
              label="Graph, chart yoki diagram rasmini yuklang"
            />
            <p className="text-sm text-slate-500 mt-2">
              Talabalar tahlil qilishlari uchun graph, chart yoki diagram rasmini yuklang
            </p>
          </div>
        )}

        {/* Writing-specific: Task 2 - Essay Prompt */}
        {currentType === 'writing' && currentSection.includes('task-2') && (
          <div>
            <label className="block text-slate-700 mb-2">
              Essay Topshirig'i <span className="text-red-500">*</span>
            </label>
            <textarea
              value={essayPrompt}
              onChange={(e) => setEssayPrompt(e.target.value)}
              placeholder="Masalan: Some people believe that technology has made our lives easier. Others think it has made life more complicated. Discuss both views and give your own opinion."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50 resize-none"
              required
            />
            <p className="text-sm text-slate-500 mt-2">
              Talabalar essay yozishlari uchun topshiriqni kiriting (250+ so'z)
            </p>
          </div>
        )}

        {/* Info Box - only for Reading and Listening */}
        {(currentType === 'reading' || currentType === 'listening') && (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 mb-2">
              💡 <strong>Bir nechta savol guruhlari:</strong>
            </p>
            <p className="text-sm text-blue-700 mb-1">
              • Har bir guruh uchun alohida savol turi (Table, Note Completion va h.k.)
            </p>
            <p className="text-sm text-blue-700">
              • Masalan: Questions 1-7 (Table), Questions 8-10 (Note Completion)
            </p>
          </div>
        )}

        {/* Question Groups - only for Reading and Listening */}
        {(currentType === 'reading' || currentType === 'listening') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-slate-900">Savol Guruhlari</h3>
              <button
                type="button"
                onClick={addQuestionGroup}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Guruh Qo&apos;shish
              </button>
            </div>

            {questionGroups.map((group, index) => {
              const isExpanded = expandedGroups.includes(group.id);
              return (
                <div
                  key={group.id}
                  className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
                >
                  {/* Group Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleGroupExpanded(group.id)}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        )}
                      </button>
                      <div>
                        <p className="text-slate-900">
                          <strong>Guruh {index + 1}</strong>
                          {group.questionRange && (
                            <span className="ml-2 text-[#042d62]">
                              (Questions {group.questionRange})
                            </span>
                          )}
                        </p>
                        {group.category && (
                          <p className="text-sm text-slate-600">{group.category}</p>
                        )}
                      </div>
                    </div>
                    {questionGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestionGroup(group.id)}
                        className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Group Content */}
                  {isExpanded && (
                    <div className="p-5 bg-white">
                      <QuestionGroupForm
                        selectedType={currentType}
                        selectedSection={currentSection}
                        group={group}
                        onUpdate={(updatedGroup) => updateQuestionGroup(group.id, updatedGroup)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={isTestDetailMode ? onCancel : onBack}
            className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-[#042d62] text-white px-6 py-3 rounded-xl hover:bg-[#053a75] transition-all shadow-md hover:shadow-lg"
          >
            <Save className="w-5 h-5" />
            Saqlash
          </button>
        </div>
      </form>
    </div>
  );
}