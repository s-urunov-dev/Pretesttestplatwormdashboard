import { Plus, Trash2 } from 'lucide-react';

interface DynamicTableProps {
  tableData: { headers: string[]; rows: string[][] };
  onChange: (data: { headers: string[]; rows: string[][] }) => void;
}

export function DynamicTable({ tableData, onChange }: DynamicTableProps) {
  const addRow = () => {
    // New row starts with 1 column
    onChange({
      ...tableData,
      rows: [...tableData.rows, ['']],
    });
  };

  const removeRow = (rowIndex: number) => {
    onChange({
      ...tableData,
      rows: tableData.rows.filter((_, i) => i !== rowIndex),
    });
  };

  const addColumnToRow = (rowIndex: number) => {
    const rows = [...tableData.rows];
    rows[rowIndex] = [...rows[rowIndex], ''];
    onChange({ ...tableData, rows });
  };

  const removeColumnFromRow = (rowIndex: number, colIndex: number) => {
    const rows = [...tableData.rows];
    rows[rowIndex] = rows[rowIndex].filter((_, i) => i !== colIndex);
    onChange({ ...tableData, rows });
  };

  const updateHeader = (index: number, value: string) => {
    const headers = [...tableData.headers];
    headers[index] = value;
    onChange({ ...tableData, headers });
  };

  const addHeader = () => {
    onChange({
      ...tableData,
      headers: [...tableData.headers, ''],
    });
  };

  const removeHeader = (index: number) => {
    onChange({
      ...tableData,
      headers: tableData.headers.filter((_, i) => i !== index),
    });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const rows = [...tableData.rows];
    rows[rowIndex][colIndex] = value;
    onChange({ ...tableData, rows });
  };

  return (
    <div className="border-2 border-slate-300 rounded-xl p-5 bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <label className="text-slate-700">Jadval (Har qator o&apos;z ustunlari bilan)</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addHeader}
            className="px-3 py-1.5 text-sm bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-colors"
          >
            + Ustun (Header)
          </button>
          <button
            type="button"
            onClick={addRow}
            className="px-3 py-1.5 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            + Qator
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-900 mb-1">
          💡 <strong>Har qator o&apos;z ustunlariga ega:</strong>
        </p>
        <p className="text-sm text-blue-700 mb-2">
          Har bir qator uchun alohida ustunlar qo&apos;shish/o&apos;chirish mumkin
        </p>
        <p className="text-sm text-blue-800">
          🗺️ <strong>Map/Diagram uchun:</strong> Birinchi ustun - savol raqami (11, 12, 13...), Ikkinchi ustun - javob (allotment gardens, toilet...)
        </p>
      </div>

      <div className="space-y-4">
        {/* Headers */}
        {tableData.headers.length > 0 && (
          <div>
            <p className="text-sm text-slate-600 mb-2">Jadval sarlavhalari:</p>
            <div className="flex gap-2 flex-wrap">
              {tableData.headers.map((header, i) => (
                <div key={i} className="flex gap-1">
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    placeholder={`Ustun ${i + 1}`}
                    className="w-40 px-3 py-2 text-sm border-2 border-indigo-300 bg-indigo-50 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-indigo-400"
                  />
                  {tableData.headers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHeader(i)}
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

        {/* Rows */}
        <div className="space-y-3">
          {tableData.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between mb-3">
                <p className="text-slate-900">
                  <strong>Qator {rowIndex + 1}</strong> ({row.length} ustun)
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => addColumnToRow(rowIndex)}
                    className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    + Ustun
                  </button>
                  {tableData.rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      O&apos;chirish
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {row.map((cell, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-1">
                    <label className="text-xs text-slate-600 px-1">
                      Katak {colIndex + 1}
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        placeholder={`Bo'sh joy uchun: (${rowIndex + 1}) ____`}
                        className="w-48 px-3 py-2.5 text-sm border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400"
                      />
                      {row.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumnFromRow(rowIndex, colIndex)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}