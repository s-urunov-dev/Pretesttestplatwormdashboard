import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Upload, X } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api-cleaned';

export interface DiagramItem {
  id: string;
  content: string;
}

export interface DiagramAnswer {
  questionNumber: number;
  correctAnswer: string;
}

export interface DiagramLabelingValue {
  principle: CriteriaType;
  instruction?: string;
  diagramTitle?: string;
  diagramImageUrl?: string; // Optional diagram image
  items: DiagramItem[];
  options?: string[];
  answers?: DiagramAnswer[];
}

interface DiagramLabelingInputsProps {
  value?: DiagramLabelingValue;
  onChange: (data: DiagramLabelingValue) => void;
}

export function DiagramLabelingInputs({ value, onChange }: DiagramLabelingInputsProps) {
  const data = value || {
    principle: 'ONE_WORD' as CriteriaType,
    items: [
      { id: generateId(), content: '' },
      { id: generateId(), content: '' },
    ],
    options: [],
    answers: [],
  };

  function generateId() {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const addItem = () => {
    onChange({
      ...data,
      items: [...data.items, { id: generateId(), content: '' }],
    });
  };

  const removeItem = (itemId: string) => {
    if (data.items.length <= 1) {
      alert('Kamida bitta label bo\'lishi kerak');
      return;
    }
    onChange({
      ...data,
      items: data.items.filter(item => item.id !== itemId),
    });
  };

  const updateItem = (itemId: string, content: string) => {
    onChange({
      ...data,
      items: data.items.map(item =>
        item.id === itemId ? { ...item, content } : item
      ),
    });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...data.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onChange({ ...data, items: newItems });
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
    data.items.forEach(item => {
      if (item.content) {
        const matches = item.content.match(/\((\d+)\)/g);
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
    data.items.forEach(item => {
      if (item.content) {
        const matches = item.content.match(/\(\d+\)/g);
        if (matches) {
          count += matches.length;
        }
      }
    });
    return count;
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Iltimos, faqat rasm fayli yuklang!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Rasm hajmi 5MB dan kichik bo\'lishi kerak!');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target?.result as string;
      onChange({ ...data, diagramImageUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    onChange({ ...data, diagramImageUrl: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Diagram Title */}
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          Diagram Sarlavhasi (Title)
        </label>
        <input
          type="text"
          value={data.diagramTitle || ''}
          onChange={(e) => onChange({ ...data, diagramTitle: e.target.value })}
          placeholder="Masalan: Structure of a Wind Turbine"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
        />
      </div>

      {/* Diagram Image URL (Optional) */}
      <div>
        <label className="block text-sm text-slate-700 mb-2 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Diagram Rasmi (ixtiyoriy)
        </label>

        {!data.diagramImageUrl ? (
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
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* URL Input */}
            <div className="text-center text-sm text-slate-500">yoki</div>
            <input
              type="text"
              value={data.diagramImageUrl || ''}
              onChange={(e) => onChange({ ...data, diagramImageUrl: e.target.value })}
              placeholder="Rasm URL manzilini kiriting"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
            />
          </div>
        ) : (
          <div className="relative border border-slate-200 rounded-lg p-4 bg-slate-50">
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="w-4 h-4" />
            </button>
            <img 
              src={data.diagramImageUrl} 
              alt="Diagram preview" 
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
          📊 Jami: <strong>{data.items.length}</strong> label, 
          <strong> {getAnswerCount()}</strong> javob maydoni
        </p>
      </div>

      {/* Items Editor */}
      <div className="border border-slate-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-900 font-medium">Diagram Labels (Belgilar)</h4>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-[#042d62] text-white rounded hover:bg-[#053a7a] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Label
          </button>
        </div>

        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
          <p className="mb-1">💡 <strong>Qo&apos;llanma:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
            <li>Har bir label matnida (1), (2) yozilsa avtomatik javob maydoniga aylanadi</li>
            <li>Masalan: &quot;The blades are attached to the central (1) __________&quot;</li>
            <li>Yoki: &quot;The (2) __________ converts wind energy&quot;</li>
          </ul>
        </div>

        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={item.id} className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                  <span className="text-sm px-2 py-1 bg-[#042d62] text-white rounded">
                    Label {index + 1}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === data.items.length - 1}
                    className="p-1 text-slate-600 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <textarea
                value={item.content}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder="Matn kiriting yoki (1), (2) yozing..."
                rows={2}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
              />

              {item.content && item.content.match(/\(\d+\)/g) && (
                <div className="mt-2 text-xs text-green-600">
                  ✓ {item.content.match(/\(\d+\)/g)?.length} javob topildi
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
          Masalan: hub, rotor, gearbox, generator, tower
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
            Labellarda (1), (2) kabi savol raqamlari topilmadi
          </div>
        )}
      </div>
    </div>
  );
}