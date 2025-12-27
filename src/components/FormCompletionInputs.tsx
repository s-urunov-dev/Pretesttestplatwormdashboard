import React, { useState } from 'react';
import { FileText, Copy } from 'lucide-react';

export interface FormCompletionValue {
  title?: string;
  body: string; // Forma matni - (1), (2), (3) bilan
  principle?: 'ONE_WORD' | 'NMT_TWO' | 'NMT_THREE' | 'ONE_NUMBER'; // Criteria
}

interface FormCompletionInputsProps {
  data?: FormCompletionValue;
  onChange: (data: FormCompletionValue) => void;
  questionNumberStart?: number;
}

export function FormCompletionInputs({ 
  data, 
  onChange,
  questionNumberStart = 1 
}: FormCompletionInputsProps) {
  const [showPreview, setShowPreview] = useState(false);

  const formData = data || {
    title: 'Complete the form below',
    body: `Appointment Form

Patient name: Aziza (1)
Day: (2)
Date: (3)
Time: (4)
Address: (5) Oxford Street
Landmark: City (6)
Phone: 071-245-(7)`,
  };

  const updateBody = (newBody: string) => {
    onChange({ ...formData, body: newBody });
  };

  const updateTitle = (newTitle: string) => {
    onChange({ ...formData, title: newTitle });
  };

  const updatePrinciple = (newPrinciple: 'ONE_WORD' | 'NMT_TWO' | 'NMT_THREE' | 'ONE_NUMBER') => {
    onChange({ ...formData, principle: newPrinciple });
  };

  const copyTemplateExample = () => {
    const exampleTemplate = `Appointment Form

Patient name: Aziza (1)
Day: (2)
Date: (3)
Time: (4)
Address: (5) Oxford Street
Landmark: City (6)
Phone: 071-245-(7)`;
    
    updateBody(exampleTemplate);
    alert('✅ Namuna shablon nusxalandi!');
  };

  // Extract numbers from form template
  const extractedNumbers = React.useMemo(() => {
    const matches = formData.body.match(/\((\d+)\)/g) || [];
    return matches.map(m => parseInt(m.replace(/[()]/g, '')));
  }, [formData.body]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          Sarlavha (Title) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Complete the form below"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
        />
      </div>

      {/* Principle/Criteria */}
      <div>
        <label className="block text-sm text-slate-700 mb-2">
          Javob Mezonlari (Answer Criteria) <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.principle || 'NMT_TWO'}
          onChange={(e) => updatePrinciple(e.target.value as 'ONE_WORD' | 'NMT_TWO' | 'NMT_THREE' | 'ONE_NUMBER')}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
        >
          <option value="ONE_WORD">ONE WORD - Bitta so'z</option>
          <option value="NMT_TWO">NO MORE THAN TWO WORDS - 2 ta so'zdan oshmasin</option>
          <option value="NMT_THREE">NO MORE THAN THREE WORDS - 3 ta so'zdan oshmasin</option>
          <option value="ONE_NUMBER">ONE NUMBER - Bitta raqam</option>
        </select>
        <p className="text-xs text-slate-500 mt-1">
          Talaba javobida qancha so'z yoki raqam bo'lishi mumkinligini belgilang
        </p>
      </div>

      {/* Form Body Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-slate-700">
            📝 Forma Matni <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={copyTemplateExample}
            className="flex items-center gap-1 px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
          >
            <Copy className="w-3 h-3" />
            Namuna nusxalash
          </button>
        </div>
        
        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
          <p className="font-semibold mb-1">💡 Qo&apos;llanma:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Bo&apos;sh joylarni <code className="bg-blue-100 px-1 rounded">(1)</code>, <code className="bg-blue-100 px-1 rounded">(2)</code>, <code className="bg-blue-100 px-1 rounded">(3)</code> bilan belgilang</li>
            <li>Forma tuzilishini istalgancha yozing</li>
            <li>Raqamlar ketma-ket bo&apos;lishi shart emas</li>
            <li>Bu turdagi savolda variantlar kerak emas, faqat forma matni</li>
          </ul>
        </div>

        <textarea
          value={formData.body}
          onChange={(e) => updateBody(e.target.value)}
          placeholder={`Masalan:

Appointment Form

Name: (1)
Date: (2)
Time: (3)
Address: (4) Oxford Street`}
          rows={15}
          className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] font-mono text-sm bg-white resize-y"
        />

        {/* Body Analysis */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600">📊 Topilgan bo&apos;sh joylar:</span>
            {extractedNumbers.length > 0 ? (
              <span className="text-green-600 font-semibold">
                {extractedNumbers.sort((a, b) => a - b).join(', ')} ({extractedNumbers.length} ta)
              </span>
            ) : (
              <span className="text-amber-600">Hech qanday (1), (2) raqam topilmadi</span>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Preview */}
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
      >
        <FileText className="w-4 h-4" />
        {showPreview ? '🔽 Preview yopish' : '🔼 Preview ko\'rish'}
      </button>

      {/* Preview */}
      {showPreview && (
        <div className="border-2 border-[#042d62] rounded-lg p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-[#042d62] mb-3">👀 Preview:</h4>
          <div className="bg-white border border-slate-300 rounded p-4">
            <h3 className="font-semibold mb-3 text-slate-900">{formData.title}</h3>
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
              {formData.body}
            </pre>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="border-2 border-green-400 rounded-xl p-5 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h4 className="text-green-900 font-bold text-lg">Xulosa</h4>
        </div>
        <div className="space-y-2 text-sm text-green-800">
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span>📝 Sarlavha:</span>
            <span className="font-bold text-[#042d62]">
              {formData.title || 'Kiritilmagan'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span>🔢 Bo&apos;sh joylar soni:</span>
            <span className="font-bold text-green-600">{extractedNumbers.length}</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-white rounded-lg">
            <span>📊 Raqamlar:</span>
            <span className="font-bold text-purple-600">
              {extractedNumbers.length > 0 ? extractedNumbers.sort((a, b) => a - b).join(', ') : 'Yo\'q'}
            </span>
          </div>
          {extractedNumbers.length > 0 && formData.body.trim() && (
            <div className="p-3 bg-green-100 border border-green-300 rounded-lg mt-2">
              <p className="text-green-800 font-bold flex items-center gap-2">
                🎉 Tayyor! Backend ga yuborish mumkin
              </p>
            </div>
          )}
          {extractedNumbers.length === 0 && (
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg mt-2">
              <p className="text-amber-800 font-semibold">
                ⚠️ Forma matnida bo&apos;sh joylar ((1), (2), ...) yo&apos;q
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}