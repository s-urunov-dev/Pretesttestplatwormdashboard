# 🖼️ Diagram Chart - Alohida API Implementation

## 📌 Umumiy Ma'lumot

Backend'da DiagramChart uchun alohida API yaratildi. DiagramChart endi `gap_filling` modeliga bog'langan.

## 🔗 Backend Mantiq

### Database Structure
```
Passage
  └─ Group
      └─ GapFilling
          └─ DiagramChart (image field)
```

### Workflow
1. **Avval** gap_filling yaratiladi (passage yaratish orqali)
2. **Keyin** diagram_chart yaratiladi (`gap_filling` ID bilan)

---

## 🔗 API Endpoints

### 1. Create DiagramChart
```
POST https://api.samariddin.space/api/v1/reading/diagram-chart/
```

**Request (FormData):**
```javascript
{
  image: File,           // Rasm fayli
  gap_filling: number    // Gap Filling ID (REQUIRED!)
}
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

### 2. Update DiagramChart
```
PATCH https://api.samariddin.space/api/v1/reading/diagram-chart/{id}/
```

**Request (FormData):**
```javascript
{
  image: File            // Yangi rasm fayli
}
```

**Response:**
```json
{
  "id": 123,
  "image": "https://api.samariddin.space/media/diagrams/updated_image.png",
  "gap_filling": 456,
  "updated_at": "2024-12-24T13:00:00Z"
}
```

---

## 🔄 Frontend Implementation

### Yangi Funksiyalar (`/lib/api-cleaned.ts`)

#### 1. `createDiagramChart()`
```typescript
export async function createDiagramChart(
  imageFile: File, 
  gapFillingId: number  // ✅ REQUIRED: gap_filling ID
): Promise<any>
```

**Parametrlar:**
- `imageFile`: Yuklash uchun rasm fayli
- `gapFillingId`: **REQUIRED** - Gap Filling ID raqami

**Qanday ishlaydi:**
1. FormData yaratadi
2. Image faylini qo'shadi
3. Gap Filling ID'ni qo'shadi (majburiy!)
4. POST so'rovi yuboradi `/reading/diagram-chart/` ga
5. Yaratilgan diagram chart ma'lumotlarini qaytaradi

**Example:**
```typescript
const imageFile = base64ToFile(base64Image, 'flowchart.png');
const gapFillingId = createdPassage.groups[0].gap_filling.id;

await createDiagramChart(imageFile, gapFillingId);
```

#### 2. `updateDiagramChart()`
```typescript
export async function updateDiagramChart(
  id: number, 
  imageFile: File
): Promise<any>
```

**Parametrlar:**
- `id`: Diagram chart ID raqami
- `imageFile`: Yangi rasm fayli

**Qanday ishlaydi:**
1. FormData yaratadi
2. Yangi image faylini qo'shadi
3. PATCH so'rovi yuboradi `/reading/diagram-chart/{id}/` ga
4. Yangilangan diagram chart ma'lumotlarini qaytaradi

**Example:**
```typescript
const imageFile = base64ToFile(base64Image, 'flowchart.png');
await updateDiagramChart(123, imageFile);
```

#### 3. `getDiagramChart()` - Yangi funksiya!
```typescript
export async function getDiagramChart(
  id: number
): Promise<any>
```

**Parametrlar:**
- `id`: Diagram chart ID raqami

**Qanday ishlaydi:**
1. GET so'rovi yuboradi `/reading/diagram-chart/{id}/` ga
2. Diagram chart ma'lumotlarini qaytaradi (image URL, gap_filling ID, etc.)

**Example:**
```typescript
const diagramChart = await getDiagramChart(123);
console.log(diagramChart);
// {
//   id: 123,
//   image: "https://api.samariddin.space/media/diagrams/flowchart.png",
//   gap_filling: 456,
//   created_at: "2024-12-24T12:00:00Z"
// }
```

**Qachon ishlatiladi:**
- Diagram chart yaratilgandan keyin retrieve qilish
- Diagram chart yangilangandan keyin retrieve qilish
- Group ichida diagram_chart objectni to'liq olish

---

### Yangilangan Funksiyalar

#### 1. `createReadingPassage()` - Yangi Flow

**Eski yondashuv (❌ Olib tashlandi):**
```javascript
// Hammasi bitta FormData'da
formData.append('diagram_chart_0', file);
formData.append('groups', JSON.stringify(groups));
// Backend parse qilishda muammo
```

**Yangi yondashuv (✅ Joriy):**
```javascript
// Step 1: Passage yaratish (rasm'siz)
const passageData = {
  reading: data.reading,
  passage_type: data.passage_type,
  title: data.title,
  body: data.body,
  groups: data.groups.map(group => {
    const groupCopy = JSON.parse(JSON.stringify(group));
    // diagram_chart ni olib tashlash
    if (groupCopy.gap_filling?.diagram_chart) {
      delete groupCopy.gap_filling.diagram_chart;
    }
    return groupCopy;
  })
};

const response = await fetch(`${BASE_URL}/reading-pasage-create/`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(passageData),
});

const createdPassage = await response.json();

// Step 2: Har bir diagram_chart uchun alohida so'rov
for (let i = 0; i < data.groups.length; i++) {
  const group = data.groups[i];
  
  if (group.gap_filling?.diagram_chart?.image?.startsWith('data:image')) {
    const imageFile = base64ToFile(imageData, `diagram_chart_${i}.png`);
    
    // ✅ MUHIM: Gap Filling ID kerak!
    const gapFillingId = createdPassage.groups[i].gap_filling.id;
    
    // Create diagram chart
    const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
    
    // Step 3: Retrieve created diagram_chart object
    const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
    console.log('Created diagram chart:', retrievedDiagramChart);
  }
}
```

#### 2. `updateReadingPassage()` - Yangi Flow

```javascript
// Step 1: Eski passage'ni olish
const existingResponse = await fetch(`${BASE_URL}/reading-pasage-update/${id}/`);
const existingData = await existingResponse.json();
const existingGroups = existingData.groups || [];

// Step 2: Passage yangilash (rasm'siz)
const passageData = {
  title: data.title,
  body: data.body,
  groups: data.groups.map(group => {
    const groupCopy = JSON.parse(JSON.stringify(group));
    if (groupCopy.gap_filling?.diagram_chart) {
      delete groupCopy.gap_filling.diagram_chart;
    }
    return groupCopy;
  })
};

const response = await fetch(`${BASE_URL}/reading-pasage-update/${id}/`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(passageData),
});

const updatedPassage = await response.json();

// Step 3: Har bir diagram_chart ni yangilash yoki yaratish
for (let i = 0; i < data.groups.length; i++) {
  const group = data.groups[i];
  
  if (group.gap_filling?.diagram_chart?.image?.startsWith('data:image')) {
    const imageFile = base64ToFile(imageData, `diagram_chart_${i}.png`);
    
    const existingDiagramChartId = existingGroups[i]?.gap_filling?.diagram_chart?.id;
    
    if (existingDiagramChartId) {
      // Mavjud diagram_chart ni yangilash
      const updatedDiagramChart = await updateDiagramChart(existingDiagramChartId, imageFile);
      
      // Retrieve updated diagram_chart
      const retrievedDiagramChart = await getDiagramChart(updatedDiagramChart.id);
      console.log('Updated diagram chart:', retrievedDiagramChart);
    } else {
      // Yangi diagram_chart yaratish
      // ✅ MUHIM: Gap Filling ID kerak!
      const gapFillingId = updatedPassage.groups[i].gap_filling.id;
      
      const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
      
      // Retrieve created diagram_chart
      const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
      console.log('Created diagram chart:', retrievedDiagramChart);
    }
  }
}
```

## 📊 Execution Flow

### Create Flow
```
1. User rasm yuklaydi (FlowChart yoki Diagram Labeling)
   ↓
2. Frontend base64 formatda saqlaydi
   ↓
3. createReadingPassage() chaqiriladi
   ↓
4. Passage yaratiladi (JSON format, rasm'siz)
   ✅ Gap Filling ham yaratiladi!
   ↓
5. Har bir group uchun:
   - Gap Filling ID olinadi (backend'dan)
   - Base64 → File conversion
   - createDiagramChart(imageFile, gapFillingId) chaqiriladi
   - Rasm alohida yuklanadi
   ↓
6. DiagramChart yaratilgandan keyin:
   - getDiagramChart(id) chaqiriladi
   - Yaratilgan diagram_chart objectni retrieve qiladi
   - Console'da to'liq ma'lumotlar ko'rinadi
   ↓
7. ✅ Success message
```

### Update Flow
```
1. User mavjud passage'ni ochadi
   ↓
2. Rasm'ni o'zgartiradi yoki yangi rasm yuklaydi
   ↓
3. updateReadingPassage() chaqiriladi
   ↓
4. Eski passage ma'lumotlari olinadi (GET request)
   ↓
5. Passage yangilanadi (JSON format, rasm'siz)
   ✅ Gap Filling ham yangilanadi!
   ↓
6. Har bir group uchun:
   - Eski diagram_chart ID tekshiriladi
   - Agar bor: 
     * updateDiagramChart(id, imageFile)
     * getDiagramChart(id) - retrieve updated
   - Agar yo'q: 
     * Gap Filling ID olinadi (backend'dan)
     * createDiagramChart(imageFile, gapFillingId)
     * getDiagramChart(id) - retrieve created
   ↓
7. ✅ Success message
```

## 🎯 Afzalliklar

### ✅ Aniq Separation of Concerns
- Passage ma'lumotlari JSON formatda
- Rasmlar alohida file upload sifatida
- Backend mantiqiy ajratilgan

### ✅ Yaxshi Error Handling
- Passage yaratilmasaham, rasm yuklash mumkin
- Har bir qadam alohida xatoliklar bilan
- Debugging oson

### ✅ Moslashuvchanlik
- Rasm majburiy emas
- Bir nechta rasm qo'shish oson
- Kelajakda yangi fayl turlari qo'shish mumkin

### ✅ Backend Mustaqilligi
- Django, Flask, Node.js - hammasi uchun mos
- Standard REST API pattern
- FormData va JSON aralashmaydi

## 🧪 Test Qilish

### Test 1: Flowchart Completion - Yangi Passage
```javascript
// 1. Flowchart Completion tanlash
// 2. Title va body kiriting
// 3. Rasm yuklash (base64)
// 4. From/To qiymatlar kiriting
// 5. Save tugmasini bosing

// Console'da ko'ring:
// 🔄 Creating reading passage: {...}
// 📡 Passage response status: 201
// ✅ Reading passage created: {...}
// 📸 Uploading diagram_chart for group 0...
// 🔄 Creating diagram chart: diagram_chart_0.png for gap_filling: 123
// 📡 DiagramChart response status: 201
// ✅ DiagramChart created: {...}
// ✅ Diagram chart uploaded for group 0
// ✅ All diagram charts uploaded successfully
```

### Test 2: Diagram Labeling - Update Existing
```javascript
// 1. Mavjud passage'ni tahrirlash
// 2. Diagram Labeling group'ni tanlash
// 3. Yangi rasm yuklash
// 4. Save tugmasini bosing

// Console'da ko'ring:
// 🔄 Updating reading passage: {...}
// 📋 Existing groups: [...]
// 📡 Update response status: 200
// ✅ Reading passage updated: {...}
// 📸 Updating diagram_chart for group 0...
// 🔄 Updating diagram chart: 123
// 📡 DiagramChart update response status: 200
// ✅ DiagramChart updated: {...}
// ✅ Diagram chart updated for group 0
// ✅ All diagram charts processed successfully
```
// ✅ Reading passage updated: {...}
// 📸 Updating diagram_chart for group 0...
// 🔄 Updating diagram chart: 123
// 📡 DiagramChart update response status: 200
// ✅ DiagramChart updated: {...}
// ✅ Diagram chart updated for group 0
// ✅ All diagram charts processed successfully
```

### Test 3: Multiple Groups - Mixed Images
```javascript
// 1. Passage'da 2 ta group yarating
// 2. Birinchisi Flowchart (rasm bilan)
// 3. Ikkinchisi Diagram Labeling (rasm bilan)
// 4. Save tugmasini bosing

// Natija:
// - Passage yaratiladi
// - Group 0 uchun diagram_chart yaratiladi
// - Group 1 uchun diagram_chart yaratiladi
// - Hammasi alohida so'rovlar
```

## 🐛 Error Handling

### Passage yaratildi, lekin rasm yuklanmadi
```javascript
try {
  const createdPassage = await response.json();
  console.log('✅ Reading passage created:', createdPassage);
  
  // Rasm yuklashda xatolik
  await createDiagramChart(imageFile, groupId);
} catch (error) {
  console.error('💥 Error uploading diagram chart:', error);
  // Passage yaratilgan, lekin rasm yo'q
  // User'ga xabar berish kerak
}
```

### Rasm yangilashda xatolik
```javascript
try {
  await updateDiagramChart(id, imageFile);
} catch (error) {
  console.error('💥 Error updating diagram chart:', error);
  // Passage yangilangan, lekin rasm yangilanmagan
  // Eski rasm qoladi
}
```

## 📝 Qo'shimcha Ma'lumotlar

### Base64 to File Conversion
```typescript
function base64ToFile(base64String: string, filename: string): File {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
```

### Logging Format
```javascript
// ✅ Success - Green check
// ❌ Error - Red X
// 🔄 Processing - Blue cycle
// 📡 Network - Antenna
// 📸 Image - Camera
// 📋 Data - Clipboard
// 💥 Crash - Explosion
```

## 🎉 Natija

- ✅ Alohida DiagramChart API muvaffaqiyatli implementatsiya qilindi
- ✅ Create va Update funksiyalari to'liq ishlaydi
- ✅ Error handling va logging qo'shildi
- ✅ Frontend-backend integration aniq va sodda
- ✅ Test qilish va debugging oson

**Yangilanish sanasi:** 24 Dekabr 2024
