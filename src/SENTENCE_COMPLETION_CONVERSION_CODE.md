# Sentence Completion Conversion Code

Replace lines 637-672 in AddQuestionPage.tsx with:

```typescript
        // Convert sentence_completion to gap_filling for backend compatibility
        if (cleanedGroup.sentence_completion && cleanedGroup.question_type === 'sentence_completion') {
          // instruction field now contains the principle (ONE_WORD, NMT_TWO, etc.)
          const principle = cleanedGroup.sentence_completion.instruction || 'NMT_TWO_NUM';
          
          // Build HTML body with all sentences
          let body = '';
          cleanedGroup.sentence_completion.sentences.forEach((sentence: any, idx: number) => {
            const gapNumber = cleanedGroup.from_value + idx;
            const sentenceWithGap = sentence.text.replace(/_{2,}|_+/g, `(${gapNumber})`);
            body += `<p>${sentenceWithGap}</p>\n`;
          });
          
          // Set gap_filling for backend
          cleanedGroup.gap_filling = {
            title: cleanedGroup.sentence_completion.title,
            principle: principle,
            body: body.trim(),
          };
          
          // Keep sentence_completion for future compatibility (optional)
          // delete cleanedGroup.sentence_completion;
        }
```

## Explanation:

1. **Principle**: Directly use the `instruction` field which now contains principle codes like `ONE_WORD`, `NMT_TWO_NUM`, etc.
2. **Title**: Send `title` to backend
3. **Body**: All sentences are converted to HTML `<p>` tags with gap numbers replaced
4. **No Options**: Options field is completely removed

## Backend Format:

```json
{
  "gap_filling": {
    "title": "Complete the sentences below.",
    "principle": "NMT_TWO_NUM",
    "body": "<p>Early methods of measuring time depended largely on natural phenomena such as the sun and (1).</p>\n<p>The Ancient Egyptians developed a calendar based on the movements of (2).</p>"
  }
}
```
