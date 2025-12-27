/**
 * Utility to convert gap_filling format (from backend) to sentence_completion format (for frontend form)
 * This is the REVERSE of sentenceCompletionConverter.ts
 */

export interface GapFillingData {
  title: string;
  principle: string;
  body: string; // HTML format: <p>Sentence with (1)</p><p>Another with (2)</p>
}

export interface SentenceCompletionData {
  title: string;
  instruction: string;
  sentences: Array<{ text: string }>;
}

/**
 * Maps principle codes to instruction text
 */
const PRINCIPLE_TO_INSTRUCTION: Record<string, string> = {
  'ONE_WORD': 'Choose ONE WORD ONLY from the passage for each answer.',
  'NMT_TWO': 'Choose NO MORE THAN TWO WORDS from the passage for each answer.',
  'NMT_THREE': 'Choose NO MORE THAN THREE WORDS from the passage for each answer.',
  'NMT_TWO_NUM': 'Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
  'NMT_THREE_NUM': 'Choose NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage for each answer.',
  'NMT_FOUR_NUM': 'Choose NO MORE THAN FOUR WORDS AND/OR A NUMBER from the passage for each answer.',
};

/**
 * Converts gap_filling data (from backend) to sentence_completion format (for frontend editing)
 * 
 * Example input:
 * {
 *   title: "Complete the sentences",
 *   principle: "NMT_TWO_NUM",
 *   body: "<p>DWAD WD AWD AW (1).</p>\n<p>DHAWHDAHKWLDH KHAWDJH AHWD (2).</p>"
 * }
 * 
 * Example output:
 * {
 *   title: "Complete the sentences",
 *   instruction: "Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
 *   sentences: [
 *     { text: "DWAD WD AWD AW _____." },
 *     { text: "DHAWHDAHKWLDH KHAWDJH AHWD _____." }
 *   ]
 * }
 */
export function convertGapFillingToSentenceCompletion(
  gapFilling: GapFillingData
): SentenceCompletionData {
  console.log('🔄 Converting gap_filling to sentence_completion:', gapFilling);
  
  // Get instruction text from principle
  const instruction = PRINCIPLE_TO_INSTRUCTION[gapFilling.principle] || 
    'Choose NO MORE THAN TWO WORDS from the passage for each answer.';

  // Parse body HTML to extract sentences
  const sentences = parseBodyToSentences(gapFilling.body);

  const result = {
    title: gapFilling.title,
    instruction,
    sentences,
  };
  
  console.log('✅ Converted to sentence_completion:', result);
  
  return result;
}

/**
 * Parses HTML body to extract sentences and convert gap numbers to underscores
 * 
 * Input: "<p>DWAD WD AWD AW (1).</p>\n<p>DHAWHDAHKWLDH KHAWDJH AHWD (2).</p>"
 * Output: [
 *   { text: "DWAD WD AWD AW _____." },
 *   { text: "DHAWHDAHKWLDH KHAWDJH AHWD _____." }
 * ]
 */
function parseBodyToSentences(body: string): Array<{ text: string }> {
  console.log('📝 Parsing body HTML:', body);
  
  // Handle empty or undefined body
  if (!body || typeof body !== 'string') {
    console.warn('⚠️ Body is empty or not a string!');
    return [];
  }
  
  // Remove all escape sequences and newlines
  const cleanBody = body
    .replace(/\\n/g, '')
    .replace(/\n/g, '')
    .replace(/\\r/g, '')
    .replace(/\r/g, '')
    .trim();
  
  console.log('🧹 Cleaned body:', cleanBody);
  
  // Extract all <p>...</p> tags
  const pTagRegex = /<p>(.*?)<\/p>/gi;
  const matches = Array.from(cleanBody.matchAll(pTagRegex));
  
  console.log('🔍 Found matches:', matches.length);
  
  const sentences: Array<{ text: string }> = [];
  
  for (const match of matches) {
    const sentenceHtml = match[1].trim();
    
    console.log('  📄 Sentence HTML:', sentenceHtml);
    
    if (sentenceHtml) {
      // Replace gap numbers like (1), (2), (3) with underscores
      const sentenceWithUnderscores = sentenceHtml.replace(/\(\d+\)/g, '_____');
      
      console.log('  ✨ Sentence with underscores:', sentenceWithUnderscores);
      
      sentences.push({
        text: sentenceWithUnderscores,
      });
    }
  }
  
  console.log('✅ Total sentences parsed:', sentences.length);
  
  return sentences;
}

/**
 * Helper: Get instruction text from principle code
 */
export function getInstructionFromPrinciple(principle: string): string {
  return PRINCIPLE_TO_INSTRUCTION[principle] || 
    'Choose NO MORE THAN TWO WORDS from the passage for each answer.';
}
