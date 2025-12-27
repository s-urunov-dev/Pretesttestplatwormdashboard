# 🔄 Diagram Chart API - Yangilanish (24.12.2024)

## ⚠️ MUHIM O'ZGARISH

Backend'da DiagramChart API yangilandi. Endi `gap_filling` ID kerak!

---

## 📊 Eski vs Yangi

### ❌ Eski (ishlamaydi)
```typescript
await createDiagramChart(imageFile, groupId);
```

### ✅ Yangi (joriy)
```typescript
await createDiagramChart(imageFile, gapFillingId);
```

---

## 🔗 API Requests

### 1. Create DiagramChart
```javascript
POST /api/v1/reading/diagram-chart/

FormData:
  - image: File
  - gap_filling: number  // ✅ REQUIRED!

Response:
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/flowchart.png",
  "gap_filling": 456,
  "created_at": "2024-12-24T12:00:00Z"
}
```

### 2. Get DiagramChart
```javascript
GET /api/v1/reading/diagram-chart/{id}/

Response:
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/flowchart.png",
  "gap_filling": 456,
  "created_at": "2024-12-24T12:00:00Z"
}
```

### 3. Update DiagramChart
```javascript
PATCH /api/v1/reading/diagram-chart/{id}/

FormData:
  - image: File

Response:
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/updated.png",
  "gap_filling": 456,
  "updated_at": "2024-12-24T13:00:00Z"
}
```

---

## 💻 Frontend Implementation

### Create Passage bilan Diagram Chart

```typescript
// Step 1: Passage yaratish
const createdPassage = await createReadingPassage({
  reading: readingId,
  passage_type: 'passage1',
  title: 'Title',
  body: 'Body',
  groups: [{
    question_type: 'flowchart_completion',
    from_value: 1,
    to_value: 5,
    gap_filling: {
      title: 'Complete the flowchart',
      principle: 'ONE_WORD',
      body: 'Text...'
      // diagram_chart ni qo'shmang!
    }
  }]
});

// Step 2: Gap Filling ID olish
const gapFillingId = createdPassage.groups[0].gap_filling.id;

// Step 3: Diagram chart yuklash
const imageFile = base64ToFile(base64Image, 'flowchart.png');
const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);

// Step 4: Yaratilgan diagram_chart objectni retrieve qilish
const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
console.log('Created diagram chart:', retrievedDiagramChart);
// {
//   id: 123,
//   image: "https://api.samariddin.space/media/diagrams/flowchart.png",
//   gap_filling: 456,
//   created_at: "2024-12-24T12:00:00Z"
// }
```

### Update Passage bilan Diagram Chart

```typescript
// Step 1: Eski ma'lumotlarni tekshirish
const existingResponse = await fetch(`/reading-pasage-update/${id}/`);
const existingData = await existingResponse.json();
const existingDiagramChartId = existingData.groups[0]?.gap_filling?.diagram_chart?.id;

// Step 2: Passage yangilash
const updatedPassage = await updateReadingPassage(id, {
  title: 'Updated',
  body: 'Updated',
  groups: [...]
});

// Step 3: Rasm yangilash yoki yaratish
if (newImageUploaded) {
  const imageFile = base64ToFile(base64Image, 'flowchart.png');
  
  if (existingDiagramChartId) {
    // Mavjud rasm'ni yangilash
    const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
    
    // Retrieve updated diagram_chart
    const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
    console.log('Updated diagram chart:', retrievedDiagramChart);
  } else {
    // Yangi rasm yuklash
    const gapFillingId = updatedPassage.groups[0].gap_filling.id;
    const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
    
    // Retrieve created diagram_chart
    const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
    console.log('Created diagram chart:', retrievedDiagramChart);
  }
}
```

---

## 🗂️ Database Structure

```
Passage
  └─ Group
      └─ GapFilling ← DiagramChart shu yerga bog'langan!
          └─ DiagramChart
              └─ image: File
```

---

## 🐛 Console Logs

### Create (Yangi)
```
🔄 Creating reading passage: {...}
📡 Passage response status: 201
✅ Reading passage created: {...}
📸 Uploading diagram_chart for group 0...
🔄 Creating diagram chart: diagram_chart_0.png for gap_filling: 123
📡 DiagramChart response status: 201
✅ DiagramChart created: {...}
✅ Diagram chart uploaded for group 0
🔄 Getting diagram chart: 123
📡 DiagramChart GET response status: 200
✅ DiagramChart retrieved: {id: 123, image: "...", gap_filling: 456}
✅ Diagram chart retrieved for group 0
```

### Update (Yangi)
```
🔄 Updating reading passage: {...}
📋 Existing groups: [...]
📡 Update response status: 200
✅ Reading passage updated: {...}
📸 Updating diagram_chart for group 0...
🔄 Updating diagram chart: 456
📡 DiagramChart update response status: 200
✅ DiagramChart updated: {...}
✅ Diagram chart updated for group 0
🔄 Getting diagram chart: 456
📡 DiagramChart GET response status: 200
✅ DiagramChart retrieved: {id: 456, image: "...", gap_filling: 789}
✅ Diagram chart retrieved for group 0
```

### Error (Gap Filling ID topilmasa)
```
⚠️ Gap filling ID not found for group 0
```

---

## ✅ O'zgarishlar

### `/lib/api-cleaned.ts`

#### 1. createDiagramChart() - Yangilandi
```typescript
// OLD
export async function createDiagramChart(
  imageFile: File, 
  groupId?: number  // ❌ Optional group ID
): Promise<any>

// NEW
export async function createDiagramChart(
  imageFile: File, 
  gapFillingId: number  // ✅ Required gap_filling ID
): Promise<any>
```

#### 2. getDiagramChart() - Yangi funksiya!
```typescript
// ✅ NEW
export async function getDiagramChart(
  id: number
): Promise<any> {
  const response = await fetch(`${BASE_URL}/reading/diagram-chart/${id}/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
}
```

#### 3. createReadingPassage() - Yangilandi
```typescript
// OLD
const createdGroupId = createdPassage.groups[i].id;
await createDiagramChart(imageFile, createdGroupId);

// NEW - 3 step workflow
const gapFillingId = createdPassage.groups[i].gap_filling.id;
if (gapFillingId) {
  // Step 1: Create diagram chart
  const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
  
  // Step 2: Retrieve created diagram chart
  const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
  console.log('Created diagram chart:', retrievedDiagramChart);
} else {
  console.warn('⚠️ Gap filling ID not found');
}
```

#### 4. updateReadingPassage() - Yangilandi
```typescript
// OLD
const createdGroupId = updatedPassage.groups[i].id;
await createDiagramChart(imageFile, createdGroupId);

// NEW - Update existing or create new
if (existingDiagramChartId) {
  // Update existing
  const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
  const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
  console.log('Updated diagram chart:', retrievedDiagramChart);
} else {
  // Create new
  const gapFillingId = updatedPassage.groups[i].gap_filling.id;
  const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
  const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
  console.log('Created diagram chart:', retrievedDiagramChart);
}
```

---

## 📚 To'liq Dokumentatsiya

- `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md` - Batafsil implementation
- `/BACKEND_API_INTEGRATION_GUIDE.md` - Barcha API'lar uchun qo'llanma

---

**Yangilanish sanasi:** 24 Dekabr 2024  
**Sabab:** Backend'da gap_filling serializer DiagramChart'ga qo'shildi  
**Status:** ✅ Frontend to'liq yangilandi
