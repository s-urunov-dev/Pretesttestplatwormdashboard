import { TableCompletionData, TableCell } from '../components/TableCompletionEditor';
import { CriteriaType } from './api';

/**
 * Backend model structure:
 * {
 *   principle: CriteriaType,
 *   row_count: number,
 *   column_counts: string[][],  // 2D array where each row can have different columns
 *   table_details: JSONField
 * }
 */

export interface BackendTableCompletion {
  principle: CriteriaType;
  row_count: number;
  column_counts: string[][];
  table_details: {
    instruction?: string;
    rows: TableCell[][];
  };
}

/**
 * Convert frontend TableCompletionData to backend format
 */
export function tableDataToBackend(data: TableCompletionData): BackendTableCompletion {
  // Calculate column_counts - 2D array representing the structure
  const column_counts: string[][] = data.rows.map((row) => {
    return row.map((cell, index) => {
      // Store cell metadata as string (can be extended later)
      return `col_${index}`;
    });
  });

  return {
    principle: data.principle,
    row_count: data.rows.length,
    column_counts,
    table_details: {
      instruction: data.instruction,
      rows: data.rows,
    },
  };
}

/**
 * Convert backend format to frontend TableCompletionData
 */
export function tableDataFromBackend(backend: BackendTableCompletion, questionNumberStart: number = 1): TableCompletionData {
  return {
    principle: backend.principle,
    instruction: backend.table_details.instruction,
    rows: backend.table_details.rows || [],
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