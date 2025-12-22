import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';

// CORRECT Type definitions matching EXACT backend structure
export type QuestionTypeVariant = 'matching' | 'multiple_choice_one' | 'multiple_choice_multiple' | 'pick_from_list';
export type VariantType = 'letter' | 'number' | 'roman';

// CORRECT structure: option is array of objects with key-value pairs
export interface MatchingQuestionData {
  title: string;
  statement: string[];
  option: Array<{ [key: string]: string }>; // Array of objects like [{ "A": "text", "B": "text" }]
  variant_type: VariantType;
  answer_count: number;
}

interface AdminMatchingEditorProps {
  initialData?: MatchingQuestionData;
  questionType?: QuestionTypeVariant;
  onChange: (data: MatchingQuestionData) => void;
  onQuestionTypeChange?: (type: QuestionTypeVariant) => void;
  hideQuestionTypeSelector?: boolean;
}

const QUESTION_TYPES = [
  { value: 'matching' as const, label: 'Matching', description: 'Match items to categories' },
  { value: 'multiple_choice_one' as const, label: 'Multiple Choice (One Answer)', description: 'Choose one correct answer' },
  { value: 'multiple_choice_multiple' as const, label: 'Multiple Choice (Multiple Answers)', description: 'Choose multiple correct answers' },
  { value: 'pick_from_list' as const, label: 'Pick From List', description: 'Select items from a list' },
];

const VARIANT_TYPES = [
  { value: 'letter' as const, label: 'Harflar (A, B, C...)', example: 'A, B, C, D' },
  { value: 'number' as const, label: 'Raqamlar (1, 2, 3...)', example: '1, 2, 3, 4' },
  { value: 'roman' as const, label: 'Rim raqamlari (I, II, III...)', example: 'I, II, III, IV' },
];

export function AdminMatchingEditor({ 
  initialData, 
  questionType = 'matching',
  onChange,
  onQuestionTypeChange,
  hideQuestionTypeSelector = false
}: AdminMatchingEditorProps) {
  const [selectedType, setSelectedType] = useState<QuestionTypeVariant>(questionType);
  const [title, setTitle] = useState(initialData?.title || '');
  const [statements, setStatements] = useState<string[]>(initialData?.statement || ['']);
  
  // CORRECT: options is array of objects with key-value pairs
  const [options, setOptions] = useState<Array<{ [key: string]: string }>>(
    initialData?.option || [{ A: '', B: '', C: '', D: '' }]
  );
  
  const [variantType, setVariantType] = useState<VariantType>(initialData?.variant_type || 'letter');
  const [answerCount, setAnswerCount] = useState(initialData?.answer_count || 1);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedStatement, setDraggedStatement] = useState<number | null>(null);

  // Sync with initialData when it changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStatements(initialData.statement.length > 0 ? initialData.statement : ['']);
      
      // Handle options as array of objects
      if (initialData.option && initialData.option.length > 0) {
        setOptions(initialData.option);
      } else {
        // Default: one object with 4 options
        setOptions([{ A: '', B: '', C: '', D: '' }]);
      }
      
      setVariantType(initialData.variant_type || 'letter');
      setAnswerCount(initialData.answer_count || 1);
    }
  }, [initialData]);

  // Update parent on any change
  useEffect(() => {
    const data: MatchingQuestionData = {
      title,
      statement: statements.filter(s => s.trim()),
      option: options.filter(opt => Object.keys(opt).length > 0),
      variant_type: variantType,
      answer_count: answerCount,
    };
    onChange(data);
  }, [title, statements, options, variantType, answerCount]);

  // Get option label (A, B, C... or 1, 2, 3... or I, II, III...)
  const getOptionLabel = (index: number): string => {
    if (variantType === 'number') return String(index + 1);
    if (variantType === 'roman') {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      return romans[index] || `(${index + 1})`;
    }
    return String.fromCharCode(65 + index); // A, B, C...
  };

  // Get all option keys from the first options object
  const getOptionKeys = (): string[] => {
    if (options.length === 0) return [];
    return Object.keys(options[0]).sort();
  };

  // Add a new statement
  const addStatement = () => {
    setStatements([...statements, '']);
  };

  // Update a statement
  const updateStatement = (index: number, value: string) => {
    const updated = [...statements];
    updated[index] = value;
    setStatements(updated);
  };

  // Remove a statement
  const removeStatement = (index: number) => {
    if (statements.length > 1) {
      setStatements(statements.filter((_, i) => i !== index));
    }
  };

  // Move statement (drag and drop)
  const moveStatement = (fromIndex: number, toIndex: number) => {
    const updated = [...statements];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setStatements(updated);
  };

  // Add a new option key to ALL option objects
  const addOptionKey = () => {
    const currentKeys = getOptionKeys();
    const newKeyIndex = currentKeys.length;
    const newKey = getOptionLabel(newKeyIndex);
    
    const updated = options.map(opt => ({
      ...opt,
      [newKey]: ''
    }));
    setOptions(updated);
  };

  // Remove an option key from ALL option objects
  const removeOptionKey = (key: string) => {
    const currentKeys = getOptionKeys();
    if (currentKeys.length <= 2) return; // Minimum 2 options
    
    const updated = options.map(opt => {
      const newOpt = { ...opt };
      delete newOpt[key];
      return newOpt;
    });
    setOptions(updated);
  };

  // Update specific option value
  const updateOptionValue = (optionIndex: number, key: string, value: string) => {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      [key]: value
    };
    setOptions(updated);
  };

  // Handle variant type change - regenerate keys
  const handleVariantTypeChange = (newVariantType: VariantType) => {
    setVariantType(newVariantType);
    
    // Regenerate option keys based on new variant type
    if (options.length > 0) {
      const currentValues = Object.values(options[0]);
      const newOptions: { [key: string]: string } = {};
      
      currentValues.forEach((value, index) => {
        let newKey: string;
        if (newVariantType === 'number') {
          newKey = String(index + 1);
        } else if (newVariantType === 'roman') {
          const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
          newKey = romans[index] || String(index + 1);
        } else {
          newKey = String.fromCharCode(65 + index); // A, B, C...
        }
        newOptions[newKey] = value;
      });
      
      setOptions([newOptions]);
    }
  };

  // Validation
  const validationResults = {
    minStatements: statements.filter(s => s.trim()).length >= 1,
    minOptions: getOptionKeys().length >= 2,
    emptyStatements: statements.some((s, i) => !s.trim() && i < statements.length - 1),
    emptyOptions: options.length > 0 && Object.values(options[0]).some(v => !v.trim()),
    answerCountValid: answerCount >= 1,
  };

  const isValid = validationResults.minStatements && 
                  validationResults.minOptions && 
                  !validationResults.emptyStatements &&
                  !validationResults.emptyOptions &&
                  validationResults.answerCountValid;

  const optionKeys = getOptionKeys();

  return (
    <div className="space-y-6">
      {/* Question Type Selector */}
      {!hideQuestionTypeSelector && (
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
          <label className="block text-slate-700 mb-3 font-medium">
            Question Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QUESTION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => {
                  setSelectedType(type.value);
                  onQuestionTypeChange?.(type.value);
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedType === type.value
                    ? 'border-[#042d62] bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    selectedType === type.value
                      ? 'border-[#042d62] bg-[#042d62]'
                      : 'border-slate-300'
                  }`}>
                    {selectedType === type.value && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{type.label}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 p-6 space-y-6">
        {/* Header with icon */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#042d62] to-[#053a75] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Matching Question Builder</h3>
            <p className="text-sm text-slate-600">Statements va Options ni alohida-alohida sozlang</p>
          </div>
        </div>

        {/* Question Title */}
        <div>
          <label className="block text-slate-700 mb-2 text-sm font-medium">
            Savol Sarlavhasi <span className="text-slate-400">(ixtiyoriy)</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masalan: Match each statement to the correct option"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white transition-all"
          />
        </div>

        {/* Variant Type & Answer Count */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-2 text-sm font-medium">
              Variant Turi <span className="text-red-500">*</span>
            </label>
            <select
              value={variantType}
              onChange={(e) => handleVariantTypeChange(e.target.value as VariantType)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white appearance-none"
            >
              {VARIANT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Namuna: {VARIANT_TYPES.find(t => t.value === variantType)?.example}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 mb-2 text-sm font-medium">
              Har bir Statement uchun Javoblar Soni <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={answerCount}
              onChange={(e) => setAnswerCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Statements Section */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">📝 Savollar (Statements)</h4>
              <p className="text-sm text-slate-600 mt-0.5">
                {statements.filter(s => s.trim()).length} ta savol
              </p>
            </div>
            <button
              type="button"
              onClick={addStatement}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-all text-sm font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              + Savol
            </button>
          </div>

          <div className="space-y-3">
            {statements.map((statement, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => setDraggedStatement(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedStatement !== null && draggedStatement !== index) {
                    moveStatement(draggedStatement, index);
                    setDraggedStatement(null);
                  }
                }}
                className="group"
              >
                <div className="flex items-start gap-3 bg-blue-50 rounded-lg p-4 border border-blue-200 hover:border-blue-300 transition-all">
                  <button
                    type="button"
                    className="mt-2 cursor-move text-slate-400 hover:text-slate-600"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#042d62] text-white text-sm font-bold mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={statement}
                    onChange={(e) => updateStatement(index, e.target.value)}
                    placeholder={`Statement ${index + 1} matnini kiriting...`}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeStatement(index)}
                    disabled={statements.length === 1}
                    className="mt-2 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!validationResults.minStatements && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mt-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Kamida bitta statement qo'shing</span>
            </div>
          )}
        </div>

        {/* Options Section */}
        <div className="bg-white rounded-xl border-2 border-green-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-slate-900">✅ Variantlar (Options)</h4>
              <p className="text-sm text-slate-600 mt-0.5">
                {optionKeys.length} ta variant - Barcha savollar uchun bir xil variantlar
              </p>
            </div>
            <button
              type="button"
              onClick={addOptionKey}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all text-sm font-medium shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              + Variant
            </button>
          </div>

          {options.length > 0 && (
            <div className="space-y-3">
              {optionKeys.map((key, index) => (
                <div key={key} className="group">
                  <div className="flex items-center gap-3 bg-green-50 rounded-lg p-3 border border-green-200 hover:border-green-300 transition-all">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold border-2 border-green-700">
                      {key}
                    </div>
                    <input
                      type="text"
                      value={options[0][key] || ''}
                      onChange={(e) => updateOptionValue(0, key, e.target.value)}
                      placeholder={`Option ${key} matnini kiriting...`}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeOptionKey(key)}
                      disabled={optionKeys.length <= 2}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!validationResults.minOptions && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 mt-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Kamida 2 ta option qo'shing</span>
            </div>
          )}
        </div>

        {/* Preview Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-5 h-5" />
                Preview Yopish
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Preview Ko'rish
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">👁️ Student Preview (O'quvchi ko'rinishi)</h3>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {QUESTION_TYPES.find(t => t.value === selectedType)?.label}
            </span>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            {title && (
              <div className="mb-6 pb-4 border-b border-slate-200">
                <p className="text-slate-700 font-medium italic">{title}</p>
              </div>
            )}

            {/* Statements */}
            <div className="space-y-4 mb-6">
              <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Questions</p>
              {statements.filter(s => s.trim()).map((statement, index) => (
                <div key={index} className="flex gap-3 p-3 bg-slate-50 rounded-lg">
                  <span className="font-bold text-[#042d62] min-w-[28px]">{index + 1}.</span>
                  <p className="text-slate-900">{statement}</p>
                </div>
              ))}
            </div>

            {/* Options */}
            {options.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Answer Options</p>
                <div className="grid grid-cols-1 gap-3">
                  {optionKeys.map((key) => (
                    <div key={key} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="font-bold text-green-700 text-lg min-w-[36px] text-center">
                        {key}
                      </span>
                      <span className="text-slate-800 flex-1">{options[0][key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {answerCount > 1 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Eslatma:</strong> Har bir statement uchun {answerCount} ta javob tanlash kerak.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Summary */}
      <div className={`rounded-xl border-2 p-4 ${
        isValid 
          ? 'bg-green-50 border-green-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          {isValid ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-700">✅ Saqlashga tayyor!</p>
                <p className="text-sm text-slate-600">Barcha validatsiyalar muvaffaqiyatli o'tdi</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-700">⚠️ Iltimos tekshiring</p>
                <p className="text-sm text-slate-600">
                  {!validationResults.minStatements && 'Kamida 1 ta statement kerak. '}
                  {!validationResults.minOptions && 'Kamida 2 ta option kerak. '}
                  {validationResults.emptyStatements && 'Bo\'sh statementlar mavjud. '}
                  {validationResults.emptyOptions && 'Bo\'sh optionlar mavjud.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* JSON Debug (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="bg-slate-900 text-green-400 rounded-xl p-4 font-mono text-xs">
          <summary className="cursor-pointer text-white font-semibold mb-2">🔧 JSON Output (Dev Only)</summary>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify({ title, statement: statements.filter(s => s.trim()), option: options, variant_type: variantType, answer_count: answerCount }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}