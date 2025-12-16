import { BookOpen, Headphones, PenTool, Trash2, Eye, Calendar, FileText, AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { TestResponse } from '../lib/api';

export interface Test {
  id: string;
  title: string;
  reading?: {
    title: string;
    parts: string[];
  };
  listening?: {
    title: string;
    parts: string[];
  };
  writing?: {
    title: string;
    tasks: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

interface TestListProps {
  tests: TestResponse[];
  onDelete: (id: number) => void;
  onView: (id: number) => void;
  loading?: boolean;
  error?: string | null;
  offline?: boolean;
}

export function TestList({ tests, onDelete, onView, loading, error, offline }: TestListProps) {
  if (offline) {
    return (
      <>
        {/* Offline Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <WifiOff className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-amber-900">
                <strong>Offline rejim:</strong> Backend serverga ulanib bo&apos;lmadi. Ma&apos;lumotlar vaqtinchalik saqlanmoqda.
              </p>
            </div>
          </div>
        </div>
        {renderTestsList()}
      </>
    );
  }

  return renderTestsList();

  function renderTestsList() {
    if (error) {
      return (
        <div className="bg-white rounded-2xl shadow-md border border-red-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-slate-900 mb-2">Xatolik yuz berdi</h3>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#042d62] hover:bg-[#053a75] text-white rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Qayta yuklash
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-slate-900 mb-2">Yuklanmoqda...</h3>
          <p className="text-slate-600">
            Testlar ro&apos;yxati yuklanmoqda
          </p>
        </div>
      );
    }

    if (tests.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-slate-900 mb-2">Hali testlar yo&apos;q</h3>
          <p className="text-slate-600 mb-4">
            Yangi test yaratish uchun yuqoridagi tugmani bosing
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {tests.map((test) => {
          // For now, mock the sections data
          const hasReading = false; // Will be populated from API later
          const hasListening = false; // Will be populated from API later
          const hasWriting = false; // Will be populated from API later
          const completedSections = [hasReading, hasListening, hasWriting].filter(Boolean).length;

          return (
            <div
              key={test.id}
              className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-200 group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-gradient-to-br from-[#042d62] to-[#0369a1] rounded-xl shadow-md">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-slate-900 mb-2">{test.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Yaratilgan: {new Date(test.created_at).toLocaleDateString('uz-UZ', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView(test.id)}
                      className="px-4 py-2 bg-[#042d62] hover:bg-[#053a75] text-white rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      Ko&apos;rish
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Testni o\'chirmoqchimisiz?')) {
                          onDelete(test.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded-xl transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Bo&apos;limlar</span>
                    <span className="text-sm text-slate-900">
                      {completedSections}/3 to&apos;ldirildi
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#042d62] to-[#0369a1] transition-all duration-500"
                      style={{ width: `${(completedSections / 3) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Sections */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Reading */}
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      hasReading
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          hasReading ? 'bg-[#042d62]' : 'bg-slate-300'
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 ${hasReading ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <span className={`text-sm ${hasReading ? 'text-blue-900' : 'text-slate-500'}`}>
                        Reading
                      </span>
                    </div>
                    {hasReading && (
                      <p className="text-xs text-blue-700 line-clamp-1">
                        {test.reading!.parts.length} passage
                      </p>
                    )}
                  </div>

                  {/* Listening */}
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      hasListening
                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          hasListening ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <Headphones className={`w-4 h-4 ${hasListening ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <span className={`text-sm ${hasListening ? 'text-emerald-900' : 'text-slate-500'}`}>
                        Listening
                      </span>
                    </div>
                    {hasListening && (
                      <p className="text-xs text-emerald-700 line-clamp-1">
                        {test.listening!.parts.length} part
                      </p>
                    )}
                  </div>

                  {/* Writing */}
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${
                      hasWriting
                        ? 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          hasWriting ? 'bg-violet-600' : 'bg-slate-300'
                        }`}
                      >
                        <PenTool className={`w-4 h-4 ${hasWriting ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <span className={`text-sm ${hasWriting ? 'text-violet-900' : 'text-slate-500'}`}>
                        Writing
                      </span>
                    </div>
                    {hasWriting && (
                      <p className="text-xs text-violet-700 line-clamp-1">
                        {test.writing!.tasks.length} task
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}