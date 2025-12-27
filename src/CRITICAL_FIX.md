# CRITICAL FIX NEEDED!

## Problem
Lines 646-653 in `/pages/AddQuestionPage.tsx` need to be deleted. These are OLD CODE that should not exist.

## Current Code (DELETE THESE LINES 646-653):
```typescript
          let body = `<p><strong>${cleanedGroup.sentence_completion.title}</strong></p>\n`;
          body += `<p><em>${instruction}</em></p>\n`;
          body += `<ol>\n`;
          cleanedGroup.sentence_completion.sentences.forEach((sentence: any, idx: number) => {
            const gapNumber = cleanedGroup.from_value + idx;
            const sentenceWithGap = sentence.text.replace(/_{2,}|_+/g, `(${gapNumber})`);
            body += `<li>${sentenceWithGap}</li>\n`;
          });
```

## How to Fix:
1. Open `/pages/AddQuestionPage.tsx`
2. Go to line 646
3. Delete lines 646-653 (everything shown above)
4. The code should look like this after deletion:

```typescript
        if (cleanedGroup.sentence_completion && cleanedGroup.question_type === 'sentence_completion') {
          cleanedGroup.gap_filling = convertSentenceCompletionToGapFilling(
            cleanedGroup.sentence_completion,
            cleanedGroup.from_value
          );
          
          // Keep sentence_completion for future compatibility (optional)
          // delete cleanedGroup.sentence_completion;
        }
```

## Why This Fix is Needed:
The error "ReferenceError: instruction is not defined" happens because:
- Line 647 uses `${instruction}` variable
- But we removed the `instruction` variable definition earlier
- We're now using `convertSentenceCompletionToGapFilling()` function instead
- So all the old body-building code (lines 646-653) must be deleted

## After Fix:
The backend will receive:
```json
{
  "gap_filling": {
    "title": "Complete the sentences",
    "principle": "NMT_TWO_NUM",  // from dropdown
    "body": "<p>Sentence 1 with (1)</p>\n<p>Sentence 2 with (2)</p>"  // ONLY sentences!
  }
}
```
