/**
 * Converts sentence_completion data to gap_filling format for backend
 */
export function convertSentenceCompletionToGapFilling(sentenceCompletion: any, fromValue: number) {
  // Instruction field already contains the principle code (ONE_WORD, NMT_TWO_NUM, etc.)
  const principle = sentenceCompletion.instruction || 'NMT_TWO_NUM';
  
  // Build HTML body with ONLY sentences (no title, no instruction!)
  let body = '';
  sentenceCompletion.sentences.forEach((sentence: any, idx: number) => {
    const gapNumber = fromValue + idx;
    const sentenceWithGap = sentence.text.replace(/_{2,}|_+/g, `(${gapNumber})`);
    body += `<p>${sentenceWithGap}</p>\n`;
  });
  
  return {
    title: sentenceCompletion.title,
    principle: principle,
    body: body.trim(),
  };
}
