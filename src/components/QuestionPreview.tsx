import { X } from 'lucide-react';
import { Question } from './QuestionPanel';

interface QuestionPreviewProps {
  question: Question;
  onClose: () => void;
}

export function QuestionPreview({ question, onClose }: QuestionPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-1">Savol Preview</h2>
            <p className="text-slate-600">
              {question.questionRange ? `Questions ${question.questionRange}` : question.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Question Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md">
                {question.type.toUpperCase()}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                {question.category}
              </span>
              {question.questionRange && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-md">
                  Questions {question.questionRange}
                </span>
              )}
            </div>
            <h3 className="text-slate-900 mb-2">{question.title}</h3>
          </div>

          {/* Instructions */}
          {question.instructions && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-slate-900">{question.instructions}</p>
              {question.answerFormat && (
                <p className="text-slate-700 mt-2">
                  <span className="font-medium">Answer format:</span> {question.answerFormat}
                </p>
              )}
            </div>
          )}

          {/* Passage */}
          {question.passage && (
            <div className="mb-6">
              <h4 className="text-slate-900 mb-3">Passage:</h4>
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {question.passage}
                </p>
              </div>
            </div>
          )}

          {/* Image */}
          {question.imageUrl && (
            <div className="mb-6">
              <h4 className="text-slate-900 mb-3">Diagram/Map:</h4>
              <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
                <img
                  src={question.imageUrl}
                  alt="Question diagram"
                  className="w-full max-h-96 object-contain bg-slate-50"
                />
              </div>
            </div>
          )}

          {/* Table */}
          {question.tableData && question.tableData.headers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-slate-900 mb-3">Table:</h4>
              <div className="overflow-x-auto border border-slate-300 rounded-lg">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      {question.tableData.headers.map((header, i) => (
                        <th key={i} className="px-4 py-3 text-left text-slate-900 border border-slate-300">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {question.tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-slate-50">
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="px-4 py-3 text-slate-700 border border-slate-300">
                            {cell || (
                              <span className="inline-flex items-center justify-center w-12 h-8 bg-yellow-100 text-yellow-700 rounded text-sm">
                                ({rowIndex + 1})
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub Questions */}
          {question.subQuestions && question.subQuestions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-slate-900 mb-3">Questions:</h4>
              <div className="space-y-4">
                {question.subQuestions.map((sq, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                      {sq.number}
                    </div>
                    <div className="flex-1">
                      {sq.text && (
                        <p className="text-slate-700 mb-2">{sq.text}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 text-sm">Answer:</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                          {sq.answer}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Content */}
          {question.content && (
            <div className="mb-6">
              <h4 className="text-slate-900 mb-3">Additional Information:</h4>
              <p className="text-slate-700 p-4 bg-slate-50 rounded-lg">
                {question.content}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-slate-500 pt-6 border-t border-slate-200">
            {question.points && (
              <div>
                <span className="font-medium">Points:</span> {question.points}
              </div>
            )}
            {question.timeLimit && (
              <div>
                <span className="font-medium">Time:</span> {question.timeLimit}s
              </div>
            )}
            <div>
              <span className="font-medium">Type:</span> {question.questionType}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
