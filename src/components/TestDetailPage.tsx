import { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Headphones, PenTool, Edit2, Save, FileText, Calendar, Check, Loader2, AlertCircle } from 'lucide-react';
import { AllQuestionTypesForm } from './AllQuestionTypesForm';
import { getTestDetail, TestDetail, isOfflineMode } from '../lib/api';

interface TestDetailPageProps {
  testId: number;
  onNavigateBack: () => void;
  onNavigateToAddQuestion?: (testId: number, testName: string, readingId?: number, listeningId?: number) => void;
}

type EditingSection = {
  type: 'reading' | 'listening' | 'writing';
  section: string;
} | null;

export function TestDetailPage({ testId, onNavigateBack, onNavigateToAddQuestion }: TestDetailPageProps) {
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [showWritingTaskSelector, setShowWritingTaskSelector] = useState(false);

  const loadTestDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isOff = await isOfflineMode();
      setOffline(isOff);

      if (isOff) {
        setError('Test tafsilotlari offline rejimda mavjud emas');
        setLoading(false);
        return;
      }

      const data = await getTestDetail(testId);
      setTest(data);
      setEditedTitle(data.name);
    } catch (err) {
      console.error('Failed to load test details:', err);
      setError('Test ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestDetail();
  }, [testId]);

  const handleSaveTitle = () => {
    if (test) {
      setTest({ ...test, name: editedTitle });
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#042d62] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Test ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-slate-900 mb-2">Xatolik yuz berdi</h2>
            <p className="text-slate-600 mb-6">{error || 'Test topilmadi'}</p>
            <button
              onClick={onNavigateBack}
              className="px-6 py-3 bg-[#042d62] hover:bg-[#053a75] text-white rounded-xl transition-all"
            >
              Orqaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: 'reading' as const,
      label: 'Reading',
      icon: BookOpen,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      border: 'border-blue-200',
      textColor: 'text-blue-900',
      data: test.reading,
      hasData: test.reading && test.reading.passages && test.reading.passages.length > 0,
    },
    {
      id: 'listening' as const,
      label: 'Listening',
      icon: Headphones,
      gradient: 'from-emerald-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      textColor: 'text-emerald-900',
      data: test.listening,
      hasData: test.listening && test.listening.parts && test.listening.parts.length > 0,
    },
    {
      id: 'writing' as const,
      label: 'Writing',
      icon: PenTool,
      gradient: 'from-violet-500 to-violet-600',
      bgGradient: 'from-violet-50 to-violet-100',
      border: 'border-violet-200',
      textColor: 'text-violet-900',
      data: test.writing,
      hasData: test.writing && test.writing.question,
    },
  ];

  const completedSections = sections.filter(s => s.hasData).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onNavigateBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-gradient-to-br from-[#042d62] to-[#0369a1] rounded-2xl shadow-md">
                <FileText className="w-10 h-10 text-white" />
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="flex-1 px-4 py-3 border-2 border-[#042d62] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-5 py-3 bg-[#042d62] hover:bg-[#053a75] text-white rounded-xl transition-all flex items-center gap-2 shadow-md"
                    >
                      <Save className="w-4 h-4" />
                      Saqlash
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-slate-900">{test.name}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-6 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Test ID: #{test.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Status: {test.is_active ? 'Faol' : 'Nofaol'}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Test Jarayoni</span>
                    <span className="text-sm text-slate-900">
                      {completedSections}/3 to&apos;ldirildi
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#042d62] to-[#0369a1] transition-all duration-500"
                      style={{ width: `${(completedSections / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section) => {
            const Icon = section.icon;
            const hasData = section.hasData;

            return (
              <div
                key={section.id}
                className={`bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all duration-200 ${
                  hasData ? `${section.border} hover:shadow-xl` : 'border-slate-200 opacity-60'
                }`}
              >
                <div className={`p-6 ${hasData ? `bg-gradient-to-br ${section.bgGradient}` : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl shadow-md bg-gradient-to-br ${section.gradient}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {hasData && (
                      <div className="p-2 bg-green-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className={`mb-2 ${hasData ? section.textColor : 'text-slate-500'}`}>
                    {section.label}
                  </h3>

                  {hasData ? (
                    <div className="space-y-2">
                      {section.id === 'reading' && section.data.passages && (
                        <>
                          <p className={`text-sm ${section.textColor}`}>
                            {section.data.passages.length} ta passage
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {section.data.passages.map((passage, index) => (
                              <span
                                key={passage.id}
                                className={`px-2 py-1 bg-white/70 ${section.textColor} rounded-lg text-xs`}
                              >
                                {passage.passage_type}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      {section.id === 'listening' && section.data.parts && (
                        <>
                          <p className={`text-sm ${section.textColor}`}>
                            {section.data.parts.length} ta part
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {section.data.parts.map((part, index) => (
                              <span
                                key={part.id}
                                className={`px-2 py-1 bg-white/70 ${section.textColor} rounded-lg text-xs`}
                              >
                                {part.part_type.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                      {section.id === 'writing' && section.data.question && (
                        <>
                          <p className={`text-sm ${section.textColor} line-clamp-2`}>
                            {section.data.question}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-1 bg-white/70 ${section.textColor} rounded-lg text-xs`}>
                              {section.data.type === 'task1' ? 'Task 1' : 'Task 2'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Hali to&apos;ldirilmagan</p>
                  )}
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                  <button
                    className={`w-full px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                      hasData
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-[#042d62] hover:bg-[#053a75] text-white shadow-md'
                    }`}
                    onClick={() => {
                      if (onNavigateToAddQuestion && (section.id === 'reading' || section.id === 'listening')) {
                        // Use new interface for reading/listening
                        const readingId = test.reading?.id;
                        const listeningId = test.listening?.parts?.[0]?.listening;
                        onNavigateToAddQuestion(test.id, test.name, readingId, listeningId);
                      } else if (section.id === 'writing') {
                        setShowWritingTaskSelector(true);
                      } else {
                        // Fallback to old form
                        setEditingSection({ type: section.id, section: section.label });
                      }
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                    {hasData ? 'Tahrirlash' : 'Qo\'shish'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Content Details */}
        {sections.filter(s => s.hasData).length > 0 && (
          <div className="mt-8">
            <h2 className="text-slate-900 mb-6">Batafsil Ma&apos;lumot</h2>
            <div className="space-y-6">
              {sections.filter(s => s.hasData).map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-2xl shadow-md border-2 overflow-hidden"
                  style={{ borderColor: section.border.replace('border-', '') }}
                >
                  <div className={`p-6 bg-gradient-to-r ${section.bgGradient}`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl shadow-md bg-gradient-to-br ${section.gradient}`}>
                        <section.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={section.textColor}>{section.label}</h3>
                        {section.id === 'reading' && section.data.passages && (
                          <p className="text-sm text-slate-600">
                            {section.data.passages.length} ta passage
                          </p>
                        )}
                        {section.id === 'listening' && section.data.parts && (
                          <p className="text-sm text-slate-600">
                            {section.data.parts.length} ta part
                          </p>
                        )}
                        {section.id === 'writing' && section.data.question && (
                          <p className="text-sm text-slate-600">
                            {section.data.type === 'task1' ? 'Task 1' : 'Task 2'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {section.id === 'reading' && section.data.passages && (
                      <div className="space-y-4">
                        {section.data.passages.map((passage, index) => (
                          <div
                            key={passage.id}
                            className={`p-4 rounded-xl border-2 bg-gradient-to-br ${section.bgGradient} ${section.border}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className={`${section.textColor}`}>{passage.passage_type}</p>
                              <span className={`px-2 py-1 bg-white/70 ${section.textColor} rounded-lg text-xs`}>
                                {passage.title}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{passage.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === 'listening' && section.data.parts && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {section.data.parts.map((part, index) => (
                          <div
                            key={part.id}
                            className={`p-4 rounded-xl border-2 bg-gradient-to-br ${section.bgGradient} ${section.border}`}
                          >
                            <p className={`text-sm ${section.textColor}`}>
                              {part.part_type.replace('_', ' ').toUpperCase()}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {part.question_type.length} savol turi
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    {section.id === 'writing' && section.data.question && (
                      <div className={`p-4 rounded-xl border-2 bg-gradient-to-br ${section.bgGradient} ${section.border}`}>
                        <p className={`text-sm ${section.textColor} mb-2`}>
                          {section.data.type === 'task1' ? 'Task 1' : 'Task 2'}
                        </p>
                        <p className="text-slate-700">{section.data.question}</p>
                        {section.data.image && (
                          <div className="mt-3">
                            <img
                              src={section.data.image}
                              alt="Writing task"
                              className="rounded-lg max-h-48 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editingSection && test && (
          <div className="mt-8">
            <h2 className="text-slate-900 mb-6">Bo\'limni Tahrirlash</h2>
            <AllQuestionTypesForm
              sectionType={editingSection.type}
              sectionLabel={editingSection.section}
              sectionData={test[editingSection.type] || null}
              onSave={(updatedData) => {
                setTest({ ...test, [editingSection.type]: updatedData });
                setEditingSection(null);
              }}
              onCancel={() => setEditingSection(null)}
            />
          </div>
        )}

        {/* Writing Task Selector Modal */}
        {showWritingTaskSelector && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <h2 className="text-slate-900 mb-2">Writing Task Tanlang</h2>
              <p className="text-slate-600 mb-6 text-sm">
                Qaysi writing taskni tahrirlashni xohlaysiz?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEditingSection({ type: 'writing', section: 'Writing - Task 1' });
                    setShowWritingTaskSelector(false);
                  }}
                  className="w-full p-5 bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-200 rounded-xl hover:border-violet-300 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-md">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-violet-900">Task 1</p>
                      <p className="text-sm text-violet-700">Graph/Chart/Diagram tahlili</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setEditingSection({ type: 'writing', section: 'Writing - Task 2' });
                    setShowWritingTaskSelector(false);
                  }}
                  className="w-full p-5 bg-gradient-to-br from-violet-50 to-violet-100 border-2 border-violet-200 rounded-xl hover:border-violet-300 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-md">
                      <PenTool className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-violet-900">Task 2</p>
                      <p className="text-sm text-violet-700">Essay yozish (250+ so&apos;z)</p>
                    </div>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowWritingTaskSelector(false)}
                className="w-full mt-4 px-5 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}