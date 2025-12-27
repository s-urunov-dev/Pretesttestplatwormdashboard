import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Info } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api-cleaned';

/**
 * Index-based Table Completion Editor for IELTS Reading
 * 
 * Supports dynamic gap-filling: cells can contain text with (1), (2), etc. placeholders
 * Example: "Based on the sun and (1) ________"
 */

export interface IndexedTableData {
  principle: CriteriaType;
  instruction?: string; // Custom instruction
  tableTitle?: string; // Table title
  rowCount: number;
  columnCount: number;
  cells: { [index: string]: string }; // Index-based cell values
  questionNumberStart?: number; // Starting question number
}

interface TableCompletionEditorIndexedProps {
  data: IndexedTableData;
  onChange: (data: IndexedTableData) => void;
  mode?: 'edit' | 'preview';
  initialData?: Partial<IndexedTableData>;
}

export function TableCompletionEditorIndexed({ 
  data, 
  onChange, 
  mode = 'edit',
  initialData 
}: TableCompletionEditorIndexedProps) {
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [cellInputValue, setCellInputValue] = useState<string>('');

  // Initialize with default if empty
  React.useEffect(() => {
    if (!data.rowCount || !data.columnCount) {
      onChange({
        principle: data.principle || initialData?.principle || 'ONE_WORD',
        instruction: data.instruction || initialData?.instruction,
        tableTitle: data.tableTitle || initialData?.tableTitle,
        rowCount: initialData?.rowCount || 5,
        columnCount: initialData?.columnCount || 2,
        cells: initialData?.cells || {},
        questionNumberStart: data.questionNumberStart || initialData?.questionNumberStart || 1,
      });
    }
  }, []);

  const totalCells = data.rowCount * data.columnCount;

  const updatePrinciple = (principle: CriteriaType) => {
    onChange({ ...data, principle });
  };

  const updateRowCount = (count: number) => {
    if (count < 1) return;
    onChange({ ...data, rowCount: count });
  };

  const updateColumnCount = (count: number) => {
    if (count < 1) return;
    onChange({ ...data, columnCount: count });
  };

  const updateCellValue = (index: number, value: string) => {
    const newCells = { ...data.cells };
    if (value.trim() === '') {
      delete newCells[index.toString()];
    } else {
      newCells[index.toString()] = value;
    }
    onChange({ ...data, cells: newCells });
  };

  const startEditingCell = (index: number) => {
    setEditingCell(index);
    setCellInputValue(data.cells[index.toString()] || '');
  };

  const saveEditingCell = () => {
    if (editingCell !== null) {
      updateCellValue(editingCell, cellInputValue);
      setEditingCell(null);
      setCellInputValue('');
    }
  };

  const cancelEditingCell = () => {
    setEditingCell(null);
    setCellInputValue('');
  };

  const getCellIndex = (row: number, col: number): number => {
    return row * data.columnCount + col;
  };

  const getRowCol = (index: number): { row: number; col: number } => {
    return {
      row: Math.floor(index / data.columnCount),
      col: index % data.columnCount,
    };
  };

  const getAnswerCount = () => {
    let count = 0;
    Object.values(data.cells).forEach(cellValue => {
      if (cellValue) {
        const matches = cellValue.match(/\(\d+\)/g);
        if (matches) {
          count += matches.length;
        }
      }
    });
    return count;
  };

  const getInstructionText = () => {
    if (data.instruction) return data.instruction;
    
    const criteriaLabels: Record<CriteriaType, string> = {
      'ONE_WORD': 'Choose ONE WORD ONLY from the passage.',
      'ONE_WORD_OR_NUMBER': 'Choose ONE WORD AND/OR A NUMBER from the passage.',
      'NMT_ONE': 'Choose NO MORE THAN ONE WORD from the passage.',
      'NMT_TWO': 'Choose NO MORE THAN TWO WORDS from the passage.',
      'NMT_THREE': 'Choose NO MORE THAN THREE WORDS from the passage.',
      'NMT_TWO_NUM': 'Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage.',
      'NMT_THREE_NUM': 'Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage.',
      'NUMBER_ONLY': 'Choose A NUMBER ONLY from the passage.',
      'FROM_BOX': 'Choose your answers from the box.',
    };
    return criteriaLabels[data.principle] || '';
  };

  // Parse text content and render with input fields for gaps
  const renderCellContent = (content: string) => {
    if (!content) return <span className="text-slate-400 text-xs">(Bo'sh)</span>;
    
    // Split by (1), (2), etc. pattern
    const parts = content.split(/(\(\d+\))/);
    
    return (
      <span className="text-sm">
        {parts.map((part, index) => {
          // Check if this part is a gap placeholder like (1), (2)
          const gapMatch = part.match(/\((\d+)\)/);
          if (gapMatch) {
            return (
              <span key={index} className="inline-flex items-center gap-1 mx-0.5">
                <span className="font-semibold text-slate-700 text-xs">{part}</span>
                <span className="inline-block w-20 h-0.5 bg-slate-800 align-middle"></span>
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </span>
    );
  };

  if (mode === 'preview') {
    return (
      <div className="space-y-4">
        {/* Question Number Range */}
        {data.questionNumberStart && getAnswerCount() > 0 && (
          <div className="text-sm text-slate-900 font-semibold">
            Questions {data.questionNumberStart} – {data.questionNumberStart + getAnswerCount() - 1}
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-1">
          <p className="text-sm text-slate-900">
            <strong>Complete the table below.</strong>
          </p>
          <p className="text-sm text-slate-700">{getInstructionText()}</p>
        </div>

        {/* Table Title */}
        {data.tableTitle && (
          <div className="text-sm text-slate-900">
            <strong>Table: {data.tableTitle}</strong>
          </div>
        )}

        {/* Table */}
        <div className="border-2 border-black">
          <table className="w-full border-collapse">
            <tbody>
              {Array.from({ length: data.rowCount }, (_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: data.columnCount }, (_, colIdx) => {
                    const cellIndex = getCellIndex(rowIdx, colIdx);
                    const cellValue = data.cells[cellIndex.toString()];

                    return (
                      <td
                        key={colIdx}
                        className={`border-black p-3 ${
                          colIdx > 0 ? 'border-l-2' : ''
                        } ${
                          rowIdx > 0 ? 'border-t-2' : ''
                        } bg-slate-50`}
                      >
                        <div className="text-sm text-slate-900 min-h-[40px] flex items-center">
                          {renderCellContent(cellValue || '')}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <div className="space-y-4">
        {/* Table Title */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Jadval Sarlavhasi (Table Title)
          </label>
          <input
            type="text"
            value={data.tableTitle || ''}
            onChange={(e) => onChange({ ...data, tableTitle: e.target.value })}
            placeholder="Masalan: Development of Time Standardisation"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Bu jadval ustida ko'rsatiladi
          </p>
        </div>

        {/* Principle Selection */}
        <div>
          <label className="block text-sm text-slate-700 mb-2">
            Javob Formati (Principle) <span className="text-red-500">*</span>
          </label>
          <select
            value={data.principle}
            onChange={(e) => updatePrinciple(e.target.value as CriteriaType)}
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
            Maxsus Ko&apos;rsatma (ixtiyoriy)
          </label>
          <input
            type="text"
            value={data.instruction || ''}
            onChange={(e) => onChange({ ...data, instruction: e.target.value })}
            placeholder="Bo'sh qoldirilsa avtomatik yaratiladi"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
          />
          <p className="text-xs text-slate-500 mt-1">
            Odatiy: &quot;{getInstructionText()}&quot;
          </p>
        </div>

        {/* Grid Size */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-700 mb-2">Qatorlar soni</label>
            <input
              type="number"
              min="1"
              max="20"
              value={data.rowCount || 5}
              onChange={(e) => updateRowCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-2">Ustunlar soni</label>
            <input
              type="number"
              min="1"
              max="10"
              value={data.columnCount || 2}
              onChange={(e) => updateColumnCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
            />
          </div>
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

        {/* Info */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 text-sm text-blue-900">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="mb-1">
                <strong>Jadval:</strong> {data.rowCount}x{data.columnCount} o'lchamda ({totalCells} ta katak)
              </p>
              <p className="text-xs text-blue-700">
                💡 <strong>Maslahat:</strong> Har bir katakka matn yozing yoki (1), (2), (3) raqamlarini yozing - ular avtomatik javob maydoniga aylanadi!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Editor */}
      <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            {Array.from({ length: data.rowCount }, (_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-slate-50">
                {Array.from({ length: data.columnCount }, (_, colIdx) => {
                  const cellIndex = getCellIndex(rowIdx, colIdx);
                  const cellValue = data.cells[cellIndex.toString()] || '';
                  const isEditing = editingCell === cellIndex;
                  const hasGaps = cellValue && cellValue.match(/\(\d+\)/g);

                  return (
                    <td
                      key={colIdx}
                      className={`border-slate-300 p-3 relative ${
                        colIdx > 0 ? 'border-l-2' : ''
                      } ${
                        rowIdx > 0 ? 'border-t-2' : ''
                      }`}
                    >
                      {/* Index number */}
                      <span className="absolute top-1 left-1 text-xs text-slate-400 font-mono bg-slate-100 px-1 rounded">
                        {cellIndex}
                      </span>

                      {/* Cell editor */}
                      <div className="mt-5">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={cellInputValue}
                              onChange={(e) => setCellInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  saveEditingCell();
                                } else if (e.key === 'Escape') {
                                  cancelEditingCell();
                                }
                              }}
                              placeholder="Matn kiriting yoki (1), (2) yozing..."
                              rows={3}
                              autoFocus
                              className="w-full px-2 py-1 text-sm border-2 border-[#042d62] rounded focus:outline-none resize-none"
                            />
                            {/* Gap count indicator */}
                            {cellInputValue && cellInputValue.match(/\(\d+\)/g) && (
                              <div className="text-xs text-green-600">
                                ✓ {cellInputValue.match(/\(\d+\)/g)?.length} javob topildi
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                onClick={saveEditingCell}
                                className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                ✓ Saqlash
                              </button>
                              <button
                                onClick={cancelEditingCell}
                                className="flex-1 px-3 py-1.5 text-sm bg-slate-300 text-slate-700 rounded hover:bg-slate-400 transition-colors"
                              >
                                × Bekor
                              </button>
                            </div>
                            <p className="text-xs text-slate-500">
                              Ctrl+Enter: Saqlash | Esc: Bekor qilish
                            </p>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditingCell(cellIndex)}
                            className="cursor-pointer group min-h-[60px] flex items-center"
                          >
                            {cellValue ? (
                              <div className="w-full px-2 py-2 text-sm bg-slate-50 border border-slate-300 rounded group-hover:border-[#042d62] group-hover:bg-blue-50 transition-all">
                                {renderCellContent(cellValue)}
                                {hasGaps && (
                                  <div className="mt-2 text-xs text-green-600">
                                    ✓ {hasGaps.length} javob
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="w-full px-2 py-2 text-sm border-2 border-dashed border-slate-300 rounded text-slate-400 text-center group-hover:border-[#042d62] transition-all">
                                Matn yoki (1), (2)...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Helper info */}
      <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-700">
        <p className="font-semibold mb-2">📖 Qo&apos;llanma:</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li><strong>Matn kiriting:</strong> Oddiy matn yoki matn + javob maydonlari</li>
          <li><strong>Javob maydonlari:</strong> (1), (2), (3) yozing - preview'da input field bo'lib ko'rinadi</li>
          <li><strong>Masalan:</strong> &quot;Based on the sun and (1) ________&quot;</li>
          <li><strong>Index raqami:</strong> Har bir katakda chap yuqori burchakda ko'rsatiladi</li>
          <li><strong>Tahrirlash:</strong> Katakka bosing, Ctrl+Enter bilan saqlang</li>
        </ul>
      </div>

      {/* Preview */}
      <div className="border-t-2 border-slate-300 pt-6">
        <h4 className="text-slate-900 mb-4 font-semibold">Ko&apos;rinishi (Student View)</h4>
        <TableCompletionEditorIndexed data={data} onChange={onChange} mode="preview" />
      </div>
    </div>
  );
}
