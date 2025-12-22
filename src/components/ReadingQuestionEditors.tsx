import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface MultipleChoiceEditorProps {
  data?: {
    questions: Array<{
      question: string;
      options: Array<{ key: string; text: string }>;
      correctAnswer: string;
    }>;
  };
  onChange: (data: any) => void;
}

export function MultipleChoiceEditor({ data, onChange }: MultipleChoiceEditorProps) {
  const [questions, setQuestions] = useState(data?.questions || [
    { question: '', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }], correctAnswer: '' }
  ]);

  const addQuestion = () => {
    const updated = [...questions, { question: '', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }, { key: 'C', text: '' }, { key: 'D', text: '' }], correctAnswer: '' }];
    setQuestions(updated);
    onChange({ questions: updated });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
    onChange({ questions: updated });
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex].text = text;
    setQuestions(updated);
    onChange({ questions: updated });
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
      onChange({ questions: updated });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Multiple Choice Questions</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Savol Qo'shish
        </button>
      </div>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#042d62] text-white text-sm font-bold mt-2">
              {qIndex + 1}
            </div>
            <div className="flex-1 space-y-4">
              <textarea
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                placeholder="Savol matnini kiriting..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
              />
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Javob Variantlari</p>
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      {option.key}
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                      placeholder={`Variant ${option.key}`}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To'g'ri Javob
                </label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
                >
                  <option value="">Tanlang...</option>
                  {q.options.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.key}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeQuestion(qIndex)}
              disabled={questions.length === 1}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TrueFalseEditorProps {
  questionType: 'true_false_not_given' | 'yes_no_not_given';
  data?: {
    statements: Array<{ text: string; answer: string }>;
  };
  onChange: (data: any) => void;
}

export function TrueFalseEditor({ questionType, data, onChange }: TrueFalseEditorProps) {
  const options = questionType === 'true_false_not_given' 
    ? ['TRUE', 'FALSE', 'NOT GIVEN']
    : ['YES', 'NO', 'NOT GIVEN'];

  const [statements, setStatements] = useState(data?.statements || [{ text: '', answer: '' }]);

  const addStatement = () => {
    const updated = [...statements, { text: '', answer: '' }];
    setStatements(updated);
    onChange({ statements: updated });
  };

  const updateStatement = (index: number, field: string, value: string) => {
    const updated = [...statements];
    updated[index] = { ...updated[index], [field]: value };
    setStatements(updated);
    onChange({ statements: updated });
  };

  const removeStatement = (index: number) => {
    if (statements.length > 1) {
      const updated = statements.filter((_, i) => i !== index);
      setStatements(updated);
      onChange({ statements: updated });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">
          {questionType === 'true_false_not_given' ? 'True / False / Not Given' : 'Yes / No / Not Given'}
        </h3>
        <button
          type="button"
          onClick={addStatement}
          className="flex items-center gap-2 px-4 py-2 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Statement Qo'shish
        </button>
      </div>

      {statements.map((stmt, index) => (
        <div key={index} className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#042d62] text-white text-sm font-bold mt-2">
              {index + 1}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={stmt.text}
                onChange={(e) => updateStatement(index, 'text', e.target.value)}
                placeholder="Statement matnini kiriting..."
                rows={2}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  To'g'ri Javob
                </label>
                <div className="flex gap-2">
                  {options.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateStatement(index, 'answer', opt)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        stmt.answer === opt
                          ? 'bg-[#042d62] text-white'
                          : 'bg-white border border-slate-300 text-slate-700 hover:border-[#042d62]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeStatement(index)}
              disabled={statements.length === 1}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface CompletionEditorProps {
  questionType: string;
  data?: {
    title?: string;
    body: string;
    principle: string;
  };
  onChange: (data: any) => void;
}

export function CompletionEditor({ questionType, data, onChange }: CompletionEditorProps) {
  const [title, setTitle] = useState(data?.title || '');
  const [body, setBody] = useState(data?.body || '');
  const [principle, setPrinciple] = useState(data?.principle || 'NMT_TWO');

  const handleChange = (field: string, value: string) => {
    const updated = { title, body, principle, [field]: value };
    if (field === 'title') setTitle(value);
    if (field === 'body') setBody(value);
    if (field === 'principle') setPrinciple(value);
    onChange(updated);
  };

  const principles = [
    { value: 'ONE_WORD', label: 'One word only' },
    { value: 'ONE_WORD_OR_NUMBER', label: 'One word and/or a number' },
    { value: 'NMT_ONE', label: 'No more than one word' },
    { value: 'NMT_TWO', label: 'No more than two words' },
    { value: 'NMT_THREE', label: 'No more than three words' },
    { value: 'NMT_TWO_NUM', label: 'No more than two words and/or a number' },
    { value: 'NMT_THREE_NUM', label: 'No more than three words and/or a number' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">
        {questionType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
      </h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Sarlavha <span className="text-slate-400">(ixtiyoriy)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Masalan: Complete the sentences below"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Javob Kriteriyasi <span className="text-red-500">*</span>
        </label>
        <select
          value={principle}
          onChange={(e) => handleChange('principle', e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
        >
          {principles.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Matn (bo'sh joylarni raqamlar bilan belgilang) <span className="text-red-500">*</span>
        </label>
        <textarea
          value={body}
          onChange={(e) => handleChange('body', e.target.value)}
          placeholder="Masalan: The company was founded in (1) and now has offices in (2)."
          rows={10}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none font-mono text-sm"
        />
        <p className="text-sm text-slate-500 mt-2">
          Bo'sh joylarni (1), (2), (3) kabi raqamlar bilan belgilang
        </p>
      </div>
    </div>
  );
}

interface DiagramLabelingEditorProps {
  data?: {
    title?: string;
    image: File | string | null;
  };
  onChange: (data: any) => void;
}

export function DiagramLabelingEditor({ data, onChange }: DiagramLabelingEditorProps) {
  const [title, setTitle] = useState(data?.title || '');
  const [image, setImage] = useState<File | string | null>(data?.image || null);
  const [preview, setPreview] = useState<string | null>(
    typeof data?.image === 'string' ? data.image : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onChange({ title, image: file });
    }
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onChange({ title: value, image });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Diagram Labeling</h3>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Sarlavha <span className="text-slate-400">(ixtiyoriy)</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Masalan: Label the diagram below"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Diagram/Map Rasmi <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
        />
        {preview && (
          <div className="mt-3 rounded-lg overflow-hidden border-2 border-slate-200">
            <img src={preview} alt="Diagram preview" className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
}

interface ShortAnswerEditorProps {
  data?: {
    questions: Array<{ question: string }>;
  };
  onChange: (data: any) => void;
}

export function ShortAnswerEditor({ data, onChange }: ShortAnswerEditorProps) {
  const [questions, setQuestions] = useState(data?.questions || [{ question: '' }]);

  const addQuestion = () => {
    const updated = [...questions, { question: '' }];
    setQuestions(updated);
    onChange({ questions: updated });
  };

  const updateQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
    onChange({ questions: updated });
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updated = questions.filter((_, i) => i !== index);
      setQuestions(updated);
      onChange({ questions: updated });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Short Answer Questions</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Savol Qo'shish
        </button>
      </div>

      {questions.map((q, index) => (
        <div key={index} className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#042d62] text-white text-sm font-bold mt-2">
              {index + 1}
            </div>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(index, e.target.value)}
              placeholder="Savol matnini kiriting..."
              rows={2}
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none"
            />
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              disabled={questions.length === 1}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
