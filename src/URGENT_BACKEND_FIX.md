# 🚨 URGENT BACKEND SERIALIZER FIX REQUIRED

## ❌ Current Error
```
AttributeError: 'RelatedManager' object has no attribute 'statement'
Location: /var/www/pretest/backend/dashboard/serializers/reading.py, line 88
```

## 🔍 Root Cause
The `MatchingStatementSerializer.get_questions()` method is receiving a **RelatedManager** object instead of a **MatchingStatement** model instance.

This happens because the serializer field is incorrectly configured in `QuestionGroupModelSerializer`.

## ✅ SOLUTION (3 minutes fix)

### Option 1: Fix the Serializer Field (RECOMMENDED)

**File:** `/var/www/pretest/backend/dashboard/serializers/reading.py`

**Current (WRONG) code in QuestionGroupModelSerializer:**
```python
class QuestionGroupModelSerializer(ModelSerializer):
    # ... other fields ...
    matching = MatchingStatementSerializer(required=False)  # ❌ WRONG - missing source
```

**Fixed code:**
```python
class QuestionGroupModelSerializer(ModelSerializer):
    # ... other fields ...
    matching = MatchingStatementSerializer(
        source='matchingstatement',  # ✅ Add this - use the actual related name
        required=False,
        read_only=True
    )
```

**If the related name is different, check your model:**
```python
# In your QuestionGroup model, check the related_name:
class QuestionGroup(models.Model):
    # Find the ForeignKey or OneToOneField that links to MatchingStatement
    # It might look like:
    # matching_statement = models.OneToOneField(
    #     MatchingStatement,
    #     related_name='question_group',  # ← Use this name
    # )
```

### Option 2: Handle RelatedManager in get_questions()

**File:** `/var/www/pretest/backend/dashboard/serializers/reading.py`

**Current (WRONG) code:**
```python
def get_questions(self, obj):
    return [
        {
            "statement": s,
            "option": obj.option[i]
        }
        for i, s in enumerate(obj.statement)  # ❌ obj is RelatedManager
    ]
```

**Fixed code:**
```python
def get_questions(self, obj):
    # ✅ Check if obj is the correct type
    if isinstance(obj, RelatedManager):
        # If it's a RelatedManager, get the first related object
        obj = obj.first()
        if not obj:
            return []
    
    # Now obj should be a MatchingStatement instance
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

## 🧪 How to Test

1. **Restart your Django server:**
   ```bash
   cd /var/www/pretest/backend
   sudo systemctl restart pretest  # or your service name
   ```

2. **Test the API endpoint:**
   ```bash
   curl https://api.samariddin.space/api/v1/readings/1/passages/
   ```

3. **Check for errors:** Should return JSON data without AttributeError

## 📋 Quick Diagnostic Commands

```bash
# 1. Check your current code
cd /var/www/pretest/backend
grep -n "class MatchingStatementSerializer" dashboard/serializers/reading.py -A 20

# 2. Check the model relationships
grep -n "class QuestionGroup" dashboard/models/*.py -A 30

# 3. Check if the fix was applied
grep -n "source=" dashboard/serializers/reading.py | grep matching
```

## 🎯 Expected Result

After fix, the API should return:
```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 2,
      "passage_type": "passage1",
      "title": "...",
      "body": "...",
      "groups": [
        {
          "from_value": 1,
          "to_value": 6,
          "reading_question_type": "true_false_not_given",
          "matching": {
            "id": 1,
            "variant_type": "letter",
            "answer_count": 6,
            "questions": [
              {"statement": "...", "option": "A"},
              {"statement": "...", "option": "B"}
            ]
          }
        }
      ]
    }
  ]
}
```

## ⚡ If Issue Persists

1. **Check the actual related_name in your model:**
   ```python
   # Find in dashboard/models/
   python manage.py shell
   >>> from dashboard.models import QuestionGroup
   >>> QuestionGroup._meta.get_fields()
   # Look for the field that connects to MatchingStatement
   ```

2. **Enable Django debug logging:**
   ```python
   # In settings.py
   LOGGING = {
       'version': 1,
       'handlers': {
           'console': {
               'class': 'logging.StreamHandler',
           },
       },
       'loggers': {
           'django.db.backends': {
               'handlers': ['console'],
               'level': 'DEBUG',
           },
       },
   }
   ```

3. **Contact frontend team** if backend fix is complete but error persists

---
**Created:** 2025-12-26  
**Priority:** 🔥 CRITICAL - Blocks all Reading passage features
