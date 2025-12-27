# 🔗 Backend API Integration Guide

Bu qo'llanma IELTS Admin Panel frontend'i backend API'lari bilan qanday ishlashini tushuntiradi.

## 📋 Mundarija

1. [Reading Section APIs](#reading-section-apis)
2. [Listening Section APIs](#listening-section-apis)
3. [Writing Section APIs](#writing-section-apis)
4. [Diagram Chart API](#diagram-chart-api)
5. [Error Handling](#error-handling)

---

## 🔵 Reading Section APIs

### 1. Create Reading Passage

**Endpoint:** `POST /api/v1/reading-pasage-create/`

**Request Body (JSON):**
```json
{
  "reading": 1,
  "passage_type": "passage1",
  "title": "Climate Change",
  "body": "Climate change is...",
  "groups": [
    {
      "question_type": "multiple_choice",
      "from_value": 1,
      "to_value": 5,
      "identify_info": {
        "title": "Choose the correct answer",
        "question": ["Question 1?", "Question 2?"]
      }
    }
  ]
}
```

**Response:**
```json
{
  "id": 123,
  "reading": 1,
  "passage_type": "passage1",
  "title": "Climate Change",
  "body": "Climate change is...",
  "groups": [
    {
      "id": 456,
      "question_type": "multiple_choice",
      "from_value": 1,
      "to_value": 5,
      ...
    }
  ],
  "created_at": "2024-12-24T12:00:00Z"
}
```

**Frontend funksiya:**
```typescript
import { createReadingPassage } from './lib/api-cleaned';

const data = {
  reading: readingId,
  passage_type: 'passage1',
  title: 'Title',
  body: 'Body text',
  groups: [...]
};

await createReadingPassage(data);
```

---

### 2. Update Reading Passage

**Endpoint:** `PATCH /api/v1/reading-pasage-update/{id}/`

**Request Body (JSON):**
```json
{
  "title": "Updated Title",
  "body": "Updated body...",
  "groups": [...]
}
```

**Frontend funksiya:**
```typescript
import { updateReadingPassage } from './lib/api-cleaned';

await updateReadingPassage(passageId, {
  title: 'Updated Title',
  body: 'Updated body',
  groups: [...]
});
```

---

### 3. Get Reading Passages

**Endpoint:** `GET /api/v1/readings/{reading_id}/passages/`

**Response:**
```json
[
  {
    "id": 1,
    "passage_type": "passage1",
    "title": "Title",
    "body": "Body",
    "groups": [...]
  },
  ...
]
```

**Frontend funksiya:**
```typescript
import { getReadingPassages } from './lib/api-cleaned';

const passages = await getReadingPassages(readingId);
```

---

### 4. Question Types

Backend'dan mavjud savol turlarini olish:

**Endpoint:** `GET /api/v1/reading-question-types/`

**Response:**
```json
[
  { "id": 1, "type": "multiple_choice" },
  { "id": 2, "type": "true_false_not_given" },
  { "id": 3, "type": "matching_headings" },
  ...
]
```

**Frontend funksiya:**
```typescript
import { getReadingQuestionTypes } from './lib/api-cleaned';

const types = await getReadingQuestionTypes();
```

---

## 🎧 Listening Section APIs

### 1. Create Listening Part

**Endpoint:** `POST /api/v1/listening-part-create/`

**Request Body (FormData yoki JSON):**

**Agar audio file yuklansa (FormData):**
```javascript
const formData = new FormData();
formData.append('listening', listeningId);
formData.append('part_type', 'part_1');
formData.append('audio', audioFile);
formData.append('groups', JSON.stringify(groups));
```

**Agar audio URL bo'lsa (JSON):**
```json
{
  "listening": 1,
  "part_type": "part_1",
  "audio": "https://example.com/audio.mp3",
  "groups": [...]
}
```

**Frontend funksiya:**
```typescript
import { createListeningPartWithQuestions } from './lib/api-cleaned';

await createListeningPartWithQuestions({
  listening: listeningId,
  part_type: 'part_1',
  audio: audioUrl,
  groups: [...]
});
```

---

### 2. Get Listening Parts

**Endpoint:** `GET /api/v1/listenings/{listening_id}/`

**Response:**
```json
{
  "id": 1,
  "parts": [
    {
      "id": 1,
      "part_type": "part_1",
      "audio": "https://...",
      "groups": [...]
    },
    ...
  ]
}
```

**Frontend funksiya:**
```typescript
import { getListening } from './lib/api-cleaned';

const listening = await getListening(listeningId);
const parts = listening.parts;
```

---

## ✍️ Writing Section APIs

### 1. Create Writing Task

**Endpoint:** `POST /api/v1/writing-question-create/`

**Task 1 (with image) - FormData:**
```javascript
const formData = new FormData();
formData.append('test_id', testId);
formData.append('type', 'task1');
formData.append('question', 'Describe the chart...');
formData.append('image', imageFile);
```

**Task 2 (essay) - JSON:**
```json
{
  "test_id": 1,
  "type": "task2",
  "question": "Some people believe...",
  "image": null
}
```

**Frontend funksiya:**
```typescript
import { createWritingTask } from './lib/api-cleaned';

// Task 1 with image
await createWritingTask({
  test_id: testId,
  type: 'task1',
  question: 'Describe...',
  image: imageFile  // File object
});

// Task 2 without image
await createWritingTask({
  test_id: testId,
  type: 'task2',
  question: 'Essay prompt...',
  image: null
});
```

---

## 🖼️ Diagram Chart API

### Yangi Alohida API (2024-12-24)

Flowchart Completion va Diagram Labeling uchun rasmlar endi alohida API orqali yuboriladi.

⚠️ **MUHIM:** DiagramChart endi `gap_filling` modeliga bog'langan!

### Database Structure
```
Passage → Group → GapFilling → DiagramChart
```

### 1. Create Diagram Chart

**Endpoint:** `POST /api/v1/reading/diagram-chart/`

**Request (FormData):**
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('gap_filling', gapFillingId);  // ✅ REQUIRED!
```

**Response:**
```json
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/image.png",
  "gap_filling": 456,
  "created_at": "2024-12-24T12:00:00Z"
}
```

**Frontend funksiya:**
```typescript
import { createDiagramChart } from './lib/api-cleaned';

// ✅ gap_filling ID kerak!
const gapFillingId = createdPassage.groups[0].gap_filling.id;
const result = await createDiagramChart(imageFile, gapFillingId);
console.log('Uploaded image URL:', result.image);
```

---

### 2. Get Diagram Chart (NEW!)

**Endpoint:** `GET /api/v1/reading/diagram-chart/{id}/`

**Request:**
```javascript
// No body needed
GET /api/v1/reading/diagram-chart/123/

Headers:
  Content-Type: application/json
```

**Response:**
```json
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/flowchart.png",
  "gap_filling": 456,
  "created_at": "2024-12-24T12:00:00Z"
}
```

**Frontend funksiya:**
```typescript
import { getDiagramChart } from './lib/api-cleaned';

const diagramChart = await getDiagramChart(123);
console.log('Diagram chart:', diagramChart);
```

---

### 3. Update Diagram Chart

**Endpoint:** `PATCH /api/v1/reading/diagram-chart/{id}/`

**Request (FormData):**
```javascript
const formData = new FormData();
formData.append('image', newImageFile);
```

**Response:**
```json
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/updated.png",
  "gap_filling": 456,
  "updated_at": "2024-12-24T13:00:00Z"
}
```

**Frontend funksiya:**
```typescript
import { updateDiagramChart } from './lib/api-cleaned';

const result = await updateDiagramChart(diagramChartId, newImageFile);
```

---

### 4. Diagram Chart Workflow

**Create Reading Passage bilan Diagram Chart:**

```typescript
// Step 1: Passage yaratish (rasm'siz)
const passageData = {
  reading: readingId,
  passage_type: 'passage1',
  title: 'Title',
  body: 'Body',
  groups: [
    {
      question_type: 'flowchart_completion',
      from_value: 1,
      to_value: 5,
      gap_filling: {
        title: 'Complete the flowchart',
        principle: 'ONE_WORD',
        body: 'Flowchart text...'
        // diagram_chart ni qo'shmang!
      }
    }
  ]
};

const createdPassage = await createReadingPassage(passageData);

// Step 2: Diagram chart rasmini alohida yuklash
const imageFile = base64ToFile(base64Image, 'flowchart.png');

// ✅ MUHIM: Gap Filling ID kerak!
const gapFillingId = createdPassage.groups[0].gap_filling.id;

const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);

// Step 3: ✅ YANGI! Retrieve created diagram chart
const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
console.log('Created diagram chart:', retrievedDiagramChart);

// ✅ To'liq!
```

**Update Reading Passage bilan Diagram Chart:**

```typescript
// Step 1: Eski ma'lumotlarni olish
const existingPassage = await getReadingPassage(passageId);
const existingDiagramChartId = existingPassage.groups[0]?.gap_filling?.diagram_chart?.id;

// Step 2: Passage yangilash (rasm'siz)
const updatedPassage = await updateReadingPassage(passageId, {
  title: 'Updated Title',
  body: 'Updated body',
  groups: [...]
});

// Step 3: Diagram chart yangilash yoki yaratish
if (newImageUploaded) {
  const imageFile = base64ToFile(base64Image, 'flowchart.png');
  
  if (existingDiagramChartId) {
    // Mavjud rasm'ni yangilash
    const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
    
    // ✅ YANGI! Retrieve updated diagram chart
    const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
    console.log('Updated diagram chart:', retrievedDiagramChart);
  } else {
    // Yangi rasm yuklash
    // ✅ MUHIM: Gap Filling ID kerak!
    const gapFillingId = updatedPassage.groups[0].gap_filling.id;
    
    const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
    
    // ✅ YANGI! Retrieve created diagram chart
    const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
    console.log('Created diagram chart:', retrievedDiagramChart);
  }
}

// ✅ To'liq!
```

---

## ⚠️ Error Handling

### 1. Network Errors

```typescript
try {
  await createReadingPassage(data);
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    // Internet aloqasi yo'q
    showError('Internet aloqasini tekshiring');
  } else {
    // Boshqa xatolik
    showError(error.message);
  }
}
```

---

### 2. Validation Errors

Backend validation xatoliklari:

```json
{
  "reading": ["This field is required."],
  "groups": [
    {
      "from_value": ["Ensure this value is greater than 0."]
    }
  ]
}
```

Frontend'da ko'rsatish:

```typescript
try {
  await createReadingPassage(data);
} catch (error) {
  const errorMessage = error.message;
  
  // Parse backend error
  try {
    const errorJson = JSON.parse(errorMessage);
    
    // Ko'rsatish
    Object.keys(errorJson).forEach(field => {
      showFieldError(field, errorJson[field]);
    });
  } catch {
    // Generic error
    showError(errorMessage);
  }
}
```

---

### 3. HTTP Status Codes

| Status | Ma'nosi | Amal |
|--------|---------|------|
| 200 | OK | Success |
| 201 | Created | Yangi ma'lumot yaratildi |
| 400 | Bad Request | Validation xatoligi |
| 401 | Unauthorized | Login kerak |
| 404 | Not Found | Ma'lumot topilmadi |
| 500 | Server Error | Backend xatoligi |

---

## 📊 Question Type Data Structures

### 1. Multiple Choice (identify_info)

```typescript
{
  question_type: "multiple_choice",
  from_value: 1,
  to_value: 5,
  identify_info: {
    title: "Choose the correct answer",
    question: [
      "What is the main idea?",
      "What does the author suggest?"
    ]
  }
}
```

---

### 2. True/False/Not Given (identify_info)

```typescript
{
  question_type: "true_false_not_given",
  from_value: 1,
  to_value: 5,
  identify_info: {
    title: "Do the following statements agree...",
    question: [
      "The author mentions climate change.",
      "Scientists agree on the solution."
    ]
  }
}
```

---

### 3. Matching Headings (matching_item)

```typescript
{
  question_type: "matching_headings",
  from_value: 1,
  to_value: 5,
  matching_item: {
    title: "Choose the correct heading...",
    statement: [
      "Paragraph A",
      "Paragraph B",
      "Paragraph C"
    ],
    option: [
      ["Introduction", "History"],
      ["Current trends", "Future predictions"]
    ],
    variant_type: "romain",
    answer_count: 1
  }
}
```

---

### 4. Sentence Completion (gap_filling)

```typescript
{
  question_type: "sentence_completion",
  from_value: 1,
  to_value: 5,
  gap_filling: {
    title: "Complete the sentences",
    principle: "NMT_TWO",
    body: "1. The experiment was conducted in ___.\n2. Scientists discovered ___."
  }
}
```

---

### 5. Summary Completion (gap_filling)

```typescript
{
  question_type: "summary_completion",
  from_value: 1,
  to_value: 5,
  gap_filling: {
    title: "Complete the summary",
    principle: "ONE_WORD",
    body: "Climate change affects (1)___ and causes (2)___."
  }
}
```

---

### 6. Table Completion (gap_filling)

```typescript
{
  question_type: "table_completion",
  from_value: 1,
  to_value: 5,
  gap_filling: {
    title: "Complete the table",
    principle: "NMT_TWO",
    body: JSON.stringify({
      instruction: "Complete using NO MORE THAN TWO WORDS",
      rows: [
        [
          { type: "text", content: "Activity", isAnswer: false },
          { type: "text", content: "Age", isAnswer: false }
        ],
        [
          { type: "text", content: "Swimming", isAnswer: false },
          { type: "answer", content: "", isAnswer: true }
        ]
      ]
    })
  }
}
```

---

### 7. Flowchart Completion (gap_filling + diagram_chart)

```typescript
// Step 1: Passage yaratish
{
  question_type: "flowchart_completion",
  from_value: 1,
  to_value: 5,
  gap_filling: {
    title: "Complete the flowchart",
    principle: "ONE_WORD",
    body: "Step 1: (1)___\nStep 2: (2)___"
    // diagram_chart ni bu yerga qo'shmang!
  }
}

// Step 2: Alohida diagram_chart yaratish
await createDiagramChart(imageFile, groupId);
```

---

### 8. Diagram Labeling (gap_filling + diagram_chart)

```typescript
// Flowchart Completion bilan bir xil
{
  question_type: "diagram_labeling",
  from_value: 1,
  to_value: 5,
  gap_filling: {
    title: "Label the diagram",
    principle: "ONE_WORD_OR_NUMBER",
    body: "Part A: (1)___\nPart B: (2)___"
  }
}

// Rasm alohida
await createDiagramChart(imageFile, groupId);
```

---

### 9. Short Answer Questions (gap_filling)

```typescript
{
  question_type: "short_answer",
  from_value: 1,
  to_value: 5,
  gap_filling: {
    title: "Answer the questions",
    principle: "NMT_THREE",
    body: "1. What is the main cause?\n2. Where did it happen?"
  }
}
```

---

## 🔐 Authentication

Hozirda authentication yo'q, lekin kelajakda qo'shilishi mumkin:

```typescript
// Token bilan request
const response = await fetch(`${BASE_URL}/endpoint/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
});
```

---

## 🌐 Base URL

```typescript
// /lib/api-cleaned.ts
export const BASE_URL = 'https://api.samariddin.space/api/v1';
```

Agar backend URL o'zgarsa, faqat `BASE_URL` ni yangilash kerak.

---

## 📚 Boshqa Dokumentatsiyalar

- **Diagram Chart API:** `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md`
- **Table Completion:** `/TABLE_COMPLETION_GUIDE.md`
- **Reading Question Types:** `/QUICK_START_GUIDE.md`

---

**Yangilanish sanasi:** 24 Dekabr 2024
