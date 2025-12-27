# 🎯 Backend Fix - Visual Guide

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ❌ XATOLIK: RelatedManager obyekti statement'ga ega emas  │
│                                                             │
│  📍 Joylashuv: dashboard/serializers/reading.py, line 88   │
│                                                             │
│  ⏱️  Fix vaqti: 3 daqiqa                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 Muammo Vizual

```
Frontend           Backend API          Serializer           Django Model
   ↓                    ↓                    ↓                     ↓
GET /passages/   →   Reading View   →   Serializer.data   →   QuestionGroup
                                              ↓
                                       MatchingSerializer
                                              ↓
                                       get_questions()
                                              ↓
                                         ❌ ERROR ❌
                                     obj.statement
                                     (obj is RelatedManager,
                                      not MatchingStatement)
```

## ✅ Yechim Vizual

### Variant 1: Source Parameter (Oson)

```python
class QuestionGroupModelSerializer(ModelSerializer):
    
    # ❌ XATO (hozirgi):
    matching = MatchingStatementSerializer(required=False)
    
    # ✅ TO'G'RI (o'zgartirish):
    matching = MatchingStatementSerializer(
        source='matchingstatement',  # ← Qo'shing
        required=False,
        read_only=True
    )
```

**Natija:**
```
Serializer → source='matchingstatement' → Model instance ✅
                                        (not RelatedManager ❌)
```

---

### Variant 2: Method Update (Murakkab)

```python
def get_questions(self, obj):
    
    # ❌ XATO (hozirgi):
    # for i, s in enumerate(obj.statement)  # obj - RelatedManager
    
    
    # ✅ TO'G'RI (o'zgartirish):
    from django.db.models import Manager
    
    # 1️⃣ RelatedManager'ni tekshirish
    if isinstance(obj, Manager):
        obj = obj.first()  # Birinchi instance'ni olish
        if not obj:
            return []
    
    # 2️⃣ Xavfsiz attribute access
    statements = obj.statement if hasattr(obj, 'statement') else []
    options = obj.option if hasattr(obj, 'option') else []
    
    # 3️⃣ Data qaytarish
    return [
        {
            "statement": statements[i] if i < len(statements) else "",
            "option": options[i] if i < len(options) else ""
        }
        for i in range(max(len(statements), len(options)))
    ]
```

**Natija:**
```
RelatedManager → Check type → Get first() → Use attributes ✅
```

---

## 📂 Fayl Strukturasi

```
/var/www/pretest/backend/
├── dashboard/
│   ├── serializers/
│   │   └── reading.py  ← 🎯 SHU FAYLNI TAHRIRLASH
│   └── models/
│       ├── reading.py
│       └── question.py
└── manage.py
```

---

## 🔧 Qadamlar (Step-by-Step)

```
┌─────────────────────────────────────────────────────┐
│ 1️⃣  Faylni Ochish                                   │
└─────────────────────────────────────────────────────┘

$ cd /var/www/pretest/backend
$ vim dashboard/serializers/reading.py
```

```
┌─────────────────────────────────────────────────────┐
│ 2️⃣  Qatorni Topish                                   │
└─────────────────────────────────────────────────────┘

/class QuestionGroupModelSerializer    # Search in vim
                                        # or
/matching =                             # Find the line
```

```
┌─────────────────────────────────────────────────────┐
│ 3️⃣  O'zgartirish                                     │
└─────────────────────────────────────────────────────┘

Before:
    matching = MatchingStatementSerializer(required=False)

After:
    matching = MatchingStatementSerializer(
        source='matchingstatement',
        required=False,
        read_only=True
    )
```

```
┌─────────────────────────────────────────────────────┐
│ 4️⃣  Saqlash va Chiqish                               │
└─────────────────────────────────────────────────────┘

:wq    # Vim'da saqlash
```

```
┌─────────────────────────────────────────────────────┐
│ 5️⃣  Server Restart                                   │
└─────────────────────────────────────────────────────┘

$ sudo systemctl restart pretest
```

```
┌─────────────────────────────────────────────────────┐
│ 6️⃣  Test                                             │
└─────────────────────────────────────────────────────┘

$ curl https://api.samariddin.space/api/v1/readings/1/passages/

✅ JSON ko'rinsa - SUCCESS!
❌ HTML ko'rinsa - yana tekshiring
```

---

## 🧪 Test Natijalari

### ❌ Xato (Hozirgi):
```html
<!DOCTYPE html>
<html>
<head><title>AttributeError at /api/v1/readings/1/passages/</title></head>
<body>
  <h1>AttributeError</h1>
  <pre>'RelatedManager' object has no attribute 'statement'</pre>
</body>
</html>
```

### ✅ To'g'ri (Fix Qo'llangandan Keyin):
```json
{
  "count": 1,
  "results": [
    {
      "id": 2,
      "passage_type": "passage1",
      "title": "Mindfulness",
      "body": "...",
      "groups": [
        {
          "from_value": 1,
          "to_value": 6,
          "reading_question_type": "true_false_not_given",
          "matching": {
            "id": 1,
            "questions": [
              {"statement": "...", "option": "A"}
            ]
          }
        }
      ]
    }
  ]
}
```

---

## 🎓 Nima Uchun Bu Xato Yuz Berdi?

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Django'da ForeignKey/OneToOneField ishlatilganda:      │
│                                                          │
│  QuestionGroup.matching  →  RelatedManager object       │
│                              (collection of objects)     │
│                                                          │
│  Lekin serializer kutgan:                               │
│                                                          │
│  QuestionGroup.matching  →  MatchingStatement instance  │
│                              (single object)             │
│                                                          │
│  source='matchingstatement' qo'shsangiz:                │
│  Django avtomatik to'g'ri obyektni beradi               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📞 Yordam Kerakmi?

### Related Name Topish:
```bash
$ cd /var/www/pretest/backend
$ grep -rn "class MatchingStatement" dashboard/models/
$ grep -rn "ForeignKey.*MatchingStatement" dashboard/models/
```

### Django Shell:
```python
$ python manage.py shell

>>> from dashboard.models import QuestionGroup
>>> for field in QuestionGroup._meta.get_fields():
...     if 'matching' in field.name.lower():
...         print(f"{field.name}: {field}")
```

### Log'larni Ko'rish:
```bash
$ sudo journalctl -u pretest -n 50 --no-pager
```

---

## 🏁 Muvaffaqiyat Mezoni

```
✅ curl JSON qaytaradi
✅ Frontend'da "Qayta tekshirish" button ishlaydi
✅ Passages yuklanadi
✅ Savol guruhlari ko'rinadi
✅ Xatolik yo'qoladi
```

---

**Omad!** 🎉

Agar muammo hal bo'lmasa:
- `/URGENT_BACKEND_FIX.md` - Batafsil English dokumentatsiya
- `/BACKEND_FIX_QUICK_GUIDE.md` - Qisqa O'zbekcha guide

**Vaqt:** 3-5 daqiqa | **Difficulty:** ⭐⭐☆☆☆ (Easy)
