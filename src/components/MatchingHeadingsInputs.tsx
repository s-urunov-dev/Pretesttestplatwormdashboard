import React, { useState, useEffect } from 'react';
import { Plus, X, Info, CheckCircle2, AlertCircle, MoveVertical, Hash } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'romain';

interface MatchingHeadingsInputsProps {
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

export function MatchingHeadingsInputs({ value, onChange, variantType }: MatchingHeadingsInputsProps) {
  const [statements, setStatements] = useState<string[]>([]);
  const [commonOptions, setCommonOptions] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      if (value && value.statement && value.option) {
        setStatements(value.statement || ['']);
        // Common options are the same for all questions - take first one
        setCommonOptions(value.option[0] || []);
      } else {
        setStatements(['']);
        setCommonOptions([]);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      // For Matching Headings: ALL questions share the SAME options
      const optionsForAllQuestions = statements.map(() => [...commonOptions]);
      
      console.log('🔍 Matching Headings Debug:', {
        statements,
        commonOptions,
        optionsForAllQuestions
      });
      
      onChange({
        statement: statements,
        option: optionsForAllQuestions
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statements, commonOptions, initialized]);

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

  const addStatement = () => {
    setStatements([...statements, '']);
  };

  const updateStatement = (index: number, value: string) => {
    const newStatements = [...statements];
    newStatements[index] = value;
    setStatements(newStatements);
  };

  const removeStatement = (index: number) => {
    if (statements.length > 1) {
      setStatements(statements.filter((_, idx) => idx !== index));
    }
  };

  const addOption = () => {
    setCommonOptions([...commonOptions, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...commonOptions];
    newOptions[index] = value;
    setCommonOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setCommonOptions(commonOptions.filter((_, idx) => idx !== index));
  };

  // Quick add multiple options
  const addMultipleOptions = (count: number) => {
    const newOptions = [...commonOptions];
    for (let i = 0; i < count; i++) {
      newOptions.push('');
    }
    setCommonOptions(newOptions);
  };

  // Quick add multiple statements
  const addMultipleStatements = (count: number) => {
    const newStatements = [...statements];
    for (let i = 0; i < count; i++) {
      newStatements.push('');
    }
    setStatements(newStatements);
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  const firstLetter = commonOptions.length > 0 ? getVariantLabel(0) : 'A';
  const lastLetter = commonOptions.length > 0 ? getVariantLabel(commonOptions.length - 1) : 'H';
  const isValidConfiguration = statements.length > 0 && commonOptions.length > statements.length;

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
            <p className={`text-sm ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              Match each paragraph with the correct heading. Write the correct letter{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                {firstLetter} – {lastLetter}
              </strong>{' '}
              next to questions{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                1 – {statements.length}
              </strong>.
            </p>
            {!isValidConfiguration && (
              <p className="text-xs text-orange-700 mt-2 italic">
                ⚠️ Odatda headinglar soni paragraphlardan ko'p bo'lishi kerak (masalan: 5 savol, 8 heading)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-purple-700">{commonOptions.length}</div>
          <div className="text-xs text-purple-600 mt-1">Headinglar</div>
        </div>
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-700">{statements.length}</div>
          <div className="text-xs text-blue-600 mt-1">Savollar</div>
        </div>
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-700">
            {commonOptions.length - statements.length}
          </div>
          <div className="text-xs text-green-600 mt-1">Extra headinglar</div>
        </div>
      </div>

      {/* Common Headings (Options Pool) */}
      <div className="p-5 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-purple-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Hash className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-purple-900 font-bold">
              Headinglar (Umumiy variantlar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-full font-bold shadow-sm">
            {commonOptions.length} ta
          </span>
        </div>

        <p className="text-xs text-purple-700 mb-4 p-3 bg-white/60 rounded-lg border border-purple-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Bu headinglar barcha paragraphlar uchun umumiy bo'ladi. Talaba har bir paragraph uchun mos headingni tanlaydi.
        </p>

        {/* Quick Add Options */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => addMultipleOptions(3)}
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors border border-purple-300"
          >
            + 3 ta qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleOptions(5)}
            className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors border border-purple-300"
          >
            + 5 ta qo'shish
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
          {commonOptions.map((option, idx) => (
            <div key={idx} className="flex items-center gap-2 group">
              <div className="flex items-center justify-center min-w-[48px] h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-sm">
                <span className="text-sm font-bold text-white">
                  {getVariantLabel(idx)}
                </span>
              </div>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(idx, e.target.value)}
                placeholder={`Heading ${getVariantLabel(idx)} - masalan: "Introduction to the topic"`}
                className="flex-1 px-3 py-2.5 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeOption(idx)}
                className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-300"
                title="Headingni o'chirish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addOption}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-purple-700 font-semibold hover:bg-purple-100 rounded-lg transition-all w-full border-2 border-dashed border-purple-400 hover:border-purple-500 hover:shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi heading qo'shish</span>
          </button>
        </div>
      </div>

      {/* Paragraphs (Statements/Questions) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b-2 border-slate-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#042d62] rounded-lg">
              <MoveVertical className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-slate-900 font-bold">
              Paragraphlar (Savollar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-full font-bold shadow-sm">
            {statements.length} ta
          </span>
        </div>

        {/* Quick Add Statements */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addMultipleStatements(3)}
            className="px-3 py-1.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors border border-green-300"
          >
            + 3 ta savol qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleStatements(5)}
            className="px-3 py-1.5 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors border border-green-300"
          >
            + 5 ta savol qo'shish
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {statements.map((statement, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-slate-50 to-blue-50 border-2 border-slate-300 rounded-xl hover:border-blue-400 transition-all shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center min-w-[70px] h-10 bg-gradient-to-br from-[#042d62] to-blue-700 rounded-lg shadow-sm">
                  <span className="text-sm font-bold text-white">
                    Savol {idx + 1}
                  </span>
                </div>
                <input
                  type="text"
                  value={statement}
                  onChange={(e) => updateStatement(idx, e.target.value)}
                  placeholder={`Masalan: "Paragraph A" yoki "The first paragraph discusses..."`}
                  className="flex-1 px-3 py-2.5 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white shadow-sm"
                />
                {statements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStatement(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300"
                    title="Paragraphni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addStatement}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-green-700 font-semibold hover:bg-green-50 rounded-xl transition-all w-full border-2 border-dashed border-green-400 hover:border-green-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi paragraph qo'shish</span>
          </button>
        </div>
      </div>

      {/* Enhanced Info Box with Examples */}
      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <p className="text-sm font-bold text-blue-900">
              💡 Matching Headings qanday ishlaydi:
            </p>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex gap-2">
                <span className="text-blue-600">1.</span>
                <span><strong>Headinglar</strong> - Umumiy variantlar havzasi (A, B, C, D, E, F, G, H)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">2.</span>
                <span><strong>Paragraphlar</strong> - Har bir savol (Savol 1, Savol 2, ...)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">3.</span>
                <span>Talaba har bir paragraph uchun eng mos headingni tanlaydi</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-600">4.</span>
                <span><strong>Muhim:</strong> Headinglar soni paragraphlardan ko'p bo'ladi (masalan: 5 savol, 8 heading)</span>
              </div>
            </div>

            {/* Example Preview */}
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-blue-900 mb-2">📝 Misol:</p>
              <div className="space-y-1 text-xs text-blue-800">
                <p><strong>Headinglar:</strong> A. Introduction | B. Historical Background | C. Modern Applications | D. Future Prospects | E. Conclusion | F. Methods | G. Results | H. Discussion</p>
                <p><strong>Savollar:</strong> 1. Paragraph A | 2. Paragraph B | 3. Paragraph C | 4. Paragraph D | 5. Paragraph E</p>
                <p className="text-blue-600 italic">→ Talaba har bir paragraph uchun A-H orasidan to'g'ri headingni tanlaydi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}