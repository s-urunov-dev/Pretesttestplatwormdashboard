import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'romain';

interface MatchingQuestion {
  id: string;
  statement: string;
  options: string[]; // ✅ ARRAY, not object!
}

interface MatchingItemInputsProps {
  value?: {
    statement?: string[];
    option?: string[][]; // ✅ ARRAY OF ARRAYS
    variant_type?: VariantType;
  };
  onChange: (data: {
    statement: string[];
    option: string[][]; // ✅ ARRAY OF ARRAYS
  }) => void;
  variantType: VariantType;
}

export function MatchingItemInputs({ value, onChange, variantType }: MatchingItemInputsProps) {
  const [questions, setQuestions] = useState<MatchingQuestion[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      if (value && value.statement && value.option && value.statement.length > 0) {
        const initialQuestions: MatchingQuestion[] = value.statement.map((stmt, idx) => ({
          id: `q-${idx}-${Date.now()}`,
          statement: stmt,
          options: value.option![idx] || []
        }));
        setQuestions(initialQuestions);
      } else {
        // Initialize with one empty question if no data
        setQuestions([{
          id: `q-${Date.now()}`,
          statement: '',
          options: []
        }]);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent (WITHOUT onChange in dependency)
  useEffect(() => {
    if (initialized && questions.length > 0) {
      const statements = questions.map(q => q.statement);
      const options = questions.map(q => q.options);
      
      console.log('🔍 Matching Items Debug:', {
        statements,
        options,
        questions
      });
      
      onChange({
        statement: statements,
        option: options
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, initialized]);

  const getVariantLabel = (index: number): string => {
    switch (variantType) {
      case 'letter':
        return String.fromCharCode(65 + index);
      case 'number':
        return (index + 1).toString();
      case 'romain':
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
        return romanNumerals[index] || (index + 1).toString();
      default:
        return (index + 1).toString();
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      id: `q-${Date.now()}`,
      statement: '',
      options: []
    }]);
  };

  const updateQuestion = (questionId: string, statement: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, statement } : q
    ));
  };

  const removeQuestion = (questionId: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        // ✅ Just push a new empty string to the array
        return {
          ...q,
          options: [...q.options, '']
        };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return {
          ...q,
          options: newOptions
        };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => {
        // ✅ Now working with array of strings
        return (
          <div key={question.id} className="p-5 bg-slate-50 border-2 border-slate-200 rounded-xl space-y-4">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-300">
              <h4 className="text-sm text-slate-700">
                <strong>Savol {qIndex + 1}</strong>
              </h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Savolni o'chirish"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Question Statement Input */}
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Savol matni <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={question.statement}
                onChange={(e) => updateQuestion(question.id, e.target.value)}
                placeholder={`Savol ${qIndex + 1} matnini kiriting`}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
              />
            </div>

            {/* Options for this Question */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm text-slate-700">
                  Variantlar <span className="text-red-500">*</span>
                </label>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                  {question.options.length} ta
                </span>
              </div>

              <div className="space-y-2">
                {question.options.map((optionValue, optionIdx) => (
                  <div 
                    key={optionIdx}
                    className="flex items-center gap-2 group"
                  >
                    <span className="text-sm font-semibold text-purple-600 w-8">
                      {getVariantLabel(optionIdx)}.
                    </span>
                    <input
                      type="text"
                      value={optionValue}
                      onChange={(e) => updateOption(question.id, optionIdx, e.target.value)}
                      placeholder={`Variant ${getVariantLabel(optionIdx)}`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(question.id, optionIdx)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="O'chirish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addOption(question.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors w-full border border-dashed border-purple-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Variant qo'shish</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                Har bir variant alohida input. Belgi avtomatik qo'shiladi.
              </p>
            </div>
          </div>
        );
      })}

      {/* Add Question Button */}
      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-2 px-4 py-3 text-sm text-green-600 hover:bg-green-50 rounded-xl transition-colors w-full border-2 border-dashed border-green-300"
      >
        <Plus className="w-5 h-5" />
        <span>Yangi savol qo'shish</span>
      </button>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          <strong>💡 Qanday ishlaydi:</strong> Har bir savol uchun o'z variantlari mavjud. 
          Yangi savol qo'shish uchun yuqoridagi tugmani bosing.
        </p>
      </div>
    </div>
  );
}