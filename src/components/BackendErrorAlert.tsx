import React from 'react';
import { AlertCircle, FileText, RefreshCw } from 'lucide-react';

interface BackendErrorAlertProps {
  error: Error;
  onRetry?: () => void;
}

export function BackendErrorAlert({ error, onRetry }: BackendErrorAlertProps) {
  const isBackendError = error.message.includes('Backend serializer error');
  const isSerializerError = error.message.includes('RelatedManager') || error.message.includes('AttributeError');

  if (!isBackendError && !isSerializerError) {
    // Generic error display
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-red-900 font-semibold mb-2">Xatolik yuz berdi</h3>
            <p className="text-red-700 text-sm">{error.message}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Qayta urinish
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Backend serializer error - show detailed info
  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-8 shadow-lg">
      <div className="flex items-start gap-6">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            🚨 Backend Serializer Xatoligi
          </h2>

          {/* Description */}
          <div className="space-y-3 text-gray-700">
            <p className="text-lg">
              Backend API'da <strong>serializer</strong> muammosi aniqlandi. Bu frontend muammosi emas.
            </p>

            {/* Error details */}
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="font-mono text-sm text-red-600 mb-2">
                <strong>Error:</strong> 'RelatedManager' object has no attribute 'statement'
              </p>
              <p className="font-mono text-sm text-gray-600">
                <strong>Location:</strong> dashboard/serializers/reading.py, line 88
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded">
              <h4 className="font-semibold text-orange-900 mb-2">
                ✅ Backend dasturchi uchun ko'rsatma:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
                <li>
                  <code className="bg-white px-2 py-0.5 rounded">/URGENT_BACKEND_FIX.md</code> faylini oching
                </li>
                <li>
                  <code className="bg-white px-2 py-0.5 rounded">MatchingStatementSerializer</code> ni to'g'irlang
                </li>
                <li>Django serverini qayta ishga tushiring</li>
                <li>Test qiling: <code className="bg-white px-2 py-0.5 rounded">/api/v1/readings/1/passages/</code></li>
              </ol>
            </div>

            {/* Documentation link */}
            <div className="flex items-center gap-3 pt-2">
              <FileText className="w-5 h-5 text-[#042d62]" />
              <a
                href="/URGENT_BACKEND_FIX.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#042d62] hover:underline font-semibold"
              >
                To'liq fix documentation →
              </a>
            </div>

            {/* Expected time */}
            <p className="text-sm text-gray-600 pt-2">
              ⏱️ <strong>Taxminiy vaqt:</strong> 3-5 daqiqa (backend developer uchun)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-colors shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                Backend fix qilinganmi? Qayta tekshirish
              </button>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Orqaga qaytish
            </button>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-6 pt-6 border-t border-orange-200">
        <p className="text-sm text-gray-600 italic">
          💡 <strong>Eslatma:</strong> Frontend to'liq ishlayapti. Faqat backend serializer'ni to'g'rilagandan keyin passages yuklanadi.
        </p>
      </div>
    </div>
  );
}
