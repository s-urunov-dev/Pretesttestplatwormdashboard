# 🚀 Quick Start Guide - Dynamic Question Group Form

## 📍 Access the Demo

```
Navigate to: /demo/dynamic-form
```

## ⚡ Quick Actions

### Add a Question Group
```
1. Click "Guruh Qo'shish" button
2. Fill in the form fields
3. Save when done
```

### Add Questions
```
In the "Savollar" textarea:
- Type one question per line
- Press Enter for new question
- Empty lines are auto-removed
- Count updates automatically
```

### Add Options
```
In the "Variantlar" textarea:
- Type one option per line
- Press Enter for new option
- Choose variant type (A/B/C or 1/2/3)
- Preview shows how they'll look
```

### Duplicate a Group
```
Click the Copy icon (📋) → Instant duplicate
```

### Delete a Group
```
Click the Trash icon (🗑️) → Confirm → Deleted
```

## 🎯 Example: Creating a Matching Question

```typescript
// Step 1: Add Group
Click "Guruh Qo'shish"

// Step 2: Set Range
Dan: 1
Gacha: 5

// Step 3: Add Instruction
"Match each heading with the correct paragraph"

// Step 4: Add Questions (5 questions = 5 paragraphs)
Paragraph A
Paragraph B
Paragraph C
Paragraph D
Paragraph E

// Step 5: Choose Variant Type
Select: "Rim (I, II, III...)"

// Step 6: Add Options (headings)
Introduction to the topic
Historical background
Current developments
Future predictions
Conclusion and summary

// Step 7: Set Answers Count
1 (each paragraph matches 1 heading)

// Step 8: Save
Click "Saqlash"
```

## ✅ Validation Checklist

Before saving, ensure:
- [ ] Dan > 0
- [ ] Gacha >= Dan
- [ ] At least 1 question added
- [ ] At least 1 option added
- [ ] Answers count > 0
- [ ] Answers count <= questions count

## 🎨 Visual Indicators

| Icon/Color | Meaning |
|------------|---------|
| 🟢 Green checkmark | Valid group |
| 🔴 Red alert icon | Has errors |
| 🔵 Blue badge | Question range |
| 🟦 Light blue badge | Question type |
| 🟢 Green badge | Questions count |
| 🟣 Purple badge | Options count |

## 💡 Pro Tips

1. **Use Enter key** - Add questions/options quickly by pressing Enter
2. **Check preview** - Options preview shows exactly how they'll appear
3. **Use duplicate** - Save time by copying similar groups
4. **Expand/collapse** - Click header to toggle group visibility
5. **Watch counts** - Badges update in real-time as you type

## 🐛 Common Issues

### Issue: Can't save
**Solution:** Check validation errors in red box

### Issue: Options not showing labels
**Solution:** Select a variant type first

### Issue: Questions count wrong
**Solution:** Remove empty lines from textarea

### Issue: Duplicate button not working
**Solution:** Make sure original group is valid first

## 📊 Data Structure

When you save, the data looks like this:

```json
{
  "id": "group-1234567890",
  "question_type": "Matching Headings",
  "from_value": 1,
  "to_value": 5,
  "instruction": "Match each heading...",
  "questions": [
    "Paragraph A",
    "Paragraph B",
    "Paragraph C"
  ],
  "options": [
    "Introduction",
    "Background",
    "Developments"
  ],
  "variant_type": "letter",
  "correct_answers_count": 1
}
```

## 🎯 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter (in textarea) | New line (new question/option) |
| Click header | Expand/collapse group |
| Tab | Navigate between fields |

## 📱 Responsive Design

Works on all screen sizes:
- 💻 Desktop - Full width layout
- 📱 Mobile - Stacked layout
- 📱 Tablet - Optimized spacing

## 🔗 Related Components

- `QuestionTypeSelector` - Select question type
- `ReadingQuestionForm` - Main reading form
- `AddQuestionPage` - Full question page

## 🎉 You're Ready!

Start creating dynamic question groups now! 🚀

Visit `/demo/dynamic-form` to try it out.
