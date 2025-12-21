import React, { useState } from 'react';
import { Plus, Trash2, Type, Edit3 } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api';

// Cell types
export type CellType = 'text' | 'answer';

export interface TableCell {
  type: CellType;
  content: string; // For text cells, stores the text. For answer cells, empty
  isAnswer: boolean; // Convenience flag
}

export interface TableCompletionData {
  principle: CriteriaType;
  instruction?: string; // Custom instruction text
  rows: TableCell[][]; // Each row can have different number of cells
  questionNumberStart?: number; // Starting question number for auto-numbering
}

interface TableCompletionEditorProps {
  data: TableCompletionData;
  onChange: (data: TableCompletionData) => void;
  mode?: 'edit' | 'preview';
}

export function TableCompletionEditor({ data, onChange, mode = 'edit' }: TableCompletionEditorProps) {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  // Initialize with default if empty
  React.useEffect(() => {
    if (!data.rows || data.rows.length === 0) {
      onChange({
        principle: data.principle || 'NMT_TWO',
        instruction: data.instruction,
        rows: [
          [
            { type: 'text', content: '', isAnswer: false },
            { type: 'text', content: '', isAnswer: false },
          ],
        ],
        questionNumberStart: data.questionNumberStart || 1,
      });
    }
  }, []);

  const addRow = () => {
    // Default to 2 columns for new row
    const newRow: TableCell[] = [
      { type: 'text', content: '', isAnswer: false },
      { type: 'text', content: '', isAnswer: false },
    ];
    onChange({
      ...data,
      rows: [...data.rows, newRow],
    });
  };

  const removeRow = (rowIndex: number) => {
    if (data.rows.length <= 1) {
      alert('Kamida bitta qator bo\'lishi kerak');
      return;
    }
    onChange({
      ...data,
      rows: data.rows.filter((_, i) => i !== rowIndex),
    });
  };

  const addColumnToRow = (rowIndex: number) => {
    const newRows = [...data.rows];
    newRows[rowIndex] = [
      ...newRows[rowIndex],
      { type: 'text', content: '', isAnswer: false },
    ];
    onChange({ ...data, rows: newRows });
  };

  const removeColumnFromRow = (rowIndex: number, colIndex: number) => {
    if (data.rows[rowIndex].length <= 1) {
      alert('Har bir qatorda kamida bitta ustun bo\'lishi kerak');
      return;
    }
    const newRows = [...data.rows];
    newRows[rowIndex] = newRows[rowIndex].filter((_, i) => i !== colIndex);
    onChange({ ...data, rows: newRows });
  };

  const updateCell = (rowIndex: number, colIndex: number, updates: Partial<TableCell>) => {
    const newRows = data.rows.map((row, ri) =>
      row.map((cell, ci) => {
        if (ri === rowIndex && ci === colIndex) {
          const updated = { ...cell, ...updates };
          // Sync isAnswer flag with type
          if (updates.type) {
            updated.isAnswer = updates.type === 'answer';
            if (updates.type === 'answer') {
              updated.content = ''; // Clear content for answer cells
            }
          }
          return updated;
        }
        return cell;
      })
    );
    onChange({ ...data, rows: newRows });
  };

  const toggleCellType = (rowIndex: number, colIndex: number) => {
    const currentCell = data.rows[rowIndex][colIndex];
    const newType = currentCell.type === 'text' ? 'answer' : 'text';
    updateCell(rowIndex, colIndex, { type: newType });
  };

  const getAnswerCount = () => {
    return data.rows.flat().filter(cell => cell.isAnswer).length;
  };

  const getInstructionText = () => {
    if (data.instruction) return data.instruction;
    
    const criteriaLabels: Record<CriteriaType, string> = {
      'ONE_WORD': 'Write ONE WORD ONLY for each answer.',
      'ONE_WORD_OR_NUMBER': 'Write ONE WORD AND/OR A NUMBER for each answer.',
      'NMT_ONE': 'Write NO MORE THAN ONE WORD for each answer.',
      'NMT_TWO': 'Write NO MORE THAN TWO WORDS for each answer.',
      'NMT_THREE': 'Write NO MORE THAN THREE WORDS for each answer.',
      'NMT_TWO_NUM': 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
      'NMT_THREE_NUM': 'Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
      'NUMBER_ONLY': 'Write A NUMBER ONLY for each answer.',
      'FROM_BOX': 'Choose your answers from the box.',
    };
    return criteriaLabels[data.principle] || '';
  };

  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        {/* Instructions */}
        <div className="p-4 bg-slate-50 border border-slate-300 rounded">
          <p className="text-sm text-slate-900">
            <strong>Complete the table below.</strong>
          </p>
          <p className="text-sm text-slate-700 mt-1">{getInstructionText()}</p>
        </div>

        {/* Question Number Range */}
        {data.questionNumberStart && getAnswerCount() > 0 && (
          <div className="text-sm text-slate-900">
            <strong>Questions {data.questionNumberStart}–{data.questionNumberStart + getAnswerCount() - 1}</strong>
          </div>
        )}

        {/* Table - Each row as separate table for independent column counts */}
        <div className="border-2 border-black">
          {data.rows && data.rows.length > 0 ? (
            data.rows.map((row, rowIndex) => (
              <div key={rowIndex} className={rowIndex > 0 ? 'border-t-2 border-black' : ''}>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      {row && row.length > 0 ? (
                        row.map((cell, colIndex) => (
                          <td
                            key={colIndex}
                            className={`border-black p-3 ${
                              colIndex > 0 ? 'border-l' : ''
                            } ${
                              cell.isAnswer ? 'bg-white' : 'bg-slate-50'
                            }`}
                            style={{ width: `${100 / row.length}%` }}
                          >
                            {cell.isAnswer ? (
                              <div className="min-h-[40px] flex items-center justify-center">
                                <div className="w-full h-10 border-2 border-slate-400 bg-white" />
                              </div>
                            ) : (
                              <div className="text-sm text-slate-900 min-h-[40px] flex items-center">
                                {cell.content || '\u00A0'}
                              </div>
                            )}
                          </td>
                        ))
                      ) : (
                        <td className="border-black p-3 bg-red-50 text-red-600">
                          Bo'sh qator
                        </td>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <div className="p-3 bg-red-50 text-red-600">
              Ma'lumot yo'q
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-4">
        {/* Principle Selection */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Answer Principle <span className="text-red-500">*</span>
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
            Custom Instruction (ixtiyoriy)
          </label>
          <input
            type="text"
            value={data.instruction || ''}
            onChange={(e) => onChange({ ...data, instruction: e.target.value })}
            placeholder="Odatiy ko'rsatma avtomatik yaratiladi"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
          />
        </div>

        {/* Question Number Start */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Boshlang'ich savol raqami
          </label>
          <input
            type="number"
            value={data.questionNumberStart || 1}
            onChange={(e) => onChange({ ...data, questionNumberStart: parseInt(e.target.value) || 1 })}
            min="1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
          />
        </div>

        {/* Stats */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            📊 Jami: <strong>{data.rows.length}</strong> qator, 
            <strong> {getAnswerCount()}</strong> javob katakchasi
          </p>
          <p className="text-xs text-blue-700 mt-1">
            💡 Har bir qatorda turli xil miqdorda ustunlar bo'lishi mumkin
          </p>
        </div>
      </div>

      {/* Table Editor */}
      <div className="border border-slate-300 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-slate-900">Jadval Tuzilishi</h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-[#042d62] text-white rounded hover:bg-[#053a7a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Qator
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
          <p className="mb-1">💡 <strong>Qo'llanma:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Har bir qatorga alohida ustun qo'shing yoki o'chiring</li>
            <li>Katakchani bosing va matn kiriting yoki javob maydoniga aylantiring</li>
            <li>Javob maydonlari avtomatik raqamlanadi</li>
          </ul>
        </div>

        <div className="space-y-4">
          {data.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="border-2 border-slate-300 rounded-lg p-3 bg-slate-50">
              {/* Row Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm px-2 py-1 bg-[#042d62] text-white rounded">
                    Qator {rowIndex + 1}
                  </span>
                  <span className="text-xs text-slate-600">
                    ({row.length} ustun)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addColumnToRow(rowIndex)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Ustun
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRow(rowIndex)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Qatorni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row Cells */}
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }}>
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={`border-2 p-3 rounded-lg cursor-pointer transition-all ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'border-[#042d62] bg-blue-50'
                        : 'border-slate-300'
                    } ${
                      cell.isAnswer
                        ? 'bg-yellow-50'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedCell({ row: rowIndex, col: colIndex })}
                  >
                    <div className="space-y-2">
                      {/* Cell Header */}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          cell.isAnswer
                            ? 'bg-orange-200 text-orange-900'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {cell.isAnswer ? 'Javob' : 'Matn'}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCellType(rowIndex, colIndex);
                            }}
                            className="p-1 hover:bg-slate-200 rounded transition-colors"
                            title="Turini o'zgartirish"
                          >
                            {cell.isAnswer ? (
                              <Edit3 className="w-3 h-3 text-orange-700" />
                            ) : (
                              <Type className="w-3 h-3 text-slate-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeColumnFromRow(rowIndex, colIndex);
                            }}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                            title="Ustunni o'chirish"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Cell Content */}
                      {cell.isAnswer ? (
                        <div className="flex items-center justify-center py-2">
                          <div className="w-full h-8 border-2 border-dashed border-orange-400 bg-white rounded flex items-center justify-center text-xs text-orange-600">
                            Answer
                          </div>
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={cell.content}
                          onChange={(e) => updateCell(rowIndex, colIndex, { content: e.target.value })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Matn kiriting..."
                          className="w-full px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border-t border-slate-300 pt-6">
        <h4 className="text-slate-900 mb-4">Ko'rinishi (Student View)</h4>
        <TableCompletionEditor data={data} onChange={onChange} mode="preview" />
      </div>
    </div>
  );
}