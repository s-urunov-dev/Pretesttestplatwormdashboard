import React, { useState, useEffect } from 'react';
import { PenTool, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { WritingType } from '../lib/api';

interface WritingFormProps {
  testId: number;
  taskType: WritingType;
  onSuccess?: () => void;
  existingData?: {
    id?: number;
    question: string;
    image?: string | null;
  };
}

export function WritingForm({ testId, taskType, onSuccess, existingData }: WritingFormProps) {
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Track original values to detect changes
  const [originalQuestion, setOriginalQuestion] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);

  const MAX_QUESTION_LENGTH = 500;
  const remainingChars = MAX_QUESTION_LENGTH - question.length;

  // Update form when existingData or taskType changes
  useEffect(() => {
    console.log('🔄 WritingForm useEffect - taskType:', taskType, 'existingData:', existingData);
    
    if (existingData && existingData.id) {
      // Load existing task data
      setQuestion(existingData.question || '');
      setImagePreview(existingData.image || null);
      setOriginalQuestion(existingData.question || '');
      setOriginalImage(existingData.image || null);
    } else {
      // Clear form for new task
      setQuestion('');
      setImage(null);
      setImagePreview(null);
      setOriginalQuestion('');
      setOriginalImage(null);
    }
  }, [existingData, taskType]); // Reset when taskType changes

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if image has changed (user uploaded new file)
  const imageChanged = image !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    
    // Re-check existingData at submission time (it may have changed after previous save)
    const hasExistingId = existingData?.id !== undefined && existingData?.id !== null;
    
    console.log('====================================');
    console.log('📝 WRITING FORM SUBMISSION START');
    console.log('====================================');
    console.log('Test ID:', testId);
    console.log('Task Type:', taskType);
    console.log('existingData:', JSON.stringify(existingData, null, 2));
    console.log('existingData?.id:', existingData?.id);
    console.log('typeof existingData?.id:', typeof existingData?.id);
    console.log('hasExistingId:', hasExistingId);
    console.log('Question:', question.trim().substring(0, 50) + '...');
    console.log('Has new image file:', !!image);
    console.log('====================================');
    
    try {
      const { createWriting, updateWriting, patchWriting } = await import('../lib/api');
      
      if (hasExistingId && existingData?.id) {
        // UPDATE existing task
        console.log('✅ UPDATE MODE - Patching existing task');
        console.log('   Existing task ID:', existingData.id);
        console.log('   Task Type:', taskType);
        console.log('📝 Update strategy: PATCH (partial update)');
        
        // Build update payload
        // Backend /writing-update/{writing_task_id}/ uses writing task ID in URL
        // and 'type' in body to validate the task type
        const updateData: any = {
          type: taskType, // To validate task type
          question: question.trim(),
        };
        
        // Only include image if user selected a NEW image file
        if (imageChanged && image) {
          updateData.image = image;
          console.log('   ✅ Adding NEW image to payload (user uploaded new file)');
        } else {
          console.log('   ⏭️  Skipping image (no new file selected, keeping existing image)');
        }
        
        console.log('📤 Final update payload fields:', Object.keys(updateData));
        console.log('📤 Calling PATCH API with writing task ID:', existingData.id);
        console.log('📤 API URL will be: /writing-update/' + existingData.id + '/');
        console.log('📤 type in body:', taskType, '(to validate task type)');
        
        console.log('⏳ Sending PATCH request...');
        const result = await patchWriting(existingData.id, updateData);
        console.log('✅ PATCH request completed:', result);
        
        alert('✅ Writing task yangilandi!');
      } else {
        // CREATE new task
        console.log('✅ CREATE MODE - Creating new task');
        console.log('Test ID:', testId);
        console.log('Task type:', taskType);
        
        const createData = {
          test: testId,
          type: taskType,
          question: question.trim(),
          image: image || undefined,
        };
        
        console.log('📤 Create payload:', {
          test: createData.test,
          type: createData.type,
          questionLength: createData.question.length,
          hasImage: !!createData.image
        });
        console.log('📤 API URL will be: /writing-create/' + testId + '/');
        
        const result = await createWriting(createData);
        console.log('✅ CREATE request completed:', result);
        alert('✅ Writing task yaratildi!');
      }
      
      console.log('====================================');
      console.log('✅ SUBMISSION SUCCESSFUL');
      console.log('====================================');
      
      onSuccess?.();
    } catch (error) {
      console.error('====================================');
      console.error('❌ SUBMISSION FAILED');
      console.error('Error:', error);
      console.error('Error message:', (error as Error).message);
      console.error('====================================');
      alert('❌ Xatolik: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isTask1 = taskType === 'task1';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl text-slate-900">
              {isTask1 ? 'Task1 - Graph/Chart/Letter' : 'Task2 - Essay'}
            </h2>
            <p className="text-sm text-slate-500">
              {isTask1 
                ? 'Rasm yuklang va vazifa tavsifini kiriting' 
                : 'Essay yozish uchun vazifa matnini kiriting'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task1 - Image Upload */}
          {isTask1 && (
            <div>
              <label className="block text-slate-700 mb-3">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Rasm yuklash {existingData?.image && '(Yangi rasm yuklasangiz, eskisi o\'chiriladi)'}
                </span>
              </label>
              
              <div className="space-y-3">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative border-2 border-slate-200 rounded-xl overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Task preview" 
                      className="w-full max-h-96 object-contain bg-slate-50"
                    />
                  </div>
                )}
                
                {/* Upload Button */}
                <label className="block cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-violet-500 hover:bg-violet-50 transition-all">
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600">
                      {imagePreview ? 'Boshqa rasm tanlash' : 'Rasm yuklash'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Question Text */}
          <div>
            <label className="block text-slate-700 mb-3">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Vazifa matni <span className="text-red-500">*</span>
              </span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={MAX_QUESTION_LENGTH}
              rows={isTask1 ? 6 : 10}
              placeholder={
                isTask1
                  ? 'Misol: The chart below shows the percentage of households in different age groups...'
                  : 'Misol: Some people think that... Discuss both views and give your own opinion.'
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-slate-500">
                {isTask1 
                  ? 'Grafik, jadval yoki diagrammani tavsiflovchi vazifa matnini kiriting'
                  : 'Essay mavzusi va ko\'rsatmalarni kiriting'}
              </p>
              <p className={`text-xs font-medium ${remainingChars < 50 ? 'text-orange-600' : 'text-slate-500'}`}>
                {remainingChars}/{MAX_QUESTION_LENGTH}
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading || !question.trim() || (isTask1 && !image && !imagePreview)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#042d62] to-[#0369a1] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <PenTool className="w-5 h-5" />
                  <span>{existingData?.id ? 'Yangilash' : 'Saqlash'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}