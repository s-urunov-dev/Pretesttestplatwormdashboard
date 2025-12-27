import React, { useState, useEffect } from 'react';
import { Plus, X, Info, CheckCircle2, AlertCircle, FileText, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface TrueFalseNotGivenInputsProps {
  value?: {
    title?: string;
    question?: string[]; // Backend format: array of strings
    questions?: Array<{  // Component format: array of objects
      text: string;
      correctAnswer: 'TRUE' | 'FALSE' | 'NOT GIVEN';
    }>;
  };
  onChange: (data: {
    title: string;
    questions: Array<{
      text: string;
      correctAnswer: 'TRUE' | 'FALSE' | 'NOT GIVEN';
    }>;
  }) => void;
}

export function TrueFalseNotGivenInputs({ value, onChange }: TrueFalseNotGivenInputsProps) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Array<{
    text: string;
    correctAnswer: 'TRUE' | 'FALSE' | 'NOT GIVEN';
  }>>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      setTitle(value?.title || '');
      
      // Handle both formats: questions (component) and question (backend)
      if (value?.questions && value.questions.length > 0) {
        // Component format
        setQuestions(value.questions);
      } else if (value?.question && value.question.length > 0) {
        // Backend format - convert string[] to object[]
        setQuestions(value.question.map(text => ({
          text,
          correctAnswer: 'TRUE' as const
        })));
      } else {
        // Default
        setQuestions([{ text: '', correctAnswer: 'TRUE' }]);
      }
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      console.log('✅ TRUE/FALSE/NOT GIVEN Debug:', { title, questions });
      onChange({ title, questions });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, questions, initialized]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', correctAnswer: 'TRUE' }]);
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const updateCorrectAnswer = (index: number, answer: 'TRUE' | 'FALSE' | 'NOT GIVEN') => {
    const newQuestions = [...questions];
    newQuestions[index].correctAnswer = answer;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, idx) => idx !== index));
    }
  };

  const addMultipleQuestions = (count: number) => {
    const newQuestions = [...questions];
    for (let i = 0; i < count; i++) {
      newQuestions.push({ text: '', correctAnswer: 'TRUE' });
    }
    setQuestions(newQuestions);
  };

  const getAnswerIcon = (answer: 'TRUE' | 'FALSE' | 'NOT GIVEN') => {
    switch (answer) {
      case 'TRUE':
        return <CheckCircle className="w-4 h-4" />;
      case 'FALSE':
        return <XCircle className="w-4 h-4" />;
      case 'NOT GIVEN':
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getAnswerColor = (answer: 'TRUE' | 'FALSE' | 'NOT GIVEN') => {
    switch (answer) {
      case 'TRUE':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'FALSE':
        return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
      case 'NOT GIVEN':
        return 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200';
    }
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  const isValidConfiguration = questions.length > 0 && questions.every(q => q.text.trim() !== '');

  // Count answers
  const trueCount = questions.filter(q => q.correctAnswer === 'TRUE').length;
  const falseCount = questions.filter(q => q.correctAnswer === 'FALSE').length;
  const notGivenCount = questions.filter(q => q.correctAnswer === 'NOT GIVEN').length;

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
              <strong>Do the following statements agree with the information given in the reading passage?</strong>
            </p>
            <p className={`text-sm mb-2 ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              Write:
            </p>
            <div className={`ml-4 space-y-1 text-sm ${
              isValidConfiguration ? 'text-green-800' : 'text-orange-800'
            }`}>
              <p><strong>TRUE</strong> — if the statement agrees with the information</p>
              <p><strong>FALSE</strong> — if the statement contradicts the information</p>
              <p><strong>NOT GIVEN</strong> — if there is no information on this</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-slate-700">{questions.length}</div>
          <div className="text-xs text-slate-600 mt-1">Jami Savollar</div>
        </div>
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-green-700">{trueCount}</div>
          <div className="text-xs text-green-600 mt-1">TRUE</div>
        </div>
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-red-700">{falseCount}</div>
          <div className="text-xs text-red-600 mt-1">FALSE</div>
        </div>
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl text-center">
          <div className="text-2xl font-bold text-orange-700">{notGivenCount}</div>
          <div className="text-xs text-orange-600 mt-1">NOT GIVEN</div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => addMultipleQuestions(3)}
          className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors border border-indigo-300"
        >
          + 3 ta savol qo'shish
        </button>
        <button
          type="button"
          onClick={() => addMultipleQuestions(5)}
          className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors border border-indigo-300"
        >
          + 5 ta savol qo'shish
        </button>
        <button
          type="button"
          onClick={() => addMultipleQuestions(7)}
          className="px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg transition-colors border border-indigo-300"
        >
          + 7 ta savol qo'shish
        </button>
      </div>

      {/* Title Input */}
      <div className="p-5 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 border-2 border-slate-300 rounded-xl shadow-sm">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          📝 Savol Sarlavhasi (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: Do the following statements agree with the information given in the reading passage?"
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
        />
        <p className="text-xs text-slate-500 mt-2">
          <Info className="w-3 h-3 inline mr-1" />
          Bu sarlavha talabaga ko'rsatiladi (ixtiyoriy)
        </p>
      </div>

      {/* Statements Section */}
      <div className="p-5 bg-gradient-to-br from-indigo-50 via-blue-50 to-indigo-50 border-2 border-indigo-300 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-indigo-300">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-base text-indigo-900 font-bold">
              Statements (Bayonotlar)
            </h3>
          </div>
          <span className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-full font-bold shadow-sm">
            {questions.length} ta
          </span>
        </div>

        <p className="text-xs text-indigo-700 mb-4 p-3 bg-white/60 rounded-lg border border-indigo-200">
          <Info className="w-3.5 h-3.5 inline mr-1" />
          Har bir bayonot uchun to'g'ri javobni belgilang: TRUE, FALSE yoki NOT GIVEN
        </p>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {questions.map((question, idx) => (
            <div key={idx} className="p-4 bg-white border-2 border-indigo-300 rounded-xl shadow-sm hover:border-indigo-400 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex items-center justify-center min-w-[60px] h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-sm flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                </div>
                <textarea
                  value={question.text}
                  onChange={(e) => updateQuestionText(idx, e.target.value)}
                  placeholder={`Masalan: "The first mechanical clocks were invented to improve accuracy in sea navigation." yoki "Railway companies were one of the main reasons for the introduction of standardised time."`}
                  rows={2}
                  className="flex-1 px-3 py-2.5 border-2 border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm resize-none"
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

              {/* Correct Answer Selector */}
              <div className="flex items-center gap-2 ml-[72px]">
                <label className="text-xs font-semibold text-indigo-900 min-w-[100px]">
                  ✅ To'g'ri javob:
                </label>
                <div className="flex gap-2 flex-1">
                  <button
                    type="button"
                    onClick={() => updateCorrectAnswer(idx, 'TRUE')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all border-2 ${
                      question.correctAnswer === 'TRUE'
                        ? 'bg-green-600 text-white border-green-600 shadow-md'
                        : 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    TRUE
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCorrectAnswer(idx, 'FALSE')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all border-2 ${
                      question.correctAnswer === 'FALSE'
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    FALSE
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCorrectAnswer(idx, 'NOT GIVEN')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all border-2 ${
                      question.correctAnswer === 'NOT GIVEN'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                        : 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    NOT GIVEN
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-indigo-700 font-semibold hover:bg-indigo-50 rounded-xl transition-all w-full border-2 border-dashed border-indigo-400 hover:border-indigo-500 hover:shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Yangi statement qo'shish</span>
          </button>
        </div>
      </div>

      {/* Answer Summary Table */}
      {questions.length > 0 && (
        <div className="p-5 bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-slate-300 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-slate-600" />
            <h3 className="text-base text-slate-900 font-bold">
              ✅ Correct Answers Summary (Admin/Teacher use)
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
            {questions.map((question, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-sm font-bold text-slate-700 min-w-[30px]">{idx + 1}</span>
                <span className="text-xs text-slate-600 flex-1 truncate">{question.text || '(Empty statement)'}</span>
                <span className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md ${
                  question.correctAnswer === 'TRUE' ? 'bg-green-100 text-green-700' :
                  question.correctAnswer === 'FALSE' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {getAnswerIcon(question.correctAnswer)}
                  {question.correctAnswer}
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
              💡 TRUE / FALSE / NOT GIVEN qanday ishlaydi:
            </p>
            <div className="space-y-2 text-xs text-violet-800">
              <div className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>TRUE</strong> - Statement passage'dagi ma'lumot bilan mos keladi</span>
              </div>
              <div className="flex gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span><strong>FALSE</strong> - Statement passage'dagi ma'lumotga zid</span>
              </div>
              <div className="flex gap-2">
                <HelpCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span><strong>NOT GIVEN</strong> - Passage'da bu haqida ma'lumot yo'q</span>
              </div>
            </div>

            {/* Example Preview */}
            <div className="mt-3 p-3 bg-white/80 rounded-lg border border-violet-200">
              <p className="text-xs font-semibold text-violet-900 mb-2">📝 Misol:</p>
              <div className="space-y-2 text-xs text-violet-800">
                <div>
                  <p className="font-semibold mb-1">Statements:</p>
                  <p className="ml-2">1. The first mechanical clocks were invented to improve accuracy in sea navigation.</p>
                  <p className="ml-2 text-orange-700 font-semibold">→ NOT GIVEN</p>
                </div>
                <div>
                  <p className="ml-2">2. Railway companies were one of the main reasons for the introduction of standardised time.</p>
                  <p className="ml-2 text-green-700 font-semibold">→ TRUE</p>
                </div>
                <div>
                  <p className="ml-2">3. All countries immediately accepted Greenwich as the global time standard.</p>
                  <p className="ml-2 text-red-700 font-semibold">→ FALSE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}