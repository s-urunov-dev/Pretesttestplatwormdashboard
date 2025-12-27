# ⚡ Backend Serializer Xatoligi - Tezkor Fix (3 daqiqa)

## ❌ Xatolik
```
AttributeError: 'RelatedManager' object has no attribute 'statement'
Fayl: dashboard/serializers/reading.py, qator: 88
```

## ✅ Yechim (ikkita variant)

### Variant 1: Serializer Field'ni To'g'rilash (TAVSIYA ETILADI)

**Fayl:** `dashboard/serializers/reading.py`

**Hozirgi xato kod:**
```python
class QuestionGroupModelSerializer(ModelSerializer):
    # ... boshqa fieldlar ...
    matching = MatchingStatementSerializer(required=False)  # ❌ XATO
```

**To'g'ri kod:**
```python
class QuestionGroupModelSerializer(ModelSerializer):
    # ... boshqa fieldlar ...
    matching = MatchingStatementSerializer(
        source='matchingstatement',  # ✅ related_name'ni qo'shing
        required=False,
        read_only=True
    )
```

**❗ Muhim:** `'matchingstatement'` o'rniga sizning modelingizdagi `related_name`'ni ishlating.

---

### Variant 2: get_questions() Metodini To'g'rilash

**Fayl:** `dashboard/serializers/reading.py`

**Hozirgi xato kod:**
```python
def get_questions(self, obj):
    return [
        {
            "statement": s,
            "option": obj.option[i]
        }
        for i, s in enumerate(obj.statement)  # ❌ obj - RelatedManager
    ]
```

**To'g'ri kod:**
```python
def get_questions(self, obj):
    # RelatedManager'ni tekshirish
    from django.db.models import Manager
    
    if isinstance(obj, Manager):
        obj = obj.first()  # Birinchi obyektni olish
        if not obj:
            return []
    
    # Endi obj - MatchingStatement instance
    statements = obj.statement if hasattr(obj, 'statement') else []
    options = obj.option if hasattr(obj, 'option') else []
    
    return [
        {
            "statement": statements[i] if i < len(statements) else "",
            "option": options[i] if i < len(options) else ""
        }
        for i in range(max(len(statements), len(options)))
    ]
```

---

## 🧪 Test Qilish

```bash
# 1. Django serverini qayta ishga tushiring
sudo systemctl restart pretest  # yoki sizning service nomingiz

# 2. API'ni test qiling
curl https://api.samariddin.space/api/v1/readings/1/passages/

# 3. Javob JSON bo'lishi kerak (HTML emas)
```

---

## 📋 Related Name'ni Topish

Agar `related_name` nima ekanini bilmasangiz:

```bash
cd /var/www/pretest/backend
grep -rn "class MatchingStatement" dashboard/models/
grep -rn "class QuestionGroup" dashboard/models/ -A 20
```

Yoki:

```python
python manage.py shell
>>> from dashboard.models import QuestionGroup
>>> QuestionGroup._meta.get_fields()
# MatchingStatement bilan bog'langan fieldni toping
```

---

## ✅ Natija

API quyidagi formatda javob qaytarishi kerak:

```json
{
  "results": [
    {
      "id": 2,
      "title": "...",
      "groups": [
        {
          "matching": {
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

**Muammo davom etsami:** `/URGENT_BACKEND_FIX.md` faylida batafsil ko'rsatmalar bor.

**Tuzatildi:** 2025-12-26 | **Vaqt:** 3-5 daqiqa
