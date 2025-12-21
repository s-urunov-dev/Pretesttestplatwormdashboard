# Table Completion Editor - Foydalanish Qo'llanmasi

## Umumiy Ma'lumot

Table Completion komponenti IELTS Listening va Reading section'lari uchun to'liq dinamik jadval yaratish imkoniyatini beradi. Bu komponent har bir qatorda turli xil miqdorda ustunlar bo'lishini qo'llab-quvvatlaydi - qatorlar bir-biriga bog'lanmagan.

## Asosiy Xususiyatlar

### 1. Moslashuvchan Jadval Tuzilishi
- ✅ **Har bir qatorda turli xil ustunlar**: Birinchi qatorda 2 ta ustun, ikkinchisida 4 ta ustun bo'lishi mumkin
- ✅ **Mustaqil qatorlar**: Har bir qator o'z ustunlariga ega, bir-biriga bog'lanmagan
- ✅ **Dinamik qo'shish/o'chirish**: Har bir qatorga alohida ustun qo'shish yoki o'chirish
- ✅ **Oddiy tuzilma**: Colspan va rowspan yo'q, sodda va tushunarli

### 2. Katakcha Turlari
- **Matn katakchasi**: Static matn uchun (jadval sarlavhalari, labels)
- **Javob katakchasi**: Student javob kiritish uchun bo'sh maydon

### 3. Javob Qoidalari (Principles)
- `ONE_WORD` - Faqat bitta so'z
- `ONE_WORD_OR_NUMBER` - Bitta so'z va/yoki raqam
- `NMT_ONE` - Bir so'zdan ko'p bo'lmagan
- `NMT_TWO` - Ikki so'zdan ko'p bo'lmagan
- `NMT_THREE` - Uch so'zdan ko'p bo'lmagan
- `NMT_TWO_NUM` - Ikki so'z va/yoki raqam
- `NMT_THREE_NUM` - Uch so'z va/yoki raqam
- `NUMBER_ONLY` - Faqat raqam
- `FROM_BOX` - Box'dan tanlash

## Admin Panel (Edit Mode)

### Jadval Yaratish:

1. **Qator va Ustun Qo'shish** (yonma-yon tugmalar): 
   - "[+ Qator]" tugmasi - yangi qator qo'shadi (default 2 ta ustun bilan)
   - "[+ Ustun]" tugmasi - tanlangan qatorga ustun qo'shadi

2. **Har Bir Qatorga Alohida Ustun Boshqaruvi**:
   - Har bir qator o'zining "[+ Ustun]" tugmasiga ega
   - Faqat shu qatorga ustun qo'shadi
   - Har bir katakchada o'chirish tugmasi bor

3. **Katakcha Sozlamalari**:
   - **Matn kiriting**: Text katakchalari uchun
   - **Turi o'zgartirish**: Matn ↔ Javob (icon tugmasi)

### Kontrollar:

```
┌─────────────────────────────────────────┐
│ Answer Principle: [NMT_TWO ▼]          │
├─────────────────────────────────────────┤
│ Custom Instruction: [_____________]     │
├─────────────────────────────────────────┤
│ Boshlang'ich savol raqami: [1]         │
└─────────────────────────────────────────┘
```

### Jadval Tuzilishi:

```
┌─────────────────────────────────────────────┐
│ Jadval Tuzilishi      [+ Qator]             │
├─────────────────────────────────────────────┤
│  Qator 1 (3 ustun)    [+ Ustun] [🗑️]        │
│  ┌──────────┬──────────┬──────────┐         │
│  │  [Matn]  │  [Matn]  │ [Javob]  │         │
│  │ Activity │Age Group │  Answer  │         │
│  └──────────┴──────────┴──────────┘         │
├─────────────────────────────────────────────┤
│  Qator 2 (2 ustun)    [+ Ustun] [🗑️]        │
│  ┌────────────────┬────────────────┐         │
│  │     [Matn]     │    [Javob]     │         │
│  │    Swimming    │     Answer     │         │
│  └────────────────┴────────────────┘         │
└─────────────────────────────────────────────┘
```

## Student View (Preview Mode)

Student ko'rinishi aniq IELTS imtihon uslubida:

```
╔═══════════════════════════════════════════╗
║ Complete the table below.                 ║
║ Write NO MORE THAN TWO WORDS for each... ║
╠═══════════════════════════════════════════╣
║ Questions 1–5                             ║
╠═══════════════════════════════════════════╣
║ ┏━━━━━━━━━┳━━━━━━━━━┳━━━━━━━━━┓         ║
║ ┃Activity ┃Age Group┃Duration ┃         ║
║ ┣━━━━━━━━━╋━━━━━━━━━╋━━━━━━━━━┫         ║
║ ┃Swimming ┃  [___]  ┃ 2 hours ┃         ║
║ ┣━━━━━━━━━╋━━━━━━━━━╋━━━━━━━━━┫         ║
║ ┃Tennis   ┃ Adults  ┃  [___]  ┃         ║
║ ┗━━━━━━━━━┻━━━━━━━━━┻━━━━━━━━━┛         ║
╚═══════════════════════════════════════════╝
```

## Backend Model Tuzilishi

```typescript
{
  principle: "NMT_TWO",
  row_count: 3,
  column_counts: [
    ["col_0", "col_1", "col_2"],  // Qator 1: 3 ustun
    ["col_0", "col_1"],            // Qator 2: 2 ustun
    ["col_0", "col_1", "col_2", "col_3"]  // Qator 3: 4 ustun
  ],
  table_details: {
    instruction: "Custom instruction (optional)",
    rows: [
      [
        { type: "text", content: "Activity", isAnswer: false },
        { type: "text", content: "Age Group", isAnswer: false },
        { type: "text", content: "Duration", isAnswer: false }
      ],
      [
        { type: "text", content: "Swimming", isAnswer: false },
        { type: "answer", content: "", isAnswer: true }
      ],
      [
        { type: "text", content: "Tennis", isAnswer: false },
        { type: "text", content: "Adults", isAnswer: false },
        { type: "answer", content: "", isAnswer: true },
        { type: "text", content: "Coach", isAnswer: false }
      ]
    ]
  }
}
```

## Misol: Turli Xil Qatorlar

### Har bir qatorda turli miqdorda ustunlar:

```
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃    MAIN HEADING        ┃  ← Qator 1: 1 ustun
┣━━━━━━━━━┳━━━━━━━━━━━━━┫
┃ Label A ┃   [____]     ┃  ← Qator 2: 2 ustun
┣━━━━━┳━━━╋━━━━━━━┳━━━━━┫
┃ B   ┃ C ┃ [___] ┃ D   ┃  ← Qator 3: 4 ustun
┗━━━━━┻━━━┻━━━━━━━┻━━━━━┛
```

**Yaratish:**
1. Qator 1: Default 2 ustun, birini o'chiring → 1 ustun qoladi
2. Qator 2: Default 2 ustun (o'zgartirmaslik)
3. Qator 3: Default 2 ustun + "[+ Ustun]" 2 marta bosing → 4 ustun

## Amaliy Qo'llanma

### Oddiy Jadval (3x3):

```
Qadamlar:
1. "[+ Qator]" 3 marta bosing (3 ta qator)
2. Har bir qatorga "[+ Ustun]" 1 marta bosing (3 ustun)
3. Birinchi qatorni sarlavha qiling (barcha katakchalar "Matn")
4. Keyingi qatorlarda javob katakchalari belgilang
```

### Turli Xil Ustunlar:

```
Qadamlar:
1. Qator 1: 1 ustun (1 ta o'chirish)
   - Content: "MAIN TITLE"
2. Qator 2: 2 ustun (default)
3. Qator 3: 5 ustun (3 ta qo'shish)
```

## Texnik Ma'lumotlar

### Data Serialization

Ma'lumotlar `gap_filling.body` maydonida JSON formatda saqlanadi:

```typescript
// Frontend → Backend
const serialized = JSON.stringify({
  instruction: tableData.instruction,
  rows: tableData.rows
});

// Backend → Frontend  
const deserialized = JSON.parse(gap_filling.body);
```

### Integration

Table Completion quyidagi fayllarda ishlaydi:

- `/components/TableCompletionEditor.tsx` - Asosiy komponent
- `/lib/tableCompletionHelper.ts` - Helper funksiyalar
- `/components/ListeningForm.tsx` - Listening integratsiyasi
- `/components/BulkReadingForm.tsx` - Reading integratsiyasi

## Best Practices

### ✅ To'g'ri Amaliyotlar:

1. **Aniq Sarlavhalar**: Har bir ustun/qator uchun tushunarli labels
2. **Mantiqiy Tuzilish**: Javoblar mantiqli joylashgan bo'lsin
3. **Oddiy strukturalar**: Murakkab bo'lmagan, tushunarli jadvallar
4. **Preview Tekshirish**: Har doim student view'ni ko'rib chiqing

### ❌ Oldini Olish Kerak:

1. Bo'sh katakchalar qoldirmaslik
2. Juda ko'p qator/ustunlar (10+ dan ortiq)
3. Noaniq javob maydonlari
4. Ortiqcha murakkab strukturalar

## Muammolarni Hal Qilish

### Jadval Ko'rinmaydi
```bash
✓ Browser console'ni tekshiring
✓ JSON formatini validate qiling
✓ Cache'ni tozalang (Ctrl+F5)
```

### Katakchalar Noto'g'ri Joylashgan
```bash
✓ Har bir qatordagi ustunlar sonini hisoblang
✓ Preview mode'da ko'ring
✓ JSON structure'ni tekshiring
```

### Ma'lumotlar Saqlanmaydi
```bash
✓ from_value va to_value to'ldirilganini tekshiring
✓ Kamida 1 ta javob katakchasi borligini tasdiqlang
✓ Network tab'da API response'ni ko'ring
```

## FAQ

**Q: Har bir qatorda turli xil ustunlar bo'lishi mumkinmi?**  
A: Ha! Har bir qator mustaqil va istalgan miqdorda ustunlarga ega bo'lishi mumkin. Masalan: Qator 1 → 1 ustun, Qator 2 → 3 ustun, Qator 3 → 2 ustun.

**Q: Qatorlar bir-biriga bog'langanmi?**  
A: Yo'q! Har bir qator butunlay mustaqil. Siz istalgan qatorga istalgan miqdorda ustun qo'sha olasiz.

**Q: Maximum nechta qator/ustun bo'lishi mumkin?**  
A: Texnik cheklov yo'q, lekin IELTS standartlari uchun 10x10 yetarli.

**Q: Student javoblarni qanday kiritadi?**  
A: Javob katakchalari bo'sh input box sifatida ko'rsatiladi.

**Q: Tugmalar qayerda joylashgan?**  
A: "[+ Qator]" va "[+ Ustun]" tugmalari yuqorida yonma-yon joylashgan. Har bir qator o'z "[+ Ustun]" tugmasiga ega.

## Yangilanish Tarixi

- **v1.0** - Asosiy funksionallik
- **v2.0** - Har bir qatorda turli xil ustunlar qo'llab-quvvatlandi
- **v3.0** - Colspan va rowspan olib tashlandi, soddaroq interfeys