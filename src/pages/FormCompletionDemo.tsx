import React, { useState } from 'react';
import { FormCompletionInputs, FormCompletionValue } from '../components/FormCompletionInputs';
import { convertFormCompletionToGapFilling, validateFormCompletionData } from '../utils/formCompletionConverter';
import { CheckCircle2, AlertCircle, FileText, Code } from 'lucide-react';

export function FormCompletionDemo() {
  const [formData, setFormData] = useState<FormCompletionValue | undefined>();
  const [showBackendData, setShowBackendData] = useState(false);

  const handleChange = (data: FormCompletionValue) => {
    setFormData(data);
  };

  const validation = formData ? validateFormCompletionData(formData) : { valid: false, errors: [] };
  const backendData = formData && validation.valid 
    ? convertFormCompletionToGapFilling(formData) 
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-[#042d62]">
          <h1 className="text-3xl font-bold text-[#042d62] mb-2">
            🎯 Form Completion Demo
          </h1>
          <p className="text-slate-600">
            Listening uchun Form Completion savol turini yaratish va sinash
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Savollar soni</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formData?.questions.length || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${
            validation.valid ? 'border-green-500' : 'border-amber-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Validatsiya</p>
                <p className="text-2xl font-bold">
                  {validation.valid ? (
                    <span className="text-green-600">✓ Valid</span>
                  ) : (
                    <span className="text-amber-600">⚠️ Xato</span>
                  )}
                </p>
              </div>
              {validation.valid ? (
                <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
              ) : (
                <AlertCircle className="w-8 h-8 text-amber-500 opacity-50" />
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Backend data</p>
                <button
                  onClick={() => setShowBackendData(!showBackendData)}
                  className="text-purple-600 font-semibold text-sm hover:underline"
                >
                  {showBackendData ? 'Yashirish' : 'Ko\'rish'}
                </button>
              </div>
              <Code className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Form Editor */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-[#042d62] mb-4">
              📝 Form Editor
            </h2>
            <FormCompletionInputs
              value={formData}
              onChange={handleChange}
            />
          </div>

          {/* Right: Preview & Backend Data */}
          <div className="space-y-6">
            {/* Preview */}
            {formData && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-[#042d62] mb-4">
                  👀 O&apos;quvchi ko&apos;rinishi
                </h2>
                
                {/* Form Template */}
                <div className="border-2 border-slate-200 rounded-lg p-4 bg-slate-50 mb-4">
                  <h3 className="font-semibold text-slate-900 mb-3">{formData.title}</h3>
                  <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed mb-4">
                    {formData.formTemplate}
                  </pre>
                </div>

                {/* Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-700">Variantlar:</h4>
                  {formData.questions.map((question) => (
                    <div key={question.id} className="border border-slate-200 rounded-lg p-3 bg-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-[#042d62] text-white rounded-full text-xs font-bold">
                          ({question.questionNumber})
                        </span>
                        {question.correctAnswer && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                            ✓ To&apos;g&apos;ri: {question.correctAnswer}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        {question.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-2 p-2 rounded ${
                              opt.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
                            }`}
                          >
                            <span className="font-semibold text-slate-700">{opt.label})</span>
                            <span className={opt.isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}>
                              {opt.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {!validation.valid && validation.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <h2 className="text-xl font-bold text-amber-900">
                    Validatsiya xatolari
                  </h2>
                </div>
                <ul className="space-y-2">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="text-amber-600">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Backend Data */}
            {showBackendData && backendData && (
              <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white">
                <h2 className="text-xl font-bold mb-4 text-white">
                  🔧 Backend formatda data
                </h2>
                <pre className="text-xs overflow-x-auto bg-slate-800 p-4 rounded-lg">
                  {JSON.stringify(backendData, null, 2)}
                </pre>
                
                <div className="mt-4 p-3 bg-blue-900/50 rounded-lg text-sm">
                  <p className="font-semibold mb-1">📤 Backend API ga yuboriladi:</p>
                  <ul className="space-y-1 text-blue-200 text-xs">
                    <li>• <code>title</code>: &quot;{backendData.title}&quot;</li>
                    <li>• <code>questions</code>: [{backendData.questions.length}] array</li>
                    <li>• <code>answer_count</code>: {backendData.answer_count}</li>
                    <li>• <code>form_template</code>: Full form text</li>
                    <li>• <code>correct_answers</code>: [{backendData.correct_answers?.join(', ')}]</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-3">
                💡 Qo&apos;llanma
              </h2>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">1.</span>
                  <span>Forma shablonida <code className="bg-blue-100 px-1 rounded">(1)</code>, <code className="bg-blue-100 px-1 rounded">(2)</code> raqamlarini qo&apos;ying</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">2.</span>
                  <span>Har bir raqam uchun 3 ta variant (A, B, C) yozing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">3.</span>
                  <span>To&apos;g&apos;ri javobni radio button bilan tanlang</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600">4.</span>
                  <span>Preview va backend data ni tekshiring</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
