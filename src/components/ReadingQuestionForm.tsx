import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  QuestionGroup, 
  GAP_FILLING_CRITERIA, 
  createReadingPassage, 
  createReading,
  PassageType,
  CriteriaType,
  getReadingQuestionTypes,
  QuestionType
} from '../lib/api';

interface ReadingQuestionFormProps {
  testId?: number;
  passageNumber: number; // 1, 2, or 3
  onSubmit?: () => void;
  onBack?: () => void;
}

export function ReadingQuestionForm({ testId, passageNumber, onSubmit, onBack }: ReadingQuestionFormProps) {
  const [title, setTitle] = useState('');
  const [passageText, setPassageText] = useState('');
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['0']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([]);
  const [loadingQuestionTypes, setLoadingQuestionTypes] = useState(true);

  // Load question types from API
  useEffect(() => {
    const fetchQuestionTypes = async () => {
      try {
        setLoadingQuestionTypes(true);
        const types = await getReadingQuestionTypes();
        console.log('✅ Loaded question types from API:', types);
        setQuestionTypes(types);
      } catch (error) {
        console.error('❌ Failed to load question types:', error);
        // Fallback to empty array - user will see loading message
        setQuestionTypes([]);
      } finally {
        setLoadingQuestionTypes(false);
      }
    };

    fetchQuestionTypes();
  }, []);

  // Log criteria to debug
  console.log('GAP_FILLING_CRITERIA:', GAP_FILLING_CRITERIA);
  console.log('Number of criteria:', Object.keys(GAP_FILLING_CRITERIA).length);

  // Helper function to determine question type category based on API type
  const getQuestionTypeCategory = (questionType: string): 'identify_info' | 'gap_filling' | 'matching_item' | null => {
    if (!questionType) return null;

    const type = questionType.toLowerCase();

    // Identify Info types (True/False/Not Given, Yes/No/Not Given)
    if (type.includes('true') || type.includes('false') || 
        type.includes('yes') || type.includes('no') || 
        type.includes('not_given') || type.includes('notgiven')) {
      return 'identify_info';
    }

    // Gap Filling types (Sentence/Summary/Table/Note Completion, Short Answer)
    if (type.includes('completion') || type.includes('complete') ||
        type.includes('sentence') || type.includes('summary') ||
        type.includes('table') || type.includes('note') ||
        type.includes('flowchart') || type.includes('flow') ||
        type.includes('diagram') || type.includes('short_answer') ||
        type.includes('fill')) {
      return 'gap_filling';
    }

    // Matching types (Matching Headings, Features, Information, Sentence Endings)
    if (type.includes('matching') || type.includes('match')) {
      return 'matching_item';
    }

    // Default to gap_filling for unknown types
    return 'gap_filling';
  };

  const addQuestionGroup = () => {
    const newId = questionGroups.length.toString();
    setQuestionGroups([
      ...questionGroups,
      {
        question_type: '',
        from_value: 0,
        to_value: 0,
      },
    ]);
    setExpandedGroups([...expandedGroups, newId]);
  };

  const removeQuestionGroup = (index: number) => {
    setQuestionGroups(questionGroups.filter((_, i) => i !== index));
    setExpandedGroups(expandedGroups.filter(id => id !== index.toString()));
  };

  const updateQuestionGroup = (index: number, updates: Partial<QuestionGroup>) => {
    const updated = [...questionGroups];
    updated[index] = { ...updated[index], ...updates };
    setQuestionGroups(updated);
  };

  const toggleGroupExpanded = (index: string) => {
    if (expandedGroups.includes(index)) {
      setExpandedGroups(expandedGroups.filter(id => id !== index));
    } else {
      setExpandedGroups([...expandedGroups, index]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !passageText || questionGroups.length === 0) {
      alert('Iltimos, barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    // Validate all question groups
    for (const group of questionGroups) {
      if (!group.question_type || group.from_value === 0 || group.to_value === 0) {
        alert('Iltimos, barcha savol guruhlarini to\'ldiring');
        return;
      }
    }

    if (!testId) {
      alert('Test ID mavjud emas. Iltimos, avval test yarating.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create reading section if needed
      const readingSection = await createReading(testId);
      
      // Determine passage type
      const passageType: PassageType = `passage${passageNumber}` as PassageType;

      // Prepare the data payload
      const payload = {
        reading: readingSection.id,
        passage_type: passageType,
        title: title,
        body: passageText,
        groups: questionGroups,
      };

      console.log('📤 Sending reading passage data:', JSON.stringify(payload, null, 2));

      // Create reading passage with question groups
      await createReadingPassage(payload);

      alert('Reading passage muvaffaqiyatli yaratildi!');
      onSubmit?.();
    } catch (error) {
      console.error('Error creating reading passage:', error);
      alert(`Xatolik yuz berdi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Passage Title */}
        <div>
          <label className="block text-slate-700 mb-2">
            Passage Sarlavhasi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Climate Change and Its Effects"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50"
            required
          />
        </div>

        {/* Passage Text */}
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
            Talabalar o&apos;qishlari uchun to&apos;liq passage matnini kiriting
          </p>
        </div>

        {/* Info Box */}
        <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900 mb-2">
            💡 <strong>Bir nechta savol guruhlari:</strong>
          </p>
          <p className="text-sm text-blue-700 mb-1">
            • Har bir guruh uchun alohida savol turi (True/False, Sentence Completion va h.k.)
          </p>
          <p className="text-sm text-blue-700">
            • Masalan: Questions 1-6 (True/False), Questions 7-13 (Sentence Completion)
          </p>
        </div>

        {/* Question Groups */}
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
            const isExpanded = expandedGroups.includes(index.toString());
            
            // Determine form type dynamically based on API question type
            const formCategory = getQuestionTypeCategory(group.question_type);
            const isIdentifyInfo = formCategory === 'identify_info';
            const isGapFilling = formCategory === 'gap_filling';
            const isMatchingItem = formCategory === 'matching_item';

            return (
              <div
                key={index}
                className="border-2 border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"
              >
                {/* Group Header */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleGroupExpanded(index.toString())}
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
                        {group.from_value > 0 && group.to_value > 0 && (
                          <span className="ml-2 text-[#042d62]">
                            (Questions {group.from_value}-{group.to_value})
                          </span>
                        )}
                      </p>
                      {group.question_type && (
                        <p className="text-sm text-slate-600">
                          {questionTypes.find(t => t.type === group.question_type)?.type || group.question_type}
                        </p>
                      )}
                    </div>
                  </div>
                  {questionGroups.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestionGroup(index)}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Group Content */}
                {isExpanded && (
                  <div className="p-5 bg-white space-y-4">
                    {/* Question Type */}
                    <div>
                      <label className="block text-slate-700 mb-2">
                        Savol Turi <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={group.question_type}
                        onChange={(e) => updateQuestionGroup(index, { question_type: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                        required
                      >
                        <option value="">Tanlang...</option>
                        {loadingQuestionTypes ? (
                          <option value="loading">Yuklanmoqda...</option>
                        ) : (
                          questionTypes.map((qt) => (
                            <option key={qt.id} value={qt.type}>
                              {qt.type}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    {/* Question Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 mb-2">
                          Boshlanish Raqami <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={group.from_value || ''}
                          onChange={(e) => updateQuestionGroup(index, { from_value: parseInt(e.target.value) || 0 })}
                          placeholder="1"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 mb-2">
                          Tugash Raqami <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={group.to_value || ''}
                          onChange={(e) => updateQuestionGroup(index, { to_value: parseInt(e.target.value) || 0 })}
                          placeholder="6"
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                          required
                        />
                      </div>
                    </div>

                    {/* True/False/Not Given Fields */}
                    {isIdentifyInfo && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-slate-700 mb-2">
                            Ko&apos;rsatma <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={group.identify_info?.title || ''}
                            onChange={(e) => updateQuestionGroup(index, {
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
                              updateQuestionGroup(index, {
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
                    )}

                    {/* Gap Filling Fields (Sentence Completion, etc.) */}
                    {isGapFilling && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-slate-700 mb-2">
                            Sarlavha <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={group.gap_filling?.title || ''}
                            onChange={(e) => updateQuestionGroup(index, {
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
                            Javob Formati <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={group.gap_filling?.principle || ''}
                            onChange={(e) => {
                              console.log('Selected principle:', e.target.value);
                              updateQuestionGroup(index, {
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
                            {(() => {
                              console.log('Rendering criteria options...');
                              console.log('GAP_FILLING_CRITERIA:', GAP_FILLING_CRITERIA);
                              const entries = Object.entries(GAP_FILLING_CRITERIA);
                              console.log('Number of entries:', entries.length);
                              console.log('Entries:', entries);
                              return entries.map(([key, { value, label }]) => {
                                console.log(`Creating option: ${key} = ${value} (${label})`);
                                return (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                );
                              });
                            })()}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 mb-2">
                            Matn (bo&apos;sh joylar uchun raqamlarni qavs ichida yozing) <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={group.gap_filling?.body || ''}
                            onChange={(e) => updateQuestionGroup(index, {
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
                    )}

                    {/* Matching Item Fields */}
                    {isMatchingItem && (
                      <div className="space-y-4 border-t pt-4">
                        <div>
                          <label className="block text-slate-700 mb-2">
                            Sarlavha <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={group.matching_item?.title || ''}
                            onChange={(e) => updateQuestionGroup(index, {
                              matching_item: {
                                title: e.target.value,
                                statement: group.matching_item?.statement || [],
                                option: group.matching_item?.option || [],
                                variant_type: group.matching_item?.variant_type || 'letter',
                                answer_count: group.matching_item?.answer_count || 1,
                              }
                            })}
                            placeholder="Masalan: Match the following headings to paragraphs"
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 mb-2">
                              Variant Turi <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={group.matching_item?.variant_type || 'letter'}
                              onChange={(e) => updateQuestionGroup(index, {
                                matching_item: {
                                  title: group.matching_item?.title || '',
                                  statement: group.matching_item?.statement || [],
                                  option: group.matching_item?.option || [],
                                  variant_type: e.target.value as 'letter' | 'number' | 'romain',
                                  answer_count: group.matching_item?.answer_count || 1,
                                }
                              })}
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                              required
                            >
                              <option value="letter">Harflar (A, B, C...)</option>
                              <option value="number">Raqamlar (1, 2, 3...)</option>
                              <option value="romain">Rim raqamlari (I, II, III...)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-slate-700 mb-2">
                              Javoblar Soni <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={group.matching_item?.answer_count || 1}
                              onChange={(e) => updateQuestionGroup(index, {
                                matching_item: {
                                  title: group.matching_item?.title || '',
                                  statement: group.matching_item?.statement || [],
                                  option: group.matching_item?.option || [],
                                  variant_type: group.matching_item?.variant_type || 'letter',
                                  answer_count: parseInt(e.target.value) || 1,
                                }
                              })}
                              placeholder="1"
                              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 mb-2">
                            Statements (har bir qator alohida) <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={(group.matching_item?.statement || []).join('\n')}
                            onChange={(e) => {
                              const statements = e.target.value.split('\n').filter(s => s.trim());
                              updateQuestionGroup(index, {
                                matching_item: {
                                  title: group.matching_item?.title || '',
                                  statement: statements,
                                  option: group.matching_item?.option || [],
                                  variant_type: group.matching_item?.variant_type || 'letter',
                                  answer_count: group.matching_item?.answer_count || 1,
                                }
                              });
                            }}
                            placeholder="The role of technology in education&#10;Environmental impact of urbanization&#10;Benefits of renewable energy"
                            rows={5}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm"
                            required
                          />
                          <p className="text-sm text-slate-500 mt-2">
                            Har bir statement ni yangi qatordan kiriting
                          </p>
                        </div>

                        <div>
                          <label className="block text-slate-700 mb-2">
                            Options/Variantlar (har bir qator alohida) <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={(group.matching_item?.option || []).join('\n')}
                            onChange={(e) => {
                              const options = e.target.value.split('\n').filter(o => o.trim());
                              updateQuestionGroup(index, {
                                matching_item: {
                                  title: group.matching_item?.title || '',
                                  statement: group.matching_item?.statement || [],
                                  option: options,
                                  variant_type: group.matching_item?.variant_type || 'letter',
                                  answer_count: group.matching_item?.answer_count || 1,
                                }
                              });
                            }}
                            placeholder="Paragraph A&#10;Paragraph B&#10;Paragraph C&#10;Paragraph D"
                            rows={5}
                            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm"
                            required
                          />
                          <p className="text-sm text-slate-500 mt-2">
                            Har bir option ni yangi qatordan kiriting
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {questionGroups.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-slate-500 mb-4">Hali savol guruhlari yo&apos;q</p>
              <button
                type="button"
                onClick={addQuestionGroup}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-all"
              >
                <Plus className="w-4 h-4" />
                Birinchi Guruhni Qo&apos;shish
              </button>
            </div>
          )}
        </div>

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
            {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}