import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Info, CheckCircle2, AlertCircle, ListOrdered, FileText } from 'lucide-react';

interface SummaryCompletionInputsProps {
  value?: {
    title?: string;
    instruction?: string;
    summary?: string;
    options?: string[];
  };
  onChange: (data: {
    title: string;
    instruction: string;
    summary: string;
    options: string[];
  }) => void;
}

export function SummaryCompletionInputs({ value, onChange }: SummaryCompletionInputsProps) {
  const [title, setTitle] = useState('Complete the summary below.');
  const [instruction, setInstruction] = useState('ONE_WORD_FROM_LIST');
  const [summary, setSummary] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize from value prop ONCE
  useEffect(() => {
    if (!initialized) {
      setTitle(value?.title || 'Complete the summary below.');
      setInstruction(value?.instruction || 'ONE_WORD_FROM_LIST');
      setSummary(value?.summary || '');
      
      if (value?.options && value.options.length > 0) {
        setOptions(value.options);
      } else {
        setOptions([]);
      }
      
      setInitialized(true);
    }
  }, [value, initialized]);

  // Sync changes to parent
  useEffect(() => {
    if (initialized) {
      console.log('✅ Summary Completion Debug:', { title, instruction, summary, options });
      onChange({ title, instruction, summary, options });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, instruction, summary, options, initialized]);

  const addOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  if (!initialized) {
    return <div className="text-slate-500 text-sm">Loading...</div>;
  }

  // Validation - check if summary has gaps (1), (2), etc.
  const gapMatches = summary.match(/\(\d+\)/g);
  const gapCount = gapMatches ? gapMatches.length : 0;
  
  const isValidConfiguration = 
    summary.trim() !== '' && 
    gapCount > 0 && 
    (instruction.includes('FROM_PASSAGE') || options.length >= gapCount);

  // Check if instruction requires options list
  const requiresOptionsList = instruction.includes('FROM_LIST');

  // Instruction display mapping
  const instructionLabels: { [key: string]: string } = {
    'ONE_WORD_FROM_PASSAGE': 'Choose ONE WORD ONLY from the passage',
    'ONE_WORD_FROM_LIST': 'Choose ONE WORD ONLY from the list of options',
    'NMT_TWO_FROM_PASSAGE': 'Choose NO MORE THAN TWO WORDS from the passage',
    'NMT_TWO_FROM_LIST': 'Choose NO MORE THAN TWO WORDS from the list of options',
    'NMT_THREE_FROM_PASSAGE': 'Choose NO MORE THAN THREE WORDS from the passage',
    'NMT_THREE_FROM_LIST': 'Choose NO MORE THAN THREE WORDS from the list of options',
    'ONE_WORD_NUM_FROM_PASSAGE': 'Choose ONE WORD AND/OR A NUMBER from the passage',
    'NMT_TWO_NUM_FROM_PASSAGE': 'Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage',
  };

  return (
    <div className="space-y-6">
      {/* Header with validation status */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#042d62] to-[#053a75] text-white p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Summary Completion</h3>
            <p className="text-sm text-white/80">
              {gapCount} ta bo'sh joy | {options.length} ta variant
            </p>
          </div>
        </div>
        
        {isValidConfiguration ? (
          <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-green-300" />
            <span className="text-sm font-medium">Tayyor</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-300" />
            <span className="text-sm font-medium">Tugallanmagan</span>
          </div>
        )}
      </div>

      {/* Title Input */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">1</span>
          </div>
          <label className="font-semibold text-slate-900">
            Sarlavha <span className="text-slate-400 font-normal">(ixtiyoriy)</span>
          </label>
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masalan: Complete the summary below."
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 transition-all"
        />
      </div>

      {/* Instruction Type */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <span className="text-purple-600 font-bold text-sm">2</span>
          </div>
          <label className="font-semibold text-slate-900">
            Javob Kriteriyasi <span className="text-red-500">*</span>
          </label>
        </div>
        <select
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 transition-all"
        >
          {Object.entries(instructionLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            <span className="font-medium">Tanlangan:</span> {instructionLabels[instruction]}
          </p>
        </div>
      </div>

      {/* Summary Text */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <span className="text-green-600 font-bold text-sm">3</span>
          </div>
          <label className="font-semibold text-slate-900">
            Summary Matni <span className="text-red-500">*</span>
          </label>
        </div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summary matnini kiriting. Bo'sh joylarni (1), (2), (3) kabi raqamlar bilan belgilang.&#10;&#10;Masalan: The development of global time standardisation was driven by the expansion of railways and international trade. Before standardised time was introduced, different regions used their own local time, which caused significant (1). To solve this problem, international meetings were held, leading to the adoption of a common reference point. Despite this agreement, some countries showed (2) to the new system."
          rows={12}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 resize-none font-mono text-sm transition-all leading-relaxed"
        />
        
        {/* Gap Detection Info */}
        <div className={`border rounded-lg p-3 flex items-start gap-3 ${
          gapCount > 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        }`}>
          {gapCount > 0 ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-900">
                <span className="font-medium">{gapCount} ta bo'sh joy topildi:</span> {gapMatches?.join(', ')}
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900">
                Bo'sh joylar topilmadi. Matnda (1), (2), (3) kabi raqamlarni qo'shing.
              </p>
            </>
          )}
        </div>
        
        {/* Example Box */}
        <details className="group bg-blue-50 border border-blue-200 rounded-lg">
          <summary className="cursor-pointer list-none px-4 py-3 font-medium text-blue-900 hover:bg-blue-100 transition-colors rounded-lg">
            💡 Misol ko'rish
            <span className="float-right text-blue-400 group-open:rotate-90 transition-transform">▶</span>
          </summary>
          <div className="px-4 pb-4 text-sm text-blue-800 space-y-2 border-t border-blue-200 mt-2 pt-3">
            <p className="font-medium">Summary Example:</p>
            <pre className="bg-white p-3 rounded border border-blue-200 overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
The development of global time standardisation was driven by the expansion of railways and international trade. Before standardised time was introduced, different regions used their own local time, which caused significant (1). To solve this problem, international meetings were held, leading to the adoption of a common reference point. Despite this agreement, some countries showed (2) to the new system due to political and cultural reasons. Over time, improvements in technology made timekeeping devices more (3), increasing public acceptance. Today, modern society relies heavily on precise (4) for communication, transport, and commerce.
            </pre>
          </div>
        </details>
      </div>

      {/* Options List - Only show if instruction requires list */}
      {requiresOptionsList && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">4</span>
              </div>
              <label className="font-semibold text-slate-900">
                Javob Variantlari <span className="text-red-500">*</span>
              </label>
            </div>
            <div className="text-sm text-slate-600">
              {options.length} ta variant
            </div>
          </div>

          {/* Add New Option */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Yangi variant kiriting..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-slate-50 transition-all"
            />
            <button
              type="button"
              onClick={addOption}
              disabled={!newOption.trim()}
              className="px-6 py-3 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Qo'shish
            </button>
          </div>

          {/* Options Grid */}
          {options.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="group bg-slate-50 border-2 border-slate-200 rounded-lg p-3 flex items-center justify-between hover:border-[#042d62] transition-all"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#042d62] text-white flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {option}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <ListOrdered className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium mb-1">Hali variant qo'shilmagan</p>
              <p className="text-sm text-slate-500">
                Yuqoridagi input orqali javob variantlarini qo'shing
              </p>
            </div>
          )}

          {/* Validation Warning */}
          {gapCount > 0 && options.length < gapCount && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-900">
                <span className="font-medium">Diqqat:</span> Summary da {gapCount} ta bo'sh joy bor, lekin {options.length} ta variant mavjud. 
                Kamida {gapCount} ta variant kerak.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Multiple Options - Only show if instruction requires list */}
      {requiresOptionsList && (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
          <details className="group">
            <summary className="cursor-pointer list-none flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-600" />
                <span className="font-medium text-slate-900">Ko'p variantlarni bir vaqtda qo'shish</span>
              </div>
              <span className="text-slate-400 group-open:rotate-90 transition-transform">▶</span>
            </summary>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-600">
                Bir nechta variantlarni har birini yangi qatorda yozing:
              </p>
              <textarea
                placeholder="confusion&#10;resistance&#10;accurate&#10;clocks&#10;trade&#10;schedules&#10;agreement&#10;measurement"
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white resize-none font-mono text-sm"
                onBlur={(e) => {
                  const lines = e.target.value
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line !== '');
                  
                  if (lines.length > 0) {
                    setOptions([...options, ...lines]);
                    e.target.value = '';
                  }
                }}
              />
              <p className="text-xs text-slate-500">
                💡 Matnni yozib bo'lgach, input tashqarisiga bosing - barcha qatorlar avtomatik qo'shiladi
              </p>
              <details className="bg-white border border-slate-300 rounded-lg">
                <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors rounded-lg">
                  📋 Misol variantlar ro'yxati
                </summary>
                <div className="px-3 pb-2 pt-1">
                  <div className="bg-slate-50 p-2 rounded text-xs font-mono text-slate-700 border border-slate-200">
                    confusion<br/>
                    resistance<br/>
                    accurate<br/>
                    clocks<br/>
                    trade<br/>
                    schedules<br/>
                    agreement<br/>
                    measurement
                  </div>
                </div>
              </details>
            </div>
          </details>
        </div>
      )}

      {/* Info message for FROM_PASSAGE instructions */}
      {!requiresOptionsList && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900 mb-2">
                Javob variantlari kerak emas
              </p>
              <p className="text-sm text-blue-800">
                Tanlangan kriteriya "<span className="font-semibold">{instructionLabels[instruction]}</span>" 
                bo'lgani uchun, talabalar javoblarni o'zlari passagedan topib yozadilar. 
                Javob variantlari ro'yxati kerak emas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Panel */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-5">
        <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-slate-600" />
          Konfiguratsiya Xulosasi
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-2xl font-bold text-[#042d62]">{gapCount}</div>
            <div className="text-xs text-slate-600 mt-1">Bo'sh Joylar</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-2xl font-bold text-[#042d62]">{options.length}</div>
            <div className="text-xs text-slate-600 mt-1">Variantlar</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="text-2xl font-bold text-[#042d62]">{summary.split(/\s+/).filter(w => w).length}</div>
            <div className="text-xs text-slate-600 mt-1">So'zlar</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className={`text-2xl font-bold ${isValidConfiguration ? 'text-green-600' : 'text-amber-600'}`}>
              {isValidConfiguration ? '✓' : '!'}
            </div>
            <div className="text-xs text-slate-600 mt-1">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}