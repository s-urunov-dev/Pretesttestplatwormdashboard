import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { AdminMatchingEditor, MatchingQuestionData } from '../components/AdminMatchingEditor';

export function MatchingEditorDemo() {
  const [data, setData] = useState<MatchingQuestionData>({
    title: '',
    statement: [],
    option: [{ A: '', B: '', C: '', D: '' }], // CORRECT: array of objects
    variant_type: 'letter',
    answer_count: 1,
  });

  const handleChange = (newData: MatchingQuestionData) => {
    setData(newData);
    console.log('📊 Matching Question Data:', JSON.stringify(newData, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-slate-600 hover:text-[#042d62] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Admin Matching Editor Demo
          </h1>
          <p className="text-slate-600">
            Create and edit matching-style questions with an intuitive interface
          </p>
        </div>

        {/* Editor */}
        <AdminMatchingEditor
          initialData={data}
          onChange={handleChange}
        />

        {/* JSON Output (for debugging) */}
        <div className="mt-8 bg-slate-900 text-green-400 rounded-xl p-6 font-mono text-sm overflow-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">JSON Output (Backend Format)</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                alert('Copied to clipboard!');
              }}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
            >
              Copy JSON
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}