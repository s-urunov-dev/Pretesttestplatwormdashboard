import React from 'react';
import { AlertCircle } from 'lucide-react';

export const READING_QUESTION_TYPES = [
  { id: 1, value: 'multiple_choice', label: 'Multiple Choice', tooltip: 'Choose correct answer' },
  { id: 2, value: 'true_false_not_given', label: 'True / False / Not Given', tooltip: 'Identify true, false, or not given statements' },
  { id: 3, value: 'yes_no_not_given', label: 'Yes / No / Not Given', tooltip: 'Determine yes, no, or not given' },
  { id: 4, value: 'matching_headings', label: 'Matching Headings', tooltip: 'Match headings to paragraphs' },
  { id: 5, value: 'matching_information', label: 'Matching Information', tooltip: 'Match information to paragraphs' },
  { id: 6, value: 'matching_sentence_endings', label: 'Matching Sentence Endings', tooltip: 'Complete sentences with correct endings' },
  { id: 7, value: 'matching_features', label: 'Matching Features', tooltip: 'Match features to categories' },
  { id: 8, value: 'sentence_completion', label: 'Sentence Completion', tooltip: 'Complete sentences with correct words' },
  { id: 9, value: 'summary_completion', label: 'Summary Completion', tooltip: 'Fill in blanks in summary' },
  { id: 10, value: 'table_completion', label: 'Table Completion', tooltip: 'Complete table with correct information' },
  { id: 11, value: 'flow_chart_completion', label: 'Flow-chart Completion', tooltip: 'Complete flow-chart with correct steps' },
  { id: 12, value: 'diagram_labeling', label: 'Diagram Labeling', tooltip: 'Label diagram parts correctly' },
  { id: 13, value: 'short_answer', label: 'Short Answer Questions', tooltip: 'Answer questions with short responses' },
];

interface QuestionTypeSelectorProps {
  selectedTypes: string[];
  onTypesChange: (types: string[]) => void;
}

export function QuestionTypeSelector({ selectedTypes, onTypesChange }: QuestionTypeSelectorProps) {
  const selectedType = selectedTypes[0] || null;

  const handleTypeClick = (typeValue: string) => {
    if (selectedType === typeValue) {
      // Clicking the same button deselects it
      onTypesChange([]);
    } else {
      // Select the new one (replaces previous selection)
      onTypesChange([typeValue]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Savol Turini Tanlang
        </h2>
        {selectedType && (
          <button
            type="button"
            onClick={() => onTypesChange([])}
            className="text-sm text-[#5B68DF] hover:text-[#042d62] font-medium transition-colors"
          >
            Hammasini yopish
          </button>
        )}
      </div>

      {/* Info Hint Box */}
      <div className="flex items-start gap-3 p-3 bg-[#E8F4FD] border border-[#B8DFFB] rounded-lg mb-6">
        <div className="mt-0.5">
          <span className="text-lg">💡</span>
        </div>
        <p className="text-sm text-[#1E3A8A] leading-relaxed">
          <strong className="font-semibold">Maslahat:</strong> Bir xil savol turini bir necha marta qo'shishingiz mumkin. Har bir guruh mustaqil.
        </p>
      </div>

      {/* Question Type Pills Grid */}
      <div className="flex flex-wrap gap-3">
        {READING_QUESTION_TYPES.map((type) => {
          const isSelected = selectedType === type.value;
          
          return (
            <div key={type.id} className="relative group">
              <button
                type="button"
                onClick={() => handleTypeClick(type.value)}
                className={`
                  relative px-4 py-2.5 rounded-full text-sm font-medium 
                  transition-all duration-200 ease-out
                  border-2
                  ${isSelected
                    ? 'bg-[#1E293B] text-white border-[#1E293B]'
                    : 'bg-white text-[#5B68DF] border-[#5B68DF] hover:bg-[#F8F9FF]'
                  }
                `}
              >
                <span className="whitespace-nowrap">
                  {type.id}. {type.label}
                </span>
              </button>

              {/* Tooltip on Hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                {type.tooltip}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-slate-900"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
