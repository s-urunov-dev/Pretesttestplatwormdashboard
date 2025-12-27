import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Upload, X, Image as ImageIcon } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api-cleaned';

export interface FlowChartStep {
  id: string;
  content: string;
}

export interface FlowChartAnswer {
  questionNumber: number;
  correctAnswer: string;
}

export interface FlowChartCompletionValue {
  principle: CriteriaType;
  instruction?: string;
  flowChartTitle?: string;
  image?: string; // Base64 or URL
  steps: FlowChartStep[];
  options?: string[];
  answers?: FlowChartAnswer[];
}

interface FlowChartCompletionInputsProps {
  value?: FlowChartCompletionValue;
  onChange: (data: FlowChartCompletionValue) => void;
}

export function FlowChartCompletionInputs({ value, onChange }: FlowChartCompletionInputsProps) {
  const data = value || {
    principle: 'ONE_WORD' as CriteriaType,
    steps: [
      { id: generateId(), content: '' },
      { id: generateId(), content: '' },
    ],
    options: [],
    answers: [],
  };

  function generateId() {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const addStep = () => {
    onChange({
      ...data,
      steps: [...data.steps, { id: generateId(), content: '' }],
    });
  };

  const removeStep = (stepId: string) => {
    if (data.steps.length <= 1) {
      alert('Kamida bitta qadam bo\'lishi kerak');
      return;
    }
    onChange({
      ...data,
      steps: data.steps.filter(step => step.id !== stepId),
    });
  };

  const updateStep = (stepId: string, content: string) => {
    onChange({
      ...data,
      steps: data.steps.map(step =>
        step.id === stepId ? { ...step, content } : step
      ),
    });
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...data.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    onChange({ ...data, steps: newSteps });
  };

  const addOption = () => {
    const currentOptions = data.options || [];
    onChange({
      ...data,
      options: [...currentOptions, ''],
    });
  };

  const removeOption = (index: number) => {
    const currentOptions = data.options || [];
    onChange({
      ...data,
      options: currentOptions.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = data.options || [];
    onChange({
      ...data,
      options: currentOptions.map((opt, i) => i === index ? value : opt),
    });
  };

  const getAllQuestionNumbers = () => {
    const questionNumbers: number[] = [];
    data.steps.forEach(step => {
      if (step.content) {
        const matches = step.content.match(/\((\d+)\)/g);
        if (matches) {
          matches.forEach(match => {
            const num = parseInt(match.replace(/[()]/g, ''));
            if (!questionNumbers.includes(num)) {
              questionNumbers.push(num);
            }
          });
        }
      }
    });
    return questionNumbers.sort((a, b) => a - b);
  };

  const updateAnswer = (questionNumber: number, correctAnswer: string) => {
    const currentAnswers = data.answers || [];
    const existingIndex = currentAnswers.findIndex(a => a.questionNumber === questionNumber);
    
    if (existingIndex >= 0) {
      onChange({
        ...data,
        answers: currentAnswers.map((a, i) =>
          i === existingIndex ? { questionNumber, correctAnswer } : a
        ),
      });
    } else {
      onChange({
        ...data,
        answers: [...currentAnswers, { questionNumber, correctAnswer }],
      });
    }
  };

  const getAnswerForQuestion = (questionNumber: number): string => {
    const answer = (data.answers || []).find(a => a.questionNumber === questionNumber);
    return answer?.correctAnswer || '';
  };

  const getAnswerCount = () => {
    let count = 0;
    data.steps.forEach(step => {
      if (step.content) {
        const matches = step.content.match(/\(\d+\)/g);
        if (matches) {
          count += matches.length;
        }
      }
    });
    return count;
  };

  return (
    <div className="space-y-6">
      {/* Flow Chart Title */}
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          Flow Chart Sarlavhasi (Title)
        </label>
        <input
          type="text"
          value={data.flowChartTitle || ''}
          onChange={(e) => onChange({ ...data, flowChartTitle: e.target.value })}
          placeholder="Masalan: Establishing a Global Time Standard"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
        />
      </div>

      {/* Flowchart Image Upload */}
      <div>
        <label className="block text-sm text-slate-700 mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Flowchart Image (ixtiyoriy)
        </label>

        {!data.image ? (
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
                      onChange({ ...data, image: base64String });
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
              value={data.image || ''}
              onChange={(e) => onChange({ ...data, image: e.target.value || undefined })}
              placeholder="Rasm URL manzilini kiriting"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
            />
          </div>
        ) : (
          <div className="relative border border-slate-200 rounded-lg p-4 bg-slate-50">
            <button
              type="button"
              onClick={() => onChange({ ...data, image: undefined })}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img 
              src={data.image} 
              alt="Flowchart preview" 
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
          Masalan: &quot;Choose ONE WORD ONLY from the list of options.&quot;
        </p>
      </div>

      {/* Stats */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          📊 Jami: <strong>{data.steps.length}</strong> qadam, 
          <strong> {getAnswerCount()}</strong> javob maydoni
        </p>
      </div>

      {/* Steps Editor */}
      <div className="border border-slate-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-900 font-medium">Flow Chart Qadamlari</h4>
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-[#042d62] text-white rounded hover:bg-[#053a7a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Qadam
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
          <p className="mb-1">💡 <strong>Qo&apos;llanma:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
            <li>Har bir qadam matnida (1), (2) yozilsa avtomatik javob maydoniga aylanadi</li>
            <li>Masalan: &quot;Different regions follow the movement of the (1) __________&quot;</li>
          </ul>
        </div>

        <div className="space-y-3">
          {data.steps.map((step, index) => (
            <div key={step.id} className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-sm px-2 py-1 bg-[#042d62] text-white rounded">
                    Qadam {index + 1}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === data.steps.length - 1}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={step.content}
                onChange={(e) => updateStep(step.id, e.target.value)}
                placeholder="Matn kiriting yoki (1), (2) yozing..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
              />

              {step.content && step.content.match(/\(\d+\)/g) && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ {step.content.match(/\(\d+\)/g)?.length} javob topildi
                </div>
              )}

              {index < data.steps.length - 1 && (
                <div className="mt-2 text-center text-slate-400 text-sm">⬇️</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Options Section */}
      <div className="border border-slate-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-900 font-medium">Variantlar (Options) - Ixtiyoriy</h4>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Variant
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          Masalan: sun, confusion, conflicts, meridian, resistance, accurate
        </p>

        {data.options && data.options.length > 0 ? (
          <div className="space-y-2">
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Variant ${index + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center p-4 border border-dashed border-slate-300 rounded-lg">
            Variant yo&apos;q. Agar kerak bo&apos;lsa, &quot;Variant&quot; tugmasini bosing.
          </div>
        )}
      </div>

      {/* Correct Answers Section */}
      <div className="border border-green-300 rounded-lg p-4 bg-green-50">
        <h4 className="text-green-900 font-medium mb-3">✅ To&apos;g&apos;ri Javoblar (Admin uchun)</h4>

        {getAllQuestionNumbers().length > 0 ? (
          <div className="space-y-3">
            {getAllQuestionNumbers().map((qNum) => (
              <div key={qNum} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-green-900 w-12">
                  {qNum} →
                </span>
                <input
                  type="text"
                  value={getAnswerForQuestion(qNum)}
                  onChange={(e) => updateAnswer(qNum, e.target.value)}
                  placeholder="To'g'ri javob"
                  className="flex-1 px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-green-700 text-center p-4 border border-dashed border-green-300 rounded-lg bg-white">
            Qadamlarda (1), (2) kabi savol raqamlari topilmadi
          </div>
        )}
      </div>
    </div>
  );
}