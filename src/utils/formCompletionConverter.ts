import { FormCompletionValue } from '../components/FormCompletionInputs';

/**
 * Converts Form Completion UI data to backend format
 * 
 * Form Completion Format (UI):
 * - title: Form title
 * - body: Full form text with (1), (2) gaps
 * - principle: Answer criteria (optional)
 * 
 * Backend Format:
 * - Stored in the `body` field as plain text
 * - No variants or options needed for this question type
 */

export interface BackendFormCompletionData {
  title: string;
  body: string; // Full form text with numbered gaps
  principle?: 'ONE_WORD' | 'NMT_TWO' | 'NMT_THREE' | 'ONE_NUMBER'; // Answer criteria
}

export function convertFormCompletionToBackend(
  formCompletionData: FormCompletionValue
): BackendFormCompletionData {
  if (!formCompletionData || !formCompletionData.body) {
    console.error('❌ Invalid form completion data:', formCompletionData);
    throw new Error('Invalid form completion data: body is required');
  }

  console.log('🔄 Converting Form Completion to backend format...');
  console.log('📥 Input data:', formCompletionData);

  const { title, body, principle } = formCompletionData;

  const result: BackendFormCompletionData = {
    title: title || 'Complete the form below',
    body: body.trim(),
    principle: principle || 'NMT_TWO', // Default to NMT_TWO if not specified
  };

  console.log('📤 Converted to backend format:', result);
  console.log('✅ Form Completion conversion complete!');
  console.log(`   - Title: ${result.title}`);
  console.log(`   - Body length: ${result.body.length} characters`);
  console.log(`   - Principle: ${result.principle}`);

  return result;
}

/**
 * Converts backend format back to Form Completion UI format
 * Used when loading existing data for editing
 */
export function convertBackendToFormCompletion(
  backendData: any
): FormCompletionValue {
  console.log('🔄 Converting backend to Form Completion format...');
  console.log('📥 Backend data:', backendData);

  // Handle different possible backend structures
  const title = backendData.title || backendData.question || 'Complete the form below';
  const body = backendData.body || backendData.form_template || '';
  const principle = backendData.principle || 'NMT_TWO'; // Default to NMT_TWO if not specified

  if (!body) {
    console.error('❌ No body/form_template in backend data');
    throw new Error('Invalid backend data: no body or form_template');
  }

  const result: FormCompletionValue = {
    title,
    body,
    principle,
  };

  console.log('📤 Converted to UI format:', result);
  console.log('✅ Form Completion reverse conversion complete!');

  return result;
}

/**
 * Validates Form Completion data before submission
 */
export function validateFormCompletionData(
  data: FormCompletionValue
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.body || data.body.trim().length === 0) {
    errors.push('Form body is required');
  }

  // Check if there are numbered gaps in the form
  const gapMatches = data.body.match(/\((\d+)\)/g);
  if (!gapMatches || gapMatches.length === 0) {
    errors.push('Form must contain at least one numbered gap (e.g., (1), (2))');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Legacy function name for backward compatibility
export function convertFormCompletionToGapFilling(
  formCompletionData: FormCompletionValue
): BackendFormCompletionData {
  return convertFormCompletionToBackend(formCompletionData);
}

// Legacy function name for backward compatibility
export function convertGapFillingToFormCompletion(
  backendData: any
): FormCompletionValue {
  return convertBackendToFormCompletion(backendData);
}