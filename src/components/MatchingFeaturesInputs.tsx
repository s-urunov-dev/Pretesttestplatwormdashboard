import React, { useState, useEffect } from 'react';
import { Plus, X, Info, CheckCircle2, AlertCircle, Users, MessageSquare } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'romain';

interface MatchingFeaturesInputsProps {
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

export function MatchingFeaturesInputs({ value, onChange, variantType }: MatchingFeaturesInputsProps) {
  const [statements, setStatements] = useState<string[]>([]);
  const [people, setPeople] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      if (value && value.statement && value.option) {
        setStatements(value.statement || ['']);
        // Extract people from options (first statement's options represent all people)
        const allPeople = value.option[0] || [];
        setPeople(allPeople);
      } else {
        setStatements(['']);
        setPeople(['']);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      // All statements share the SAME people/categories
      const optionsForAllStatements = statements.map(() => [...people]);
      
      console.log('🎯 Matching Features Debug:', {
        statements,
        people,
        optionsForAllStatements
      });
      
      onChange({
        statement: statements,
        option: optionsForAllStatements
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statements, people, initialized]);

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

  const addPerson = () => {
    setPeople([...people, '']);
  };

  const updatePerson = (index: number, value: string) => {
    const newPeople = [...people];
    newPeople[index] = value;
    setPeople(newPeople);
  };

  const removePerson = (index: number) => {
    if (people.length > 1) {
      setPeople(people.filter((_, idx) => idx !== index));
    }
  };

  // Quick add multiple
  const addMultipleStatements = (count: number) => {
    const newStatements = [...statements];
    for (let i = 0; i < count; i++) {
      newStatements.push('');
    }
    setStatements(newStatements);
  };

  const addMultiplePeople = (count: number) => {
    const newPeople = [...people];
    for (let i = 0; i < count; i++) {
      newPeople.push('');
    }
    setPeople(newPeople);
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  const firstLetter = people.length > 0 ? getVariantLabel(0) : 'A';
  const lastLetter = people.length > 0 ? getVariantLabel(people.length - 1) : 'D';
  const isValidConfiguration = statements.length > 0 && people.length > 0;

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
              <strong>Questions {statements.length > 0 ? `1 – ${statements.length}` : '1 – 6'}</strong>
            </p>
            <p className={`text-sm mb-2 ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              Match each statement with the correct person.<br/>
              Write the correct letter{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                {firstLetter} – {lastLetter}
              </strong>{' '}
              next to questions{' '}
              <strong className="px-2 py-0.5 bg-white rounded border">
                1 – {statements.length}
              </strong>.
            </p>
            <p className={`text-xs font-bold mt-2 ${
              isValidConfiguration ? 'text-green-700' : 'text-orange-700'
            }`}>
              NB You may use any letter more than once.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-blue-700">{people.length}</div>
          <div className="text-xs text-blue-600 mt-1">People / Categories</div>
        </div>
        <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-700">{statements.length}</div>
          <div className="text-xs text-amber-600 mt-1">Statements (Fikrlar)</div>
        </div>
      </div>

      {/* People/Categories Section */}
      <div className="p-5 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-blue-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-blue-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-blue-900 font-bold">
              People / Categories (Shaxslar / Toifalar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-full font-bold shadow-sm">
            {people.length} ta
          </span>
        </div>

        <p className="text-xs text-blue-700 mb-4 p-3 bg-white/60 rounded-lg border border-blue-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Shaxslar, mutaxassislar yoki kategoriyalar. Odatda 3-5 ta bo'ladi. Har biriga harf belgilanadi (A, B, C...).
        </p>

        {/* Quick Add People */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => addMultiplePeople(3)}
            className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors border border-blue-300"
          >
            + 3 ta person qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultiplePeople(4)}
            className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors border border-blue-300"
          >
            + 4 ta person qo'shish
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {people.map((person, idx) => (
            <div key={idx} className="p-4 bg-white border-2 border-blue-300 rounded-xl shadow-sm hover:border-blue-400 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center min-w-[60px] h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {getVariantLabel(idx)}
                  </span>
                </div>
                <input
                  type="text"
                  value={person}
                  onChange={(e) => updatePerson(idx, e.target.value)}
                  placeholder={`Masalan: "Dr Helen Morris" yoki "Professor James Lee"`}
                  className="flex-1 px-3 py-2.5 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
                {people.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePerson(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300 flex-shrink-0"
                    title="Person'ni o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addPerson}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-blue-700 font-semibold hover:bg-blue-50 rounded-xl transition-all w-full border-2 border-dashed border-blue-400 hover:border-blue-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi person qo'shish</span>
          </button>
        </div>
      </div>

      {/* Statements Section */}
      <div className="p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-amber-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600 rounded-lg">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-amber-900 font-bold">
              Statements (Fikrlar / Bayonotlar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-amber-600 text-white rounded-full font-bold shadow-sm">
            {statements.length} ta
          </span>
        </div>

        <p className="text-xs text-amber-700 mb-4 p-3 bg-white/60 rounded-lg border border-amber-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Fikrlar yoki bayonotlar. Talaba har bir statementni to'g'ri person bilan moslashtirishi kerak.
        </p>

        {/* Quick Add Statements */}
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => addMultipleStatements(3)}
            className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
          >
            + 3 ta statement qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleStatements(5)}
            className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
          >
            + 5 ta statement qo'shish
          </button>
          <button
            type="button"
            onClick={() => addMultipleStatements(6)}
            className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors border border-amber-300"
          >
            + 6 ta statement qo'shish
          </button>
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {statements.map((statement, idx) => (
            <div key={idx} className="p-4 bg-white border-2 border-amber-300 rounded-xl shadow-sm hover:border-amber-400 transition-all">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center min-w-[70px] h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    Statement {idx + 1}
                  </span>
                </div>
                <textarea
                  value={statement}
                  onChange={(e) => updateStatement(idx, e.target.value)}
                  placeholder={`Masalan: "Believes that technological progress will reduce the need for manual labour" yoki "Argues that government policy is the key factor in economic growth"`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 border-2 border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm resize-none"
                />
                {statements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStatement(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300 flex-shrink-0"
                    title="Statementni o'chirish"
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
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-amber-700 font-semibold hover:bg-amber-50 rounded-xl transition-all w-full border-2 border-dashed border-amber-400 hover:border-amber-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi statement qo'shish</span>
          </button>
        </div>
      </div>

      {/* Enhanced Info Box with Examples */}
      <div className="p-5 bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <p className="text-sm font-bold text-sky-900">
              💡 Matching Features qanday ishlaydi:
            </p>
            <div className="space-y-2 text-xs text-sky-800">
              <div className="flex gap-2">
                <span className="text-sky-600">1.</span>
                <span><strong>People/Categories</strong> - Kichik ro'yxat: shaxslar, mutaxassislar, kategoriyalar (A, B, C, D)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-600">2.</span>
                <span><strong>Statements</strong> - Katta ro'yxat: fikrlar, bayonotlar, xususiyatlar (1, 2, 3...)</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-600">3.</span>
                <span>Talaba har bir statementni to'g'ri person bilan moslashtiradi</span>
              </div>
              <div className="flex gap-2">
                <span className="text-sky-600">4.</span>
                <span><strong>NB:</strong> Bir xil harfni bir necha marta ishlatish mumkin!</span>
              </div>
            </div>

            {/* Example Preview */}
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-sky-200">
              <p className="text-xs font-semibold text-sky-900 mb-2">📝 Misol:</p>
              <div className="space-y-2 text-xs text-sky-800">
                <div>
                  <p className="font-semibold mb-1">People:</p>
                  <p className="ml-2"><strong>A</strong> Dr Helen Morris</p>
                  <p className="ml-2"><strong>B</strong> Professor James Lee</p>
                  <p className="ml-2"><strong>C</strong> Dr Ahmed Khan</p>
                  <p className="ml-2"><strong>D</strong> Professor Laura Smith</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Statements:</p>
                  <p className="ml-2">1. Believes that technological progress will reduce the need for manual labour</p>
                  <p className="ml-2">2. Argues that government policy is the key factor in economic growth</p>
                  <p className="ml-2">3. Suggests that education systems must adapt to future job markets</p>
                </div>
                <p className="text-sky-600 italic mt-2">→ Talaba: 1-A, 2-B, 3-C (masalan)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
