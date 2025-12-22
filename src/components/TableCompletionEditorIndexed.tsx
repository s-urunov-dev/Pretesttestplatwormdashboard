import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Info } from 'lucide-react';
import { CriteriaType, GAP_FILLING_CRITERIA } from '../lib/api-cleaned';

/**
 * Index-based Table Completion Editor for IELTS Listening
 * 
 * New API structure:
 * {
 *   "table_completion": {
 *     "principle": "ONE_WORD",
 *     "table_details": {
 *       "0": "cell content",
 *       "1": "cell content",
 *       ...
 *     }
 *   }
 * }
 * 
 * Indexes go left-to-right, top-to-bottom.
 */

export interface IndexedTableData {
  principle: CriteriaType;
  rowCount: number;
  columnCount: number;
  cells: { [index: string]: string }; // Index-based cell values
}

interface TableCompletionEditorIndexedProps {
  data: IndexedTableData;
  onChange: (data: IndexedTableData) => void;
  mode?: 'edit' | 'preview';
}

export function TableCompletionEditorIndexed({ 
  data, 
  onChange, 
  mode = 'edit' 
}: TableCompletionEditorIndexedProps) {
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [cellInputValue, setCellInputValue] = useState<string>('');

  // Initialize with default if empty
  React.useEffect(() => {
    if (!data.rowCount || !data.columnCount) {
      onChange({
        principle: data.principle || 'ONE_WORD',
        rowCount: 4,
        columnCount: 3,
        cells: {},
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

  if (mode === 'preview') {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        {/* Instruction */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Complete the table using{' '}
            <strong>
              {GAP_FILLING_CRITERIA[data.principle]?.label || data.principle}
            </strong>
          </p>
        </div>

        {/* Table */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <tbody>
              {Array.from({ length: data.rowCount }, (_, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-gray-50">
                  {Array.from({ length: data.columnCount }, (_, colIdx) => {
                    const cellIndex = getCellIndex(rowIdx, colIdx);
                    const cellValue = data.cells[cellIndex.toString()];
                    const isEmpty = !cellValue || cellValue.trim() === '';

                    return (
                      <td
                        key={colIdx}
                        className="border border-gray-200 p-3 relative"
                      >
                        {/* Index number */}
                        <span className="absolute top-1 left-1 text-xs text-gray-400">
                          {cellIndex}
                        </span>

                        {/* Cell content */}
                        <div className="mt-3 text-center">
                          {isEmpty ? (
                            <div className="px-3 py-2 border-2 border-dashed border-gray-300 rounded text-gray-400">
                              ______
                            </div>
                          ) : (
                            <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded">
                              {cellValue}
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Configuration Section */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
        <h3 className="text-sm text-gray-700 mb-2">Table Sozlamalari</h3>

        {/* Principle */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">So'z Cheklovi</label>
          <select
            value={data.principle}
            onChange={(e) => updatePrinciple(e.target.value as CriteriaType)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
          >
            {Object.entries(GAP_FILLING_CRITERIA).map(([key, { value, label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Grid Size */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Qatorlar soni</label>
            <input
              type="number"
              min="1"
              max="20"
              value={data.rowCount || 4}
              onChange={(e) => updateRowCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ustunlar soni</label>
            <input
              type="number"
              min="1"
              max="10"
              value={data.columnCount || 3}
              onChange={(e) => updateColumnCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            Jadval {data.rowCount}x{data.columnCount} o'lchamda ({totalCells} ta katak). 
            Har bir katak index bilan belgilanadi (0 dan {totalCells - 1} gacha).
          </div>
        </div>
      </div>

      {/* Table Editor */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            {Array.from({ length: data.rowCount }, (_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {Array.from({ length: data.columnCount }, (_, colIdx) => {
                  const cellIndex = getCellIndex(rowIdx, colIdx);
                  const cellValue = data.cells[cellIndex.toString()] || '';
                  const isEditing = editingCell === cellIndex;

                  return (
                    <td
                      key={colIdx}
                      className="border border-gray-200 p-3 relative"
                    >
                      {/* Index number */}
                      <span className="absolute top-1 left-1 text-xs text-gray-400">
                        {cellIndex}
                      </span>

                      {/* Cell editor */}
                      <div className="mt-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={cellInputValue}
                              onChange={(e) => setCellInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditingCell();
                                } else if (e.key === 'Escape') {
                                  cancelEditingCell();
                                }
                              }}
                              placeholder="Bo'sh (javob kiritish uchun)"
                              autoFocus
                              className="w-full px-2 py-1 text-sm border-2 border-[#042d62] rounded focus:outline-none"
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={saveEditingCell}
                                className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                ✓ Saqlash
                              </button>
                              <button
                                onClick={cancelEditingCell}
                                className="flex-1 px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              >
                                × Bekor
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => startEditingCell(cellIndex)}
                            className="cursor-pointer group"
                          >
                            {cellValue ? (
                              <div className="px-2 py-1 text-sm bg-gray-100 border border-gray-300 rounded group-hover:border-[#042d62] group-hover:bg-blue-50">
                                {cellValue}
                              </div>
                            ) : (
                              <div className="px-2 py-1 text-sm border-2 border-dashed border-gray-300 rounded text-gray-400 text-center group-hover:border-[#042d62]">
                                ______
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
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
        <strong>Yo'riqnoma:</strong> Har bir katakka bosing va qiymat kiriting. Bo'sh kataklar talaba tomonidan to'ldiriladi.
        Indexlar chap-o'ngga, yuqoridan pastga hisoblanadi.
      </div>
    </div>
  );
}
