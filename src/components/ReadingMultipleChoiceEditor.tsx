import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface ReadingMultipleChoiceQuestion {
  question: string;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string | string[]; // single or multiple answers
}

export interface ReadingMultipleChoiceData {
  title?: string;
  variant_type: 'letter' | 'number' | 'romain';
  answer_count: number; // 1 for single choice, >1 for multiple choice
  questions: ReadingMultipleChoiceQuestion[];
}

interface ReadingMultipleChoiceEditorProps {
  data?: ReadingMultipleChoiceData;
  onChange: (data: ReadingMultipleChoiceData) => void;
  questionNumberStart?: number;
  questionNumberEnd?: number;
}

export function ReadingMultipleChoiceEditor({ 
  data, 
  onChange,
  questionNumberStart = 1,
  questionNumberEnd = 1,
}: ReadingMultipleChoiceEditorProps) {
  const [title, setTitle] = useState(data?.title || '');
  const [variantType, setVariantType] = useState<'letter' | 'number' | 'romain'>(data?.variant_type || 'letter');
  const [answerCount, setAnswerCount] = useState(data?.answer_count || 1);
  const [questions, setQuestions] = useState<ReadingMultipleChoiceQuestion[]>(
    data?.questions || [
      { 
        question: '', 
        options: [
          { key: 'A', text: '' }, 
          { key: 'B', text: '' }, 
          { key: 'C', text: '' }, 
          { key: 'D', text: '' }
        ], 
        correctAnswer: answerCount > 1 ? [] : '' 
      }
    ]
  );

  // Calculate how many questions should exist based on from_value and to_value
  const expectedQuestionCount = questionNumberEnd - questionNumberStart + 1;

  useEffect(() => {
    // Auto-adjust questions array to match expected count
    if (questions.length < expectedQuestionCount) {
      const newQuestions = [...questions];
      while (newQuestions.length < expectedQuestionCount) {
        newQuestions.push({
          question: '',
          options: generateOptions(variantType, 4),
          correctAnswer: answerCount > 1 ? [] : ''
        });
      }
      setQuestions(newQuestions);
    } else if (questions.length > expectedQuestionCount) {
      setQuestions(questions.slice(0, expectedQuestionCount));
    }
  }, [questionNumberStart, questionNumberEnd]);

  useEffect(() => {
    // Emit changes to parent
    onChange({
      title,
      variant_type: variantType,
      answer_count: answerCount,
      questions,
    });
  }, [title, variantType, answerCount, questions]);

  const generateOptions = (type: 'letter' | 'number' | 'romain', count: number) => {
    const options: Array<{ key: string; text: string }> = [];
    for (let i = 0; i < count; i++) {
      let key = '';
      if (type === 'letter') {
        key = String.fromCharCode(65 + i); // A, B, C, D...
      } else if (type === 'number') {
        key = String(i + 1); // 1, 2, 3, 4...
      } else {
        // Roman numerals
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
        key = romanNumerals[i] || String(i + 1);
      }
      options.push({ key, text: '' });
    }
    return options;
  };

  const handleVariantTypeChange = (newType: 'letter' | 'number' | 'romain') => {
    setVariantType(newType);
    // Update all questions' option keys
    const updatedQuestions = questions.map(q => ({
      ...q,
      options: q.options.map((opt, idx) => ({
        ...opt,
        key: generateOptions(newType, q.options.length)[idx].key
      })),
      correctAnswer: answerCount > 1 ? [] : ''
    }));
    setQuestions(updatedQuestions);
  };

  const handleAnswerCountChange = (newCount: number) => {
    setAnswerCount(newCount);
    // Reset all correct answers when switching between single/multiple
    const updatedQuestions = questions.map(q => ({
      ...q,
      correctAnswer: newCount > 1 ? [] : ''
    }));
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex: number) => {
    const updated = [...questions];
    const currentOptions = updated[qIndex].options;
    const newKey = generateOptions(variantType, currentOptions.length + 1)[currentOptions.length].key;
    updated[qIndex].options.push({ key: newKey, text: '' });
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(oIndex, 1);
      // Re-generate keys for remaining options
      updated[qIndex].options = updated[qIndex].options.map((opt, idx) => ({
        ...opt,
        key: generateOptions(variantType, updated[qIndex].options.length)[idx].key
      }));
      // Reset correct answer if it was the removed option
      if (answerCount === 1 && updated[qIndex].correctAnswer === updated[qIndex].options[oIndex]?.key) {
        updated[qIndex].correctAnswer = '';
      } else if (answerCount > 1 && Array.isArray(updated[qIndex].correctAnswer)) {
        updated[qIndex].correctAnswer = (updated[qIndex].correctAnswer as string[]).filter(
          ans => ans !== updated[qIndex].options[oIndex]?.key
        );
      }
      setQuestions(updated);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
  };

  const toggleCorrectAnswer = (qIndex: number, optionKey: string) => {
    const updated = [...questions];
    if (answerCount === 1) {
      // Single choice - replace
      updated[qIndex].correctAnswer = optionKey;
    } else {
      // Multiple choice - toggle
      const current = updated[qIndex].correctAnswer as string[];
      if (current.includes(optionKey)) {
        updated[qIndex].correctAnswer = current.filter(key => key !== optionKey);
      } else {
        if (current.length < answerCount) {
          updated[qIndex].correctAnswer = [...current, optionKey];
        } else {
          alert(`Maksimal ${answerCount} ta javob tanlash mumkin!`);
          return;
        }
      }
    }
    setQuestions(updated);
  };

  const isAnswerSelected = (qIndex: number, optionKey: string): boolean => {
    const answer = questions[qIndex].correctAnswer;
    if (answerCount === 1) {
      return answer === optionKey;
    } else {
      return Array.isArray(answer) && answer.includes(optionKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* Global Settings */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-5 space-y-4">
        <h3 className="text-lg text-[#042d62]">
          Multiple Choice - Umumiy Sozlamalar
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Sarlavha <span className="text-slate-400">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Choose the correct answer"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Variant Turi <span className="text-red-500">*</span>
            </label>
            <select
              value={variantType}
              onChange={(e) => handleVariantTypeChange(e.target.value as any)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
            >
              <option value="letter">Alifbo (A, B, C...)</option>
              <option value="number">Raqamlar (1, 2, 3...)</option>
              <option value="romain">Rim raqamlari (I, II, III...)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-700 mb-2">
              Har bir savol uchun to'g'ri javoblar soni <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={answerCount}
              onChange={(e) => handleAnswerCountChange(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              {answerCount === 1 ? '✓ Bitta javob (Single Choice)' : `✓ Bir nechta javob (${answerCount} ta)`}
            </p>
          </div>
        </div>

        <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Maslahat:</strong> Savol soni avtomatik ravishda "Dan" va "Gacha" qiymatlariga asoslanadi (Q{questionNumberStart}-Q{questionNumberEnd} = {expectedQuestionCount} ta savol).
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const questionNumber = questionNumberStart + qIndex;
          
          return (
            <div key={qIndex} className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
              {/* Question Header */}
              <div className="bg-gradient-to-r from-[#042d62] to-[#053a75] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#042d62]">
                    {questionNumber}
                  </div>
                  <h4 className="text-white">Savol {questionNumber}</h4>
                </div>
              </div>

              {/* Question Content */}
              <div className="p-5 space-y-4">
                {/* Question Text */}
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Savol matni <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                    placeholder="Savol matnini kiriting..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm text-slate-700">
                      Javob Variantlari <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      Variant Qo'shish
                    </button>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3 group">
                        {/* Option Key Badge */}
                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          {option.key}
                        </span>

                        {/* Option Text Input */}
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                          placeholder={`Variant ${option.key}`}
                          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
                        />

                        {/* Correct Answer Selector */}
                        <button
                          type="button"
                          onClick={() => toggleCorrectAnswer(qIndex, option.key)}
                          className={`px-4 py-2.5 rounded-lg transition-all border-2 shrink-0 ${
                            isAnswerSelected(qIndex, option.key)
                              ? 'bg-[#042d62] border-[#042d62] text-white shadow-md'
                              : 'bg-white border-slate-300 text-slate-600 hover:border-[#042d62]'
                          }`}
                          title="To'g'ri javob sifatida belgilash"
                        >
                          {isAnswerSelected(qIndex, option.key) ? '✓ To\'g\'ri' : 'Tanlash'}
                        </button>

                        {/* Remove Option Button */}
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={q.options.length <= 2}
                          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                          title="Variantni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correct Answer Summary */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <strong>To'g'ri javob{answerCount > 1 ? 'lar' : ''}:</strong>{' '}
                    {answerCount === 1 ? (
                      q.correctAnswer ? (
                        <span className="text-green-600 font-medium">{q.correctAnswer}</span>
                      ) : (
                        <span className="text-red-600">Hali tanlanmagan</span>
                      )
                    ) : (
                      Array.isArray(q.correctAnswer) && q.correctAnswer.length > 0 ? (
                        <span className="text-green-600 font-medium">{q.correctAnswer.join(', ')}</span>
                      ) : (
                        <span className="text-red-600">Hali tanlanmagan</span>
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          ℹ️ <strong>Eslatma:</strong> Savol soni "Dan" va "Gacha" qiymatlari bilan avtomatik belgilanadi. 
          Har bir savol uchun kamida 2 ta variant bo'lishi kerak. To'g'ri javobni tanlash uchun variant yonidagi "Tanlash" tugmasini bosing.
        </p>
      </div>
    </div>
  );
}
