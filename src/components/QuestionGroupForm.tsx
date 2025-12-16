import { useState, useEffect } from 'react';
import { QuestionTypeSpecificFields } from './QuestionTypeSpecificFields';

interface QuestionGroup {
  id: string;
  questionRange: string;
  questionType: string;
  category: string;
  instructions: string;
  answerFormat: string;
  passage?: string;
  imageUrl?: string;
  tableData?: { headers: string[]; rows: string[][] };
  multipleChoiceOptions?: string[];
  matchingData?: { items: string[]; options: string[] };
  subQuestions: { number: string; text: string; answer: string | string[] }[];
}

interface QuestionGroupFormProps {
  selectedType: 'reading' | 'listening' | 'writing';
  selectedSection: string;
  group: QuestionGroup;
  onUpdate: (updatedGroup: Partial<QuestionGroup>) => void;
}

export function QuestionGroupForm({ selectedType, selectedSection, group, onUpdate }: QuestionGroupFormProps) {
  const [localGroup, setLocalGroup] = useState(group);

  useEffect(() => {
    setLocalGroup(group);
  }, [group]);

  const updateLocal = (updates: Partial<QuestionGroup>) => {
    const updated = { ...localGroup, ...updates };
    setLocalGroup(updated);
    onUpdate(updates);
  };

  // Question types based on type
  const questionTypesByType = {
    listening: [
      { value: 'form-completion', label: '1. Form Completion', description: 'Fill in missing information', needsTable: true },
      { value: 'note-completion', label: '2. Note Completion', description: 'Complete notes from a talk', needsPassage: true },
      { value: 'table-completion', label: '3. Table Completion', description: 'Fill in table cells', needsTable: true },
      { value: 'sentence-completion', label: '4. Sentence Completion', description: 'Complete sentences', needsPassage: true },
      { value: 'multiple-choice-one', label: '5. Multiple Choice (One answer)', description: 'Choose one correct answer', needsMultipleChoice: true },
      { value: 'multiple-choice-multiple', label: '6. Multiple Choice (Multiple answers)', description: 'Choose TWO or more answers', needsMultipleChoice: true },
      { value: 'matching', label: '7. Matching', description: 'Match items to categories', needsMatching: true },
      { value: 'map-labeling', label: '8. Map / Diagram Labelling', description: 'Label areas on a map', needsImage: true, needsTable: true },
      { value: 'flowchart-completion', label: '9. Flow-chart Completion', description: 'Complete a process diagram', needsImage: true, needsPassage: true },
      { value: 'summary-completion', label: '10. Summary Completion', description: 'Fill in summary blanks', needsPassage: true },
      { value: 'pick-from-list', label: '11. Pick from a List', description: 'Choose items from a list', needsMultipleChoice: true },
    ],
    reading: [
      { value: 'multiple-choice', label: '1. Multiple Choice', description: 'Choose correct answer', needsMultipleChoice: true },
      { value: 'true-false-not-given', label: '2. True / False / Not Given', description: 'Factual information', needsPassage: true },
      { value: 'yes-no-not-given', label: '3. Yes / No / Not Given', description: 'Writer\'s views', needsPassage: true },
      { value: 'matching-headings', label: '4. Matching Headings', description: 'Match headings to paragraphs', needsMatching: true },
      { value: 'matching-information', label: '5. Matching Information', description: 'Find information in paragraphs', needsPassage: true },
      { value: 'matching-sentence-endings', label: '6. Matching Sentence Endings', description: 'Complete sentences with endings', needsMatching: true },
      { value: 'matching-features', label: '7. Matching Features', description: 'Match items to categories', needsMatching: true },
      { value: 'sentence-completion', label: '8. Sentence Completion', description: 'Complete sentences', needsPassage: true },
      { value: 'summary-completion', label: '9. Summary Completion', description: 'Fill in summary', needsPassage: true },
      { value: 'table-completion', label: '10. Table Completion', description: 'Complete table', needsTable: true },
      { value: 'flowchart-completion', label: '11. Flow-chart Completion', description: 'Complete flowchart', needsImage: true, needsTable: true },
      { value: 'diagram-labeling', label: '12. Diagram Labelling', description: 'Label diagram parts', needsImage: true, needsTable: true },
      { value: 'short-answer', label: '13. Short Answer Questions', description: 'Answer in 3 words max', needsPassage: true },
    ],
    writing: [
      { value: 'task-1-academic', label: 'Task 1 (Academic)', description: 'Describe graph/chart/diagram', needsImage: true },
      { value: 'task-1-general', label: 'Task 1 (General)', description: 'Write a letter', needsPassage: true },
      { value: 'task-2', label: 'Task 2 (Essay)', description: 'Write an essay', needsPassage: true },
    ],
  };

  const currentQuestionTypes = questionTypesByType[selectedType];
  const selectedQuestionTypeDetails = currentQuestionTypes.find(qt => qt.value === localGroup.questionType);

  const handleQuestionTypeChange = (value: string, label: string) => {
    const updates: Partial<QuestionGroup> = {
      questionType: value,
      category: label,
      // Initialize default data structures
      tableData: { headers: [''], rows: [['']] },
      multipleChoiceOptions: ['', '', '', ''],
      matchingData: { items: ['', ''], options: ['', '', ''] },
      subQuestions: localGroup.subQuestions.length > 0 ? localGroup.subQuestions : [{ number: '1', text: '', answer: '' }],
    };
    updateLocal(updates);
  };

  return (
    <div className="space-y-4">
      {/* Question Range */}
      <div>
        <label className="block text-slate-700 mb-2">
          Savol Raqamlari <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={localGroup.questionRange}
          onChange={(e) => updateLocal({ questionRange: e.target.value })}
          placeholder="Masalan: 1-7, 8-10"
          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50"
          required
        />
      </div>

      {/* Question Type Selection */}
      <div>
        <label className="block text-slate-700 mb-3">
          Savol Turi <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQuestionTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleQuestionTypeChange(type.value, type.label)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                localGroup.questionType === type.value
                  ? 'border-[#042d62] bg-blue-50 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-900 mb-0.5">{type.label}</p>
                  <p className="text-xs text-slate-600">{type.description}</p>
                </div>
                {localGroup.questionType === type.value && (
                  <div className="w-5 h-5 bg-[#042d62] rounded-full flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {localGroup.questionType && selectedQuestionTypeDetails && (
        <>
          {/* Instructions */}
          <div>
            <label className="block text-slate-700 mb-2">
              Ko&apos;rsatmalar
            </label>
            <textarea
              value={localGroup.instructions}
              onChange={(e) => updateLocal({ instructions: e.target.value })}
              placeholder="Complete the form. Write ONE WORD AND/OR A NUMBER for each answer."
              rows={2}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Answer Format */}
          <div>
            <label className="block text-slate-700 mb-2">
              Javob Formati
            </label>
            <input
              type="text"
              value={localGroup.answerFormat}
              onChange={(e) => updateLocal({ answerFormat: e.target.value })}
              placeholder="ONE WORD ONLY, TWO LETTERS, A NUMBER"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Question Type Specific Fields */}
          <QuestionTypeSpecificFields
            questionType={selectedQuestionTypeDetails}
            passage={localGroup.passage || ''}
            onPassageChange={(value) => updateLocal({ passage: value })}
            imageUrl={localGroup.imageUrl || ''}
            onImageChange={(value) => updateLocal({ imageUrl: value })}
            tableData={localGroup.tableData || { headers: [''], rows: [['']] }}
            onTableDataChange={(data) => updateLocal({ tableData: data })}
            multipleChoiceOptions={localGroup.multipleChoiceOptions || ['', '', '', '']}
            onMultipleChoiceOptionsChange={(options) => updateLocal({ multipleChoiceOptions: options })}
            matchingData={localGroup.matchingData || { items: ['', ''], options: ['', '', ''] }}
            onMatchingDataChange={(data) => updateLocal({ matchingData: data })}
            subQuestions={localGroup.subQuestions}
            onSubQuestionsChange={(questions) => updateLocal({ subQuestions: questions })}
          />
        </>
      )}
    </div>
  );
}