import { Plus, Trash2 } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { DynamicTable } from './DynamicTable';

interface QuestionTypeDetails {
  value: string;
  label: string;
  description: string;
  needsTable?: boolean;
  needsPassage?: boolean;
  needsImage?: boolean;
  needsMultipleChoice?: boolean;
  needsMatching?: boolean;
  needsQuestions?: boolean;
}

interface QuestionTypeSpecificFieldsProps {
  questionType: QuestionTypeDetails;
  passage: string;
  onPassageChange: (value: string) => void;
  imageUrl: string;
  onImageChange: (value: string) => void;
  tableData: { headers: string[]; rows: string[][] };
  onTableDataChange: (data: { headers: string[]; rows: string[][] }) => void;
  multipleChoiceOptions: string[];
  onMultipleChoiceOptionsChange: (options: string[]) => void;
  matchingData: { items: string[]; options: string[] };
  onMatchingDataChange: (data: { items: string[]; options: string[] }) => void;
  subQuestions: { number: string; text: string; answer: string | string[] }[];
  onSubQuestionsChange: (questions: { number: string; text: string; answer: string | string[] }[]) => void;
}

export function QuestionTypeSpecificFields({
  questionType,
  passage,
  onPassageChange,
  imageUrl,
  onImageChange,
  tableData,
  onTableDataChange,
  multipleChoiceOptions,
  onMultipleChoiceOptionsChange,
  matchingData,
  onMatchingDataChange,
  subQuestions,
  onSubQuestionsChange,
}: QuestionTypeSpecificFieldsProps) {
  
  const addSubQuestion = () => {
    const lastNumber = subQuestions.length > 0 ? parseInt(subQuestions[subQuestions.length - 1].number || '0') : 0;
    onSubQuestionsChange([...subQuestions, { number: (lastNumber + 1).toString(), text: '', answer: '' }]);
  };

  const removeSubQuestion = (index: number) => {
    onSubQuestionsChange(subQuestions.filter((_, i) => i !== index));
  };

  const updateSubQuestion = (index: number, field: 'number' | 'text' | 'answer', value: string | string[]) => {
    const updated = [...subQuestions];
    updated[index][field] = value as any;
    onSubQuestionsChange(updated);
  };

  const addMultipleChoiceOption = () => {
    onMultipleChoiceOptionsChange([...multipleChoiceOptions, '']);
  };

  const removeMultipleChoiceOption = (index: number) => {
    onMultipleChoiceOptionsChange(multipleChoiceOptions.filter((_, i) => i !== index));
  };

  const updateMultipleChoiceOption = (index: number, value: string) => {
    const updated = [...multipleChoiceOptions];
    updated[index] = value;
    onMultipleChoiceOptionsChange(updated);
  };

  const addMatchingItem = () => {
    onMatchingDataChange({
      ...matchingData,
      items: [...matchingData.items, ''],
    });
  };

  const addMatchingOption = () => {
    onMatchingDataChange({
      ...matchingData,
      options: [...matchingData.options, ''],
    });
  };

  const updateMatchingItem = (index: number, value: string) => {
    const items = [...matchingData.items];
    items[index] = value;
    onMatchingDataChange({ ...matchingData, items });
  };

  const updateMatchingOption = (index: number, value: string) => {
    const options = [...matchingData.options];
    options[index] = value;
    onMatchingDataChange({ ...matchingData, options });
  };

  const removeMatchingItem = (index: number) => {
    onMatchingDataChange({
      ...matchingData,
      items: matchingData.items.filter((_, i) => i !== index),
    });
  };

  const removeMatchingOption = (index: number) => {
    onMatchingDataChange({
      ...matchingData,
      options: matchingData.options.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Passage/Context */}
      {questionType.needsPassage && (
        <div>
          <label className="block text-slate-700 mb-2">
            Passage yoki Kontekst Matni <span className="text-red-500">*</span>
          </label>
          <div className="mb-3 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 mb-1">
              💡 <strong>Blank qo&apos;shish:</strong>
            </p>
            <p className="text-sm text-blue-700">
              • Javob bo&apos;sh joyi uchun: <code className="bg-blue-100 px-2 py-0.5 rounded">(1) ____</code> yoki <code className="bg-blue-100 px-2 py-0.5 rounded">____</code>
            </p>
            <p className="text-sm text-blue-700">
              • Matn ichida raqamlarni qo&apos;ying: (28) ____, (29) ____, (30) ____
            </p>
          </div>
          <textarea
            value={passage}
            onChange={(e) => onPassageChange(e.target.value)}
            placeholder={`Masalan:\n\nMost universities have more women than men.\n\nPossible reasons for the differences:\nThere are fewer male than female (28) ____, so there's a lack of role models.\nThere is no proof that this benefits women in a (29) ____ way.\nSchools have moved away from using (30) ____ for assessment.`}
            rows={12}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent resize-none font-mono text-sm bg-slate-50"
            required
          />
        </div>
      )}

      {/* Image/Map/Diagram */}
      {questionType.needsImage && (
        <div>
          <label className="block text-slate-700 mb-3">
            Rasm/Xarita/Diagram <span className="text-red-500">*</span>
          </label>
          <ImageUploader
            imageUrl={imageUrl}
            onImageChange={onImageChange}
          />
        </div>
      )}

      {/* Table */}
      {questionType.needsTable && (
        <DynamicTable
          tableData={tableData}
          onChange={onTableDataChange}
        />
      )}

      {/* Multiple Choice Options */}
      {questionType.needsMultipleChoice && (
        <div className="border-2 border-slate-300 rounded-xl p-5 bg-slate-50">
          <div className="flex items-center justify-between mb-4">
            <label className="text-slate-700">
              Variantlar (Multiple Choice) <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addMultipleChoiceOption}
              className="flex items-center gap-1 px-4 py-2 text-sm bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Variant qo&apos;shish
            </button>
          </div>
          <div className="space-y-2">
            {multipleChoiceOptions.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <span className="w-8 text-center text-slate-600">{String.fromCharCode(65 + index)})</span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateMultipleChoiceOption(index, e.target.value)}
                  placeholder={`Variant ${String.fromCharCode(65 + index)}`}
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white"
                  required
                />
                {multipleChoiceOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeMultipleChoiceOption(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-2">
            To&apos;g&apos;ri javobni quyidagi &quot;Savollar va Javoblar&quot; bo&apos;limida belgilang
          </p>
        </div>
      )}

      {/* Matching */}
      {questionType.needsMatching && (
        <div className="border border-slate-300 rounded-lg p-4">
          <label className="block text-slate-700 mb-3">
            Matching (Moslashtirish) <span className="text-red-500">*</span>
          </label>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Items to match (left side) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Elementlar (chap tomon):</p>
                <button
                  type="button"
                  onClick={addMatchingItem}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  + Element
                </button>
              </div>
              <div className="space-y-2">
                {matchingData.items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="w-8 text-center text-slate-600">{index + 1}.</span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateMatchingItem(index, e.target.value)}
                      placeholder={`Element ${index + 1}`}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    {matchingData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMatchingItem(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Options to match with (right side) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Variantlar (o&apos;ng tomon):</p>
                <button
                  type="button"
                  onClick={addMatchingOption}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  + Variant
                </button>
              </div>
              <div className="space-y-2">
                {matchingData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="w-8 text-center text-slate-600">{String.fromCharCode(65 + index)}</span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateMatchingOption(index, e.target.value)}
                      placeholder={`Variant ${String.fromCharCode(65 + index)}`}
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                    {matchingData.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMatchingOption(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 mt-3">
            To&apos;g&apos;ri javoblarni quyidagi &quot;Savollar va Javoblar&quot; bo&apos;limida kiriting (masalan: A, B, C)
          </p>
        </div>
      )}

      {/* Sub Questions and Answers */}
      <div className="border border-slate-300 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-slate-700">
            Savollar va Javoblar <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addSubQuestion}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
          >
            <Plus className="w-4 h-4" />
            Savol qo&apos;shish
          </button>
        </div>

        {questionType.needsMultipleChoice && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-900">
              💡 <strong>Multiple Choice javoblari:</strong> Har bir savol uchun to&apos;g&apos;ri variant harfini kiriting (A, B, C yoki D)
            </p>
            {questionType.value.includes('multiple') && (
              <p className="text-sm text-yellow-900 mt-1">
                Multiple answers uchun: vergul bilan ajrating (masalan: A, C)
              </p>
            )}
          </div>
        )}

        {questionType.needsMatching && (
          <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm text-purple-900">
              💡 <strong>Matching javoblari:</strong> Har bir element uchun to&apos;g&apos;ri variant harfini kiriting
            </p>
            <p className="text-sm text-purple-700 mt-1">
              Masalan: 1 → A, 2 → C, 3 → B
            </p>
          </div>
        )}

        <div className="space-y-3">
          {subQuestions.map((sq, index) => (
            <div key={index} className="flex gap-3 items-start bg-slate-50 p-3 rounded-lg">
              <input
                type="text"
                value={sq.number}
                onChange={(e) => updateSubQuestion(index, 'number', e.target.value)}
                placeholder="#"
                className="w-16 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <input
                type="text"
                value={sq.text}
                onChange={(e) => updateSubQuestion(index, 'text', e.target.value)}
                placeholder="Savol matni (ixtiyoriy, agar passage'da bo'lsa)"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <input
                type="text"
                value={sq.answer as string}
                onChange={(e) => updateSubQuestion(index, 'answer', e.target.value)}
                placeholder={questionType.needsMultipleChoice || questionType.needsMatching ? 'A, B, C...' : "To'g'ri javob"}
                className="w-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                required
              />
              {subQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubQuestion(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}