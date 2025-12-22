import { TableCompletionData, TableCell } from '../components/TableCompletionEditor';
import { CriteriaType } from './api';

/**
 * Backend model structure (NEW API format):
 * {
 *   principle: CriteriaType,
 *   table_details: { "0": "text", "1": "text", ... }  // Index-based: only cell text content
 * }
 * 
 * Frontend needs to reconstruct the table structure from this flat data.
 * We'll store metadata separately to enable reconstruction.
 */

export interface BackendTableCompletion {
  principle: CriteriaType;
  table_details: {
    [key: string]: string; // Index-based: { "0": "Swimming", "1": "", ... }
  };
}

/**
 * Convert frontend TableCompletionData to backend format (index-based)
 * Only stores cell content as flat index-based object
 */
export function tableDataToBackend(data: TableCompletionData): BackendTableCompletion {
  const table_details: { [key: string]: string } = {};
  
  let index = 0;
  // Flatten rows into index-based format - only store content text
  data.rows.forEach((row) => {
    row.forEach((cell) => {
      // Store only the text content, not the whole cell object
      table_details[index.toString()] = cell.content || '';
      index++;
    });
  });

  return {
    principle: data.principle,
    table_details,
  };
}

/**
 * Convert backend format to frontend TableCompletionData
 * We need to also store/retrieve the table structure (rows/columns layout)
 * For now, we'll store the original rows structure in a separate field
 */
export function tableDataFromBackend(backend: BackendTableCompletion, questionNumberStart: number = 1): TableCompletionData {
  const details = backend.table_details as any;
  
  // If it has instruction and rows (this means we're storing the full structure)
  if (details.instruction !== undefined || details.rows !== undefined) {
    return {
      principle: backend.principle,
      instruction: details.instruction,
      rows: details.rows || [],
      questionNumberStart,
    };
  }
  
  // Pure index-based format: can't reconstruct table structure without metadata
  // Return empty for now
  return {
    principle: backend.principle,
    instruction: undefined,
    rows: [],
    questionNumberStart,
  };
}

/**
 * Serialize table data to JSON string for gap_filling.body field
 */
export function serializeTableData(data: TableCompletionData): string {
  const backendFormat = tableDataToBackend(data);
  return JSON.stringify(backendFormat);
}

/**
 * Deserialize table data from gap_filling.body field
 */
export function deserializeTableData(bodyStr: string, principle: CriteriaType, questionNumberStart: number = 1): TableCompletionData {
  try {
    const parsed = JSON.parse(bodyStr);
    
    // Check if it's already in backend format
    if (parsed.row_count !== undefined && parsed.column_counts !== undefined) {
      return tableDataFromBackend(parsed as BackendTableCompletion, questionNumberStart);
    }
    
    // Otherwise, assume it's direct table_details format (old format)
    return {
      principle: principle,
      instruction: parsed.instruction,
      rows: parsed.rows || [],
      questionNumberStart,
    };
  } catch (error) {
    console.error('Failed to parse table data:', error);
    return {
      principle: principle,
      rows: [],
      questionNumberStart,
    };
  }
}

/**
 * Validate table structure
 */
export function validateTableData(data: TableCompletionData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.rows || data.rows.length === 0) {
    errors.push('Jadvalda kamida bitta qator bo\'lishi kerak');
  }

  data.rows.forEach((row, rowIndex) => {
    if (row.length === 0) {
      errors.push(`Qator ${rowIndex + 1} bo'sh bo'lmasligi kerak`);
    }

    row.forEach((cell, colIndex) => {
      if (!cell.type) {
        errors.push(`Qator ${rowIndex + 1}, Ustun ${colIndex + 1}: Katakcha turi ko'rsatilmagan`);
      }
      if (cell.type === 'text' && !cell.content?.trim()) {
        // Warning, not an error
      }
    });
  });

  // Check if there's at least one answer cell
  const hasAnswerCell = data.rows.some(row => row.some(cell => cell.isAnswer));
  if (!hasAnswerCell) {
    errors.push('Jadvalda kamida bitta javob katakchasi bo\'lishi kerak');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get example table data for testing
 */
export function getExampleTableData(): TableCompletionData {
  return {
    principle: 'NMT_TWO',
    instruction: undefined,
    questionNumberStart: 1,
    rows: [
      [
        { type: 'text', content: 'Activity', isAnswer: false },
        { type: 'text', content: 'Age Group', isAnswer: false },
        { type: 'text', content: 'Duration', isAnswer: false },
      ],
      [
        { type: 'text', content: 'Swimming', isAnswer: false },
        { type: 'answer', content: '', isAnswer: true },
        { type: 'text', content: '2 hours', isAnswer: false },
      ],
      [
        { type: 'text', content: 'Tennis', isAnswer: false },
        { type: 'text', content: 'Adults', isAnswer: false },
        { type: 'answer', content: '', isAnswer: true },
      ],
      [
        { type: 'answer', content: '', isAnswer: true },
        { type: 'text', content: 'Children', isAnswer: false },
        { type: 'text', content: '1 hour', isAnswer: false },
      ],
    ],
  };
}