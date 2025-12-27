# 🚀 Automatic Related Object Creation Guide

## 📋 Overview

This guide explains how to implement automatic related object creation in Django REST Framework, similar to how `listening-part-create` automatically creates `listening-audio` objects.

**Goal:** When creating a reading passage with `gap_filling` question type (flowchart_completion or diagram_labeling), automatically create the related `diagram_chart` object.

---

## ✅ Example 1: Listening Part + Listening Audio (WORKING)

### API Behavior
```bash
POST /api/v1/listening-part-create/

# Request creates listening part
# Response returns BOTH created objects:
{
  "id": 1,
  "detail": "Listening part created successfully"
}

# Related audio is automatically available at:
GET /api/v1/listening-audio/
{
  "audio": "https://api.samariddin.space/media/listening/audio/2025/12/25/file.png",
  "listening_part": 1
}
```

### Django Implementation (listening-part-create)
```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import ListeningPart, ListeningAudio

@api_view(['POST'])
def listening_part_create(request):
    data = request.data
    
    # 1. Create the main object (ListeningPart)
    listening_part = ListeningPart.objects.create(
        title=data['title'],
        # ... other fields
    )
    
    # 2. Create the related object (ListeningAudio) automatically
    if 'audio_file' in request.FILES:
        ListeningAudio.objects.create(
            listening_part=listening_part,  # ✅ Link to parent
            audio=request.FILES['audio_file']
        )
    
    # 3. Return simple response (no nested data needed)
    return Response({
        'id': listening_part.id,
        'detail': 'Listening part created successfully'
    }, status=201)
```

**Key Points:**
- ✅ Creates both objects in one request
- ✅ Simple response (doesn't need nested serializer)
- ✅ Related object is fetched separately when needed

---

## 🎯 Required Implementation: Reading Passage + Diagram Chart

### Desired API Behavior
```bash
POST /api/v1/reading-pasage-create/

# Request:
{
  "title": "Passage Title",
  "body": "Passage text...",
  "groups": [
    {
      "question_type": "flowchart_completion",
      "from_value": 1,
      "to_value": 5,
      "gap_filling": {
        "title": "Complete the flowchart",
        "questions": ["Q1", "Q2"],
        "answer_count": 2,
        "diagram_chart": {
          "image": "base64_encoded_image_data"
        }
      }
    }
  ]
}

# Response MUST include gap_filling IDs:
{
  "id": 123,
  "title": "Passage Title",
  "body": "Passage text...",
  "groups": [
    {
      "id": 456,
      "question_type": "flowchart_completion",
      "gap_filling": {
        "id": 789,  // ✅ CRITICAL: Frontend needs this ID!
        "title": "Complete the flowchart",
        "questions": ["Q1", "Q2"],
        "answer_count": 2,
        "diagram_chart": {
          "id": 999,
          "image": "https://api.samariddin.space/media/diagrams/image.png",
          "gap_filling": 789
        }
      }
    }
  ]
}
```

---

## 🔧 Django Implementation (Step-by-Step)

### Step 1: Create Nested Serializers
```python
# serializers.py
from rest_framework import serializers
from .models import ReadingPassage, QuestionGroup, GapFilling, DiagramChart

class DiagramChartSerializer(serializers.ModelSerializer):
    """Serializer for DiagramChart model"""
    class Meta:
        model = DiagramChart
        fields = ['id', 'image', 'gap_filling']

class GapFillingSerializer(serializers.ModelSerializer):
    """Serializer for GapFilling with nested DiagramChart"""
    diagram_chart = DiagramChartSerializer(read_only=True)
    
    class Meta:
        model = GapFilling
        fields = ['id', 'title', 'questions', 'answer_count', 'diagram_chart']

class QuestionGroupSerializer(serializers.ModelSerializer):
    """Serializer for QuestionGroup with nested GapFilling"""
    gap_filling = GapFillingSerializer(read_only=True)
    
    class Meta:
        model = QuestionGroup
        fields = ['id', 'question_type', 'from_value', 'to_value', 'gap_filling']

class ReadingPassageSerializer(serializers.ModelSerializer):
    """Main serializer for ReadingPassage with nested groups"""
    groups = QuestionGroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = ReadingPassage
        fields = ['id', 'title', 'body', 'passage_type', 'groups']
```

### Step 2: Update View to Create Related Objects
```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.base import ContentFile
import base64

@api_view(['POST'])
def reading_passage_create(request):
    data = request.data
    
    # 1. Create main passage
    passage = ReadingPassage.objects.create(
        reading_id=data['reading'],
        title=data['title'],
        body=data['body'],
        passage_type=data['passage_type']
    )
    
    # 2. Create question groups
    for group_data in data.get('groups', []):
        group = QuestionGroup.objects.create(
            passage=passage,
            question_type=group_data['question_type'],
            from_value=group_data['from_value'],
            to_value=group_data['to_value']
        )
        
        # 3. Create gap_filling if present
        if 'gap_filling' in group_data:
            gap_filling_data = group_data['gap_filling']
            gap_filling = GapFilling.objects.create(
                question_group=group,
                title=gap_filling_data['title'],
                questions=gap_filling_data['questions'],
                answer_count=gap_filling_data['answer_count']
            )
            
            # 4. ✅ AUTOMATICALLY CREATE DIAGRAM CHART (if image present)
            diagram_chart_data = gap_filling_data.get('diagram_chart')
            if diagram_chart_data and 'image' in diagram_chart_data:
                # Handle base64 image
                image_data = diagram_chart_data['image']
                
                # Remove data:image header if present
                if ',' in image_data:
                    format, imgstr = image_data.split(';base64,')
                    ext = format.split('/')[-1]
                else:
                    imgstr = image_data
                    ext = 'png'
                
                # Decode base64
                image_content = ContentFile(
                    base64.b64decode(imgstr),
                    name=f'diagram_{gap_filling.id}.{ext}'
                )
                
                # Create DiagramChart automatically
                DiagramChart.objects.create(
                    gap_filling=gap_filling,
                    image=image_content
                )
    
    # 5. ✅ CRITICAL: Use serializer to return complete nested data
    serializer = ReadingPassageSerializer(passage)
    return Response(serializer.data, status=201)
```

### Step 3: Update PATCH Endpoint Similarly
```python
@api_view(['PATCH'])
def reading_passage_update(request, pk):
    try:
        passage = ReadingPassage.objects.get(pk=pk)
    except ReadingPassage.DoesNotExist:
        return Response({'error': 'Passage not found'}, status=404)
    
    data = request.data
    
    # Update passage fields
    passage.title = data.get('title', passage.title)
    passage.body = data.get('body', passage.body)
    passage.passage_type = data.get('passage_type', passage.passage_type)
    passage.save()
    
    # Update or create groups
    if 'groups' in data:
        # Delete existing groups (or update them)
        passage.groups.all().delete()
        
        for group_data in data['groups']:
            group = QuestionGroup.objects.create(
                passage=passage,
                question_type=group_data['question_type'],
                from_value=group_data['from_value'],
                to_value=group_data['to_value']
            )
            
            # Create gap_filling and diagram_chart
            if 'gap_filling' in group_data:
                gap_filling_data = group_data['gap_filling']
                gap_filling = GapFilling.objects.create(
                    question_group=group,
                    title=gap_filling_data['title'],
                    questions=gap_filling_data['questions'],
                    answer_count=gap_filling_data['answer_count']
                )
                
                # ✅ AUTO-CREATE DIAGRAM CHART
                diagram_chart_data = gap_filling_data.get('diagram_chart')
                if diagram_chart_data and 'image' in diagram_chart_data:
                    # Same image handling as in create
                    image_data = diagram_chart_data['image']
                    if ',' in image_data:
                        format, imgstr = image_data.split(';base64,')
                        ext = format.split('/')[-1]
                    else:
                        imgstr = image_data
                        ext = 'png'
                    
                    image_content = ContentFile(
                        base64.b64decode(imgstr),
                        name=f'diagram_{gap_filling.id}.{ext}'
                    )
                    
                    DiagramChart.objects.create(
                        gap_filling=gap_filling,
                        image=image_content
                    )
    
    # ✅ Return with nested data
    serializer = ReadingPassageSerializer(passage)
    return Response(serializer.data, status=200)
```

---

## 📊 Model Structure (Reference)

```python
# models.py
class ReadingPassage(models.Model):
    title = models.CharField(max_length=255)
    body = models.TextField()
    passage_type = models.CharField(max_length=50)
    # ... other fields

class QuestionGroup(models.Model):
    passage = models.ForeignKey(ReadingPassage, on_delete=models.CASCADE, related_name='groups')
    question_type = models.CharField(max_length=50)
    from_value = models.IntegerField()
    to_value = models.IntegerField()
    # ... other fields

class GapFilling(models.Model):
    question_group = models.OneToOneField(QuestionGroup, on_delete=models.CASCADE, related_name='gap_filling')
    title = models.CharField(max_length=255)
    questions = models.JSONField()  # Array of questions
    answer_count = models.IntegerField()
    # ... other fields

class DiagramChart(models.Model):
    gap_filling = models.OneToOneField(GapFilling, on_delete=models.CASCADE, related_name='diagram_chart')
    image = models.ImageField(upload_to='diagrams/')
    # ... other fields
```

**Important Relationships:**
- `ReadingPassage` → `QuestionGroup` (One-to-Many via `related_name='groups'`)
- `QuestionGroup` → `GapFilling` (One-to-One via `related_name='gap_filling'`)
- `GapFilling` → `DiagramChart` (One-to-One via `related_name='diagram_chart'`)

---

## ✅ Testing Checklist

### 1. Test POST Request
```bash
curl -X POST http://localhost:8000/api/v1/reading-pasage-create/ \
  -H "Content-Type: application/json" \
  -d '{
    "reading": 1,
    "title": "Test Passage",
    "body": "Test body",
    "passage_type": "passage1",
    "groups": [
      {
        "question_type": "flowchart_completion",
        "from_value": 1,
        "to_value": 5,
        "gap_filling": {
          "title": "Complete the flowchart",
          "questions": ["Q1", "Q2"],
          "answer_count": 2,
          "diagram_chart": {
            "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
          }
        }
      }
    ]
  }'

# ✅ CHECK RESPONSE:
# 1. Has groups array? ✓
# 2. groups[0].gap_filling exists? ✓
# 3. groups[0].gap_filling.id exists? ✓ (CRITICAL)
# 4. groups[0].gap_filling.diagram_chart exists? ✓
# 5. groups[0].gap_filling.diagram_chart.id exists? ✓
# 6. groups[0].gap_filling.diagram_chart.image has URL? ✓
```

### 2. Verify Database
```python
# Django shell
from myapp.models import ReadingPassage, QuestionGroup, GapFilling, DiagramChart

# Check if objects were created
passage = ReadingPassage.objects.last()
print(f"Passage: {passage.id} - {passage.title}")

group = passage.groups.first()
print(f"Group: {group.id} - {group.question_type}")

gap_filling = group.gap_filling
print(f"GapFilling: {gap_filling.id} - {gap_filling.title}")

diagram = gap_filling.diagram_chart
print(f"DiagramChart: {diagram.id} - {diagram.image.url}")
```

### 3. Test Frontend
Open browser console and check for success logs:
```
✅ Reading passage created successfully!
✅ Found gap_filling.id: 789
✅ Found existing diagram_chart.id: 999
✅ Diagram chart already exists, skipping upload
```

---

## 🎯 Summary

### What You Need to Implement

1. **Nested Serializers** (serializers.py)
   - `DiagramChartSerializer`
   - `GapFillingSerializer` (includes diagram_chart)
   - `QuestionGroupSerializer` (includes gap_filling)
   - `ReadingPassageSerializer` (includes groups)

2. **Auto-Create Logic** (views.py)
   - In `reading_passage_create`: Create DiagramChart when gap_filling has image
   - In `reading_passage_update`: Same logic for updates
   - Use serializers in responses to return nested data

3. **Response Format**
   - Must include `groups` array
   - Each group must have `gap_filling` as object (not ID)
   - Each `gap_filling` must have `id` field
   - If diagram exists, include `diagram_chart` with `id` and `image` URL

### Benefits

✅ Frontend no longer needs separate upload requests  
✅ Atomic operation (all created in one transaction)  
✅ Matches `listening-part-create` pattern  
✅ Cleaner API design  
✅ No race conditions  

---

## 📚 Related Documentation

- `/BACKEND_GAP_FILLING_ID_FIX.md` - Why nested serializers are needed
- `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md` - Old separate API approach
- `/README_DIAGRAM_CHART_FIX.md` - Quick reference guide
- Frontend: `/lib/api-cleaned.ts` - `createReadingPassage()` function

---

**Last Updated:** December 25, 2024  
**Status:** Implementation guide ready  
**Priority:** 🔴 CRITICAL - Required for flowchart/diagram features
