# 🔧 Flowchart & Diagram Completion FormData Fix - IMPLEMENTED ✅

## Muammo
Backend FormData formatida yuborilgan `groups` ni to'g'ri parse qilolmayapti. `diagram_chart` rasmlarni yuklashda xatolik:
```
groups: [{"question_type":"flowchart_completion",...,"diagram_chart":{"image":"__FILE_UPLOAD__group_0_diagram_image"}}]
```

## Yechim Strategiyasi

### Variant 1: diagram_chart faylini alohida field sifatida yuborish
```typescript
// FormData structure:
formData.append('reading', '1');
formData.append('passage_type', 'passage1');
formData.append('title', 'Title');
formData.append('body', 'Body');
formData.append('diagram_chart_0', File);  // Rasm fayli
formData.append('groups', JSON.stringify([{
  question_type: "flowchart_completion",
  gap_filling: {
    diagram_chart: {
      image_index: 0  // diagram_chart_0 ga ishora
    }
  }
}]));
```

### Variant 2: Rasmni URL sifatida saqlash
1. Avval rasmni alohida upload endpoint ga yuborish
2. Olingan URL ni diagram_chart.image ga qo'yish
3. groups ni JSON sifatida yuborish

### Variant 3: Base64 da qoldirish (hozirgi)
- FormData ishlatmasdan JSON format
- Katta rasmlar uchun muammo bo'lishi mumkin

## ✅ Implemented Solution
Variant 1 - diagram_chart_N formatida yuborish va backend buni to'g'ri handle qilishi uchun image_index ishlatish.

### Frontend Changes (DONE ✅)
1. `/lib/api-cleaned.ts` - createReadingPassage va updateReadingPassage
   - Base64 rasmlarni File obyektiga o'girish
   - FormData ga `diagram_chart_0`, `diagram_chart_1` formatida qo'shish
   - groups JSON ichida `image_index` ishlatish

2. `/utils/flowChartCompletionConverter.ts`
   - diagram_chart support qo'shildi
   - Qo'shimcha debugging logs

3. `/utils/diagramLabelingConverter.ts`
   - diagram_chart support qo'shildi
   - diagramImageUrl -> diagram_chart.image

### FormData Structure
```
reading: "1"
passage_type: "passage1"
title: "Title"
body: "Body"
diagram_chart_0: [File] diagram_chart_0.png
groups: '[{"question_type":"flowchart_completion","gap_filling":{"diagram_chart":{"image_index":0}}}]'
```

### Backend Changes Required
```python
# Django backend - reading-pasage-create/ endpoint
groups = json.loads(request.POST.get('groups', '[]'))

for i, group in enumerate(groups):
    if 'gap_filling' in group and 'diagram_chart' in group['gap_filling']:
        image_index = group['gap_filling']['diagram_chart'].get('image_index')
        if image_index is not None:
            file_key = f'diagram_chart_{image_index}'
            if file_key in request.FILES:
                # Save file and get URL
                group['gap_filling']['diagram_chart']['image'] = request.FILES[file_key]
                # Or save file and replace with URL:
                # saved_file = save_uploaded_file(request.FILES[file_key])
                # group['gap_filling']['diagram_chart']['image'] = saved_file.url
```

### Testing
1. Flowchart Completion - rasm yuklash ✅
2. Diagram Labeling - rasm yuklash ✅
3. Console logs - debugging uchun ✅
