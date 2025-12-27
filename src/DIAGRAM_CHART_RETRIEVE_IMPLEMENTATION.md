# 🔄 Diagram Chart - Retrieve Implementation

## 📌 Yangi Qo'shildi

Backend'ga POST/PATCH so'rov yuborilgandan keyin **yaratilgan yoki yangilangan diagram_chart objectni retrieve qilish** funksiyasi qo'shildi.

---

## 🎯 Nima uchun kerak?

### Muammo

```typescript
// ❌ ESKI: Faqat yuklash
const result = await createDiagramChart(imageFile, gapFillingId);
// result = { id: 123, image: "...", gap_filling: 456 }
// Lekin bu data frontend'da saqlanmagan!
```

### Yechim

```typescript
// ✅ YANGI: Yuklash va retrieve qilish
const result = await createDiagramChart(imageFile, gapFillingId);
const retrievedDiagramChart = await getDiagramChart(result.id);

// Endi diagram_chart to'liq ma'lumotlar bilan
console.log(retrievedDiagramChart);
// {
//   id: 123,
//   image: "https://api.samariddin.space/media/diagrams/flowchart.png",
//   gap_filling: 456,
//   created_at: "2024-12-24T12:00:00Z"
// }
```

---

## 🆕 Yangi API Funksiya

### `getDiagramChart(id: number)`

```typescript
export async function getDiagramChart(id: number): Promise<any> {
  const response = await fetch(`${BASE_URL}/reading/diagram-chart/${id}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get diagram chart: ${response.status}`);
  }

  const result = await response.json();
  return result;
}
```

**Parametrlar:**
- `id`: Diagram chart ID raqami

**Returns:**
```json
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/flowchart.png",
  "gap_filling": 456,
  "created_at": "2024-12-24T12:00:00Z"
}
```

---

## 📊 Yangi Workflow

### Create Passage with Diagram Chart

```typescript
// Step 1: Passage yaratish
const createdPassage = await createReadingPassage(data);

// Step 2: Gap Filling ID olish
const gapFillingId = createdPassage.groups[0].gap_filling.id;

// Step 3: Diagram chart yuklash
const imageFile = base64ToFile(base64Image, 'flowchart.png');
const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);

// Step 4: ✅ YANGI! Diagram chart'ni retrieve qilish
if (diagramChartResult?.id) {
  const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
  console.log('Created diagram chart:', retrievedDiagramChart);
  
  // Endi bu ma'lumotlarni state'da saqlash mumkin
  // yoki frontend'da boshqa joyda ishlatish mumkin
}
```

### Update Passage with Diagram Chart

```typescript
// Step 1: Eski ma'lumotlarni olish
const existingDiagramChartId = existingGroups[0]?.gap_filling?.diagram_chart?.id;

if (existingDiagramChartId) {
  // Update existing diagram chart
  const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
  
  // ✅ YANGI! Retrieve updated diagram chart
  const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
  console.log('Updated diagram chart:', retrievedDiagramChart);
} else {
  // Create new diagram chart
  const gapFillingId = updatedPassage.groups[0].gap_filling.id;
  const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
  
  // ✅ YANGI! Retrieve created diagram chart
  const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
  console.log('Created diagram chart:', retrievedDiagramChart);
}
```

---

## 🐛 Console Logs

### Create Flow

```
🔄 Creating reading passage: {...}
📡 Passage response status: 201
✅ Reading passage created: {...}

📸 Uploading diagram_chart for group 0...
🔄 Creating diagram chart: diagram_chart_0.png for gap_filling: 123
📡 DiagramChart response status: 201
✅ DiagramChart created: { id: 123, image: "...", gap_filling: 456 }
✅ Diagram chart uploaded for group 0

🔄 Getting diagram chart: 123
📡 DiagramChart GET response status: 200
✅ DiagramChart retrieved: { id: 123, image: "...", gap_filling: 456, created_at: "..." }
✅ Diagram chart retrieved for group 0

✅ All diagram charts uploaded successfully
```

### Update Flow (Existing)

```
🔄 Updating reading passage: {...}
📋 Existing groups: [...]
📡 Update response status: 200
✅ Reading passage updated: {...}

📸 Updating diagram_chart for group 0...
🔄 Updating diagram chart: 456
📡 DiagramChart update response status: 200
✅ DiagramChart updated: { id: 456, image: "...", gap_filling: 789 }
✅ Diagram chart updated for group 0

🔄 Getting diagram chart: 456
📡 DiagramChart GET response status: 200
✅ DiagramChart retrieved: { id: 456, image: "...", gap_filling: 789, updated_at: "..." }
✅ Diagram chart retrieved for group 0

✅ All diagram charts processed successfully
```

### Update Flow (New)

```
🔄 Updating reading passage: {...}
📋 Existing groups: [...]
📡 Update response status: 200
✅ Reading passage updated: {...}

📸 Updating diagram_chart for group 0...
🔄 Creating diagram chart: diagram_chart_0.png for gap_filling: 789
📡 DiagramChart response status: 201
✅ DiagramChart created: { id: 999, image: "...", gap_filling: 789 }
✅ Diagram chart created for group 0

🔄 Getting diagram chart: 999
📡 DiagramChart GET response status: 200
✅ DiagramChart retrieved: { id: 999, image: "...", gap_filling: 789, created_at: "..." }
✅ Diagram chart retrieved for group 0

✅ All diagram charts processed successfully
```

---

## 🎯 Foydalari

### 1. To'liq Ma'lumotlar
```typescript
const retrievedDiagramChart = await getDiagramChart(diagramChartId);

// Barcha ma'lumotlar:
console.log(retrievedDiagramChart.id);           // ID
console.log(retrievedDiagramChart.image);        // Full URL
console.log(retrievedDiagramChart.gap_filling);  // Gap Filling ID
console.log(retrievedDiagramChart.created_at);   // Timestamp
```

### 2. State Management
```typescript
// React state'da saqlash
const [diagramCharts, setDiagramCharts] = useState([]);

// Yaratilgandan keyin
const retrieved = await getDiagramChart(result.id);
setDiagramCharts([...diagramCharts, retrieved]);
```

### 3. Debugging
```typescript
// Console'da to'liq ma'lumotlarni ko'rish
const retrieved = await getDiagramChart(diagramChartId);
console.log('Full diagram chart object:', retrieved);
```

### 4. Verification
```typescript
// Backend'da to'g'ri yaratilganini tekshirish
const retrieved = await getDiagramChart(diagramChartId);

if (retrieved.image && retrieved.gap_filling) {
  console.log('✅ Diagram chart successfully created!');
} else {
  console.error('❌ Diagram chart creation failed!');
}
```

---

## 🔗 API Endpoint

### GET Diagram Chart

**Endpoint:** `GET /api/v1/reading/diagram-chart/{id}/`

**Request:**
```javascript
GET /api/v1/reading/diagram-chart/123/

Headers:
  Content-Type: application/json
```

**Response:**
```json
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/flowchart_abc123.png",
  "gap_filling": 456,
  "created_at": "2024-12-24T12:00:00Z",
  "updated_at": "2024-12-24T12:00:00Z"
}
```

**Error (404):**
```json
{
  "detail": "Not found."
}
```

---

## 📝 Code Changes

### `/lib/api-cleaned.ts`

#### 1. Yangi funksiya qo'shildi

```typescript
// Get diagram chart by ID (separate API)
export async function getDiagramChart(id: number): Promise<any> {
  const apiAvailable = await checkAPIAvailability();
  
  if (!apiAvailable) {
    console.log('Offline mode: diagram chart not available');
    return null;
  }

  try {
    console.log('🔄 Getting diagram chart:', id);
    
    const response = await fetch(`${BASE_URL}/reading/diagram-chart/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 DiagramChart GET response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DiagramChart GET error:', errorText);
      throw new Error(`Failed to get diagram chart: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ DiagramChart retrieved:', result);
    return result;
  } catch (error) {
    console.error('💥 Error getting diagram chart:', error);
    throw error;
  }
}
```

#### 2. `createReadingPassage()` yangilandi

```typescript
// Before
await createDiagramChart(imageFile, gapFillingId);
console.log(`✅ Diagram chart uploaded for group ${i}`);

// After
const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
console.log(`✅ Diagram chart uploaded for group ${i}`);

// ✅ YANGI: Retrieve
if (diagramChartResult?.id) {
  const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
  console.log(`✅ Diagram chart retrieved for group ${i}:`, retrievedDiagramChart);
}
```

#### 3. `updateReadingPassage()` yangilandi

```typescript
// Update existing
if (existingDiagramChartId) {
  const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
  console.log(`✅ Diagram chart updated for group ${i}`);
  
  // ✅ YANGI: Retrieve
  if (updatedDiagramChart?.id) {
    const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
    console.log(`✅ Diagram chart retrieved for group ${i}:`, retrievedDiagramChart);
  }
}

// Create new
else {
  const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
  console.log(`✅ Diagram chart created for group ${i}`);
  
  // ✅ YANGI: Retrieve
  if (diagramChartResult?.id) {
    const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
    console.log(`✅ Diagram chart retrieved for group ${i}:`, retrievedDiagramChart);
  }
}
```

---

## ✅ To'liq Flow

```
USER ACTION
    ↓
1. Upload image (base64)
    ↓
2. createReadingPassage() → Backend creates passage + gap_filling
    ↓
3. Get gap_filling ID from response
    ↓
4. createDiagramChart(image, gap_filling_id) → Backend creates diagram_chart
    ↓
5. ✅ YANGI: getDiagramChart(id) → Backend returns full diagram_chart object
    ↓
6. Frontend receives complete data:
   - id
   - image URL
   - gap_filling ID
   - created_at timestamp
    ↓
7. Frontend can:
   - Save to state
   - Display in UI
   - Use for future updates
   - Debug/verify
```

---

## 🧪 Test Qilish

### Test 1: Create Flowchart

1. Flowchart Completion tanlash
2. Rasm yuklash
3. Form to'ldirish va Save
4. Console'ni ochish (`F12`)
5. Quyidagilarni tekshiring:
   - ✅ `Creating diagram chart` log
   - ✅ `DiagramChart created` log
   - ✅ `Getting diagram chart` log (YANGI!)
   - ✅ `DiagramChart retrieved` log (YANGI!)
   - ✅ Full object with image URL

### Test 2: Update Diagram Labeling

1. Mavjud passage'ni ochish
2. Diagram Labeling group'ni tanlash
3. Yangi rasm yuklash
4. Save tugmasini bosish
5. Console'da tekshiring:
   - ✅ `Updating diagram chart` log
   - ✅ `DiagramChart updated` log
   - ✅ `Getting diagram chart` log (YANGI!)
   - ✅ `DiagramChart retrieved` log (YANGI!)
   - ✅ Updated object with new image URL

---

## 📚 Boshqa Dokumentatsiyalar

- **[DIAGRAM_CHART_UPDATE_SUMMARY.md](./DIAGRAM_CHART_UPDATE_SUMMARY.md)** - Qisqa xulosa
- **[DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md](./DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md)** - To'liq qo'llanma
- **[BACKEND_API_INTEGRATION_GUIDE.md](./BACKEND_API_INTEGRATION_GUIDE.md)** - Barcha API'lar

---

**Yangilanish sanasi:** 24 Dekabr 2024  
**Yangilik:** `getDiagramChart()` funksiyasi qo'shildi  
**Sabab:** Yaratilgan/yangilangan diagram_chart objectni retrieve qilish  
**Status:** ✅ To'liq implementatsiya qilingan
