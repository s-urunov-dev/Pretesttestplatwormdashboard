# 🔧 Troubleshooting: Diagram Chart Upload Issues

## 🚨 Common Errors

### Error 1: "No groups in created passage response!"

**Console Output:**
```
⚠️ CRITICAL: No groups array in backend response!
Expected: response.groups = [...]
Received: { id: 123, title: "...", body: "..." }
```

**Cause:** Backend POST `/reading-pasage-create/` does not return `groups` array.

**Solution:** Backend must use nested serializers to return complete response.

**Fix Location:** `/BACKEND_GAP_FILLING_ID_FIX.md` - Section "Option 1: POST Response'da Gap Filling ID Qaytarish"

---

### Error 2: "Gap filling ID not found for flowchart_completion"

**Console Output:**
```
❌ DIAGRAM CHART UPLOAD FAILED - Gap filling ID not found!
Group: 0
Question Type: flowchart_completion
Has Image: true

🔴 REASON:
Backend POST response does not include gap_filling ID.
```

**Cause:** Backend returns `groups` array but `gap_filling` does not have `id` field.

**Possible Backend Response Structures:**

❌ **WRONG:**
```json
{
  "groups": [
    {
      "gap_filling": 789  // ← Number instead of object
    }
  ]
}
```

❌ **WRONG:**
```json
{
  "groups": [
    {
      "gap_filling": {
        "title": "...",
        "questions": []
        // ❌ NO ID!
      }
    }
  ]
}
```

✅ **CORRECT:**
```json
{
  "groups": [
    {
      "gap_filling": {
        "id": 789,  // ← MUST HAVE THIS
        "title": "...",
        "questions": []
      }
    }
  ]
}
```

**Solution:** Backend must include `id` in `GapFillingSerializer` fields.

---

### Error 3: Diagram Chart Uploaded but Not Visible

**Symptoms:**
- ✅ Console shows "Diagram chart uploaded successfully"
- ❌ Image not visible in frontend

**Debug Steps:**

1. **Check DiagramChart API Response:**
   ```javascript
   // Browser console
   // Look for logs:
   ✅ Diagram chart uploaded for group 0: { id: 123, image: "...", gap_filling: 789 }
   ```

2. **Verify Image URL:**
   - DiagramChart response should include full image URL
   - Check if URL is accessible

3. **Check GET Endpoint:**
   - Frontend may call `getDiagramChart(id)` after upload
   - Ensure backend `GET /api/v1/reading/diagram_chart/{id}/` works

**Common Causes:**
- Backend doesn't return image URL in response
- Image upload succeeded but URL not saved to database
- CORS issue preventing image loading

---

## 🔍 How to Debug

### 1. Enable Detailed Logging

Frontend already has detailed logging. Check browser console for:

```
🔍 BACKEND RESPONSE ANALYSIS
================================================================================
Response Type: object
Response Keys: ['id', 'title', 'body', 'groups']
Has groups?: true
Groups is array?: true
Groups length: 3

📋 GROUP 0 ANALYSIS:
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  ├─ id: 456
  ├─ question_type: flowchart_completion
  ├─ All Keys: ['id', 'question_type', 'from_value', 'to_value', 'gap_filling']
  ├─ gap_filling type: object
  ├─ gap_filling is object?: true
  ├─ gap_filling is number?: false
  ├─ gap_filling value: { id: 789, title: "...", ... }
  ├─ gap_filling_id: undefined
  ├─ hasGapFilling: true
  └─ gap_filling.id: 789
    ↳ gap_filling keys: ['id', 'title', 'questions', 'answer_count']
```

### 2. Check Each Step

**Step 1: POST Passage**
```
🔄 Creating reading passage: { reading: 1, ... }
```
✅ Check: Request sent correctly

**Step 2: Receive Response**
```
📡 Passage response status: 201
✅ Reading passage created: { id: 123, ... }
```
✅ Check: Response status 201 (Created)
✅ Check: Response has `groups` array

**Step 3: Find Gap Filling ID**
```
🔍 Searching for gap_filling ID in group 0 (flowchart_completion):
Group Keys: ['id', 'question_type', 'gap_filling']
gap_filling type: object
gap_filling.id: 789
✅ Found gap_filling.id: 789
```
✅ Check: Gap filling ID found

**Step 4: Upload Diagram Chart**
```
🚀 Uploading diagram chart for group 0...
  ├─ gap_filling ID: 789
  ├─ question_type: flowchart_completion
  └─ Image size: 45.23 KB
✅ Diagram chart uploaded successfully!
```
✅ Check: Upload succeeded

**Step 5: Retrieve Diagram Chart**
```
✅ Diagram chart retrieved: { id: 123, image: "http://...", gap_filling: 789 }
```
✅ Check: Retrieved successfully

### 3. If Any Step Fails

**Failure at Step 2:**
- Backend not returning response or wrong status
- Check backend logs
- See `/BACKEND_GAP_FILLING_ID_FIX.md`

**Failure at Step 3:**
- Backend response missing `groups` or `gap_filling.id`
- See detailed error in console
- See `/BACKEND_GAP_FILLING_ID_FIX.md` for fix

**Failure at Step 4:**
- DiagramChart API not working
- Check backend DiagramChart endpoint
- See `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md`

**Failure at Step 5:**
- GET DiagramChart endpoint not working
- Check backend GET `/api/v1/reading/diagram_chart/{id}/`

---

## 📖 Quick Reference

### Frontend Files
- `/lib/api-cleaned.ts` - Lines 1107-1330 (createReadingPassage)
- `/lib/api-cleaned.ts` - Lines 1080-1104 (createDiagramChart)
- `/pages/AddQuestionPage.tsx` - Lines 600-890 (handleReadingSave)

### Backend Endpoints
- `POST /api/v1/reading-pasage-create/` - Create passage (MUST return groups with gap_filling IDs)
- `POST /api/v1/reading/diagram_chart_create` - Upload diagram chart
- `GET /api/v1/reading/diagram_chart/{id}/` - Get diagram chart

### Documentation
- `/BACKEND_GAP_FILLING_ID_FIX.md` - Backend fix instructions
- `/DIAGRAM_CHART_SEPARATE_API_IMPLEMENTATION.md` - DiagramChart API details
- `/BACKEND_API_INTEGRATION_GUIDE.md` - General API documentation

---

## ✅ Verification Checklist

After backend fix, verify:

- [ ] POST `/reading-pasage-create/` returns status 201
- [ ] Response includes `groups` array
- [ ] Each group has `gap_filling` object (not number)
- [ ] Each `gap_filling` object has `id` field
- [ ] Console shows "✅ Found gap_filling.id: [number]"
- [ ] Console shows "🚀 Uploading diagram chart for group [n]..."
- [ ] Console shows "✅ Diagram chart uploaded successfully!"
- [ ] No "❌" or "⚠️" errors in console
- [ ] Diagram chart image visible in frontend (if implemented)

---

## 🆘 Still Having Issues?

1. **Copy full console output** (all logs between the `===` lines)
2. **Copy backend response** (from browser Network tab → Preview)
3. **Check `/BACKEND_GAP_FILLING_ID_FIX.md`** for backend fix
4. **Verify backend serializers** return nested objects with IDs

The frontend is working correctly. The issue is 100% in backend response structure.
