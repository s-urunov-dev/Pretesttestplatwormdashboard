import { SummaryCompletionData, GapFillingData } from '../lib/api-cleaned';

/**
 * Map Summary Completion instruction to backend principle
 * Backend only accepts: ONE_WORD, NMT_TWO, NMT_THREE, NMT_TWO_NUM, NMT_THREE_NUM, etc.
 */
const INSTRUCTION_TO_PRINCIPLE: Record<string, string> = {
  'ONE_WORD_FROM_PASSAGE': 'ONE_WORD',
  'ONE_WORD_FROM_LIST': 'ONE_WORD',
  'NMT_TWO_FROM_PASSAGE': 'NMT_TWO',
  'NMT_TWO_FROM_LIST': 'NMT_TWO',
  'NMT_THREE_FROM_PASSAGE': 'NMT_THREE',
  'NMT_THREE_FROM_LIST': 'NMT_THREE',
  'ONE_WORD_NUM_FROM_PASSAGE': 'ONE_WORD_OR_NUMBER',
  'NMT_TWO_NUM_FROM_PASSAGE': 'NMT_TWO_NUM',
};

/**
 * Reverse mapping: Backend principle to frontend instruction
 */
const PRINCIPLE_TO_INSTRUCTION: Record<string, string> = {
  'ONE_WORD': 'ONE_WORD_FROM_LIST',
  'NMT_TWO': 'NMT_TWO_FROM_LIST',
  'NMT_THREE': 'NMT_THREE_FROM_LIST',
  'ONE_WORD_OR_NUMBER': 'ONE_WORD_NUM_FROM_PASSAGE',
  'NMT_TWO_NUM': 'NMT_TWO_NUM_FROM_PASSAGE',
  'NMT_THREE_NUM': 'NMT_THREE_FROM_PASSAGE',
};

/**
 * Converts SummaryCompletionData to GapFillingData format for backend
 */
export function convertSummaryCompletionToGapFilling(
  data: SummaryCompletionData
): GapFillingData {
  // Map frontend instruction to backend principle
  const backendPrinciple = INSTRUCTION_TO_PRINCIPLE[data.instruction] || 'ONE_WORD';
  
  // Build the body text with options at the end
  let bodyText = data.summary;
  
  // If there are options, add them at the end
  if (data.options && data.options.length > 0) {
    bodyText += '\n\nOptions:\n' + data.options.join('\n');
  }
  
  return {
    title: data.title || '',
    principle: backendPrinciple as any,
    body: bodyText,
  };
}

/**
 * Converts GapFillingData back to SummaryCompletionData format for frontend
 */
export function convertGapFillingToSummaryCompletion(
  data: GapFillingData
): SummaryCompletionData {
  const body = data.body || '';
  
  // Try to split summary text and options
  const optionsMatch = body.match(/\n\nOptions:\n([\s\S]+)$/);
  
  let summary = body;
  let options: string[] = [];
  
  if (optionsMatch) {
    // Extract summary (before options)
    summary = body.substring(0, body.indexOf('\n\nOptions:\n'));
    
    // Extract options (after "Options:")
    const optionsText = optionsMatch[1];
    options = optionsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  }
  
  // Map backend principle to frontend instruction
  // If options exist, use FROM_LIST version, otherwise FROM_PASSAGE
  let instruction = PRINCIPLE_TO_INSTRUCTION[data.principle] || 'ONE_WORD_FROM_LIST';
  
  // If no options, convert to FROM_PASSAGE version
  if (options.length === 0) {
    instruction = instruction.replace('_FROM_LIST', '_FROM_PASSAGE');
  }
  
  return {
    title: data.title || 'Complete the summary below.',
    instruction: instruction,
    summary: summary,
    options: options,
  };
}