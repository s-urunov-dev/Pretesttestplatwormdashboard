import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon, Table as TableIcon, FileText } from 'lucide-react';
import { Question } from './QuestionPanel';
import { ImageUploader } from './ImageUploader';

interface EnhancedQuestionFormProps {
  selectedType: 'reading' | 'listening' | 'writing' | 'speaking';
  onSubmit: (question: Omit<Question, 'id' | 'createdAt'>) => void;
  onBack: () => void;
}

export function EnhancedQuestionForm({ selectedType, onSubmit, onBack }: EnhancedQuestionFormProps) {
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    content: '',
    questionType: '',
    questionRange: '',
    passage: '',
    instructions: '',
    answerFormat: '',
    imageUrl: '',
    points: 1,
    timeLimit: 60,
  });

  const [subQuestions, setSubQuestions] = useState<{ number: string; text: string; answer: string }[]>([
    { number: '1', text: '', answer: '' },
  ]);

  const [tableData, setTableData] = useState<{ headers: string[]; rows: string[][] }>({
    headers: [''],
    rows: [['']],
  });

  const [showPassage, setShowPassage] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [showSubQuestions, setShowSubQuestions] = useState(true);

  const questionTypes = {
    reading: [
      { value: 'multiple-choice', label: 'Multiple Choice' },
      { value: 'true-false-not-given', label: 'True/False/Not Given' },
      { value: 'matching-headings', label: 'Matching Headings' },
      { value: 'sentence-completion', label: 'Sentence Completion' },
      { value: 'form-completion', label: 'Form Completion' },
      { value: 'table-completion', label: 'Table Completion' },
      { value: 'note-completion', label: 'Note Completion' },
    ],
    listening: [
      { value: 'form-completion', label: 'Form Completion' },
      { value: 'note-completion', label: 'Note Completion' },
      { value: 'table-completion', label: 'Table Completion' },
      { value: 'map-labeling', label: 'Map Labeling' },
      { value: 'multiple-choice', label: 'Multiple Choice' },
      { value: 'matching', label: 'Matching' },
    ],
    writing: [
      { value: 'task-1-academic', label: 'Task 1 (Academic)' },
      { value: 'task-1-general', label: 'Task 1 (General)' },
      { value: 'task-2', label: 'Task 2 (Essay)' },
    ],
    speaking: [
      { value: 'part-1', label: 'Part 1 (Introduction)' },
      { value: 'part-2', label: 'Part 2 (Individual Long Turn)' },
      { value: 'part-3', label: 'Part 3 (Two-way Discussion)' },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const question: Omit<Question, 'id' | 'createdAt'> = {
      type: selectedType,
      category: formData.category,
      title: formData.title,
      content: formData.content,
      questionType: formData.questionType,
      points: formData.points,
      timeLimit: formData.timeLimit,
    };

    if (formData.questionRange) question.questionRange = formData.questionRange;
    if (formData.passage && showPassage) question.passage = formData.passage;
    if (formData.instructions) question.instructions = formData.instructions;
    if (formData.answerFormat) question.answerFormat = formData.answerFormat;
    if (formData.imageUrl && showImage) question.imageUrl = formData.imageUrl;
    if (showTable && tableData.headers[0]) question.tableData = tableData;
    if (showSubQuestions && subQuestions.length > 0) {
      question.subQuestions = subQuestions
        .filter(sq => sq.text || sq.answer)
        .map(sq => ({
          number: sq.number,
          text: sq.text,
          answer: sq.answer,
        }));
    }

    onSubmit(question);
  };

  const addSubQuestion = () => {
    const lastNumber = subQuestions.length > 0 ? parseInt(subQuestions[subQuestions.length - 1].number) : 0;
    setSubQuestions([...subQuestions, { number: (lastNumber + 1).toString(), text: '', answer: '' }]);
  };

  const removeSubQuestion = (index: number) => {
    setSubQuestions(subQuestions.filter((_, i) => i !== index));
  };

  const updateSubQuestion = (index: number, field: 'number' | 'text' | 'answer', value: string) => {
    const updated = [...subQuestions];
    updated[index][field] = value;
    setSubQuestions(updated);
  };

  const addTableRow = () => {
    setTableData({
      ...tableData,
      rows: [...tableData.rows, Array(tableData.headers.length).fill('')],
    });
  };

  const addTableColumn = () => {
    setTableData({
      headers: [...tableData.headers, ''],
      rows: tableData.rows.map(row => [...row, '']),
    });
  };

  const updateTableHeader = (index: number, value: string) => {
    const headers = [...tableData.headers];
    headers[index] = value;
    setTableData({ ...tableData, headers });
  };

  const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
    const rows = [...tableData.rows];
    rows[rowIndex][colIndex] = value;
    setTableData({ ...tableData, rows });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 mb-2">
            Savol Turi <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.questionType}
            onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Tanlang...</option>
            {questionTypes[selectedType].map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-700 mb-2">
            Savol Raqamlari
          </label>
          <input
            type="text"
            value={formData.questionRange}
            onChange={(e) => setFormData({ ...formData, questionRange: e.target.value })}
            placeholder="Masalan: 1-7, 11-14"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-700 mb-2">
          Kategoriya <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="Masalan: Form Completion, Map Labeling"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-slate-700 mb-2">
          Sarlavha <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Savol sarlavhasi"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-slate-700 mb-2">
          Ko&apos;rsatmalar
        </label>
        <textarea
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Masalan: Complete the form. Write ONE WORD AND/OR A NUMBER for each answer."
          rows={2}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Answer Format */}
      <div>
        <label className="block text-slate-700 mb-2">
          Javob Formati
        </label>
        <input
          type="text"
          value={formData.answerFormat}
          onChange={(e) => setFormData({ ...formData, answerFormat: e.target.value })}
          placeholder="Masalan: ONE WORD ONLY, TWO LETTERS, A NUMBER"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Toggle Buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setShowPassage(!showPassage)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showPassage ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" />
          Passage/Kontekst
        </button>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showTable ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          Jadval
        </button>
        <button
          type="button"
          onClick={() => setShowImage(!showImage)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
            showImage ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Rasm/Xarita
        </button>
      </div>

      {/* Passage */}
      {showPassage && (
        <div>
          <label className="block text-slate-700 mb-2">
            Passage yoki Kontekst Matni
          </label>
          <textarea
            value={formData.passage}
            onChange={(e) => setFormData({ ...formData, passage: e.target.value })}
            placeholder="To'liq matnni kiriting..."
            rows={8}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
          />
        </div>
      )}

      {/* Image URL */}
      {showImage && (
        <div>
          <label className="block text-slate-700 mb-2">
            Rasm URL (xarita, diagram uchun)
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://example.com/map.png"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Table */}
      {showTable && (
        <div className="border border-slate-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-slate-700">Jadval</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addTableColumn}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                + Ustun
              </button>
              <button
                type="button"
                onClick={addTableRow}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
              >
                + Qator
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {tableData.headers.map((header, i) => (
                    <th key={i} className="border border-slate-300 p-2">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateTableHeader(i, e.target.value)}
                        placeholder={`Ustun ${i + 1}`}
                        className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border border-slate-300 p-2">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                          placeholder={`(${rowIndex + 1})`}
                          className="w-full px-2 py-1 text-sm border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Questions */}
      {showSubQuestions && (
        <div className="border border-slate-300 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-slate-700">Savollar va Javoblar</label>
            <button
              type="button"
              onClick={addSubQuestion}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
            >
              <Plus className="w-4 h-4" />
              Savol Qo&apos;shish
            </button>
          </div>
          <div className="space-y-3">
            {subQuestions.map((sq, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input
                  type="text"
                  value={sq.number}
                  onChange={(e) => updateSubQuestion(index, 'number', e.target.value)}
                  placeholder="#"
                  className="w-16 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={sq.text}
                  onChange={(e) => updateSubQuestion(index, 'text', e.target.value)}
                  placeholder="Savol matni (ixtiyoriy)"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={sq.answer}
                  onChange={(e) => updateSubQuestion(index, 'answer', e.target.value)}
                  placeholder="To'g'ri javob"
                  className="w-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {subQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubQuestion(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Content (optional) */}
      <div>
        <label className="block text-slate-700 mb-2">
          Qo&apos;shimcha Matn
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Qo'shimcha izoh yoki kontekst..."
          rows={3}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      {/* Points and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 mb-2">Ball</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            min="1"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-slate-700 mb-2">Vaqt (soniya)</label>
          <input
            type="number"
            value={formData.timeLimit}
            onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
            min="30"
            step="30"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Orqaga
        </button>
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Savolni Qo&apos;shish
        </button>
      </div>
    </form>
  );
}