# 📖 IELTS Admin Panel - Documentation Index

Bu yerda barcha dokumentatsiya fayllari ro'yxati va ularning qisqacha tavsifi.

---

## 🚀 Quick Start

Yangi boshlovchilar uchun:

1. **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - Proyektni boshlash va asosiy tushunchalar

---

## 🔌 Backend Integration

Backend API bilan ishlash:

1. **[BACKEND_API_INTEGRATION_GUIDE.md](./BACKEND_API_INTEGRATION_GUIDE.md)** - Barcha API endpoints va qanday ishlatish
2. **[DIAGRAM_CHART_UPDATE_SUMMARY.md](./DIAGRAM_CHART_UPDATE_SUMMARY.md)** - **YANGI!** Diagram Chart API o'zgarishlari (24.12.2024)
3. **[DIAGRAM_CHART_RETRIEVE_IMPLEMENTATION.md](./DIAGRAM_CHART_RETRIEVE_IMPLEMENTATION.md)** - **YANGI!** Diagram Chart retrieve funksiyasi (24.12.2024)
4. **[DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md](./DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md)** - Diagram Chart alohida API batafsil
5. **[DEBUGGING_DIAGRAM_CHART.md](./DEBUGGING_DIAGRAM_CHART.md)** - **YANGI!** Diagram Chart debugging qo'llanma (24.12.2024)

---

## 📊 Question Types

Turli savol turlari uchun qo'llanmalar:

1. **[TABLE_COMPLETION_GUIDE.md](./TABLE_COMPLETION_GUIDE.md)** - Table Completion dynamic form
2. **[DIAGRAM_CHART_FIX_SUMMARY.md](./DIAGRAM_CHART_FIX_SUMMARY.md)** - Flowchart va Diagram Labeling image upload

---

## 🗂️ Fayl Tuzilishi

```
/
├── App.tsx                          # Main app component
├── lib/
│   └── api-cleaned.ts              # Backend API funksiyalar
├── components/
│   ├── AddReadingPassage.tsx       # Reading passage yaratish
│   ├── AddListeningPart.tsx        # Listening part yaratish
│   ├── AddWritingQuestion.tsx      # Writing task yaratish
│   └── reading-question-types/     # Reading savol turlari
│       ├── SummaryCompletion.tsx
│       ├── TableCompletion.tsx
│       ├── FlowChartCompletion.tsx
│       ├── DiagramLabeling.tsx
│       └── ShortAnswerQuestions.tsx
└── docs/                            # Bu yerdasiz!
```

---

## 📝 Eng Muhim O'zgarishlar

### 24 Dekabr 2024 - Diagram Chart API Yangilandi

#### 1. Gap Filling ID kerak (REQUIRED)

**❌ Eski:**
```typescript
await createDiagramChart(imageFile, groupId);
```

**✅ Yangi:**
```typescript
const gapFillingId = createdPassage.groups[0].gap_filling.id;
await createDiagramChart(imageFile, gapFillingId);
```

**Batafsil:** [DIAGRAM_CHART_UPDATE_SUMMARY.md](./DIAGRAM_CHART_UPDATE_SUMMARY.md)

#### 2. Retrieve funksiyasi qo'shildi (NEW)

**✅ Yangi:**
```typescript
// Create va retrieve
const diagramChartResult = await createDiagramChart(imageFile, gapFillingId);
const retrievedDiagramChart = await getDiagramChart(diagramChartResult.id);

console.log(retrievedDiagramChart);
// { id, image, gap_filling, created_at }
```

**Batafsil:** [DIAGRAM_CHART_RETRIEVE_IMPLEMENTATION.md](./DIAGRAM_CHART_RETRIEVE_IMPLEMENTATION.md)

---

## 🎯 Reading Question Types

Hozirda implementatsiya qilingan:

| Savol Turi | Component | Status |
|------------|-----------|--------|
| Sentence Completion | ✅ | To'liq ishlaydi |
| Summary Completion | ✅ | To'liq ishlaydi |
| Table Completion | ✅ | To'liq ishlaydi |
| Flowchart Completion | ✅ | To'liq ishlaydi |
| Diagram Labeling | ✅ | To'liq ishlaydi |
| Short Answer Questions | ✅ | To'liq ishlaydi |
| Note Completion | ⏳ | Kerakli |
| Form Completion | ⏳ | Kerakli |
| Multiple Choice | ⏳ | Kerakli |

---

## 🔍 Tez Qidiruv

### Backend API Endpoints

| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/reading-pasage-create/` | POST | Reading passage yaratish |
| `/reading-pasage-update/{id}/` | PATCH | Reading passage yangilash |
| `/reading/diagram-chart/` | POST | Diagram chart yaratish |
| `/reading/diagram-chart/{id}/` | PATCH | Diagram chart yangilash |
| `/listening-part-create/` | POST | Listening part yaratish |
| `/writing-question-create/` | POST | Writing task yaratish |

### Frontend Funksiyalar

| Funksiya | Fayl | Tavsif |
|----------|------|--------|
| `createReadingPassage()` | `api-cleaned.ts` | Reading passage yaratish |
| `updateReadingPassage()` | `api-cleaned.ts` | Reading passage yangilash |
| `createDiagramChart()` | `api-cleaned.ts` | Diagram chart yaratish |
| `updateDiagramChart()` | `api-cleaned.ts` | Diagram chart yangilash |
| `getDiagramChart()` | `api-cleaned.ts` | **YANGI!** Diagram chart olish |
| `createListeningPartWithQuestions()` | `api-cleaned.ts` | Listening part yaratish |
| `createWritingTask()` | `api-cleaned.ts` | Writing task yaratish |

---

## 🐛 Debug Mode

Console'da loglarni ko'rish:

```javascript
// Barcha API so'rovlar uchun
console.log('🔄 Creating...', data);
console.log('📡 Response status:', response.status);
console.log('✅ Success:', result);
console.log('❌ Error:', error);

// Diagram chart uchun
console.log('📸 Uploading diagram_chart...');
console.log('🔄 Creating diagram chart: filename for gap_filling: id');
```

---

## 💡 Tips & Tricks

### 1. Base64 to File Conversion
```typescript
function base64ToFile(base64: string, filename: string): File {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new File([u8arr], filename, { type: mime });
}
```

### 2. Error Handling
```typescript
try {
  await createReadingPassage(data);
} catch (error) {
  console.error('Error:', error.message);
  // User'ga xabar berish
  alert(error.message);
}
```

### 3. FormData vs JSON
- **FormData:** File upload uchun (image, audio)
- **JSON:** Oddiy ma'lumotlar uchun (text, numbers, arrays)

---

## 🆘 Yordam

Agar muammo bo'lsa:

1. Console'ni tekshiring (`F12` → Console)
2. Network tab'ni ko'ring (`F12` → Network)
3. Backend API dokumentatsiyasini o'qing: `https://api.samariddin.space/`
4. Bu yerda dokumentatsiyalarni o'qing!

---

## 📞 Contact

Savollar uchun:

- **Backend:** Samariddin
- **Frontend:** IELTS Admin Panel Team
- **API Docs:** https://api.samariddin.space/

---

**Oxirgi yangilanish:** 24 Dekabr 2024
