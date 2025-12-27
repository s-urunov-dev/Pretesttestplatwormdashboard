# 🚨 Backend Serializer Error - Fix Documentation

## Xatolik Haqida

Backend API'da **MatchingStatementSerializer** serializer'ida xatolik bor. Bu frontend muammosi emas - backend dasturchi tomonidan hal qilinishi kerak.

### Xatolik:
```
AttributeError: 'RelatedManager' object has no attribute 'statement'
Location: /var/www/pretest/backend/dashboard/serializers/reading.py, line 88
```

### API Endpoint:
```
GET /api/v1/readings/{reading_id}/passages/
```

---

## 📚 Fix Documentation Files

### 1. **Tezkor Fix (3 daqiqa)** ⚡
- **Fayl:** `/BACKEND_FIX_QUICK_GUIDE.md`
- **Til:** O'zbekcha
- **Maqsad:** Eng sodda va tez yechim
- **Kimga:** Backend developer uchun (Uzbekistan team)

### 2. **Batafsil Fix (5 daqiqa)** 📖
- **Fayl:** `/URGENT_BACKEND_FIX.md`
- **Til:** English
- **Maqsad:** To'liq diagnostika, test commands, troubleshooting
- **Kimga:** Senior backend developer, DevOps

---

## ✅ Fix Qadamlari (Qisqacha)

### Variant 1: Serializer Field (TAVSIYA)
```python
# dashboard/serializers/reading.py

class QuestionGroupModelSerializer(ModelSerializer):
    matching = MatchingStatementSerializer(
        source='matchingstatement',  # ← Add this
        required=False,
        read_only=True
    )
```

### Variant 2: get_questions() Method
```python
def get_questions(self, obj):
    from django.db.models import Manager
    
    if isinstance(obj, Manager):
        obj = obj.first()
        if not obj:
            return []
    
    statements = obj.statement if hasattr(obj, 'statement') else []
    options = obj.option if hasattr(obj, 'option') else []
    
    return [
        {"statement": statements[i], "option": options[i]}
        for i in range(max(len(statements), len(options)))
    ]
```

---

## 🧪 Qanday Test Qilish

```bash
# 1. Fix qo'llash
vim /var/www/pretest/backend/dashboard/serializers/reading.py

# 2. Server restart
sudo systemctl restart pretest

# 3. Test
curl https://api.samariddin.space/api/v1/readings/1/passages/

# ✅ JSON response bo'lishi kerak
# ❌ HTML bo'lsa - xato hali hal qilinmagan
```

---

## 🎯 Frontend Status

✅ **Frontend to'liq tayyor** - error handling qo'shilgan  
✅ **BackendErrorAlert component** yaratildi  
✅ **Auto-detection** - HTML error page'ni avtomatik aniqlaydi  
✅ **Retry button** - backend fix qilinganidan keyin test qilish mumkin

Frontend kodi hech qanday muammosiz ishlaydi. Faqat backend serializer'ni tuzatish kerak.

---

## 💡 Qo'shimcha Ma'lumot

### Sabab:
`MatchingStatementSerializer` noto'g'ri obyekt olmoqda:
- **Kutilgan:** `MatchingStatement` model instance
- **Kelgan:** `RelatedManager` object (ForeignKey/OneToOne manager)

### Yechim:
Source parametr orqali to'g'ri related field'ni ko'rsatish yoki get_questions() metodida RelatedManager'ni handle qilish.

---

## 📞 Yordam

Agar muammo hal bo'lmasa:

1. Batafsil log'larni ko'ring:
   ```bash
   sudo journalctl -u pretest -n 100 --no-pager
   ```

2. Django shell'da model strukturasini tekshiring:
   ```python
   python manage.py shell
   >>> from dashboard.models import QuestionGroup, MatchingStatement
   >>> QuestionGroup._meta.get_fields()
   ```

3. `/URGENT_BACKEND_FIX.md` faylida troubleshooting bo'limi bor

---

**Yaratildi:** 2025-12-26  
**Status:** 🔴 Backend fix talab qilinadi  
**Priority:** CRITICAL - Reading passages ishlamayapti  
**Vaqt:** 3-5 daqiqa (backend developer uchun)
