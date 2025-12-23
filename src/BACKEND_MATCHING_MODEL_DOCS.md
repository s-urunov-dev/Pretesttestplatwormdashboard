# 🎯 Backend-Mapped Dynamic Matching Form - Complete Documentation

## 📋 Overview

This form component is **specifically designed** to match your backend `matching_item` model with:
- Individual input fields for each statement and option
- Automatic key generation for options (A, B, C... or 1, 2, 3...)
- Direct array-to-backend mapping
- Perfect JSON output structure

## 🔗 Demo URL

**Main Demo:** `/demo/matching-group`

## 🏗️ Backend Model Structure

### Expected JSON Output

```json
{
  "matching_item": {
    "title": "Match each heading with the correct paragraph",
    "statement": [
      "Paragraph A talks about history",
      "Paragraph B discusses current trends",
      "Paragraph C analyzes future predictions"
    ],
    "option": [
      { "A": "Historical background" },
      { "B": "Current developments" },
      { "C": "Future outlook" },
      { "D": "Introduction to topic" }
    ],
    "variant_type": "letter",
    "answer_count": 1
  }
}
```

### Field Specifications

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `title` | `string` | Question instruction/header | "Match each sentence ending..." |
| `statement` | `string[]` | Array of statements | `["Statement 1", "Statement 2"]` |
| `option` | `object[]` | Array of key-value objects | `[{ "A": "text" }, { "B": "text" }]` |
| `variant_type` | `"letter" \| "number" \| "romain"` | Label type for options | `"letter"` |
| `answer_count` | `number` | Answers per statement | `1` |

## 🎨 Component File

**Location:** `/components/DynamicMatchingGroupForm.tsx`

### Props

```typescript
interface DynamicMatchingGroupFormProps {
  questionTypeName?: string;        // Display name for question type
  onSave?: (groups: QuestionGroup[]) => void;  // Callback when saving
}
```

### Usage

```tsx
import { DynamicMatchingGroupForm } from './components/DynamicMatchingGroupForm';

function MyPage() {
  const handleSave = (groups) => {
    console.log('Saved data:', groups);
    // Send to backend
  };

  return (
    <DynamicMatchingGroupForm 
      questionTypeName="Matching Headings"
      onSave={handleSave}
    />
  );
}
```

## 🔑 Key Features

### 1. Individual Input Fields

**Statements Section:**
- Each statement is a **separate text input**
- "+ Add Statement" button to add new items
- Remove (×) button appears on hover
- Index numbers (1, 2, 3...) auto-displayed

**Options Section:**
- Each option is a **separate text input**
- "+ Add Option" button to add new items
- Remove (×) button appears on hover
- Auto-generated labels (A, B, C... or 1, 2, 3... or I, II, III...)

### 2. Dynamic Label Generation

**Variant Types:**

| Type | Label Format | Example Output |
|------|-------------|----------------|
| `letter` | A, B, C, D... | `[{ "A": "..." }, { "B": "..." }]` |
| `number` | 1, 2, 3, 4... | `[{ "1": "..." }, { "2": "..." }]` |
| `romain` | I, II, III, IV... | `[{ "I": "..." }, { "II": "..." }]` |

**Behavior:**
- When variant type changes, ALL option labels regenerate automatically
- Option values remain unchanged
- Backend JSON keys update to match new variant type

### 3. State Management

```typescript
// Internal UI state (with IDs for React keys)
const [statementsById, setStatementsById] = useState<Record<string, Array<{id: string, value: string}>>>({});
const [optionsById, setOptionsById] = useState<Record<string, OptionItem[]>>({});

// Backend-ready state
interface QuestionGroup {
  id: string;
  question_type: string;
  from_value: number;
  to_value: number;
  matching_item: {
    title: string;
    statement: string[];              // ✅ Direct backend mapping
    option: Record<string, string>[]; // ✅ Direct backend mapping
    variant_type: VariantType;
    answer_count: number;
  };
}
```

### 4. Data Flow

```
User Input → Internal State (with IDs) → Backend State (arrays) → JSON Output
```

**Example Flow:**

1. User adds statement "Climate change is real"
   ```typescript
   // Internal state
   { id: "stmt-123", value: "Climate change is real" }
   ```

2. Component updates backend state
   ```typescript
   // Backend state
   statement: ["Climate change is real"]
   ```

3. On save, generates JSON
   ```json
   {
     "matching_item": {
       "statement": ["Climate change is real"],
       ...
     }
   }
   ```

## 📊 UI Structure

### Question Group Card

```
┌─────────────────────────────────────────────┐
│ ▼ Guruh 1  [Q1-5] [Matching Headings]  🗑️  │ ← Header (collapsible)
├─────────────────────────────────────────────┤
│                                             │
│ Dan: [1]           Gacha: [5]              │ ← Range inputs
│                                             │
│ Savol sarlavhasi: [Match each...]          │ ← Title/instruction
│                                             │
│ Savollar (Statements) *        [3 ta]      │
│ 1. [Statement 1 text input]          ×    │
│ 2. [Statement 2 text input]          ×    │
│ 3. [Statement 3 text input]          ×    │
│ [+ Add Statement]                          │
│                                             │
│ Variant Turi: [Harf (A, B, C) ▼]          │ ← Dropdown
│                                             │
│ Variantlar (Options) *         [4 ta]      │
│ A. [Option A text input]             ×    │
│ B. [Option B text input]             ×    │
│ C. [Option C text input]             ×    │
│ D. [Option D text input]             ×    │
│ [+ Add Option]                             │
│                                             │
│ Javoblar soni: [1]                         │ ← Number input
│                                             │
│ [3 Statements] [4 Options] [5 Questions]   │ ← Statistics
└─────────────────────────────────────────────┘
```

## 🎯 User Interactions

### Adding Items

**Add Statement:**
1. Click "+ Add Statement" button
2. New empty input appears at bottom
3. Type statement text
4. Statement auto-saves to backend array

**Add Option:**
1. Click "+ Add Option" button
2. New empty input with auto-label appears
3. Type option text
4. Option auto-saves to backend array with key

### Removing Items

**Remove Statement:**
1. Hover over statement input
2. Click × button that appears
3. Statement removed from UI and backend array
4. Numbers reindex automatically

**Remove Option:**
1. Hover over option input
2. Click × button that appears
3. Option removed from UI and backend array
4. Labels regenerate (A, B, C → A, B if C removed)

### Changing Variant Type

1. Select new variant type from dropdown
2. All option labels regenerate automatically
3. Option values remain unchanged
4. Backend JSON keys update

**Example:**
```
Before (letter):  A. History  B. Current  C. Future
After (number):   1. History  2. Current  3. Future
```

## ✅ Validation Rules

### Required Fields
- ✅ `from_value > 0`
- ✅ `to_value >= from_value`
- ✅ At least 1 statement
- ✅ At least 1 option
- ✅ `answer_count > 0`
- ✅ `answer_count <= statement.length`

### Visual Feedback
- 🔴 **Red alert icon** - Has validation errors
- 🟢 **Green checkmark** - All fields valid
- 📊 **Badges** - Show counts in real-time
- 📝 **Error box** - Lists specific errors when expanded

## 🔄 Data Transformation

### Frontend → Backend

**Input (UI State):**
```typescript
statementsById: {
  "group-123": [
    { id: "stmt-1", value: "Climate change" },
    { id: "stmt-2", value: "Global warming" }
  ]
}

optionsById: {
  "group-123": [
    { id: "opt-1", value: "Natural phenomenon" },
    { id: "opt-2", value: "Human-caused issue" }
  ]
}
```

**Output (Backend JSON):**
```json
{
  "matching_item": {
    "statement": [
      "Climate change",
      "Global warming"
    ],
    "option": [
      { "A": "Natural phenomenon" },
      { "B": "Human-caused issue" }
    ],
    "variant_type": "letter",
    "answer_count": 1
  }
}
```

## 🎨 Styling & UX

### Colors
- **Primary:** `#042d62` - Main actions
- **Green:** Statements and success
- **Purple:** Options and variants
- **Blue:** Information
- **Red:** Errors and delete actions

### Animations
- Fade-in when adding new items
- Opacity transition for remove buttons
- Smooth expand/collapse for groups

### Responsive Design
- Full width on desktop
- Stacked layout on mobile
- Touch-friendly buttons
- Proper spacing for all screens

## 💡 Best Practices

### For Developers

1. **Always validate before save:**
   ```typescript
   const errors = validateGroup(group);
   if (errors.length > 0) {
     // Handle errors
   }
   ```

2. **Filter empty values:**
   ```typescript
   statement: statements.filter(s => s.trim().length > 0)
   ```

3. **Regenerate keys on variant change:**
   ```typescript
   option: options.map((val, idx) => ({
     [getVariantLabel(idx, variantType)]: val
   }))
   ```

### For Users

1. ✅ Add statements first, then options
2. ✅ Choose variant type before adding many options
3. ✅ Provide more options than statements (IELTS standard)
4. ✅ Use clear, concise statement text
5. ✅ Test with different variant types

## 🚀 Integration Example

### With Backend API

```typescript
import { DynamicMatchingGroupForm } from './components/DynamicMatchingGroupForm';

function ReadingQuestionPage() {
  const handleSave = async (groups) => {
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups })
      });
      
      if (response.ok) {
        alert('✅ Questions saved successfully!');
      }
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  return (
    <div className="container">
      <h1>Create Reading Questions</h1>
      <DynamicMatchingGroupForm onSave={handleSave} />
    </div>
  );
}
```

### Backend Endpoint (Example)

```python
# Python/Django example
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def save_questions(request):
    groups = request.data.get('groups', [])
    
    for group in groups:
        matching_item = group['matching_item']
        
        # Access backend fields directly
        title = matching_item['title']
        statements = matching_item['statement']  # Array of strings
        options = matching_item['option']        # Array of objects
        variant_type = matching_item['variant_type']
        answer_count = matching_item['answer_count']
        
        # Save to database
        QuestionGroup.objects.create(
            question_type=group['question_type'],
            from_value=group['from_value'],
            to_value=group['to_value'],
            matching_item=matching_item
        )
    
    return Response({'status': 'success'})
```

## 🐛 Troubleshooting

### Issue: Options not showing labels
**Solution:** Make sure variant_type is set (defaults to 'letter')

### Issue: Empty items in backend array
**Solution:** Component automatically filters empty values on save

### Issue: Labels wrong after variant change
**Solution:** Labels regenerate automatically - check console for errors

### Issue: Can't remove last item
**Solution:** This is intentional - at least 1 statement and 1 option required

## 📝 Differences from Textarea Version

| Feature | Textarea Version | Individual Inputs Version |
|---------|------------------|---------------------------|
| Input method | One textarea for all | Separate input per item |
| Add items | Press Enter | Click "+ Add" button |
| Remove items | Delete line | Click × button |
| Visual feedback | Line count | Individual items + badges |
| Backend mapping | Parse string | Direct array |
| User experience | Simple but limited | More control, cleaner |

## 🎉 Summary

This component provides:
- ✅ **Perfect backend match** - JSON output matches your model exactly
- ✅ **Individual control** - Each statement/option is separate
- ✅ **Auto-labeling** - Options labeled automatically (A/B/C or 1/2/3)
- ✅ **Real-time validation** - Errors shown immediately
- ✅ **Clean UX** - Intuitive add/remove with smooth animations
- ✅ **Production-ready** - Tested and fully functional

**Perfect for IELTS admin panels with matching question types!** 🚀
