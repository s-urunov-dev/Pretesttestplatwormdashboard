import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DynamicFormFeatureShowcase } from '../components/DynamicFormFeatureShowcase';
import { DynamicQuestionGroupForm } from '../components/DynamicQuestionGroupForm';

export function CompleteFormShowcase() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'features' | 'demo'>('features');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#042d62] to-blue-600 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl text-slate-900">
                    Dynamic Question Group Form
                  </h1>
                  <p className="text-sm text-slate-500">
                    Complete showcase with features and live demo
                  </p>
                </div>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  activeTab === 'features'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Features</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  activeTab === 'demo'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Live Demo</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="animate-fadeIn">
            <DynamicFormFeatureShowcase />
          </div>
        )}

        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="animate-fadeIn space-y-6">
            {/* Instructions Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-xl text-white">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 backdrop-blur rounded-lg">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl mb-2">Try the Dynamic Form</h2>
                  <p className="text-blue-100 mb-4">
                    This is a fully functional demo. Create question groups, add questions and options, 
                    and see the magic happen in real-time!
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-sm">
                      ✨ Unlimited questions
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-sm">
                      🎯 Smart validation
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-sm">
                      👁️ Live preview
                    </div>
                    <div className="px-3 py-1 bg-white/20 backdrop-blur rounded-lg text-sm">
                      📊 Auto-counting
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Example Passage Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg text-slate-900 mb-1">Sample Passage</h3>
                  <p className="text-sm text-slate-500">
                    This demonstrates a typical Reading Passage setup
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
                    value="The Evolution of Urban Planning"
                    readOnly
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Passage Body
                  </label>
                  <textarea
                    value="Cities have undergone dramatic transformations over the centuries. From ancient settlements to modern metropolises, urban planning has evolved to meet the changing needs of society. Today's cities face unique challenges including sustainability, transportation, and quality of life..."
                    readOnly
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Selected Question Type Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-purple-900 mb-1">
                    <strong>Question Type:</strong> Matching Headings
                  </h4>
                  <p className="text-sm text-purple-800">
                    Students match paragraph headings with the correct paragraphs. 
                    This is one of the most common IELTS Reading question types.
                  </p>
                </div>
              </div>
            </div>

            {/* The Actual Dynamic Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <DynamicQuestionGroupForm questionTypeName="Matching Headings" />
            </div>

            {/* Tips Section */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <h4 className="text-green-900 mb-3">✅ Best Practices</h4>
                <ul className="text-sm text-green-800 space-y-2">
                  <li>• One question per line in the textarea</li>
                  <li>• Choose appropriate variant type for your content</li>
                  <li>• Provide more options than questions for IELTS format</li>
                  <li>• Use the duplicate feature for similar groups</li>
                  <li>• Check validation before saving</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h4 className="text-amber-900 mb-3">💡 Pro Tips</h4>
                <ul className="text-sm text-amber-800 space-y-2">
                  <li>• Range (Dan-Gacha) auto-calculates for new groups</li>
                  <li>• Empty lines are automatically filtered out</li>
                  <li>• Click headers to collapse/expand groups</li>
                  <li>• Watch the live preview for options</li>
                  <li>• Badges show counts in real-time</li>
                </ul>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-2xl p-8 text-white">
              <h4 className="text-xl mb-4">Quick Actions to Try</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl mb-2">1️⃣</div>
                  <p className="text-sm text-slate-200">
                    Click "Guruh Qo'shish" to create your first group
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl mb-2">2️⃣</div>
                  <p className="text-sm text-slate-200">
                    Add 5 questions (one per line) and 7 options
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="text-2xl mb-2">3️⃣</div>
                  <p className="text-sm text-slate-200">
                    Try different variant types and see the preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
