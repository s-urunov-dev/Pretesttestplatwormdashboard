# 📊 Diagram Chart Image Upload - YANGI YECHIM (Alohida API)

## ⚠️ MUHIM: Eski Yondashuv O'zgartirildi!

**Eski yondashuv:** FormData bilan `diagram_chart_{index}` file'larni va `groups` JSON stringni birgalikda yuborish.

**Yangi yondashuv:** Alohida DiagramChart API ishlatish - passage va rasmlar alohida yuboriladi.

---

## 🎯 Yangi Yechim

Backend'da DiagramChart uchun alohida API yaratildi:

### API Endpoints:
1. **Create:** `POST /api/v1/reading/diagram-chart/`
2. **Update:** `PATCH /api/v1/reading/diagram-chart/{id}/`

### Frontend Implementation:

#### 1. Yangi Funksiyalar (`/lib/api-cleaned.ts`)

```typescript
// Diagram chart yaratish
export async function createDiagramChart(
  imageFile: File, 
  groupId?: number
): Promise<any>

// Diagram chart yangilash
export async function updateDiagramChart(
  id: number, 
  imageFile: File
): Promise<any>
```

#### 2. Yangilangan Flow

**Create Passage:**
```javascript
// Step 1: Passage yaratish (rasm'siz)
const passageData = {
  reading: data.reading,
  passage_type: data.passage_type,
  title: data.title,
  body: data.body,
  groups: data.groups.map(group => {
    // diagram_chart ni olib tashlash
    const groupCopy = { ...group };
    if (groupCopy.gap_filling?.diagram_chart) {
      delete groupCopy.gap_filling.diagram_chart;
    }
    return groupCopy;
  })
};

await fetch('/reading-pasage-create/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(passageData)
});

// Step 2: Har bir rasm uchun alohida so'rov
for (let group of groups) {
  if (group.gap_filling?.diagram_chart?.image) {
    await createDiagramChart(imageFile, groupId);
  }
}
```

**Update Passage:**
```javascript
// Step 1: Eski ma'lumotlarni olish
const existing = await fetch(`/reading-pasage-update/${id}/`);

// Step 2: Passage yangilash (rasm'siz)
await fetch(`/reading-pasage-update/${id}/`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(passageData)
});

// Step 3: Rasmlarni yangilash yoki yaratish
for (let group of groups) {
  const existingDiagramChartId = existing.groups[i]?.gap_filling?.diagram_chart?.id;
  
  if (existingDiagramChartId) {
    await updateDiagramChart(id, imageFile);  // Update
  } else {
    await createDiagramChart(imageFile, groupId);  // Create
  }
}
```

## 🔍 Afzalliklar

### ✅ Aniq Separation
- Passage ma'lumotlari JSON formatda
- Rasmlar alohida file upload
- Backend mantiqiy ajratilgan

### ✅ Yaxshi Error Handling
- Passage yaratildi, rasm yuklashda xatolik bo'lsa ham
- Har bir qadam alohida xatoliklar bilan
- Debugging oson

### ✅ Moslashuvchanlik
- Rasm majburiy emas
- Bir nechta rasm qo'shish oson
- FormData va JSON aralashmaydi

## 📚 To'liq Dokumentatsiya

Batafsil ma'lumot uchun qarang: `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md`

---

## 🗑️ Eski Kod (Endi Ishlatilmaydi)

<details>
<summary>Eski FormData yondashuvi (faqat tarix uchun)</summary>

```javascript
// ❌ ESKi - Endi ishlatilmaydi!
const formData = new FormData();
formData.append('reading', data.reading.toString());
formData.append('passage_type', data.passage_type);
formData.append('title', data.title);
formData.append('body', data.body);

// Base64'ni File'ga aylantirish
const imageFile = base64ToFile(imageData, `diagram_chart_${index}.png`);
formData.append(`diagram_chart_${index}`, imageFile);

// Groups JSON string sifatida
formData.append('groups', JSON.stringify(processedGroups));

// Bir so'rovda yuborish
await fetch('/reading-pasage-create/', {
  method: 'POST',
  body: formData
});

// Muammo: Backend parse qilishda murakkablik
```

</details>

---

**Yangilanish sanasi:** 24 Dekabr 2024  
**Holat:** ✅ Yangi API implementatsiya qilindi  
**To'liq ma'lumot:** `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md`
