import React, { useState, useEffect } from 'react';
import { Plus, X, Info, CheckCircle2, AlertCircle, FileText, Trash2 } from 'lucide-react';

interface SentenceCompletionInputsProps {
  value?: {
    title?: string;
    instruction?: string;
    sentences?: Array<{
      text: string;
      correctAnswer: string;
    }>;
  };
  onChange: (data: {
    title: string;
    instruction: string;
    sentences: Array<{
      text: string;
      correctAnswer: string;
    }>;
  }) => void;
}

export function SentenceCompletionInputs({ value, onChange }: SentenceCompletionInputsProps) {
  const [title, setTitle] = useState('Complete the sentences below.');
  const [instruction, setInstruction] = useState('NMT_TWO_NUM');
  const [sentences, setSentences] = useState<Array<{
    text: string;
    correctAnswer: string;
  }>>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      setTitle(value?.title || 'Complete the sentences below.');
      setInstruction(value?.instruction || 'NMT_TWO_NUM');
      
      if (value?.sentences && value.sentences.length > 0) {
        setSentences(value.sentences);
      } else {
        setSentences([{ text: '', correctAnswer: '' }]);
      }
      
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      console.log('✅ Sentence Completion Debug:', { title, instruction, sentences });
      onChange({ title, instruction, sentences });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, instruction, sentences, initialized]);

  const addSentence = () => {
    setSentences([...sentences, { text: '', correctAnswer: '' }]);
  };

  const updateSentenceText = (index: number, text: string) => {
    const newSentences = [...sentences];
    newSentences[index].text = text;
    setSentences(newSentences);
  };

  const updateCorrectAnswer = (index: number, answer: string) => {
    const newSentences = [...sentences];
    newSentences[index].correctAnswer = answer;
    setSentences(newSentences);
  };

  const removeSentence = (index: number) => {
    if (sentences.length > 1) {
      setSentences(sentences.filter((_, idx) => idx !== index));
    }
  };

  const addMultipleSentences = (count: number) => {
    const newSentences = [...sentences];
    for (let i = 0; i < count; i++) {
      newSentences.push({ text: '', correctAnswer: '' });
    }
    setSentences(newSentences);
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  const isValidConfiguration = 
    sentences.length > 0 && 
    sentences.every(s => s && s.text && s.text.trim() !== '' && s.correctAnswer && s.correctAnswer.trim() !== '');

  // Instruction display mapping
  const instructionLabels: { [key: string]: string } = {
    'ONE_WORD': 'One word only',
    'ONE_WORD_OR_NUMBER': 'One word and/or a number',
    'NMT_ONE': 'No more than one word',
    'NMT_TWO': 'No more than two words',
    'NMT_THREE': 'No more than three words',
    'NMT_TWO_NUM': 'No more than two words and/or a number',
    'NMT_THREE_NUM': 'No more than three words and/or a number',
    'NUMBER_ONLY': 'A number',
    'FROM_BOX': 'Choose from the box',
  };

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
              📋 Live Preview
            </p>
            <p className={`text-sm font-bold mb-2 ${ 
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              {title || 'Complete the sentences below.'}
            </p>
            <p className={`text-sm ${ 
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              Write {instructionLabels[instruction] || instruction} for each answer.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-teal-50 border-2 border-teal-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-teal-700">{sentences.length}</div>
          <div className="text-xs text-teal-600 mt-1">Jami Jumlalar</div>
        </div>
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {sentences.filter(s => s && s.correctAnswer && s.correctAnswer.trim() !== '').length}
          </div>
          <div className="text-xs text-emerald-600 mt-1">To'ldirilgan</div>
        </div>
      </div>

      {/* Title Input */}
      <div className="p-5 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 border-2 border-slate-300 rounded-xl shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          📝 Title (Sarlavha)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Complete the sentences below."
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Instruction Input */}
      <div className="p-5 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 border-2 border-slate-300 rounded-xl shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          📋 Instruction (Ko'rsatma)
        </label>
        <select
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm bg-white"
        >
          <option value="ONE_WORD">One word only</option>
          <option value="ONE_WORD_OR_NUMBER">One word and/or a number</option>
          <option value="NMT_ONE">No more than one word</option>
          <option value="NMT_TWO">No more than two words</option>
          <option value="NMT_THREE">No more than three words</option>
          <option value="NMT_TWO_NUM">No more than two words and/or a number</option>
          <option value="NMT_THREE_NUM">No more than three words and/or a number</option>
          <option value="NUMBER_ONLY">A number</option>
          <option value="FROM_BOX">Choose from the box</option>
        </select>
      </div>

      {/* Sentences Section */}
      <div className="p-5 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-50 border-2 border-teal-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-teal-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-teal-900 font-bold">
              Sentences (Jumlalar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-teal-600 text-white rounded-full font-bold shadow-sm">
            {sentences.length} ta
          </span>
        </div>

        <p className="text-xs text-teal-700 mb-4 p-3 bg-white/60 rounded-lg border border-teal-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Har bir jumla uchun bo'sh joy qoldiring (masalan, "__________" yoki "______")
        </p>

        {/* Quick Add Sentences */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => addMultipleSentences(3)}
            className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg transition-colors border border-teal-300"
          >
            + 3 ta jumla
          </button>
          <button
            type="button"
            onClick={() => addMultipleSentences(5)}
            className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg transition-colors border border-teal-300"
          >
            + 5 ta jumla
          </button>
          <button
            type="button"
            onClick={() => addMultipleSentences(7)}
            className="px-3 py-1.5 text-xs bg-teal-100 text-teal-700 hover:bg-teal-200 rounded-lg transition-colors border border-teal-300"
          >
            + 7 ta jumla
          </button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {sentences.map((sentence, idx) => (
            <div key={idx} className="p-4 bg-white border-2 border-teal-300 rounded-xl shadow-sm hover:border-teal-400 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center min-w-[60px] h-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                </div>
                <textarea
                  value={sentence?.text || ''}
                  onChange={(e) => updateSentenceText(idx, e.target.value)}
                  placeholder={`Masalan: "Early methods of measuring time depended largely on natural phenomena such as the sun and __________." (bo'sh joyni qoldiring!)`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 border-2 border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm resize-none"
                />
                {sentences.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSentence(idx)}
                    className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all border border-transparent hover:border-red-300 flex-shrink-0"
                    title="Jumlani o'chirish"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Correct Answer Input */}
              <div className="ml-[72px] mt-2">
                <input
                  type="text"
                  value={sentence?.correctAnswer || ''}
                  onChange={(e) => updateCorrectAnswer(idx, e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2.5 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm font-semibold text-teal-900"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSentence}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-teal-700 font-semibold hover:bg-teal-50 rounded-xl transition-all w-full border-2 border-dashed border-teal-400 hover:border-teal-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi jumla qo'shish</span>
          </button>
        </div>
      </div>

      {/* Answer Summary Table */}
      {sentences.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-base text-slate-900 font-bold">
              ✅ Correct Answers Summary (Admin/Teacher use)
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
            {sentences.map((sentence, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-sm font-bold text-slate-700 min-w-[30px]">{idx + 1}</span>
                <span className="text-xs text-slate-600 flex-1 truncate">{sentence?.text || '(Empty sentence)'}</span>
                <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                  sentence?.correctAnswer 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                    : 'bg-orange-100 text-orange-700 border border-orange-300'
                }`}>
                  {sentence?.correctAnswer || 'Not set'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Info Box with Examples */}
      <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-300 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-violet-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <p className="text-sm font-bold text-violet-900">
              💡 Sentence Completion qanday ishlaydi:
            </p>
            <div className="space-y-2 text-xs text-violet-800">
              <p>• Har bir jumlada <strong>bo'sh joy</strong> qoldiring (__________ yoki ______)</p>
              <p>• Har bir jumla uchun to'g'ri javobni yozing</p>
              <p>• Talaba o'zi javob yozadi (ochiq javobli savol)</p>
            </div>

            {/* Example Preview */}
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-violet-200">
              <p className="text-xs font-semibold text-violet-900 mb-2">📝 Misol:</p>
              <div className="space-y-2 text-xs text-violet-800">
                <div>
                  <p className="font-semibold mb-1">Sentence 1:</p>
                  <p className="ml-2 italic">"Early methods of measuring time depended largely on natural phenomena such as the sun and __________."</p>
                  <p className="ml-2 text-emerald-700 font-semibold">→ Correct answer: <strong>stars</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}