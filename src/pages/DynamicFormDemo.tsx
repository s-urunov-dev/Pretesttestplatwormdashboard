import React from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicQuestionGroupForm } from '../components/DynamicQuestionGroupForm';

export function DynamicFormDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
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
                <h1 className="text-xl text-slate-900">Reading Passage Editor</h1>
                <p className="text-sm text-slate-500">
                  Dynamic Question Groups Form - Demo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Passage Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg text-slate-900 mb-1">Passage Information</h2>
              <p className="text-sm text-slate-500">
                Bu demo - Reading Passage uchun dynamic savol guruhlarini ko'rsatadi
              </p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-lg">
              Passage 1
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Passage Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                defaultValue="The History of Ancient Civilizations"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Passage Body <span className="text-red-500">*</span>
              </label>
              <textarea
                defaultValue="Ancient civilizations laid the foundation for modern society through their innovations in agriculture, architecture, writing systems, and governance..."
                rows={4}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Question Type Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900 mb-1">
                Selected Question Type: <strong>Matching Headings</strong>
              </h3>
              <p className="text-sm text-blue-800">
                Bu demo matching heading savol turini ko'rsatadi. Har bir guruhda savollar va variantlar dinamik ravishda qo'shiladi.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Question Groups Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <DynamicQuestionGroupForm questionTypeName="Matching Headings" />
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🎯</span>
            </div>
            <h4 className="text-slate-900 mb-1">Dynamic Questions</h4>
            <p className="text-sm text-slate-600">
              Har qatorda bitta savol - avtomatik sanash va preview
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📋</span>
            </div>
            <h4 className="text-slate-900 mb-1">Dynamic Options</h4>
            <p className="text-sm text-slate-600">
              Variantlar A, B, C yoki 1, 2, 3 formatida avtomatik belgilanadi
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">✅</span>
            </div>
            <h4 className="text-slate-900 mb-1">Live Validation</h4>
            <p className="text-sm text-slate-600">
              Real-time tekshirish va xatolar ko'rsatiladi
            </p>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h4 className="text-amber-900 mb-3">
            <strong>📝 Qo'llanma:</strong>
          </h4>
          <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
            <li><strong>"Guruh Qo'shish"</strong> tugmasini bosing</li>
            <li><strong>Dan/Gacha</strong> raqamlarini kiriting (masalan: 1 dan 5 gacha)</li>
            <li><strong>Savol sarlavhasi</strong>ni kiriting (ixtiyoriy)</li>
            <li><strong>Savollar</strong> maydoniga har qatorda bitta savol yozing</li>
            <li><strong>Variant turi</strong>ni tanlang (Alfibo, Raqam, Rim)</li>
            <li><strong>Variantlar</strong> maydoniga har qatorda bitta variant yozing</li>
            <li><strong>Javoblar soni</strong>ni kiriting</li>
            <li>Guruhni <strong>nusxa olish</strong> yoki <strong>o'chirish</strong> mumkin</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
