import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { QuestionTypeSelector, READING_QUESTION_TYPES } from '../components/QuestionTypeSelector';
import { 
  MultipleChoiceEditor, 
  TrueFalseEditor, 
  CompletionEditor, 
  DiagramLabelingEditor,
  ShortAnswerEditor 
} from '../components/ReadingQuestionEditors';
import { AdminMatchingEditor, MatchingQuestionData } from '../components/AdminMatchingEditor';
import { TableCompletionEditorIndexed } from '../components/TableCompletionEditorIndexed';
import { RichTextEditor } from '../components/RichTextEditor';

interface QuestionGroup {
  id: string;
  questionType: string;
  fromValue: number;
  toValue: number;
  data: any;
}

export function NewReadingQuestionPage() {
  const navigate = useNavigate();
  const { testId, passageType } = useParams<{ testId: string; passageType: string }>();
  
  const [title, setTitle] = useState('');
  const [passageText, setPassageText] = useState('');
  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]); // Manual control - NO auto-sync
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // REMOVED auto-sync useEffect - selectedTypes is now fully manual

  const getPassageTitle = () => {
    switch (passageType) {
      case 'passage1': return 'Passage 1';
      case 'passage2': return 'Passage 2';
      case 'passage3': return 'Passage 3';
      default: return 'Passage';
    }
  };

  const addQuestionGroup = (typeValue: string) => {
    const lastGroup = questionGroups[questionGroups.length - 1];
    const fromValue = lastGroup ? lastGroup.toValue + 1 : 1;

    const newGroup: QuestionGroup = {
      id: Date.now().toString(),
      questionType: typeValue,
      fromValue,
      toValue: fromValue + 3, // Default 4 questions
      data: {},
    };

    setQuestionGroups([...questionGroups, newGroup]);
    setExpandedGroups([...expandedGroups, newGroup.id]);
    // DO NOT remove from selectedTypes - keep it selected
  };

  const updateQuestionGroup = (id: string, updates: Partial<QuestionGroup>) => {
    setQuestionGroups(groups =>
      groups.map(g => g.id === id ? { ...g, ...updates } : g)
    );
  };

  const removeQuestionGroup = (id: string) => {
    setQuestionGroups(groups => groups.filter(g => g.id !== id));
    setExpandedGroups(expanded => expanded.filter(gId => gId !== id));
  };

  const toggleGroupExpand = (id: string) => {
    setExpandedGroups(expanded =>
      expanded.includes(id)
        ? expanded.filter(gId => gId !== id)
        : [...expanded, id]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      alert('Iltimos, passage sarlavhasini kiriting');
      return;
    }
    if (!passageText.trim()) {
      alert('Iltimos, passage matnini kiriting');
      return;
    }
    if (questionGroups.length === 0) {
      alert('Iltimos, kamida bitta savol guruhi qo\'shing');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: API call
      console.log('Submitting:', { title, passageText, questionGroups });
      
      alert('Muvaffaqiyatli saqlandi!');
      navigate(`/test/${testId}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Xatolik yuz berdi!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuestionTypeLabel = (type: string) => {
    return READING_QUESTION_TYPES.find(t => t.value === type)?.label || type;
  };

  const isMatchingType = (type: string) => {
    return ['matching_headings', 'matching_information', 'matching_sentence_endings', 'matching_features'].includes(type);
  };

  const renderQuestionEditor = (group: QuestionGroup) => {
    const type = group.questionType;

    if (isMatchingType(type)) {
      return (
        <AdminMatchingEditor
          initialData={group.data}
          questionType="matching"
          hideQuestionTypeSelector={true}
          onChange={(data) => updateQuestionGroup(group.id, { data })}
        />
      );
    }

    switch (type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceEditor
            data={group.data}
            onChange={(data) => updateQuestionGroup(group.id, { data })}
          />
        );
      
      case 'true_false_not_given':
      case 'yes_no_not_given':
        return (
          <TrueFalseEditor
            questionType={type as any}
            data={group.data}
            onChange={(data) => updateQuestionGroup(group.id, { data })}
          />
        );
      
      case 'sentence_completion':
      case 'summary_completion':
      case 'flow_chart_completion':
        return (
          <CompletionEditor
            questionType={type}
            data={group.data}
            onChange={(data) => updateQuestionGroup(group.id, { data })}
          />
        );
      
      case 'table_completion':
        return (
          <TableCompletionEditorIndexed
            initialData={group.data}
            onChange={(data) => updateQuestionGroup(group.id, { data })}
          />
        );
      
      case 'diagram_labeling':
        return (
          <DiagramLabelingEditor
            data={group.data}
            onChange={(data) => updateQuestionGroup(group.id, { data })}
          />
        );
      
      case 'short_answer':
        return (
          <ShortAnswerEditor
            data={group.data}
            onChange={(data) => updateQuestionGroup(group.id, { data })}
          />
        );
      
      default:
        return (
          <div className="p-8 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
            <p className="text-slate-600">
              {getQuestionTypeLabel(type)} editor hozircha mavjud emas
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/test/${testId}`)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Reading - {getPassageTitle()}</h1>
                <p className="text-slate-600">Test #{testId}</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>

        {/* Passage Info */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Passage Ma'lumotlari</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 mb-2 font-medium">
                Passage Sarlavhasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Masalan: The History of Timekeeping"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2 font-medium">
                Passage Matni <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={passageText}
                onChange={setPassageText}
                placeholder="Passage matnini kiriting..."
              />
            </div>
          </div>
        </div>

        {/* Question Type Selector */}
        <div className="mb-6">
          <QuestionTypeSelector
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
          />
          
          {/* Add buttons for selected types */}
          {selectedTypes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {selectedTypes.map(typeValue => {
                const typeInfo = READING_QUESTION_TYPES.find(t => t.value === typeValue);
                if (!typeInfo) return null;
                
                return (
                  <button
                    key={typeValue}
                    onClick={() => addQuestionGroup(typeValue)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#042d62] text-white rounded-xl hover:bg-[#053a75] transition-all font-medium shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    {typeInfo.label} Qo'shish
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Question Groups */}
        {questionGroups.length > 0 && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Savol Guruhlari ({questionGroups.length})</h2>
            
            {questionGroups.map((group, index) => (
              <div
                key={group.id}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
              >
                {/* Group Header */}
                <div className="bg-gradient-to-r from-[#042d62] to-[#053a75] p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {getQuestionTypeLabel(group.questionType)}
                        </h3>
                        <p className="text-blue-100">
                          Questions {group.fromValue} - {group.toValue}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleGroupExpand(group.id)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        {expandedGroups.includes(group.id) ? (
                          <ChevronUp className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronDown className="w-6 h-6 text-white" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bu guruhni o\'chirmoqchimisiz?')) {
                            removeQuestionGroup(group.id);
                          }
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Group Content */}
                {expandedGroups.includes(group.id) && (
                  <div className="p-8">
                    {/* Question Range */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-slate-700 mb-2 font-medium text-sm">
                          Savol Boshlanishi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={group.fromValue}
                          onChange={(e) => updateQuestionGroup(group.id, { fromValue: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 mb-2 font-medium text-sm">
                          Savol Tugashi <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={group.fromValue}
                          value={group.toValue}
                          onChange={(e) => updateQuestionGroup(group.id, { toValue: parseInt(e.target.value) || group.fromValue })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62] bg-white"
                        />
                      </div>
                    </div>

                    {/* Question Editor */}
                    {renderQuestionEditor(group)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {questionGroups.length === 0 && !selectedTypes.length && (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-slate-600 mb-4">Hali savol guruhlari yo'q</p>
            <p className="text-sm text-slate-500">Yuqoridan savol turini tanlab boshlang</p>
          </div>
        )}
      </div>
    </div>
  );
}