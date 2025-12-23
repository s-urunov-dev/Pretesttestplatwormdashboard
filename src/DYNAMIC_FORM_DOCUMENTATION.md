# Dynamic Question Group Form - Complete Documentation

## 🎯 Overview

This is a fully dynamic and scalable form component designed for creating IELTS Reading test question groups. It allows admins to add unlimited questions and options through a clean, intuitive interface.

## 🚀 Demo URL

Visit: `/demo/dynamic-form`

## ✨ Key Features

### 1. **Dynamic Question Groups**
- ✅ Add unlimited question groups
- ✅ Each group is collapsible/expandable (accordion style)
- ✅ Duplicate existing groups with one click
- ✅ Delete groups with confirmation
- ✅ Auto-expand newly created groups

### 2. **Smart Range Management**
- ✅ Auto-calculated "Dan" (From) values
- ✅ When adding a new group, "Dan" automatically starts after the previous group's "Gacha"
- ✅ Validation: "Gacha" must be >= "Dan"

### 3. **Dynamic Questions Section**
- ✅ **One question per line** - just press Enter to add more
- ✅ **Auto-count** - displays how many questions are added
- ✅ **Auto-filtering** - empty lines are automatically removed
- ✅ **Real-time updates** - question count updates as you type
- ✅ Helper text with instructions

### 4. **Dynamic Options Section**
- ✅ **One option per line** - press Enter to add more
- ✅ **Auto-count** - displays how many options are added
- ✅ **Auto-filtering** - empty lines removed automatically
- ✅ **Smart labeling** - options labeled based on variant type
- ✅ **Live preview** - see how options will appear

### 5. **Variant Type System**
Three different labeling systems:

| Variant Type | Example Labels | Use Case |
|-------------|---------------|----------|
| **Alfibo** | A, B, C, D, E... | Standard multiple choice |
| **Raqam** | 1, 2, 3, 4, 5... | Numbered lists |
| **Rim** | I, II, III, IV, V... | Roman numerals |

### 6. **Live Validation**
Real-time validation with visual feedback:

- ❌ **Red border** - Group has errors
- ✅ **Green checkmark** - Group is valid
- ⚠️ **Alert icon** - Validation errors present

**Validated fields:**
- Range values (must be > 0)
- "Gacha" >= "Dan"
- At least one question required
- At least one option required
- Correct answers count <= questions count
- Correct answers count > 0

### 7. **Visual Feedback**

**Badges:**
- 🔵 **Range badge** - Shows Q1-5 format
- 🟦 **Question type badge** - Shows type name
- 🟢 **Questions count** - Shows number of questions
- 🟣 **Options count** - Shows number of options

**Statistics Panel:**
Each expanded group shows:
- Total questions count
- Total options count
- Question numbers range

### 8. **User Experience**

**Collapsible Groups:**
- Click anywhere on the header to expand/collapse
- Expanded groups show full form
- Collapsed groups show summary with badges

**Smart Actions:**
- 📋 **Duplicate** - Copy entire group with all data
- 🗑️ **Delete** - Remove with confirmation dialog
- 📊 **Auto-validation** - See errors before saving

**Helper Text:**
- Instructions for every field
- Tips in colored boxes
- Placeholder examples

## 📋 Component Structure

```typescript
interface QuestionGroup {
  id: string;                    // Unique identifier
  question_type: string;         // Type name (e.g., "Matching")
  from_value: number;            // Range start
  to_value: number;              // Range end
  instruction: string;           // Question instruction/title
  questions: string[];           // Array of questions
  options: string[];             // Array of options
  variant_type: VariantType;     // Labeling type
  correct_answers_count: number; // Number of correct answers
}

type VariantType = 'letter' | 'number' | 'roman';
```

## 🎨 UI/UX Design Principles

### Colors
- **Primary**: `#042d62` (Deep blue)
- **Accent**: Blue shades for focus states
- **Success**: Green for valid states
- **Error**: Red for validation errors
- **Info**: Purple for options
- **Warning**: Amber for instructions

### Spacing
- Consistent padding and margins
- Clear section separation
- Generous whitespace
- Grouped related fields

### Typography
- Clear labels with required indicators (*)
- Helper text in smaller font
- Monospace font for textarea inputs
- Bold text for important information

## 🔧 How to Use

### Step 1: Add a Group
```
Click "Guruh Qo'shish" button
```

### Step 2: Fill Range Values
```
Dan: 1
Gacha: 5
(This means questions 1-5)
```

### Step 3: Add Instruction (Optional)
```
Example: "Match each heading with the correct paragraph"
```

### Step 4: Add Questions
```
Type each question on a new line:
The role of government
The impact of technology
Environmental challenges
(3 questions added automatically)
```

### Step 5: Select Variant Type
```
Choose: Alfibo (A, B, C...)
or Raqam (1, 2, 3...)
or Rim (I, II, III...)
```

### Step 6: Add Options
```
Type each option on a new line:
Introduction to the topic
Historical background
Current developments
Future predictions
(4 options added automatically)
```

### Step 7: Set Answers Count
```
Enter: 1
(Each question will have 1 correct answer)
```

### Step 8: Save
```
Click "Saqlash" button
```

## 📊 Data Flow

1. **User types in textarea** → Text is split by newlines
2. **Array is created** → Empty lines filtered out
3. **Count is updated** → Badge shows new count
4. **Preview updates** → Options preview refreshes
5. **Validation runs** → Errors shown if any
6. **Save button enabled** → Only if all valid

## ✅ Validation Rules

### Range Validation
- `from_value > 0`
- `to_value > 0`
- `to_value >= from_value`

### Content Validation
- `questions.length >= 1`
- `options.length >= 1`
- `correct_answers_count > 0`
- `correct_answers_count <= questions.length`

### UI Validation
- Show errors in collapsed state (alert icon)
- Show detailed errors in expanded state (error box)
- Prevent invalid saves

## 🎯 Use Cases

### 1. Matching Headings
```
Questions: List of paragraphs (A, B, C, D...)
Options: List of headings (i, ii, iii, iv...)
Answers: 1 per question
```

### 2. Multiple Choice
```
Questions: List of questions
Options: A, B, C, D choices
Answers: 1 per question
```

### 3. True/False/Not Given
```
Questions: List of statements
Options: True, False, Not Given
Answers: 1 per question
```

### 4. Matching Features
```
Questions: List of items to match
Options: List of categories/features
Answers: 1+ per question (multiple matches allowed)
```

## 🚀 Advanced Features

### Auto-Duplication
```
Click copy icon → Entire group copied
→ New "Dan" value auto-calculated
→ All fields preserved
```

### Smart Deletion
```
Click trash icon → Confirmation dialog
→ If confirmed → Group removed
→ Remaining groups reorder automatically
```

### Live Preview
```
Type options → Preview updates instantly
→ Shows variant labels (A, B, C...)
→ Shows first 5 options
→ Shows "... and X more" if > 5
```

## 💡 Best Practices

### For Questions
- ✅ One question per line
- ✅ Keep questions concise
- ✅ Use clear language
- ❌ Don't add numbering (auto-added)
- ❌ Don't leave empty lines

### For Options
- ✅ One option per line
- ✅ Provide enough options
- ✅ Make options distinct
- ❌ Don't add labels (auto-added)
- ❌ Don't duplicate options

### For Validation
- ✅ Check range values
- ✅ Ensure questions match range
- ✅ Provide sufficient options
- ✅ Set realistic answers count

## 🐛 Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Dan va Gacha qiymatlari 0 dan katta bo'lishi kerak" | Range values are 0 or negative | Enter positive numbers |
| "Gacha qiymati Dan qiymatidan katta yoki teng bo'lishi kerak" | Invalid range | Make "Gacha" >= "Dan" |
| "Kamida bitta savol kiriting" | No questions added | Add at least one question |
| "Kamida bitta variant kiriting" | No options added | Add at least one option |
| "Javoblar soni savollar sonidan oshmasligi kerak" | Too many answers | Reduce answers count |
| "Javoblar soni 0 dan katta bo'lishi kerak" | No answers specified | Enter at least 1 |

## 🎨 Component Files

- **Component**: `/components/DynamicQuestionGroupForm.tsx`
- **Demo Page**: `/pages/DynamicFormDemo.tsx`
- **Route**: `/demo/dynamic-form`

## 🔄 Future Enhancements

Potential improvements:
- [ ] Drag-and-drop reordering
- [ ] Import questions from file
- [ ] Export to JSON/Excel
- [ ] Question templates
- [ ] Bulk edit mode
- [ ] Undo/redo functionality
- [ ] Auto-save drafts

## 📝 Notes

- This component is fully self-contained
- No external dependencies except Lucide icons
- State management using React useState
- TypeScript for type safety
- Responsive design included
- Accessible keyboard navigation

## 🎉 Conclusion

This Dynamic Question Group Form provides a complete solution for creating IELTS Reading test questions with:
- ✅ Unlimited scalability
- ✅ Real-time validation
- ✅ Intuitive UI/UX
- ✅ Smart auto-calculations
- ✅ Clean, professional design

Perfect for IELTS admin panels! 🚀
