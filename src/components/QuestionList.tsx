import { useState } from 'react';
import { Trash2, Edit2, BookOpen, Headphones, PenTool, Mic, Clock, Award, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { Question } from './QuestionPanel';
import { QuestionPreview } from './QuestionPreview';

interface QuestionListProps {
  questions: Question[];
  onDelete: (id: string) => void;
  onEdit: (id: string, question: Partial<Question>) => void;
}

export function QuestionList({ questions, onDelete, onEdit }: QuestionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reading': return BookOpen;
      case 'listening': return Headphones;
      case 'writing': return PenTool;
      case 'speaking': return Mic;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'reading': return 'blue';
      case 'listening': return 'green';
      case 'writing': return 'purple';
      case 'speaking': return 'orange';
      default: return 'gray';
    }
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-12 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-slate-900 mb-2">Hali savollar yo&apos;q</h3>
        <p className="text-slate-600 mb-4">
          Yangi savol qo&apos;shish uchun yuqoridagi tugmani bosing
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => {
        const Icon = getTypeIcon(question.type);
        const color = getTypeColor(question.type);
        const isExpanded = expandedId === question.id;

        const colorClasses = {
          blue: {
            bg: 'bg-gradient-to-br from-[#042d62] to-[#0369a1]',
            text: 'text-white',
            badge: 'bg-blue-100 text-[#042d62]',
          },
          green: {
            bg: 'bg-gradient-to-br from-emerald-600 to-emerald-700',
            text: 'text-white',
            badge: 'bg-emerald-100 text-emerald-700',
          },
          purple: {
            bg: 'bg-gradient-to-br from-violet-600 to-violet-700',
            text: 'text-white',
            badge: 'bg-violet-100 text-violet-700',
          },
          orange: {
            bg: 'bg-gradient-to-br from-orange-600 to-orange-700',
            text: 'text-white',
            badge: 'bg-orange-100 text-orange-700',
          },
          gray: {
            bg: 'bg-gradient-to-br from-slate-600 to-slate-700',
            text: 'text-white',
            badge: 'bg-slate-100 text-slate-700',
          },
        };
        const colors = colorClasses[color as keyof typeof colorClasses];

        return (
          <div
            key={question.id}
            className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className={`p-3 ${colors.bg} rounded-xl shrink-0 shadow-md`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1.5 ${colors.badge} rounded-lg text-xs`}>
                          {question.type.toUpperCase()}
                        </span>
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs">
                          {question.category}
                        </span>
                      </div>
                      <h3 className="text-slate-900 mb-1">{question.title}</h3>
                      <p className="text-slate-600 text-sm line-clamp-2">
                        {question.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : question.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title={isExpanded ? 'Yig\'ish' : 'Ko\'proq ko\'rish'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          const newTitle = prompt('Yangi sarlavha:', question.title);
                          if (newTitle) onEdit(question.id, { title: newTitle });
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-5 h-5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Savolni o\'chirmoqchimisiz?')) {
                            onDelete(question.id);
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                      <button
                        onClick={() => setPreviewQuestion(question)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Ko\'rib chiqish"
                      >
                        <Eye className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {question.section && (
                      <div className="flex items-center gap-1">
                        <span>{question.section}</span>
                      </div>
                    )}
                    {question.questionType && (
                      <>
                        <span>•</span>
                        <span>{question.questionType}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                  <div>
                    <p className="text-slate-700 mb-2">To&apos;liq Savol:</p>
                    <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {question.content}
                    </p>
                  </div>

                  {question.options && question.options.length > 0 && (
                    <div>
                      <p className="text-slate-700 mb-2">Javob Variantlari:</p>
                      <div className="space-y-2">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-3 rounded-xl border-2 ${
                              option === question.correctAnswer
                                ? 'bg-green-50 border-green-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="text-slate-600 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <span className={option === question.correctAnswer ? 'text-green-700' : 'text-slate-700'}>
                              {option}
                            </span>
                            {option === question.correctAnswer && (
                              <span className="ml-auto px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs">
                                To&apos;g&apos;ri javob
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>Yaratilgan: {question.createdAt.toLocaleDateString('uz-UZ')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
      {previewQuestion && (
        <QuestionPreview
          question={previewQuestion}
          onClose={() => setPreviewQuestion(null)}
        />
      )}
    </div>
  );
}