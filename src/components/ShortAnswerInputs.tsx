import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api-cleaned';

export interface ShortAnswerQuestion {
  id: string;
  question: string;
  correctAnswer: string;
}

export interface ShortAnswerValue {
  principle: CriteriaType;
  instruction?: string;
  questions: ShortAnswerQuestion[];
}

interface ShortAnswerInputsProps {
  value?: ShortAnswerValue;
  onChange: (data: ShortAnswerValue) => void;
}

export function ShortAnswerInputs({ value, onChange }: ShortAnswerInputsProps) {
  const data = value || {
    principle: 'NMT_TWO' as CriteriaType,
    questions: [
      { id: generateId(), question: '', correctAnswer: '' },
      { id: generateId(), question: '', correctAnswer: '' },
      { id: generateId(), question: '', correctAnswer: '' },
    ],
  };

  function generateId() {
    return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const addQuestion = () => {
    onChange({
      ...data,
      questions: [...data.questions, { id: generateId(), question: '', correctAnswer: '' }],
    });
  };

  const removeQuestion = (questionId: string) => {
    if (data.questions.length <= 1) {
      alert('Kamida bitta savol bo\'lishi kerak');
      return;
    }
    onChange({
      ...data,
      questions: data.questions.filter(q => q.id !== questionId),
    });
  };

  const updateQuestion = (questionId: string, field: 'question' | 'correctAnswer', value: string) => {
    onChange({
      ...data,
      questions: data.questions.map(q =>
        q.id === questionId ? { ...q, [field]: value } : q
      ),
    });
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...data.questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;
    
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    onChange({ ...data, questions: newQuestions });
  };

  const getFilledQuestionsCount = () => {
    return data.questions.filter(q => q.question.trim()).length;
  };

  const getAnsweredQuestionsCount = () => {
    return data.questions.filter(q => q.question.trim() && q.correctAnswer.trim()).length;
  };

  return (
    <div className="space-y-6">
      {/* Principle Selection */}
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          Javob Formati (Principle) <span className="text-red-500">*</span>
        </label>
        <select
          value={data.principle}
          onChange={(e) => onChange({ ...data, principle: e.target.value as CriteriaType })}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
        >
          {Object.entries(GAP_FILLING_CRITERIA).map(([key, { value, label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Instruction */}
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          Maxsus Ko&apos;rsatma (ixtiyoriy)
        </label>
        <input
          type="text"
          value={data.instruction || ''}
          onChange={(e) => onChange({ ...data, instruction: e.target.value })}
          placeholder="Bo'sh qoldirilsa avtomatik yaratiladi"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
        />
        <p className="text-xs text-slate-500 mt-1">
          Masalan: &quot;Choose NO MORE THAN TWO WORDS from the reading passage for each answer.&quot;
        </p>
      </div>

      {/* Stats */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          📊 Jami: <strong>{data.questions.length}</strong> savol, 
          <strong> {getFilledQuestionsCount()}</strong> to&apos;ldirilgan,
          <strong> {getAnsweredQuestionsCount()}</strong> javob kiritilgan
        </p>
      </div>

      {/* Questions Editor */}
      <div className="border border-slate-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-900 font-medium">Savollar (Questions)</h4>
          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-[#042d62] text-white rounded hover:bg-[#053a7a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Savol
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
          <p className="mb-1">💡 <strong>Qo&apos;llanma:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
            <li>Har bir savol avtomatik raqamlanadi (1, 2, 3...)</li>
            <li>Savollar qisqa va aniq bo&apos;lishi kerak</li>
            <li>To&apos;g&apos;ri javoblarni admin uchun kiriting</li>
          </ul>
        </div>

        <div className="space-y-4">
          {data.questions.map((question, index) => (
            <div key={question.id} className="border-2 border-slate-300 rounded-lg p-4 bg-slate-50">
              {/* Question Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-sm px-3 py-1 bg-[#042d62] text-white rounded font-semibold">
                    Savol {index + 1}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(index, 'down')}
                    disabled={index === data.questions.length - 1}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Input */}
              <div className="mb-3">
                <label className="block text-xs text-slate-600 mb-1">
                  Savol matni <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                  placeholder="Masalan: What natural objects did early humans use to measure time?"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
                />
              </div>

              {/* Correct Answer Input */}
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  ✅ To&apos;g&apos;ri javob (Admin uchun)
                </label>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(question.id, 'correctAnswer', e.target.value)}
                  placeholder="To'g'ri javob"
                  className="w-full px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>

              {/* Validation */}
              {question.question.trim() && !question.correctAnswer.trim() && (
                <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                  ⚠️ Javob kiritilmagan
                </div>
              )}
              {question.question.trim() && question.correctAnswer.trim() && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  ✓ Tayyor
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="border border-green-300 rounded-lg p-4 bg-green-50">
        <h4 className="text-green-900 font-medium mb-2">📋 Xulosa</h4>
        <div className="space-y-1 text-sm text-green-800">
          <p>• Jami savollar: <strong>{data.questions.length}</strong></p>
          <p>• To&apos;ldirilgan: <strong>{getFilledQuestionsCount()}</strong></p>
          <p>• Javob kiritilgan: <strong>{getAnsweredQuestionsCount()}</strong></p>
          {getFilledQuestionsCount() !== getAnsweredQuestionsCount() && (
            <p className="text-amber-700 mt-2">
              ⚠️ {getFilledQuestionsCount() - getAnsweredQuestionsCount()} ta savol uchun javob kiritilmagan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
