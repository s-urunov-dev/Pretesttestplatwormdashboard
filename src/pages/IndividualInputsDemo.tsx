import React from 'react';
import { BookOpen, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicQuestionGroupForm } from '../components/DynamicQuestionGroupForm';

export function IndividualInputsDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#042d62] rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl text-slate-900">
                  Individual Inputs Form - Yangilangan Versiya
                </h1>
                <p className="text-sm text-slate-500">
                  Har bir savol va variant alohida input
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Success Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-2">✅ Yangi Yechim: Individual Inputs</h2>
              <p className="text-green-100 mb-3">
                Endi har bir savol va variant <strong>alohida input</strong> sifatida!
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <strong>Savollar</strong>
                  </div>
                  <p className="text-xs text-green-100">
                    "+ Savol qo'shish" tugmasi bilan har bir savol alohida input
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <strong>Variantlar</strong>
                  </div>
                  <p className="text-xs text-green-100">
                    "+ Variant qo'shish" tugmasi bilan avtomatik belgilar (A, B, C...)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">➕</span>
            </div>
            <h4 className="text-slate-900 mb-1">Alohida Input</h4>
            <p className="text-sm text-slate-600">
              Har bir savol va variant uchun o'z input maydoni
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🏷️</span>
            </div>
            <h4 className="text-slate-900 mb-1">Avtomatik Belgilar</h4>
            <p className="text-sm text-slate-600">
              Variantlar uchun A, B, C yoki 1, 2, 3 avtomatik qo'shiladi
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">❌</span>
            </div>
            <h4 className="text-slate-900 mb-1">Oson O'chirish</h4>
            <p className="text-sm text-slate-600">
              Hover qiling va × tugmasini bosing
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-blue-900 mb-4">
            <strong>📋 Qanday ishlatish:</strong>
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm text-blue-900 mb-2">Savol qo'shish:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>"+ Savol qo'shish" tugmasini bosing</li>
                <li>Yangi input paydo bo'ladi</li>
                <li>Savol matnini kiriting</li>
                <li>O'chirish uchun × tugmasini bosing (hover da ko'rinadi)</li>
              </ol>
            </div>
            <div>
              <h4 className="text-sm text-blue-900 mb-2">Variant qo'shish:</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>"+ Variant qo'shish" tugmasini bosing</li>
                <li>Belgi avtomatik qo'shiladi (A, B, C...)</li>
                <li>Variant matnini kiriting</li>
                <li>Variant turini o'zgartiring (Alfibo/Raqam/Rim)</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Sample Passage Context */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg text-slate-900 mb-1">Reading Passage</h3>
              <p className="text-sm text-slate-500">
                Bu yerda passage title va body bo'ladi
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg">
              Passage 1
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Passage Title
              </label>
              <input
                type="text"
                value="The Impact of Climate Change"
                readOnly
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Passage Body
              </label>
              <textarea
                value="Climate change represents one of the most pressing challenges facing humanity in the 21st century. Scientists worldwide have documented rising global temperatures, melting ice caps, and increasingly severe weather patterns..."
                readOnly
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* The Form - NEW INDIVIDUAL INPUTS VERSION */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-8">
          <div className="mb-6 pb-6 border-b border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg text-slate-900">Savol Guruhlari</h3>
            </div>
            <p className="text-sm text-slate-600">
              Har bir savol va variant <strong>alohida input</strong> sifatida. 
              Textarea emas! <span className="text-green-600">✅ Yangilandi</span>
            </p>
          </div>

          <DynamicQuestionGroupForm questionTypeName="Matching Headings" />
        </div>

        {/* Comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg text-slate-900 mb-4">🔄 Oldingi vs Hozir</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm text-red-900 mb-2">❌ Oldingi (Textarea)</h4>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>Bitta textarea ichida hamma savollar</li>
                <li>Har bir savol yangi qator</li>
                <li>Alohida tahrirlash qiyin</li>
                <li>Ko'p savol bo'lsa chalkash</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm text-green-900 mb-2">✅ Hozir (Individual Inputs)</h4>
              <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                <li>Har bir savol alohida input</li>
                <li>"+" tugmasi bilan qo'shish</li>
                <li>Har birini alohida tahrirlash</li>
                <li>Toza va tushunarli</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Backend Output */}
        <div className="bg-slate-900 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg text-white mb-3">📦 Backend Output</h3>
          <p className="text-sm text-slate-300 mb-3">
            Backend ga jo'natiladigan data formati o'zgarmaydi:
          </p>
          <pre className="text-xs text-green-400 font-mono overflow-x-auto bg-slate-800 rounded-lg p-4">
{`{
  "id": "group-123",
  "question_type": "Matching Headings",
  "from_value": 1,
  "to_value": 5,
  "instruction": "Match each heading...",
  "questions": [
    "Paragraph A discusses...",
    "Paragraph B analyzes...",
    "Paragraph C predicts..."
  ],
  "options": [
    "Historical context",
    "Current trends",
    "Future outlook",
    "Introduction"
  ],
  "variant_type": "letter",
  "correct_answers_count": 1
}`}
          </pre>
          <div className="mt-3 p-3 bg-green-900/30 rounded-lg border border-green-700">
            <p className="text-xs text-green-200">
              <strong>✅ Backend uchun:</strong> Data formati bir xil, faqat kirish usuli yaxshilandi!
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h4 className="text-amber-900 mb-3">💡 Maslahatlar</h4>
            <ul className="text-sm text-amber-800 space-y-2">
              <li>• Input ustiga hover qiling - × tugmasi ko'rinadi</li>
              <li>• Variantlar avtomatik belgilanadi (A, B, C...)</li>
              <li>• Bo'sh inputlar avtomatik o'chiriladi</li>
              <li>• Guruh ochiq bo'lganda tahrirlash mumkin</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-blue-900 mb-3">🎯 Afzalliklar</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Har bir element alohida boshqariladi</li>
              <li>• Tahrirlash oson va tez</li>
              <li>• Xatolarni topish oson</li>
              <li>• Professional ko'rinish</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
