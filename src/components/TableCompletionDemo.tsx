import React from 'react';

/**
 * Table Completion Demo Component
 * 
 * Demonstrates index-based table structure for IELTS listening tests.
 * Cells are indexed left-to-right, top-to-bottom (0-11 for a 4x3 table).
 */

interface TableCompletionDemoProps {
  instruction?: string;
  principle?: string;
  rowCount?: number;
  columnHeaders?: string[];
  highlightIndex?: number;
}

export function TableCompletionDemo({
  instruction = 'Complete the table using ONE WORD only.',
  principle = 'ONE_WORD',
  rowCount = 4,
  columnHeaders = ['Name', 'Time', 'Place'],
  highlightIndex = 0,
}: TableCompletionDemoProps) {
  const columnCount = columnHeaders.length;
  const totalCells = rowCount * columnCount;

  // Generate cells array with index
  const cells = Array.from({ length: totalCells }, (_, index) => ({
    index,
    row: Math.floor(index / columnCount),
    col: index % columnCount,
  }));

  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white rounded-lg">
      {/* Instruction Block */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-700">{instruction}</p>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-100">
              {columnHeaders.map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left border-b border-gray-300"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {Array.from({ length: rowCount }, (_, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
                {Array.from({ length: columnCount }, (_, colIdx) => {
                  const cellIndex = rowIdx * columnCount + colIdx;
                  const isHighlighted = cellIndex === highlightIndex;

                  return (
                    <td
                      key={colIdx}
                      className="px-6 py-4 border-b border-gray-200 relative"
                    >
                      {/* Index Number (top-left corner) */}
                      <span className="absolute top-2 left-2 text-xs text-gray-400">
                        {cellIndex}
                      </span>

                      {/* Input Field */}
                      <div className="mt-3">
                        <input
                          type="text"
                          placeholder="______"
                          className={`
                            w-full px-3 py-2 border-2 border-dashed rounded-md
                            bg-white text-gray-800 placeholder-gray-300
                            focus:outline-none focus:border-[#042d62] focus:bg-blue-50
                            transition-all
                            ${isHighlighted ? 'border-[#042d62] bg-blue-50' : 'border-gray-300'}
                          `}
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Helper Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Index Example:</strong> Index {highlightIndex} → Row{' '}
          {Math.floor(highlightIndex / columnCount) + 1}, Column{' '}
          {(highlightIndex % columnCount) + 1} ({columnHeaders[highlightIndex % columnCount]})
        </p>
      </div>

      {/* Index Grid Visualization */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm mb-3 text-gray-600">
          Index Mapping (Left → Right, Top → Bottom):
        </h3>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}>
          {cells.map((cell) => (
            <div
              key={cell.index}
              className={`
                px-3 py-2 rounded border text-center text-sm
                ${
                  cell.index === highlightIndex
                    ? 'bg-[#042d62] text-white border-[#042d62]'
                    : 'bg-white border-gray-300 text-gray-700'
                }
              `}
            >
              <div className="text-xs opacity-70">
                {columnHeaders[cell.col]}
              </div>
              <div>{cell.index}</div>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Structure Example */}
      <div className="mt-6 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
        <pre className="text-xs">
          {JSON.stringify(
            {
              table_details: {
                instruction,
                principle,
                rows: [
                  columnHeaders.map((h, i) => ({ index: i, header: h, value: '' })),
                  ...Array.from({ length: rowCount }, (_, rowIdx) =>
                    Array.from({ length: columnCount }, (_, colIdx) => ({
                      index: rowIdx * columnCount + colIdx,
                      value: '',
                    }))
                  ),
                ],
              },
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
