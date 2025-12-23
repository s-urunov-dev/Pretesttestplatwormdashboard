import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Eye, 
  Copy, 
  Trash2, 
  ChevronDown,
  List,
  Hash,
  Type,
  BarChart
} from 'lucide-react';

export function DynamicFormFeatureShowcase() {
  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl text-slate-900 mb-3">
          Dynamic Question Group Form
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Professional form component for creating IELTS Reading test questions with 
          unlimited scalability and real-time validation
        </p>
      </div>

      {/* Core Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Feature 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg text-slate-900 mb-2">Dynamic Questions</h3>
          <p className="text-sm text-slate-600 mb-3">
            Add unlimited questions by typing one per line. Press Enter to add more.
          </p>
          <div className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            ✓ Auto-count • Real-time updates • No limits
          </div>
        </div>

        {/* Feature 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <List className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg text-slate-900 mb-2">Dynamic Options</h3>
          <p className="text-sm text-slate-600 mb-3">
            Add unlimited options with auto-labeling (A, B, C... or 1, 2, 3...).
          </p>
          <div className="text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
            ✓ Smart labels • Live preview • Auto-filter
          </div>
        </div>

        {/* Feature 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg text-slate-900 mb-2">Live Validation</h3>
          <p className="text-sm text-slate-600 mb-3">
            Real-time validation with instant feedback and error messages.
          </p>
          <div className="text-xs text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
            ✓ Instant feedback • Clear errors • Visual status
          </div>
        </div>

        {/* Feature 4 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-lg text-slate-900 mb-2">Live Preview</h3>
          <p className="text-sm text-slate-600 mb-3">
            See exactly how your options will look with proper labeling.
          </p>
          <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            ✓ Real-time • Formatted • Interactive
          </div>
        </div>

        {/* Feature 5 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
            <Copy className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg text-slate-900 mb-2">Quick Duplicate</h3>
          <p className="text-sm text-slate-600 mb-3">
            Duplicate entire groups with one click to save time.
          </p>
          <div className="text-xs text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg">
            ✓ One click • All data copied • Auto-range
          </div>
        </div>

        {/* Feature 6 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
            <ChevronDown className="w-6 h-6 text-rose-600" />
          </div>
          <h3 className="text-lg text-slate-900 mb-2">Collapsible Groups</h3>
          <p className="text-sm text-slate-600 mb-3">
            Accordion-style groups to keep your workspace organized.
          </p>
          <div className="text-xs text-rose-700 bg-rose-50 px-3 py-2 rounded-lg">
            ✓ Click to toggle • Clean UI • Status badges
          </div>
        </div>
      </div>

      {/* Variant Types Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl text-slate-900">Variant Type System</h3>
            <p className="text-sm text-slate-500">Three different labeling styles for options</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Alfibo */}
          <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <h4 className="text-lg text-blue-900 mb-3">Alfibo</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs">A</span>
                <span>First option</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs">B</span>
                <span>Second option</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="w-6 h-6 bg-blue-600 text-white rounded flex items-center justify-center text-xs">C</span>
                <span>Third option</span>
              </div>
            </div>
            <p className="text-xs text-blue-700">Perfect for multiple choice questions</p>
          </div>

          {/* Raqam */}
          <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <h4 className="text-lg text-green-900 mb-3">Raqam</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-green-800">
                <span className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center text-xs">1</span>
                <span>First option</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <span className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center text-xs">2</span>
                <span>Second option</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-800">
                <span className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center text-xs">3</span>
                <span>Third option</span>
              </div>
            </div>
            <p className="text-xs text-green-700">Great for numbered lists</p>
          </div>

          {/* Rim */}
          <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <h4 className="text-lg text-purple-900 mb-3">Rim</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <span className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center text-xs">I</span>
                <span>First option</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <span className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center text-xs">II</span>
                <span>Second option</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-800">
                <span className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center text-xs">III</span>
                <span>Third option</span>
              </div>
            </div>
            <p className="text-xs text-purple-700">Ideal for formal headings</p>
          </div>
        </div>
      </div>

      {/* Validation Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl text-slate-900">Smart Validation System</h3>
            <p className="text-sm text-slate-500">Real-time checks to ensure data quality</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
              <h4 className="text-sm text-red-900">Required Checks</h4>
            </div>
            <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
              <li>Range values must be greater than 0</li>
              <li>"Gacha" must be ≥ "Dan"</li>
              <li>At least one question required</li>
              <li>At least one option required</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <h4 className="text-sm text-green-900">Valid State</h4>
            </div>
            <ul className="text-xs text-green-800 space-y-1 list-disc list-inside">
              <li>Green checkmark icon displayed</li>
              <li>Save button enabled</li>
              <li>All fields properly filled</li>
              <li>Ready to submit</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6 text-white">
          <BarChart className="w-8 h-8" />
          <div>
            <h3 className="text-2xl">Live Statistics</h3>
            <p className="text-blue-100 text-sm">Each group shows real-time metrics</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
            <div className="text-3xl text-white mb-2">∞</div>
            <div className="text-sm text-blue-100">Unlimited Questions</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
            <div className="text-3xl text-white mb-2">∞</div>
            <div className="text-sm text-blue-100">Unlimited Options</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-5 text-center">
            <div className="text-3xl text-white mb-2">∞</div>
            <div className="text-sm text-blue-100">Unlimited Groups</div>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <h3 className="text-xl text-slate-900 mb-6">Common Use Cases</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-slate-900 mb-1">Matching Headings</h4>
              <p className="text-sm text-slate-600">
                Questions = Paragraphs (A, B, C...) • Options = Headings (i, ii, iii...) • 1 answer per question
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-slate-900 mb-1">Multiple Choice</h4>
              <p className="text-sm text-slate-600">
                Questions = List of questions • Options = A, B, C, D choices • 1 answer per question
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-slate-900 mb-1">Matching Features</h4>
              <p className="text-sm text-slate-600">
                Questions = Items to match • Options = Categories/features • Multiple answers allowed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-10 shadow-xl">
        <h3 className="text-2xl text-white mb-3">Ready to Get Started?</h3>
        <p className="text-slate-300 mb-6 max-w-xl mx-auto">
          Visit the demo page to try out all features and see the dynamic form in action!
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/demo/dynamic-form"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Try Demo</span>
          </a>
          <a
            href="/DYNAMIC_FORM_DOCUMENTATION.md"
            className="px-6 py-3 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Read Docs
          </a>
        </div>
      </div>
    </div>
  );
}
