# IELTS Form Completion - Test Qo'llanmasi

## Form Completion Nima?

IELTS Listening test turlaridan biri - tinglovchi audio eshitib, forma (masalan: ro'yxatdan o'tish formasi, saqlanish formasi) ni to'ldiradi. Bu turda variantlar yo'q, faqat forma matni va bo'sh joylar bor.

## Yaratish Jarayoni

### 1. Listening Part Ochish
```
Test Detail → Add Question → Listening → Part 1/2/3/4 tanlash
```

### 2. Form Completion Turini Qo'shish
- "Form Completion" tugmasini bosing
- Guruh yaratiladi

### 3. Forma Matnini Yozish

#### Namuna Nusxalash
- "Namuna nusxalash" tugmasini bosing
- Avtomatik ravishda misol forma matni kiritiladi:

```
Appointment Form

Patient name: Aziza (1)
Day: (2)
Date: (3)
Time: (4)
Address: (5) Oxford Street
Landmark: City (6)
Phone: 071-245-(7)
```

#### O'zingiz Yozish
1. Sarlavhani kiriting (masalan: "Complete the form below")
2. Forma matnini textarea ga yozing
3. Bo'sh joylarni `(1)`, `(2)`, `(3)` raqamlari bilan belgilang

**Muhim:**
- Raqamlar ketma-ket bo'lishi shart emas
- Istalgan tartibda yozish mumkin: (1), (5), (3), (7)
- Kamida bitta bo'sh joy bo'lishi kerak

### 4. From-To Qiymatlarini Kiritish
- **Dan (from_value):** Birinchi savol raqami (masalan: 1)
- **Gacha (to_value):** Oxirgi savol raqami (masalan: 7)

### 5. Preview Ko'rish
- "Preview ko'rish" tugmasini bosing
- Forma qanday ko'rinishini ko'ring

### 6. Saqlash
- "Saqlash" tugmasini bosing
- Part backend ga yuboriladi

## Backend Integratsiya

### Create Request
```json
POST /listening-parts/create_with_questions/
{
  "listening": 1,
  "part_type": "part_1",
  "groups": [
    {
      "listening_question_type": "form_completion",
      "from_value": 1,
      "to_value": 7,
      "completion": {
        "title": "Complete the form below",
        "principle": "NMT_TWO",
        "body": "Appointment Form\n\nPatient name: Aziza (1)\nDay: (2)\nDate: (3)\nTime: (4)\nAddress: (5) Oxford Street\nLandmark: City (6)\nPhone: 071-245-(7)"
      }
    }
  ]
}
```

### Retrieve Response
Backend dan ma'lumot olinganda:
```json
GET /listening-parts/{id}/
{
  "id": 1,
  "title": "Part 1",
  "audio": "http://...",
  "groups": [
    {
      "id": 1,
      "listening_question_type": "form_completion",
      "from_value": 1,
      "to_value": 7,
      "completion": {
        "title": "Complete the form below",
        "principle": "NMT_TWO",
        "body": "Appointment Form\n\nPatient name: Aziza (1)\n..."
      }
    }
  ]
}
```

## Tahrirlash (Update)

1. Test Detail sahifasida "Edit" tugmasini bosing
2. Listening → Part 1/2/3/4 tanlang
3. Form Completion guruhi avtomatik yuklanadi
4. Forma matnini tahrirlang
5. "Saqlash" tugmasini bosing

**Backend dan kelgan ma'lumot:**
- `completion.body` dan forma matni olinadi
- `completion.title` dan sarlavha olinadi
- Frontend formatiga o'zgartiriladi

## Validatsiya

### Frontend
1. ✅ Sarlavha kiritilganligini tekshiradi (ixtiyoriy)
2. ✅ Body (forma matni) bo'sh emasligini tekshiradi
3. ✅ Kamida bitta bo'sh joy `(1)` mavjudligini tekshiradi
4. ✅ From va To qiymatlarini tekshiradi

### Backend
- Backend tomonidan amalga oshiriladi
- `completion.body` required
- `completion.title` optional
- `completion.principle` default: "NMT_TWO"

## Xususiyatlar

### ✅ Yangi Funksiyalar
- Oddiy textarea - variantlar yo'q
- Forma matnini to'liq tahrirlash
- Bo'sh joylar avtomatik aniqlash
- Preview ko'rish
- Namuna nusxalash

### ❌ Olib Tashlangan
- Variantlar (A, B, C)
- Savol guruhlari
- To'g'ri javoblarni tanlash

## Misollar

### Registration Form
```
Registration Form

Full name: (1)
Email: (2)
Phone: (3)
Date of birth: (4)
Address: (5) Main Street
Postcode: (6)
```

### Booking Form
```
Hotel Booking

Guest name: (1)
Room type: (2) room
Check-in date: (3)
Number of nights: (4)
Price per night: £(5)
```

### Conference Registration
```
Conference Registration

Delegate name: (1)
Company: (2)
Workshop preference: (3)
Dietary requirements: (4)
Payment method: (5)
```

## Tez-tez So'raladigan Savollar

**Q: Variantlar qayerda?**
A: Form Completion turida variantlar yo'q. Talaba audio eshitib, to'g'ridan-to'g'ri yozadi.

**Q: Bo'sh joylar ketma-ket bo'lishi kerakmi?**
A: Yo'q, istalgan tartibda bo'lishi mumkin.

**Q: Necha ta bo'sh joy bo'lishi mumkin?**
A: Cheklov yo'q, lekin IELTS da odatda 5-10 ta bo'ladi.

**Q: From-To qiymatlari nima?**
A: Test dagi savol raqamlari. Masalan, 11-dan 20-gacha.

## Debugging

Agar xatolik yuz bersa, console.log ni tekshiring:

1. **Frontend:**
   - "Converted completion to form_completion"
   - "Converted form_completion to gap_filling"

2. **Backend:**
   - POST request body ni tekshiring
   - `completion.body` mavjudligini tekshiring

3. **Validatsiya xatoliklari:**
   - "Form body is required"
   - "Form must contain at least one numbered gap"

## Muhim Eslatmalar

- ✅ Forma matnini yozish/o'chirish erkin
- ✅ Preview ko'rish mumkin
- ✅ Backend ga to'g'ri formatda yuboriladi
- ✅ Backend dan ma'lumot to'g'ri yuklanadi
- ✅ Validatsiya ishlaydi
