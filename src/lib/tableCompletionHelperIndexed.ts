import { IndexedTableData } from '../components/TableCompletionEditorIndexed';
import { CriteriaType, TableCompletionData } from './api';

/**
 * Backend model structure (NEW API):
 * {
 *   "table_completion": {
 *     "principle": "ONE_WORD",
 *     "table_details": {
 *       "0": "cell value",
 *       "1": "cell value",
 *       ...
 *     }
 *   }
 * }
 */

export interface BackendIndexedTableCompletion {
  principle: CriteriaType;
  table_details: {
    [key: string]: string; // Index-based cell values
  };
}

/**
 * Convert frontend IndexedTableData to backend format
 */
export function indexedTableDataToBackend(data: IndexedTableData): BackendIndexedTableCompletion {
  return {
    principle: data.principle,
    table_details: data.cells,
  };
}

/**
 * Convert backend format to frontend IndexedTableData
 */
export function indexedTableDataFromBackend(
  backend: BackendIndexedTableCompletion,
  rowCount: number = 4,
  columnCount: number = 3
): IndexedTableData {
  return {
    principle: backend.principle || 'ONE_WORD',
    rowCount,
    columnCount,
    cells: backend.table_details || {},
  };
}

/**
 * Convert old TableCompletionData format to IndexedTableData
 */
export function convertOldToIndexed(
  old: TableCompletionData,
  rowCount?: number,
  columnCount?: number
): IndexedTableData {
  // If old format has table_details with rows
  const cells: { [key: string]: string } = {};
  
  if (old.table_details?.rows && Array.isArray(old.table_details.rows)) {
    let index = 0;
    for (const row of old.table_details.rows) {
      if (Array.isArray(row)) {
        for (const cell of row) {
          const cellValue = typeof cell === 'string' ? cell : (cell?.content || '');
          if (cellValue && cellValue.trim()) {
            cells[index.toString()] = cellValue;
          }
          index++;
        }
      }
    }
    
    // Auto-detect dimensions from rows
    if (!rowCount) {
      rowCount = old.table_details.rows.length;
    }
    if (!columnCount && old.table_details.rows.length > 0) {
      columnCount = Array.isArray(old.table_details.rows[0]) 
        ? old.table_details.rows[0].length 
        : 3;
    }
  }

  return {
    principle: old.principle || 'ONE_WORD',
    rowCount: rowCount || 4,
    columnCount: columnCount || 3,
    cells,
  };
}
