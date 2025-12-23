import React from 'react';
import { BookOpen, ArrowLeft, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicMatchingGroupForm } from '../components/DynamicMatchingGroupForm';

export function MatchingGroupDemo() {
  const navigate = useNavigate();
  const [showJSON, setShowJSON] = React.useState(false);
  const [savedData, setSavedData] = React.useState<any>(null);

  const handleSave = (groups: any[]) => {
    setSavedData(groups);
    setShowJSON(true);
    alert('✅ Data saved! Scroll down to see the JSON output.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                  Dynamic Matching Group Form
                </h1>
                <p className="text-sm text-slate-500">
                  Backend-mapped with individual input fields
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 backdrop-blur rounded-lg">
              <Code className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl mb-2">Backend Structure Match</h2>
              <p className="text-blue-100 mb-3">
                This form generates JSON exactly matching your backend model:
              </p>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 font-mono text-xs text-blue-50">
                <div>• <strong>statement:</strong> string[]</div>
                <div>• <strong>option:</strong> {`[{ "A": "..." }, { "B": "..." }]`}</div>
                <div>• <strong>variant_type:</strong> letter | number | romain</div>
                <div>• <strong>answer_count:</strong> number</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📝</span>
            </div>
            <h4 className="text-slate-900 mb-1">Individual Inputs</h4>
            <p className="text-sm text-slate-600">
              Each statement and option is a separate input field with add/remove buttons
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🔤</span>
            </div>
            <h4 className="text-slate-900 mb-1">Auto Labels</h4>
            <p className="text-sm text-slate-600">
              Options auto-labeled with A/B/C or 1/2/3 or I/II/III based on variant type
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🎯</span>
            </div>
            <h4 className="text-slate-900 mb-1">Backend Ready</h4>
            <p className="text-sm text-slate-600">
              Output JSON perfectly matches your backend matching_item model
            </p>
          </div>
        </div>

        {/* Sample Passage Context */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg text-slate-900 mb-1">Reading Passage Context</h3>
              <p className="text-sm text-slate-500">
                This shows the passage info that would contain your question groups
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
                value="Climate Change and Global Impact"
                readOnly
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">
                Passage Body
              </label>
              <textarea
                value="Climate change represents one of the most significant challenges facing humanity today. Scientists have documented rising global temperatures, melting ice caps, and increasingly severe weather patterns..."
                readOnly
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h4 className="text-amber-900 mb-3">
            <strong>📋 How to Use:</strong>
          </h4>
          <ol className="text-sm text-amber-800 space-y-2 list-decimal list-inside">
            <li>Click <strong>"Guruh Qo'shish"</strong> to create a new question group</li>
            <li>Fill in <strong>Dan/Gacha</strong> range (e.g., 1 to 5)</li>
            <li>Add <strong>title/instruction</strong> (optional)</li>
            <li>Click <strong>"+ Add Statement"</strong> to add each statement individually</li>
            <li>Select <strong>variant type</strong> (Harf/Raqam/Rim)</li>
            <li>Click <strong>"+ Add Option"</strong> to add each option individually</li>
            <li>Set <strong>answer count</strong></li>
            <li>Click <strong>"Saqlash"</strong> to see the JSON output</li>
          </ol>
        </div>

        {/* The Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <DynamicMatchingGroupForm 
            questionTypeName="Matching Headings"
            onSave={handleSave}
          />
        </div>

        {/* JSON Output */}
        {showJSON && savedData && (
          <div className="bg-slate-900 rounded-2xl p-6 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Code className="w-5 h-5" />
                <h3 className="text-lg">Generated JSON Output</h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(savedData, null, 2));
                  alert('✅ JSON copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy JSON
              </button>
            </div>
            <pre className="text-xs text-green-400 font-mono overflow-x-auto">
              {JSON.stringify(savedData, null, 2)}
            </pre>
            <div className="mt-4 p-3 bg-blue-900/50 rounded-lg border border-blue-700">
              <p className="text-xs text-blue-200">
                <strong>✅ Backend Ready:</strong> This JSON structure matches your backend model perfectly.
                Each group contains a <code className="text-blue-300">matching_item</code> object with
                <code className="text-blue-300"> statement[]</code>, 
                <code className="text-blue-300"> option[]</code>,
                <code className="text-blue-300"> variant_type</code>, and
                <code className="text-blue-300"> answer_count</code>.
              </p>
            </div>
          </div>
        )}

        {/* Key Differences */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg text-slate-900 mb-4">🔑 Key Differences from Textarea Version</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="text-sm text-red-900 mb-2">❌ Old (Textarea)</h4>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                <li>Multiple items in one textarea</li>
                <li>Manual line breaks</li>
                <li>Harder to edit individual items</li>
                <li>String parsing required</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm text-green-900 mb-2">✅ New (Individual Inputs)</h4>
              <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
                <li>Each item is separate input</li>
                <li>Add/remove buttons per item</li>
                <li>Easy to edit and reorder</li>
                <li>Direct array mapping</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Backend Model Reference */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg text-indigo-900 mb-3">📦 Backend Model Reference</h3>
          <div className="bg-white rounded-lg p-4 font-mono text-xs">
            <div className="text-slate-600">{`{`}</div>
            <div className="text-slate-600 pl-4">"matching_item": {`{`}</div>
            <div className="text-slate-600 pl-8">"title": <span className="text-green-600">"string"</span>,</div>
            <div className="text-slate-600 pl-8">"statement": <span className="text-blue-600">["string", "string"]</span>,</div>
            <div className="text-slate-600 pl-8">"option": <span className="text-purple-600">[{`{ "A": "..." }, { "B": "..." }`}]</span>,</div>
            <div className="text-slate-600 pl-8">"variant_type": <span className="text-orange-600">"letter" | "number" | "romain"</span>,</div>
            <div className="text-slate-600 pl-8">"answer_count": <span className="text-red-600">number</span></div>
            <div className="text-slate-600 pl-4">{`}`}</div>
            <div className="text-slate-600">{`}`}</div>
          </div>
        </div>

        {/* Pro Tips */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h4 className="text-green-900 mb-3">✨ Pro Tips</h4>
            <ul className="text-sm text-green-800 space-y-2">
              <li>• Hover over items to see remove (×) button</li>
              <li>• Labels (A, B, C...) update automatically when changing variant type</li>
              <li>• Empty inputs are filtered out on save</li>
              <li>• Validation happens in real-time</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-blue-900 mb-3">🎯 Best Practices</h4>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Add statements first, then options</li>
              <li>• Choose variant type before adding options</li>
              <li>• Provide more options than statements (IELTS style)</li>
              <li>• Use descriptive title/instruction</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
