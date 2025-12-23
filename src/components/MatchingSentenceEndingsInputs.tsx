import React, { useState, useEffect } from 'react';
import { Plus, X, Info, CheckCircle2, AlertCircle, List, Sparkles } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'romain';

interface MatchingSentenceEndingsInputsProps {
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

export function MatchingSentenceEndingsInputs({ value, onChange, variantType }: MatchingSentenceEndingsInputsProps) {
  const [sentences, setSentences] = useState<string[]>([]);
  const [endings, setEndings] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      if (value && value.statement && value.option) {
        setSentences(value.statement || ['']);
        // Extract endings from options (first question's options represent all endings)
        const allEndings = value.option[0] || [];
        setEndings(allEndings);
      } else {
        setSentences(['']);
        setEndings(['']);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      // All sentences share the SAME endings
      const optionsForAllSentences = sentences.map(() => [...endings]);
      
      console.log('🔗 Matching Sentence Endings Debug:', {
        sentences,
        endings,
        optionsForAllSentences
      });
      
      onChange({
        statement: sentences,
        option: optionsForAllSentences
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentences, endings, initialized]);

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

  const addSentence = () => {
    setSentences([...sentences, '']);
  };

  const updateSentence = (index: number, value: string) => {
    const newSentences = [...sentences];
    newSentences[index] = value;
    setSentences(newSentences);
  };

  const removeSentence = (index: number) => {
    if (sentences.length > 1) {
      setSentences(sentences.filter((_, idx) => idx !== index));
    }
  };

  const addEnding = () => {
    setEndings([...endings, '']);
  };

  const updateEnding = (index: number, value: string) => {
    const newEndings = [...endings];
    newEndings[index] = value;
    setEndings(newEndings);
  };

  const removeEnding = (index: number) => {
    if (endings.length > 1) {
      setEndings(endings.filter((_, idx) => idx !== index));
    }
  };

  // Quick add multiple
  const addMultipleSentences = (count: number) => {
    const newSentences = [...sentences];
    for (let i = 0; i < count; i++) {
      newSentences.push('');
    }
    setSentences(newSentences);
  };

  const addMultipleEndings = (count: number) => {
    const newEndings = [...endings];
    for (let i = 0; i < count; i++) {
      newEndings.push('');
    }
    setEndings(newEndings);
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  const firstLetter = endings.length > 0 ? getVariantLabel(0) : 'A';
  const lastLetter = endings.length > 0 ? getVariantLabel(endings.length - 1) : 'H';
  const isValidConfiguration = sentences.length > 0 && endings.length > 0;

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
              <strong>Questions {sentences.length > 0 ? `1 – ${sentences.length}` : '1 – 5'}</strong>
            </p>
            <p className={`text-sm mb-2 ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              Complete each sentence with the correct ending.<br/>
              Write the correct letter{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                {firstLetter} – {lastLetter}
              </strong>{' '}
              next to questions{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                1 – {sentences.length}
              </strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-700">{sentences.length}</div>
          <div className="text-xs text-purple-600 mt-1">Sentences (Gaplar)</div>
        </div>
        <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-pink-700">{endings.length}</div>
          <div className="text-xs text-pink-600 mt-1">Endings (Tugallovchilar)</div>
        </div>
      </div>

      {/* Sentences Section */}
      <div className="p-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 border-2 border-purple-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-purple-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <List className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-purple-900 font-bold">
              Sentences (To'liq bo'lmagan gaplar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-full font-bold shadow-sm">
            {sentences.length} ta
          </span>
        </div>

        <p className="text-xs text-purple-700 mb-4 p-3 bg-white/60 rounded-lg border border-purple-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          To'liq bo'lmagan gaplar. Har bir gap oxiri "..." bilan tugaydi va talaba to'g'ri ending'ni topishi kerak.
        </p>

        {/* Quick Add Sentences */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => addMultipleSentences(3)}
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors border border-purple-300"
          >
            + 3 ta sentence qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleSentences(5)}
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors border border-purple-300"
          >
            + 5 ta sentence qo'shish
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {sentences.map((sentence, idx) => (
            <div key={idx} className="p-4 bg-white border-2 border-purple-300 rounded-xl shadow-sm hover:border-purple-400 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center min-w-[70px] h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    Sentence {idx + 1}
                  </span>
                </div>
                <textarea
                  value={sentence}
                  onChange={(e) => updateSentence(idx, e.target.value)}
                  placeholder={`Masalan: "The rapid growth of cities in the 19th century …" yoki "The introduction of factory-based work schedules …"`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 border-2 border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm resize-none"
                />
                {sentences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSentence(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300 flex-shrink-0"
                    title="Sentenceni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSentence}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-purple-700 font-semibold hover:bg-purple-50 rounded-xl transition-all w-full border-2 border-dashed border-purple-400 hover:border-purple-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi sentence qo'shish</span>
          </button>
        </div>
      </div>

      {/* Endings Section */}
      <div className="p-5 bg-gradient-to-br from-pink-50 via-rose-50 to-pink-50 border-2 border-pink-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-pink-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-pink-900 font-bold">
              Sentence Endings (Tugallovchilar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-pink-600 text-white rounded-full font-bold shadow-sm">
            {endings.length} ta
          </span>
        </div>

        <p className="text-xs text-pink-700 mb-4 p-3 bg-white/60 rounded-lg border border-pink-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Gaplarni tugallovchi qismlar. Har biri "..." bilan boshlanadi. Odatda sentences'dan ko'proq bo'ladi.
        </p>

        {/* Quick Add Endings */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => addMultipleEndings(3)}
            className="px-3 py-1.5 text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg transition-colors border border-pink-300"
          >
            + 3 ta ending qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleEndings(5)}
            className="px-3 py-1.5 text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg transition-colors border border-pink-300"
          >
            + 5 ta ending qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleEndings(8)}
            className="px-3 py-1.5 text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 rounded-lg transition-colors border border-pink-300"
          >
            + 8 ta ending qo'shish
          </button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {endings.map((ending, idx) => (
            <div key={idx} className="p-4 bg-white border-2 border-pink-300 rounded-xl shadow-sm hover:border-pink-400 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center min-w-[60px] h-10 bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {getVariantLabel(idx)}
                  </span>
                </div>
                <textarea
                  value={ending}
                  onChange={(e) => updateEnding(idx, e.target.value)}
                  placeholder={`Masalan: "… allowed people to coordinate activities across long distances." yoki "… led to confusion between neighbouring towns."`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 border-2 border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white shadow-sm resize-none"
                />
                {endings.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEnding(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300 flex-shrink-0"
                    title="Endingni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addEnding}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-pink-700 font-semibold hover:bg-pink-50 rounded-xl transition-all w-full border-2 border-dashed border-pink-400 hover:border-pink-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi ending qo'shish</span>
          </button>
        </div>
      </div>

      {/* Enhanced Info Box with Examples */}
      <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-300 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <p className="text-sm font-bold text-violet-900">
              💡 Matching Sentence Endings qanday ishlaydi:
            </p>
            <div className="space-y-2 text-xs text-violet-800">
              <div className="flex gap-2">
                <span className="text-violet-600">1.</span>
                <span><strong>Sentences</strong> - To'liq bo'lmagan gaplar (oxiri "…" bilan)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-600">2.</span>
                <span><strong>Endings</strong> - Tugallovchi qismlar ("…" dan keyin davom etadi)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-600">3.</span>
                <span>Talaba har bir sentence uchun to'g'ri ending'ni tanlaydi</span>
              </div>
              <div className="flex gap-2">
                <span className="text-violet-600">4.</span>
                <span><strong>Muhim:</strong> Endings soni odatda sentences sonidan ko'p bo'ladi (masalan: 5 ta sentence, 8 ta ending)</span>
              </div>
            </div>

            {/* Example Preview */}
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-violet-200">
              <p className="text-xs font-semibold text-violet-900 mb-2">📝 Misol:</p>
              <div className="space-y-2 text-xs text-violet-800">
                <div>
                  <p className="font-semibold mb-1">Sentences:</p>
                  <p className="ml-2">1. The rapid growth of cities in the 19th century …</p>
                  <p className="ml-2">2. The introduction of factory-based work schedules …</p>
                  <p className="ml-2">3. The lack of a unified time system …</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Sentence Endings:</p>
                  <p className="ml-2"><strong>A</strong> … allowed people to coordinate activities across long distances.</p>
                  <p className="ml-2"><strong>B</strong> … led to confusion between neighbouring towns.</p>
                  <p className="ml-2"><strong>C</strong> … required workers to follow fixed daily routines.</p>
                  <p className="ml-2"><strong>D</strong> … played a key role in improving global trade.</p>
                  <p className="ml-2"><strong>E</strong> … resulted in overcrowded living conditions.</p>
                </div>
                <p className="text-violet-600 italic mt-2">→ Talaba: 1-E, 2-C, 3-B (masalan)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
