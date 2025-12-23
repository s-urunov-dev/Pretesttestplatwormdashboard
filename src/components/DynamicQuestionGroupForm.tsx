import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Copy, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'roman';

interface QuestionInput {
  id: string;
  value: string;
}

interface OptionInput {
  id: string;
  value: string;
}

interface QuestionGroup {
  id: string;
  question_type: string;
  from_value: number;
  to_value: number;
  instruction: string;
  questions: string[];
  options: string[];
  variant_type: VariantType;
  correct_answers_count: number;
}

interface DynamicQuestionGroupFormProps {
  questionTypeName?: string;
}

export function DynamicQuestionGroupForm({ questionTypeName = 'Matching' }: DynamicQuestionGroupFormProps) {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // Internal state for managing UI inputs (with IDs for React keys)
  const [questionsById, setQuestionsById] = useState<Record<string, QuestionInput[]>>({});
  const [optionsById, setOptionsById] = useState<Record<string, OptionInput[]>>({});

  // Helper functions
  const getVariantLabel = (index: number, type: VariantType): string => {
    switch (type) {
      case 'letter':
        return String.fromCharCode(65 + index); // A, B, C...
      case 'number':
        return (index + 1).toString(); // 1, 2, 3...
      case 'roman':
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
        return romanNumerals[index] || (index + 1).toString();
      default:
        return (index + 1).toString();
    }
  };

  const addGroup = () => {
    const lastGroup = groups[groups.length - 1];
    const fromValue = lastGroup ? lastGroup.to_value + 1 : 1;

    const newGroup: QuestionGroup = {
      id: `group-${Date.now()}`,
      question_type: questionTypeName,
      from_value: fromValue,
      to_value: fromValue,
      instruction: '',
      questions: [],
      options: [],
      variant_type: 'letter',
      correct_answers_count: 1,
    };

    setGroups([...groups, newGroup]);
    setQuestionsById({ ...questionsById, [newGroup.id]: [] });
    setOptionsById({ ...optionsById, [newGroup.id]: [] });
    setExpandedGroups([...expandedGroups, newGroup.id]);
  };

  const duplicateGroup = (groupId: string) => {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return;

    const groupToDuplicate = groups[groupIndex];
    const lastGroup = groups[groups.length - 1];
    const fromValue = lastGroup.to_value + 1;

    const newGroup: QuestionGroup = {
      ...groupToDuplicate,
      id: `group-${Date.now()}`,
      from_value: fromValue,
      to_value: fromValue + (groupToDuplicate.to_value - groupToDuplicate.from_value),
    };

    // Copy questions and options inputs
    const oldQuestions = questionsById[groupId] || [];
    const oldOptions = optionsById[groupId] || [];
    
    setQuestionsById({
      ...questionsById,
      [newGroup.id]: oldQuestions.map(q => ({ id: `q-${Date.now()}-${Math.random()}`, value: q.value }))
    });
    
    setOptionsById({
      ...optionsById,
      [newGroup.id]: oldOptions.map(o => ({ id: `o-${Date.now()}-${Math.random()}`, value: o.value }))
    });

    setGroups([...groups, newGroup]);
    setExpandedGroups([...expandedGroups, newGroup.id]);
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setExpandedGroups(expandedGroups.filter(id => id !== groupId));
    
    const newQuestionsById = { ...questionsById };
    delete newQuestionsById[groupId];
    setQuestionsById(newQuestionsById);
    
    const newOptionsById = { ...optionsById };
    delete newOptionsById[groupId];
    setOptionsById(newOptionsById);
  };

  const updateGroup = (groupId: string, updates: Partial<QuestionGroup>) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const toggleExpanded = (groupId: string) => {
    if (expandedGroups.includes(groupId)) {
      setExpandedGroups(expandedGroups.filter(id => id !== groupId));
    } else {
      setExpandedGroups([...expandedGroups, groupId]);
    }
  };

  // Questions management
  const addQuestion = (groupId: string) => {
    const newQuestion = { id: `q-${Date.now()}`, value: '' };
    const current = questionsById[groupId] || [];
    setQuestionsById({
      ...questionsById,
      [groupId]: [...current, newQuestion]
    });
  };

  const updateQuestion = (groupId: string, questionId: string, value: string) => {
    const current = questionsById[groupId] || [];
    setQuestionsById({
      ...questionsById,
      [groupId]: current.map(q => q.id === questionId ? { ...q, value } : q)
    });
    
    // Update backend array
    const questions = current
      .map(q => q.id === questionId ? value : q.value)
      .filter(v => v.trim().length > 0);
    updateGroup(groupId, { questions });
  };

  const removeQuestion = (groupId: string, questionId: string) => {
    const current = questionsById[groupId] || [];
    const updated = current.filter(q => q.id !== questionId);
    setQuestionsById({
      ...questionsById,
      [groupId]: updated
    });
    
    // Update backend array
    const questions = updated.map(q => q.value).filter(v => v.trim().length > 0);
    updateGroup(groupId, { questions });
  };

  // Options management
  const addOption = (groupId: string) => {
    const newOption = { id: `o-${Date.now()}`, value: '' };
    const current = optionsById[groupId] || [];
    setOptionsById({
      ...optionsById,
      [groupId]: [...current, newOption]
    });
  };

  const updateOption = (groupId: string, optionId: string, value: string) => {
    const current = optionsById[groupId] || [];
    setOptionsById({
      ...optionsById,
      [groupId]: current.map(o => o.id === optionId ? { ...o, value } : o)
    });
    
    // Update backend array
    const options = current
      .map(o => o.id === optionId ? value : o.value)
      .filter(v => v.trim().length > 0);
    updateGroup(groupId, { options });
  };

  const removeOption = (groupId: string, optionId: string) => {
    const current = optionsById[groupId] || [];
    const updated = current.filter(o => o.id !== optionId);
    setOptionsById({
      ...optionsById,
      [groupId]: updated
    });
    
    // Update backend array
    const options = updated.map(o => o.value).filter(v => v.trim().length > 0);
    updateGroup(groupId, { options });
  };

  const validateGroup = (group: QuestionGroup) => {
    const errors: string[] = [];
    
    if (group.from_value <= 0 || group.to_value <= 0) {
      errors.push('Dan va Gacha qiymatlari 0 dan katta bo\'lishi kerak');
    }
    if (group.to_value < group.from_value) {
      errors.push('Gacha qiymati Dan qiymatidan katta yoki teng bo\'lishi kerak');
    }
    if (group.questions.length === 0) {
      errors.push('Kamida bitta savol kiriting');
    }
    if (group.options.length === 0) {
      errors.push('Kamida bitta variant kiriting');
    }
    if (group.correct_answers_count > group.questions.length) {
      errors.push('Javoblar soni savollar sonidan oshmasligi kerak');
    }
    if (group.correct_answers_count <= 0) {
      errors.push('Javoblar soni 0 dan katta bo\'lishi kerak');
    }

    return errors;
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-slate-900">Savol Guruhlari</h3>
          <p className="text-sm text-slate-500 mt-1">
            {groups.length > 0 
              ? `${groups.length} ta guruh qo'shilgan` 
              : 'Hali guruhlar yo\'q - pastdagi tugma orqali qo\'shing'}
          </p>
        </div>
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#042d62] text-white rounded-lg hover:bg-[#053a75] transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Guruh Qo'shish</span>
        </button>
      </div>

      {/* Question Groups List */}
      {groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group, index) => {
            const isExpanded = expandedGroups.includes(group.id);
            const validationErrors = validateGroup(group);
            const hasErrors = validationErrors.length > 0;
            const questionsCount = group.questions.length;
            const optionsCount = group.options.length;
            const questions = questionsById[group.id] || [];
            const options = optionsById[group.id] || [];

            return (
              <div
                key={group.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  isExpanded 
                    ? 'border-blue-200 shadow-md' 
                    : hasErrors 
                      ? 'border-red-200 hover:border-red-300' 
                      : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Group Header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => toggleExpanded(group.id)}
                >
                  <button
                    type="button"
                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-900">
                        <strong>Guruh {index + 1}</strong>
                      </span>

                      {/* Range Badge */}
                      {group.from_value > 0 && group.to_value > 0 && (
                        <span className="px-2.5 py-1 bg-[#042d62] text-white text-xs rounded-md">
                          Q{group.from_value}-{group.to_value}
                        </span>
                      )}

                      {/* Question Type Badge */}
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        {group.question_type}
                      </span>

                      {/* Questions Count Badge */}
                      {questionsCount > 0 && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                          {questionsCount} savol
                        </span>
                      )}

                      {/* Options Count Badge */}
                      {optionsCount > 0 && (
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                          {optionsCount} variant
                        </span>
                      )}

                      {/* Validation Status */}
                      {!isExpanded && (
                        hasErrors ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateGroup(group.id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Nusxa olish"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Bu guruhni o\'chirmoqchimisiz?')) {
                          removeGroup(group.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Group Content - Collapsible */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-6">
                    {/* Validation Errors */}
                    {hasErrors && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-red-900 mb-1">
                              <strong>To'ldirilmagan maydonlar:</strong>
                            </p>
                            <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                              {validationErrors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Range Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">
                          Dan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={group.from_value}
                          onChange={(e) => updateGroup(group.id, { 
                            from_value: parseInt(e.target.value) || 0 
                          })}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-700 mb-2">
                          Gacha <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={group.to_value}
                          onChange={(e) => updateGroup(group.id, { 
                            to_value: parseInt(e.target.value) || 0 
                          })}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min={group.from_value}
                        />
                      </div>
                    </div>

                    {/* Instruction Input */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Savol sarlavhasi
                      </label>
                      <input
                        type="text"
                        value={group.instruction}
                        onChange={(e) => updateGroup(group.id, { instruction: e.target.value })}
                        placeholder="Masalan: Match each heading with the correct paragraph"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Bu matn savollar ustida ko'rsatiladi
                      </p>
                    </div>

                    {/* DYNAMIC QUESTIONS - Individual Inputs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm text-slate-700">
                          Savollar <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {questionsCount} ta
                        </span>
                      </div>

                      <div className="space-y-2">
                        {questions.map((question, idx) => (
                          <div 
                            key={question.id}
                            className="flex items-center gap-2 group animate-fadeIn"
                          >
                            <span className="text-xs text-slate-500 w-6">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={question.value}
                              onChange={(e) => updateQuestion(group.id, question.id, e.target.value)}
                              placeholder={`Savol ${idx + 1}`}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeQuestion(group.id, question.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="O'chirish"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addQuestion(group.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors w-full border border-dashed border-green-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Savol qo'shish</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Har bir savol alohida input. "+ Savol qo'shish" tugmasi bilan yangi savol qo'shing.
                      </p>
                    </div>

                    {/* Variant Type Selector */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Variant turi <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={group.variant_type}
                        onChange={(e) => updateGroup(group.id, { 
                          variant_type: e.target.value as VariantType 
                        })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="letter">Alfibo (A, B, C, D...)</option>
                        <option value="number">Raqam (1, 2, 3...)</option>
                        <option value="roman">Rim (I, II, III...)</option>
                      </select>
                      <p className="text-xs text-slate-500 mt-1.5">
                        Variantlar oldida qanday belgi ko'rsatilishini tanlang
                      </p>
                    </div>

                    {/* DYNAMIC OPTIONS - Individual Inputs */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm text-slate-700">
                          Variantlar <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {optionsCount} ta
                        </span>
                      </div>

                      <div className="space-y-2">
                        {options.map((option, idx) => {
                          const label = getVariantLabel(idx, group.variant_type);
                          return (
                            <div 
                              key={option.id}
                              className="flex items-center gap-2 group animate-fadeIn"
                            >
                              <span className="text-sm font-semibold text-purple-600 w-8">
                                {label}.
                              </span>
                              <input
                                type="text"
                                value={option.value}
                                onChange={(e) => updateOption(group.id, option.id, e.target.value)}
                                placeholder={`Variant ${label}`}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(group.id, option.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="O'chirish"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => addOption(group.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors w-full border border-dashed border-purple-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Variant qo'shish</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Har bir variant alohida input. Belgi avtomatik qo'shiladi.
                      </p>
                    </div>

                    {/* Correct Answers Count */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Javoblar soni <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={group.correct_answers_count}
                        onChange={(e) => updateGroup(group.id, { 
                          correct_answers_count: parseInt(e.target.value) || 1 
                        })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max={questionsCount}
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Har bir savol uchun nechta to'g'ri javob bo'lishi mumkin (maksimal: {questionsCount || 0})
                      </p>
                    </div>

                    {/* Group Statistics */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl text-green-600">{questionsCount}</div>
                        <div className="text-xs text-green-800 mt-1">Savollar</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl text-purple-600">{optionsCount}</div>
                        <div className="text-xs text-purple-800 mt-1">Variantlar</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl text-blue-600">
                          {group.to_value - group.from_value + 1}
                        </div>
                        <div className="text-xs text-blue-800 mt-1">Savol raqamlari</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-200 rounded-full mb-4">
            <Plus className="w-8 h-8 text-slate-500" />
          </div>
          <p className="text-slate-600 mb-2">Hali savol guruhlari yo'q</p>
          <p className="text-sm text-slate-500">
            Yuqoridagi "Guruh Qo'shish" tugmasini bosing
          </p>
        </div>
      )}

      {/* Save Button (Fixed at Bottom Right) */}
      {groups.length > 0 && (
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              console.log('Saving groups:', groups);
              alert('Guruhlar saqlandi! (Console\'ga qarang)');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#042d62] to-[#0369a1] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Saqlash</span>
          </button>
        </div>
      )}
    </div>
  );
}
