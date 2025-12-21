import React, { useState } from 'react';
import { X, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';
import { Question } from './QuestionPanel';
import { EnhancedQuestionForm } from './EnhancedQuestionForm';

interface AddQuestionModalProps {
  onClose: () => void;
  onAdd: (question: Omit<Question, 'id' | 'createdAt'>) => void;
}

export function AddQuestionModal({ onClose, onAdd }: AddQuestionModalProps) {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [selectedType, setSelectedType] = useState<'reading' | 'listening' | 'writing' | 'speaking' | null>(null);

  const types = [
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'blue', description: 'O\'qish bo\'limi savollari' },
    { id: 'listening', label: 'Listening', icon: Headphones, color: 'green', description: 'Tinglash bo\'limi savollari' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'purple', description: 'Yozish bo\'limi savollari' },
    { id: 'speaking', label: 'Speaking', icon: Mic, color: 'orange', description: 'Gapirish bo\'limi savollari' },
  ];

  const handleTypeSelect = (type: 'reading' | 'listening' | 'writing' | 'speaking') => {
    setSelectedType(type);
    setStep('form');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-1">Yangi Savol Qo&apos;shish</h2>
            <p className="text-slate-600">
              {step === 'type' ? 'Savol turini tanlang' : `${selectedType?.toUpperCase()} savoli`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {types.map((type) => {
                const Icon = type.icon;
                const colorClasses = {
                  blue: {
                    border: 'hover:border-blue-500',
                    bg: 'bg-blue-100',
                    text: 'text-blue-600',
                  },
                  green: {
                    border: 'hover:border-green-500',
                    bg: 'bg-green-100',
                    text: 'text-green-600',
                  },
                  purple: {
                    border: 'hover:border-purple-500',
                    bg: 'bg-purple-100',
                    text: 'text-purple-600',
                  },
                  orange: {
                    border: 'hover:border-orange-500',
                    bg: 'bg-orange-100',
                    text: 'text-orange-600',
                  },
                };
                const colors = colorClasses[type.color as keyof typeof colorClasses];
                
                return (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id as any)}
                    className={`p-6 rounded-xl border-2 ${colors.border} hover:shadow-lg transition-all text-left group`}
                  >
                    <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <h3 className="text-slate-900 mb-1">{type.label}</h3>
                    <p className="text-slate-600 text-sm">{type.description}</p>
                  </button>
                );
              })}
            </div>
          ) : selectedType ? (
            <EnhancedQuestionForm
              selectedType={selectedType}
              onSubmit={onAdd}
              onBack={() => setStep('type')}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}