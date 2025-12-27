# 🐛 Diagram Chart Debugging Guide

## 🎯 Muammo

User aytayotgan: Group yaratilayotganda, agar gap_filling ichida diagram_chart bo'lsa, POST request `/reading/diagram-chart/` ga ketmayapti.

---

## 🔍 Debugging Flow

### 1. Frontend - Group yaratish

```typescript
// AddQuestionPage.tsx - Line 600
const addQuestionGroup = () => {
  const newGroup: QuestionGroup = {
    question_type: selectedQuestionTypes[0],
    from_value: fromValue,
    to_value: fromValue,
  };
  setGroups([...groups, newGroup]);
};
```

**Note:** Yangi group yaratilganda faqat asosiy maydonlar bor. Gap filling va diagram_chart keyinroq qo'shiladi.

---

### 2. Frontend - Diagram Chart yuklash

```typescript
// AddQuestionPage.tsx - Line 1600-1627
// Flowchart Completion uchun
onChange={(e) => {
  const file = e.target.files?.[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const base64String = event.target?.result as string;
    updateGroup(index, {
      gap_filling: {
        ...group.gap_filling,
        title: group.gap_filling?.title || '',
        principle: group.gap_filling?.principle || 'NMT_TWO',
        body: group.gap_filling?.body || '',
        diagram_chart: { image: base64String }  // ✅ Shu yerda qo'shiladi!
      }
    });
  };
  reader.readAsDataURL(file);
}}
```

**Status:** ✅ To'g'ri ishlayapti

---

### 3. Frontend - Conversion (Flowchart/Diagram Labeling)

```typescript
// AddQuestionPage.tsx - Line 715-738
if (cleanedGroup.flowchart_completion && cleanedGroup.question_type === 'flowchart_completion') {
  const converted = convertFlowChartCompletionToGapFilling(
    cleanedGroup.flowchart_completion
  );
  cleanedGroup.gap_filling = converted;  // ✅ diagram_chart ham shu yerda
  delete cleanedGroup.flowchart_completion;
}

if (cleanedGroup.diagram_labeling && cleanedGroup.question_type === 'diagram_labeling') {
  const converted = convertDiagramLabelingToGapFilling(
    cleanedGroup.diagram_labeling
  );
  cleanedGroup.gap_filling = converted;  // ✅ diagram_chart ham shu yerda
  delete cleanedGroup.diagram_labeling;
}
```

**Converter funksiyalari:**
- `convertFlowChartCompletionToGapFilling()` - ✅ diagram_chart ni qo'shadi
- `convertDiagramLabelingToGapFilling()` - ✅ diagram_chart ni qo'shadi

**Status:** ✅ To'g'ri ishlayapti

---

### 4. Frontend - API ga yuborish

```typescript
// AddQuestionPage.tsx - Line 833-841
const data: CreateReadingPassageRequest = {
  reading: readingId,
  passage_type: selectedSubType as PassageType,
  title: title.trim(),
  body: body.trim(),
  groups: cleanedGroups,  // ✅ Converted groups
};

await createReadingPassage(data);
```

**Status:** ✅ cleanedGroups yuborilmoqda

---

### 5. Backend API - createReadingPassage()

```typescript
// api-cleaned.ts - Line 1119-1132
// Step 1: Passage yaratish (diagram_chart'siz)
const passageData = {
  reading: data.reading,
  passage_type: data.passage_type,
  title: data.title,
  body: data.body,
  groups: data.groups.map(group => {
    const groupCopy = JSON.parse(JSON.stringify(group));
    // Remove diagram_chart temporarily - we'll handle it separately
    if (groupCopy.gap_filling?.diagram_chart) {
      delete groupCopy.gap_filling.diagram_chart;
    }
    return groupCopy;
  }),
};

POST /reading-pasage-create/ (diagram_chart'siz)
```

**Status:** ✅ Diagram chart o'chiriladi va keyin alohida yuklanadi

---

### 6. Backend API - Diagram Chart yuklash

```typescript
// api-cleaned.ts - Line 1164-1196
// Step 2: Upload diagram_chart images separately
for (let i = 0; i < data.groups.length; i++) {
  const group = data.groups[i];
  
  // ✅ YANGI DEBUG LOG!
  console.log(`🔍 DEBUG - Checking group ${i} for diagram_chart:`, {
    hasGapFilling: !!group.gap_filling,
    hasDiagramChart: !!group.gap_filling?.diagram_chart,
    hasImage: !!group.gap_filling?.diagram_chart?.image,
    imageType: group.gap_filling?.diagram_chart?.image ? 
      (group.gap_filling.diagram_chart.image.startsWith('data:image') ? 'base64' : 'url') : 'none'
  });
  
  if (group.gap_filling?.diagram_chart?.image) {
    const imageData = group.gap_filling.diagram_chart.image;
    
    // Check if it's a base64 image
    if (imageData.startsWith('data:image')) {
      console.log(`📸 Uploading diagram_chart for group ${i}...`);
      
      const imageFile = base64ToFile(imageData, `diagram_chart_${i}.png`);
      
      // Get the gap_filling ID from created passage
      const createdGapFillingId = createdPassage.groups?.[i]?.gap_filling?.id;
      
      if (createdGapFillingId) {
        const diagramChartResult = await createDiagramChart(imageFile, createdGapFillingId);
        console.log(`✅ Diagram chart uploaded for group ${i}`);
        
        // Retrieve the created diagram_chart object
        if (diagramChartResult?.id) {
          const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);
          console.log(`✅ Diagram chart retrieved for group ${i}:`, retrievedDiagramChart);
        }
      } else {
        console.warn(`⚠️ Gap filling ID not found for group ${i}`);
      }
    }
  }
}
```

**Key Points:**
- ✅ Group ichida `gap_filling.diagram_chart.image` borligini tekshiradi
- ✅ Base64 formatda ekanligini tekshiradi
- ✅ `createdPassage.groups[i].gap_filling.id` oladi
- ✅ Diagram chart yaratadi

---

## 🧪 Testing Checklist

### Test 1: Flowchart Completion

1. **Reading** → **Passage 1** tanlash
2. **Question Type Selector** → **Flowchart Completion** tanlash
3. **"Guruh Qo'shish"** tugmasini bosish
4. Group ochish (accordion)
5. Formani to'ldirish:
   - ✅ Title/Instruction
   - ✅ Principle (ONE_WORD / NMT_TWO / etc.)
   - ✅ **Rasm yuklash** (file upload yoki URL)
   - ✅ Flow chart steps qo'shish
6. **"Saqlash"** tugmasini bosish
7. **Browser Console** ochish (F12)
8. Quyidagi loglarni ko'rish:

```
📦 BEFORE CLEANING - Raw groups: [...]
🔄 Converting flowchart_completion: {...}
✅ Converted to gap_filling: {...}
✅ Added diagram_chart to result: {...}     ← MUHIM!

🔄 Creating reading passage: {...}
📡 Passage response status: 201
✅ Reading passage created: {...}

🔍 DEBUG - Checking group 0 for diagram_chart:  ← YANGI LOG!
  hasGapFilling: true
  hasDiagramChart: true                         ← TRUE bo'lishi kerak!
  hasImage: true                                ← TRUE bo'lishi kerak!
  imageType: "base64"                          ← "base64" bo'lishi kerak!

📸 Uploading diagram_chart for group 0...
🔄 Creating diagram chart: diagram_chart_0.png for gap_filling: 123
📡 DiagramChart response status: 201
✅ DiagramChart created: {...}
✅ Diagram chart uploaded for group 0

🔄 Getting diagram chart: 123
📡 DiagramChart GET response status: 200
✅ DiagramChart retrieved: {...}
✅ Diagram chart retrieved for group 0
```

---

### Test 2: Diagram Labeling

1. **Reading** → **Passage 2** tanlash
2. **Question Type Selector** → **Diagram Labeling** tanlash
3. **"Guruh Qo'shish"** tugmasini bosish
4. Group ochish (accordion)
5. Formani to'ldirish:
   - ✅ Title/Instruction
   - ✅ Principle
   - ✅ **Rasm yuklash** (file upload yoki URL)
   - ✅ Diagram items qo'shish
6. **"Saqlash"** tugmasini bosish
7. Console'da xuddi yuqoridagi loglarni ko'rish

---

## 🐛 Agar POST request ketmasa

### Scenario 1: `hasDiagramChart: false`

**Sabab:** Converter diagram_chart ni qo'shmadi

**Check:**
```typescript
// flowChartCompletionConverter.ts - Line 67-77
if (data.image) {
  result.diagram_chart = {
    image: data.image
  };
  console.log('✅ Added diagram_chart to result:', {...});
}
```

**Yechim:** `data.image` mavjudligini tekshiring

---

### Scenario 2: `hasImage: false`

**Sabab:** Image mavjud emas

**Check:**
```typescript
// AddQuestionPage.tsx - Line 1623
diagram_chart: { image: base64String }
```

**Yechim:** 
- File upload ishlaydimi?
- URL input to'g'ri kiritildimi?
- Base64 conversion to'g'ri ishlayaptimi?

---

### Scenario 3: `imageType: "url"`

**Sabab:** Base64 emas, URL yuklangan

**Code:**
```typescript
// api-cleaned.ts - Line 1172
if (imageData.startsWith('data:image')) {
  // Only base64 images are uploaded
}
```

**Yechim:** Bu normal - URL rasmlar yuklansa, POST request ketmaydi. Faqat base64 rasmlar yuklanadi.

---

### Scenario 4: Gap Filling ID topilmadi

**Log:**
```
⚠️ Gap filling ID not found for group 0
```

**Sabab:** Backend passage yaratilganda gap_filling yaratilmadi

**Check:**
```typescript
const createdGapFillingId = createdPassage.groups?.[i]?.gap_filling?.id;
```

**Yechim:** 
- Backend'ni tekshiring
- Backend gap_filling yaratmoqdami?
- Response to'g'ri kelmoqdami?

---

## 📊 Console Logs Tahlili

### ✅ To'g'ri ishlayotgan holat

```
📦 BEFORE CLEANING - Raw groups: [
  {
    "question_type": "flowchart_completion",
    "flowchart_completion": {
      "image": "data:image/png;base64,...",  ← Base64!
      "instruction": "Complete the flow chart",
      "principle": "ONE_WORD",
      "steps": [...]
    }
  }
]

🔄 Converting flowchart_completion: {...}
✅ Added diagram_chart to result: {
  hasDiagramChart: true,
  imageType: "base64",
  imageLength: 50000
}

✅ Converted to gap_filling: {
  title: "Complete the flow chart",
  principle: "ONE_WORD",
  body: "...",
  diagram_chart: { image: "data:image/png;base64,..." }  ← Shu yerda!
}

🔍 DEBUG - Checking group 0 for diagram_chart: {
  hasGapFilling: true,
  hasDiagramChart: true,      ← ✅
  hasImage: true,              ← ✅
  imageType: "base64"         ← ✅
}

📸 Uploading diagram_chart for group 0...
🔄 Creating diagram chart: diagram_chart_0.png for gap_filling: 123
📡 DiagramChart response status: 201
✅ DiagramChart created
```

---

### ❌ Muammoli holat

```
📦 BEFORE CLEANING - Raw groups: [
  {
    "question_type": "flowchart_completion",
    "flowchart_completion": {
      "image": undefined,              ← ❌ Rasm yo'q!
      "instruction": "Complete...",
      "principle": "ONE_WORD",
      "steps": [...]
    }
  }
]

🔄 Converting flowchart_completion: {...}
✅ Converted to gap_filling: {
  title: "Complete...",
  principle: "ONE_WORD",
  body: "...",
  // diagram_chart yo'q!              ← ❌
}

🔍 DEBUG - Checking group 0 for diagram_chart: {
  hasGapFilling: true,
  hasDiagramChart: false,     ← ❌ Yo'q!
  hasImage: false,            ← ❌
  imageType: "none"          ← ❌
}

✅ All diagram charts uploaded successfully
// ↑ POST request ketmadi chunki diagram_chart yo'q!
```

---

## 💡 Ko'rsatmalar

### 1. Har doim DEBUG loglarni tekshiring

Browser Console'ni oching (F12) va loglarni diqqat bilan o'qing.

### 2. Base64 rasmlarni tekshiring

```javascript
// Valid base64 image
"data:image/png;base64,iVBORw0KGgoAAAANS..."  ← ✅

// Invalid
"https://example.com/image.png"              ← ❌ (URL, POST ketmaydi)
undefined                                     ← ❌
""                                           ← ❌
```

### 3. Converter funksiyalarni tekshiring

```typescript
// flowChartCompletionConverter.ts
console.log('✅ Added diagram_chart to result:', {...});

// diagramLabelingConverter.ts
console.log('✅ Added diagram_chart to diagram_labeling result:', {...});
```

### 4. Network tab'ni tekshiring

Browser DevTools → Network tab → Filter: `diagram-chart`

Agar POST request ko'rinmasa:
- ❌ Diagram chart yuklash jarayoni boshlanmagan
- ✅ Console loglarni tekshiring

---

## 🎯 Xulosa

**Diagram chart POST request qachon ketadi?**

1. ✅ Group ichida `gap_filling` bor
2. ✅ Gap filling ichida `diagram_chart` bor
3. ✅ Diagram chart ichida `image` bor
4. ✅ Image **base64 formatda** (`data:image/...`)
5. ✅ Backend passage yaratilgan
6. ✅ Backend gap_filling yaratilgan va ID mavjud

**Agar bitta shart bajarilmasa → POST request ketmaydi!**

---

## 📞 Yordam

Agar muammo davom etsa:

1. Browser Console'ni skrinshotga oling
2. Network tab'ni ko'rsating
3. Console loglarni to'liq yuboring
4. Qaysi question type ishlatilganini ayting (Flowchart/Diagram Labeling)
5. Rasm qanday yuklangan (file upload/URL)?

---

**Sana:** 24 Dekabr 2024  
**Status:** ✅ Debug logs qo'shildi  
**Testing:** ⏳ User testing kerak
