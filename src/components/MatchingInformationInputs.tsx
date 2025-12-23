import React, { useState, useEffect } from 'react';
import { Plus, X, Info, CheckCircle2, AlertCircle, FileText, Search, Hash } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'romain';

interface Paragraph {
  id: string;
  label: string;
  text: string;
}

interface MatchingInformationInputsProps {
  value?: {
    statement?: string[];
    option?: string[][];
    variant_type?: VariantType;
  };
  onChange: (data: {
    statement: string[];
    option: string[][];
  }) => void;
  variantType: VariantType;
}

export function MatchingInformationInputs({ value, onChange, variantType }: MatchingInformationInputsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      if (value && value.statement && value.option) {
        setQuestions(value.statement || ['']);
        // Extract paragraphs from options (first question's options represent all paragraphs)
        const paragraphLabels = value.option[0] || [];
        setParagraphs(paragraphLabels.map((label, idx) => ({
          id: `para-${idx}`,
          label: getVariantLabel(idx),
          text: label
        })));
      } else {
        setQuestions(['']);
        setParagraphs([]);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      // For Matching Information: ALL questions share the SAME paragraph labels
      const paragraphLabels = paragraphs.map(p => p.text);
      const optionsForAllQuestions = questions.map(() => [...paragraphLabels]);
      
      console.log('🔍 Matching Information Debug:', {
        questions,
        paragraphs,
        paragraphLabels,
        optionsForAllQuestions
      });
      
      onChange({
        statement: questions,
        option: optionsForAllQuestions
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, paragraphs, initialized]);

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
    setQuestions([...questions, '']);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, idx) => idx !== index));
    }
  };

  const addParagraph = () => {
    setParagraphs([...paragraphs, {
      id: `para-${Date.now()}`,
      label: getVariantLabel(paragraphs.length),
      text: ''
    }]);
  };

  const updateParagraph = (id: string, text: string) => {
    setParagraphs(paragraphs.map(p => 
      p.id === id ? { ...p, text } : p
    ));
  };

  const removeParagraph = (id: string) => {
    if (paragraphs.length > 1) {
      setParagraphs(paragraphs.filter(p => p.id !== id));
    }
  };

  // Quick add multiple
  const addMultipleQuestions = (count: number) => {
    const newQuestions = [...questions];
    for (let i = 0; i < count; i++) {
      newQuestions.push('');
    }
    setQuestions(newQuestions);
  };

  const addMultipleParagraphs = (count: number) => {
    const newParagraphs = [...paragraphs];
    for (let i = 0; i < count; i++) {
      newParagraphs.push({
        id: `para-${Date.now()}-${i}`,
        label: getVariantLabel(paragraphs.length + i),
        text: ''
      });
    }
    setParagraphs(newParagraphs);
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  const firstLetter = paragraphs.length > 0 ? paragraphs[0].label : 'A';
  const lastLetter = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1].label : 'E';
  const isValidConfiguration = questions.length > 0 && paragraphs.length > 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Instructions with Live Update */}
      <div className={`p-5 border-2 rounded-xl transition-all ${
        isValidConfiguration 
          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
          : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300'
      }`}>
        <div className="flex items-start gap-3">
          {isValidConfiguration ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-semibold mb-2 ${
              isValidConfiguration ? 'text-green-900' : 'text-orange-900'
            }`}>
              📋 Instruction (Real-time)
            </p>
            <p className={`text-sm mb-2 ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              <strong>Questions {questions.length > 0 ? `1 – ${questions.length}` : '1 – 6'}</strong>
            </p>
            <p className={`text-sm mb-2 ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              Which paragraph contains the following information?<br/>
              Write the correct letter{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                {firstLetter} – {lastLetter}
              </strong>{' '}
              next to questions{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                1 – {questions.length}
              </strong>.
            </p>
            <p className="text-xs font-semibold italic bg-white/70 px-3 py-2 rounded border">
              NB You may use any letter more than once.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-indigo-700">{paragraphs.length}</div>
          <div className="text-xs text-indigo-600 mt-1">Paragraphlar</div>
        </div>
        <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-teal-700">{questions.length}</div>
          <div className="text-xs text-teal-600 mt-1">Information/Savollar</div>
        </div>
      </div>

      {/* Paragraphs Section */}
      <div className="p-5 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 border-2 border-indigo-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-indigo-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-indigo-900 font-bold">
              Paragraphlar (To'liq matn)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-full font-bold shadow-sm">
            {paragraphs.length} ta
          </span>
        </div>

        <p className="text-xs text-indigo-700 mb-4 p-3 bg-white/60 rounded-lg border border-indigo-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Har bir paragraph to'liq matn bilan. Talaba qaysi paragraphda kerakli ma'lumot borligini topadi.
        </p>

        {/* Quick Add Paragraphs */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => addMultipleParagraphs(3)}
            className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors border border-indigo-300"
          >
            + 3 ta paragraph qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleParagraphs(5)}
            className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors border border-indigo-300"
          >
            + 5 ta paragraph qo'shish
          </button>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {paragraphs.map((para) => (
            <div key={para.id} className="p-4 bg-white border-2 border-indigo-300 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center min-w-[60px] h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-sm">
                  <span className="text-sm font-bold text-white">
                    Paragraph {para.label}
                  </span>
                </div>
                {paragraphs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParagraph(para.id)}
                    className="ml-auto p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300"
                    title="Paragraphni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={para.text}
                onChange={(e) => updateParagraph(para.id, e.target.value)}
                placeholder={`Paragraph ${para.label} matnini kiriting...\n\nMasalan: "The early development of solar power was slow due to high costs and limited technology. However, interest increased as fossil fuel reserves began to decline."`}
                rows={4}
                className="w-full px-3 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 resize-none"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addParagraph}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-indigo-700 font-semibold hover:bg-indigo-100 rounded-lg transition-all w-full border-2 border-dashed border-indigo-400 hover:border-indigo-500 hover:shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi paragraph qo'shish</span>
          </button>
        </div>
      </div>

      {/* Questions/Information Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-slate-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600 rounded-lg">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-slate-900 font-bold">
              Information/Savollar
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-full font-bold shadow-sm">
            {questions.length} ta
          </span>
        </div>

        <p className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Talaba uchun topish kerak bo'lgan ma'lumotlar. Har birida qaysi paragraphda bu ma'lumot borligini aniqlash kerak.
        </p>

        {/* Quick Add Questions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addMultipleQuestions(3)}
            className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg transition-colors border border-teal-300"
          >
            + 3 ta savol qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleQuestions(5)}
            className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg transition-colors border border-teal-300"
          >
            + 5 ta savol qo'shish
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {questions.map((question, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-teal-50 border-2 border-teal-300 rounded-xl hover:border-teal-400 transition-all shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center min-w-[70px] h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    Savol {idx + 1}
                  </span>
                </div>
                <textarea
                  value={question}
                  onChange={(e) => updateQuestion(idx, e.target.value)}
                  placeholder={`Masalan: "A reference to financial support encouraging solar energy use" yoki "Information about technological improvements reducing costs"`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 border-2 border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm resize-none"
                />
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300 flex-shrink-0"
                    title="Savolni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-teal-700 font-semibold hover:bg-teal-50 rounded-xl transition-all w-full border-2 border-dashed border-teal-400 hover:border-teal-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi savol qo'shish</span>
          </button>
        </div>
      </div>

      {/* Enhanced Info Box with Examples */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <p className="text-sm font-bold text-blue-900">
              💡 Matching Information qanday ishlaydi:
            </p>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex gap-2">
                <span className="text-blue-600">1.</span>
                <span><strong>Paragraphlar</strong> - To'liq matnli paragraphlar (A, B, C, D, E)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">2.</span>
                <span><strong>Information</strong> - Topish kerak bo'lgan ma'lumotlar (tavsiflar)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">3.</span>
                <span>Talaba har bir information uchun qaysi paragraphda bu ma'lumot borligini aniqlaydi</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">4.</span>
                <span><strong>Muhim:</strong> Bir paragraphni bir necha marta ishlatish mumkin (NB: You may use any letter more than once)</span>
              </div>
            </div>

            {/* Example Preview */}
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">📝 Misol:</p>
              <div className="space-y-2 text-xs text-blue-800">
                <div>
                  <p className="font-semibold mb-1">Paragraphlar:</p>
                  <p className="ml-2">• <strong>Paragraph A:</strong> "The early development of solar power..."</p>
                  <p className="ml-2">• <strong>Paragraph B:</strong> "Germany became a leader in renewable energy..."</p>
                  <p className="ml-2">• <strong>Paragraph C:</strong> "One major concern about solar energy..."</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Information/Savollar:</p>
                  <p className="ml-2">1. A reference to financial support encouraging solar energy use</p>
                  <p className="ml-2">2. Information about technological improvements reducing costs</p>
                  <p className="ml-2">3. A problem related to unreliable energy production</p>
                </div>
                <p className="text-blue-600 italic mt-2">→ Talaba har bir savol uchun A, B, C, D, E dan to'g'ri javobni tanlaydi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
