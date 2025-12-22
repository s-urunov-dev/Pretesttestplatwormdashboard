import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';

// Type definitions matching backend structure
export type QuestionTypeVariant = 'matching' | 'multiple_choice_one' | 'multiple_choice_multiple' | 'pick_from_list';
export type VariantType = 'letter' | 'number' | 'roman';

export interface MatchingQuestionData {
  title: string;
  statement: string[];
  option: string[];
  variant_type: VariantType;
  answer_count: number;
}

interface AdminMatchingEditorProps {
  initialData?: MatchingQuestionData;
  questionType?: QuestionTypeVariant;
  onChange: (data: MatchingQuestionData) => void;
  onQuestionTypeChange?: (type: QuestionTypeVariant) => void;
  hideQuestionTypeSelector?: boolean; // Hide the question type selector (for Reading forms)
}

const QUESTION_TYPES = [
  { value: 'matching' as const, label: 'Matching', description: 'Match items to categories' },
  { value: 'multiple_choice_one' as const, label: 'Multiple Choice (One Answer)', description: 'Choose one correct answer' },
  { value: 'multiple_choice_multiple' as const, label: 'Multiple Choice (Multiple Answers)', description: 'Choose multiple correct answers' },
  { value: 'pick_from_list' as const, label: 'Pick From List', description: 'Select items from a list' },
];

const VARIANT_TYPES = [
  { value: 'letter' as const, label: 'Letters (A, B, C...)', example: 'A, B, C, D' },
  { value: 'number' as const, label: 'Numbers (1, 2, 3...)', example: '1, 2, 3, 4' },
  { value: 'roman' as const, label: 'Roman (I, II, III...)', example: 'I, II, III, IV' },
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
  const [options, setOptions] = useState<string[]>(initialData?.option || ['', '', '', '']);
  const [variantType, setVariantType] = useState<VariantType>(initialData?.variant_type || 'letter');
  const [answerCount, setAnswerCount] = useState(initialData?.answer_count || 1);
  const [showPreview, setShowPreview] = useState(false);
  const [draggedStatement, setDraggedStatement] = useState<number | null>(null);
  const [draggedOption, setDraggedOption] = useState<number | null>(null);

  // Sync with initialData when it changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStatements(initialData.statement.length > 0 ? initialData.statement : ['']);
      setOptions(initialData.option.length > 0 ? initialData.option : ['', '', '', '']);
      setVariantType(initialData.variant_type || 'letter');
      setAnswerCount(initialData.answer_count || 1);
    }
  }, [initialData]);

  // Update parent on any change
  useEffect(() => {
    const data: MatchingQuestionData = {
      title,
      statement: statements.filter(s => s.trim()),
      option: options.filter(o => o.trim()),
      variant_type: variantType,
      answer_count: answerCount,
    };
    onChange(data);
  }, [title, statements, options, variantType, answerCount]);

  // Validation logic
  const validationResults = {
    minStatements: statements.filter(s => s.trim()).length >= 1,
    minOptions: options.filter(o => o.trim()).length >= 2,
    answerCountValid: answerCount >= 1 && answerCount <= options.filter(o => o.trim()).length,
    emptyStatements: statements.some((s, i) => !s.trim() && i < statements.length - 1),
    emptyOptions: options.some((o, i) => !o.trim() && i < options.length - 1),
  };

  const isValid = validationResults.minStatements && 
                  validationResults.minOptions && 
                  validationResults.answerCountValid &&
                  !validationResults.emptyStatements &&
                  !validationResults.emptyOptions;

  // Helper functions
  const getOptionLabel = (index: number): string => {
    if (variantType === 'number') return String(index + 1);
    if (variantType === 'roman') {
      const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
      return romans[index] || `(${index + 1})`;
    }
    return String.fromCharCode(65 + index); // A, B, C...
  };

  // Statement handlers
  const addStatement = () => {
    setStatements([...statements, '']);
  };

  const updateStatement = (index: number, value: string) => {
    const updated = [...statements];
    updated[index] = value;
    setStatements(updated);
  };

  const removeStatement = (index: number) => {
    if (statements.length > 1) {
      setStatements(statements.filter((_, i) => i !== index));
    }
  };

  const moveStatement = (fromIndex: number, toIndex: number) => {
    const updated = [...statements];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setStatements(updated);
  };

  // Option handlers
  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const moveOption = (fromIndex: number, toIndex: number) => {
    const updated = [...options];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setOptions(updated);
  };

  // Question type change handler
  const handleQuestionTypeChange = (type: QuestionTypeVariant) => {
    setSelectedType(type);
    onQuestionTypeChange?.(type);
    
    // Adjust answer count based on type
    if (type === 'multiple_choice_one') {
      setAnswerCount(1);
    } else if (type === 'multiple_choice_multiple') {
      setAnswerCount(Math.min(2, options.filter(o => o.trim()).length));
    }
  };

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
                onClick={() => handleQuestionTypeChange(type.value)}
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

      {/* Main Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Question Meta & Statements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Meta Section */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 mb-4">Question Details</h3>
            
            {/* Title */}
            <div>
              <label className="block text-slate-700 mb-2 text-sm font-medium">
                Question Title <span className="text-slate-400">(optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Match each statement to the correct paragraph"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50 transition-all"
              />
            </div>

            {/* Variant Type & Answer Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-2 text-sm font-medium">
                  Variant Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={variantType}
                  onChange={(e) => setVariantType(e.target.value as VariantType)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50 appearance-none"
                >
                  {VARIANT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Example: {VARIANT_TYPES.find(t => t.value === variantType)?.example}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 mb-2 text-sm font-medium">
                  Answers per Statement <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={options.filter(o => o.trim()).length}
                  value={answerCount}
                  onChange={(e) => setAnswerCount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50"
                  disabled={selectedType === 'multiple_choice_one'}
                />
                {!validationResults.answerCountValid && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Must be between 1 and {options.filter(o => o.trim()).length}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statements Editor */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Statements / Questions</h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {statements.filter(s => s.trim()).length} statement{statements.filter(s => s.trim()).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={addStatement}
                className="flex items-center gap-2 px-4 py-2 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Statement
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
                  <div className="flex items-start gap-3 bg-slate-50 rounded-lg p-3 border border-slate-200 hover:border-slate-300 transition-all">
                    <button
                      type="button"
                      className="mt-2 cursor-move text-slate-400 hover:text-slate-600"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#042d62] text-white text-sm font-medium mt-1.5">
                      {index + 1}
                    </div>
                    <textarea
                      value={statement}
                      onChange={(e) => updateStatement(index, e.target.value)}
                      placeholder={`Enter statement ${index + 1}...`}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white resize-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeStatement(index)}
                      disabled={statements.length === 1}
                      className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {!validationResults.minStatements && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Add at least one statement</span>
                </div>
              )}

              {validationResults.emptyStatements && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Some statements are empty. Fill them or remove them.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Options Editor */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border-2 border-slate-200 p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">Answer Options</h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {options.filter(o => o.trim()).length} option{options.filter(o => o.trim()).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-all text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => setDraggedOption(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedOption !== null && draggedOption !== index) {
                      moveOption(draggedOption, index);
                      setDraggedOption(null);
                    }
                  }}
                  className="group"
                >
                  <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200 hover:border-slate-300 transition-all">
                    <button
                      type="button"
                      className="cursor-move text-slate-400 hover:text-slate-600"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold border-2 border-green-200">
                      {getOptionLabel(index)}
                    </div>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${getOptionLabel(index)}`}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {!validationResults.minOptions && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mt-3">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Add at least 2 options</span>
                </div>
              )}

              {validationResults.emptyOptions && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mt-3">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Fill or remove empty options</span>
                </div>
              )}
            </div>

            {/* Preview Toggle */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-sm font-medium"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Show Preview
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Student View Preview</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              {QUESTION_TYPES.find(t => t.value === selectedType)?.label}
            </span>
          </div>

          <div className="bg-white rounded-lg p-6 border border-slate-200">
            {title && (
              <div className="mb-4 pb-4 border-b border-slate-200">
                <p className="text-slate-700 font-medium italic">{title}</p>
              </div>
            )}

            {/* Statements */}
            <div className="space-y-4 mb-6">
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Questions</p>
              {statements.filter(s => s.trim()).map((statement, index) => (
                <div key={index} className="flex gap-3">
                  <span className="font-bold text-slate-700 min-w-[24px]">{index + 1}.</span>
                  <p className="text-slate-900">{statement}</p>
                </div>
              ))}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Answer Options</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.filter(o => o.trim()).map((option, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#042d62] min-w-[32px] text-center">
                      {getOptionLabel(index)}
                    </span>
                    <span className="text-slate-800">{option}</span>
                  </div>
                ))}
              </div>
            </div>

            {answerCount > 1 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Students must select {answerCount} answer{answerCount > 1 ? 's' : ''} for each statement.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Summary */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-4">
        <div className="flex items-center gap-3">
          {isValid ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-700">Ready to save</p>
                <p className="text-sm text-slate-600">All validation checks passed</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-700">Please review</p>
                <p className="text-sm text-slate-600">
                  {!validationResults.minStatements && 'Add at least one statement. '}
                  {!validationResults.minOptions && 'Add at least two options. '}
                  {!validationResults.answerCountValid && 'Check answer count. '}
                  {validationResults.emptyStatements && 'Fill or remove empty statements. '}
                  {validationResults.emptyOptions && 'Fill or remove empty options.'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}