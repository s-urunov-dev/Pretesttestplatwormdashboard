import { useState } from 'react';
import { Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  QuestionGroup, 
  GAP_FILLING_CRITERIA, 
  createReadingPassage, 
  createReading,
  PassageType,
  CriteriaType 
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

  // Log criteria to debug
  console.log('GAP_FILLING_CRITERIA:', GAP_FILLING_CRITERIA);
  console.log('Number of criteria:', Object.keys(GAP_FILLING_CRITERIA).length);

  // Reading question types mapping
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
            const isIdentifyInfo = 
              group.question_type === 'true_false_not_given' || 
              group.question_type === 'yes_no_not_given';
            const isGapFilling = 
              group.question_type === 'sentence_completion' || 
              group.question_type === 'summary_completion' ||
              group.question_type === 'table_completion' ||
              group.question_type === 'flowchart_completion' ||
              group.question_type === 'diagram_labeling' ||
              group.question_type === 'short_answer';

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
                          {readingQuestionTypes.find(t => t.value === group.question_type)?.label}
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
                        {readingQuestionTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
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
                                criteria: group.gap_filling?.criteria || 'NMT_TWO',
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
                            value={group.gap_filling?.criteria || ''}
                            onChange={(e) => {
                              console.log('Selected criteria:', e.target.value);
                              updateQuestionGroup(index, {
                                gap_filling: {
                                  title: group.gap_filling?.title || '',
                                  criteria: e.target.value as CriteriaType,
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
                                criteria: group.gap_filling?.criteria || 'NMT_TWO',
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