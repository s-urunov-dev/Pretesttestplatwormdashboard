import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Info } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api-cleaned';

export interface FlowChartStep {
  id: string;
  content: string; // Text with (1), (2) placeholders
}

export interface FlowChartAnswer {
  questionNumber: number;
  correctAnswer: string;
}

export interface FlowChartCompletionData {
  principle: CriteriaType;
  instruction?: string; // Custom instruction
  flowChartTitle?: string; // Flow Chart title
  steps: FlowChartStep[]; // Array of steps
  options?: string[]; // Optional: list of answer options
  answers?: FlowChartAnswer[]; // Correct answers for admin
  questionNumberStart?: number; // Starting question number
}

interface FlowChartCompletionEditorProps {
  data: FlowChartCompletionData;
  onChange: (data: FlowChartCompletionData) => void;
  mode?: 'edit' | 'preview';
  initialData?: Partial<FlowChartCompletionData>;
}

export function FlowChartCompletionEditor({ 
  data, 
  onChange, 
  mode = 'edit',
  initialData 
}: FlowChartCompletionEditorProps) {
  const [showAnswers, setShowAnswers] = useState(false);

  // Initialize with default if empty
  React.useEffect(() => {
    if (!data.steps || data.steps.length === 0) {
      onChange({
        principle: data.principle || initialData?.principle || 'ONE_WORD',
        instruction: data.instruction || initialData?.instruction,
        flowChartTitle: data.flowChartTitle || initialData?.flowChartTitle,
        steps: initialData?.steps || [
          { id: generateId(), content: '' },
          { id: generateId(), content: '' },
        ],
        options: data.options || initialData?.options || [],
        answers: data.answers || initialData?.answers || [],
        questionNumberStart: data.questionNumberStart || initialData?.questionNumberStart || 1,
      });
    }
  }, []);

  const generateId = () => {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

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

  const getInstructionText = () => {
    if (data.instruction) return data.instruction;
    
    const criteriaLabels: Record<CriteriaType, string> = {
      'ONE_WORD': 'Choose ONE WORD ONLY from the passage.',
      'ONE_WORD_OR_NUMBER': 'Choose ONE WORD AND/OR A NUMBER from the passage.',
      'NMT_ONE': 'Choose NO MORE THAN ONE WORD from the passage.',
      'NMT_TWO': 'Choose NO MORE THAN TWO WORDS from the passage.',
      'NMT_THREE': 'Choose NO MORE THAN THREE WORDS from the passage.',
      'NMT_TWO_NUM': 'Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage.',
      'NMT_THREE_NUM': 'Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage.',
      'NUMBER_ONLY': 'Choose A NUMBER ONLY from the passage.',
      'FROM_BOX': 'Choose from the options below.',
    };
    
    // If options exist, use FROM_BOX instruction
    if (data.options && data.options.length > 0 && !data.instruction) {
      return 'Choose ONE WORD ONLY from the list of options.';
    }
    
    return criteriaLabels[data.principle] || '';
  };

  // Parse text content and render with input fields for gaps
  const renderStepContent = (content: string) => {
    if (!content) return <span className="text-slate-400 text-sm">(Bo'sh)</span>;
    
    // Split by (1), (2), etc. pattern
    const parts = content.split(/(\(\d+\))/);
    
    return (
      <span className="text-sm leading-relaxed">
        {parts.map((part, index) => {
          // Check if this part is a gap placeholder like (1), (2)
          const gapMatch = part.match(/\((\d+)\)/);
          if (gapMatch) {
            return (
              <span key={index} className="inline-flex items-center gap-1 mx-0.5">
                <span className="font-semibold text-slate-700">{part}</span>
                <span className="inline-block w-24 h-0.5 bg-slate-800 align-middle"></span>
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        {/* Question Number Range */}
        {data.questionNumberStart && getAnswerCount() > 0 && (
          <div className="text-sm text-slate-900 font-semibold">
            Questions {data.questionNumberStart} – {data.questionNumberStart + getAnswerCount() - 1}
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-1">
          <p className="text-sm text-slate-900">
            <strong>Complete the flow chart below.</strong>
          </p>
          <p className="text-sm text-slate-700">{getInstructionText()}</p>
        </div>

        {/* Flow Chart Title */}
        {data.flowChartTitle && (
          <div className="text-sm text-slate-900">
            <strong>Flow Chart: {data.flowChartTitle}</strong>
          </div>
        )}

        {/* Flow Chart Steps */}
        <div className="space-y-3">
          {data.steps && data.steps.length > 0 ? (
            data.steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                {/* Step Box */}
                <div className="w-full max-w-2xl border-2 border-slate-800 bg-slate-50 p-4 rounded-lg text-center">
                  {renderStepContent(step.content)}
                </div>
                
                {/* Arrow (except after last step) */}
                {index < data.steps.length - 1 && (
                  <div className="text-slate-600 text-2xl">
                    ⬇️
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
              Qadam yo'q
            </div>
          )}
        </div>

        {/* Options (if provided) */}
        {data.options && data.options.length > 0 && (
          <div className="mt-6 border-t-2 border-slate-300 pt-4">
            <h4 className="text-sm text-slate-900 font-semibold mb-3">Options</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.options.filter(opt => opt.trim()).map((option, index) => (
                <div key={index} className="text-sm text-slate-800 text-center p-2 bg-slate-100 rounded border border-slate-300">
                  {option}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correct Answers (for admin) */}
        {data.answers && data.answers.length > 0 && (
          <div className="mt-6 border-t-2 border-green-300 pt-4 bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm text-green-900 font-semibold mb-3">
              ✅ Correct Answers (for admin / teacher use)
            </h4>
            <div className="space-y-1">
              {data.answers
                .sort((a, b) => a.questionNumber - b.questionNumber)
                .map((answer) => (
                  <div key={answer.questionNumber} className="text-sm text-green-900">
                    <strong>{answer.questionNumber}</strong> → {answer.correctAnswer}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <div className="space-y-4">
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
          <p className="text-xs text-slate-500 mt-1">
            Bu flow chart ustida ko'rsatiladi
          </p>
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
            Odatiy: &quot;{getInstructionText()}&quot;
          </p>
        </div>

        {/* Question Number Start */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Boshlang'ich savol raqami
          </label>
          <input
            type="number"
            value={data.questionNumberStart || 1}
            onChange={(e) => onChange({ ...data, questionNumberStart: parseInt(e.target.value) || 1 })}
            min="1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
          />
        </div>

        {/* Stats */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            📊 Jami: <strong>{data.steps.length}</strong> qadam, 
            <strong> {getAnswerCount()}</strong> javob maydoni
          </p>
          <p className="text-xs text-blue-700 mt-1">
            💡 Har bir qadam matnida (1), (2), (3) yozilsa javob maydoniga aylanadi
          </p>
        </div>
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

        {/* Instructions */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
          <p className="mb-1">💡 <strong>Qo'llanma:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
            <li>Har bir qadam matnida (1), (2) yozilsa avtomatik javob maydoniga aylanadi</li>
            <li>Masalan: &quot;Different regions follow the movement of the (1) __________&quot;</li>
            <li>Qadamlarni yuqoriga/pastga ko'chirish uchun o'q tugmalarini bosing</li>
          </ul>
        </div>

        <div className="space-y-3">
          {data.steps.map((step, index) => (
            <div key={step.id} className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50">
              {/* Step Header */}
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
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Yuqoriga"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === data.steps.length - 1}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Pastga"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Step Content */}
              <textarea
                value={step.content}
                onChange={(e) => updateStep(step.id, e.target.value)}
                placeholder="Matn kiriting yoki (1), (2) yozing..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
              />

              {/* Gap count */}
              {step.content && step.content.match(/\(\d+\)/g) && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ {step.content.match(/\(\d+\)/g)?.length} javob topildi
                </div>
              )}

              {/* Arrow indicator (except last) */}
              {index < data.steps.length - 1 && (
                <div className="mt-2 text-center text-slate-400 text-sm">
                  ⬇️
                </div>
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
          Agar variant ro'yxati berilsa, instruction avtomatik &quot;from the list of options&quot; ga o'zgaradi
        </p>

        {data.options && data.options.length > 0 ? (
          <div className="space-y-2">
            {data.options.map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Variant ${index + 1} (masalan: sun, confusion...)`}
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="O'chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 text-center p-4 border border-dashed border-slate-300 rounded-lg">
            Variant yo'q. Agar kerak bo'lsa, &quot;Variant&quot; tugmasini bosing.
          </div>
        )}
      </div>

      {/* Correct Answers Section */}
      <div className="border border-green-300 rounded-lg p-4 bg-green-50">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-green-900 font-medium">✅ To'g'ri Javoblar (Admin uchun)</h4>
          <button
            type="button"
            onClick={() => setShowAnswers(!showAnswers)}
            className="text-sm text-green-700 hover:text-green-900"
          >
            {showAnswers ? 'Yashirish' : 'Ko\'rsatish'}
          </button>
        </div>

        {showAnswers && (
          <>
            <div className="mb-3 p-3 bg-white border border-green-200 rounded">
              <p className="text-xs text-green-700">
                <Info className="w-4 h-4 inline mr-1" />
                Har bir savol raqami uchun to'g'ri javobni kiriting. Bu faqat o'qituvchi va admin uchun.
              </p>
            </div>

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
          </>
        )}
      </div>

      {/* Preview */}
      <div className="border-t-2 border-slate-300 pt-6">
        <h4 className="text-slate-900 mb-4 font-semibold">Ko&apos;rinishi (Student View)</h4>
        <FlowChartCompletionEditor data={data} onChange={onChange} mode="preview" />
      </div>
    </div>
  );
}
