import { useState, useEffect } from 'react';
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
  const [question, setQuestion] = useState(existingData?.question || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(existingData?.image || null);
  const [loading, setLoading] = useState(false);
  
  // Track original values to detect changes
  const [originalQuestion] = useState(existingData?.question || '');
  const [originalImage] = useState(existingData?.image || null);

  const MAX_QUESTION_LENGTH = 500;
  const remainingChars = MAX_QUESTION_LENGTH - question.length;

  useEffect(() => {
    if (existingData) {
      setQuestion(existingData.question);
      setImagePreview(existingData.image || null);
    }
  }, [existingData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    try {
      const { createWriting, updateWriting, patchWriting } = await import('../lib/api');
      
      if (existingData?.id) {
        // UPDATE mode - send 'type' field (required by API)
        const questionChanged = question.trim() !== originalQuestion;
        const imageChanged = image !== null;
        
        console.log('🔍 Change detection:', { questionChanged, imageChanged });
        
        // Determine update method based on what changed
        const isPartialUpdate = questionChanged !== imageChanged; // Only one field changed
        const updateMethod = isPartialUpdate ? 'PATCH' : 'PUT';
        
        console.log(`⚠️ Updating task with ${updateMethod}:`, existingData.id);
        
        // Build update payload - MUST include 'type' field
        const updateData: any = {
          type: taskType, // ✅ Required by API
        };
        
        if (questionChanged) {
          updateData.question = question.trim();
        }
        
        if (imageChanged) {
          updateData.image = image;
        }
        
        console.log('📤 Update payload:', Object.keys(updateData));
        
        if (isPartialUpdate) {
          await patchWriting(existingData.id, updateData);
        } else {
          await updateWriting(existingData.id, updateData);
        }
        
        alert('✅ Writing task yangilandi!');
      } else {
        // CREATE new task - SEND test and type fields
        console.log('✅ Creating new task...');
        const createData = {
          test: testId,
          type: taskType,
          question: question.trim(),
          image: image || undefined,
        };
        await createWriting(createData);
        alert('✅ Writing task yaratildi!');
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Error saving writing task:', error);
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