import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus, X, AlertCircle, CheckCircle2 } from 'lucide-react';

type VariantType = 'letter' | 'number' | 'romain';

interface OptionItem {
  id: string;
  value: string;
}

interface MatchingItem {
  title: string;
  statement: string[];
  option: Record<string, string>[];
  variant_type: VariantType;
  answer_count: number;
}

interface QuestionGroup {
  id: string;
  question_type: string;
  from_value: number;
  to_value: number;
  matching_item: MatchingItem;
}

interface DynamicMatchingGroupFormProps {
  questionTypeName?: string;
  onSave?: (groups: QuestionGroup[]) => void;
}

export function DynamicMatchingGroupForm({ 
  questionTypeName = 'Matching Headings',
  onSave 
}: DynamicMatchingGroupFormProps) {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  
  // Internal state for managing UI inputs (with IDs for React keys)
  const [statementsById, setStatementsById] = useState<Record<string, { id: string; value: string }[]>>({});
  const [optionsById, setOptionsById] = useState<Record<string, OptionItem[]>>({});

  // Helper: Generate variant label
  const getVariantLabel = (index: number, type: VariantType): string => {
    switch (type) {
      case 'letter':
        return String.fromCharCode(65 + index); // A, B, C...
      case 'number':
        return (index + 1).toString(); // 1, 2, 3...
      case 'romain':
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
        return romanNumerals[index] || (index + 1).toString();
      default:
        return (index + 1).toString();
    }
  };

  // Helper: Convert options array to backend format
  const convertOptionsToBackend = (options: OptionItem[], variantType: VariantType): Record<string, string>[] => {
    return options.map((opt, idx) => {
      const key = getVariantLabel(idx, variantType);
      return { [key]: opt.value };
    });
  };

  // Add new group
  const addGroup = () => {
    const lastGroup = groups[groups.length - 1];
    const fromValue = lastGroup ? lastGroup.to_value + 1 : 1;

    const newGroup: QuestionGroup = {
      id: `group-${Date.now()}`,
      question_type: questionTypeName,
      from_value: fromValue,
      to_value: fromValue,
      matching_item: {
        title: '',
        statement: [],
        option: [],
        variant_type: 'letter',
        answer_count: 1,
      },
    };

    setGroups([...groups, newGroup]);
    setStatementsById({ ...statementsById, [newGroup.id]: [] });
    setOptionsById({ ...optionsById, [newGroup.id]: [] });
    setExpandedGroups([...expandedGroups, newGroup.id]);
  };

  // Remove group
  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    setExpandedGroups(expandedGroups.filter(id => id !== groupId));
    
    const newStatementsById = { ...statementsById };
    delete newStatementsById[groupId];
    setStatementsById(newStatementsById);
    
    const newOptionsById = { ...optionsById };
    delete newOptionsById[groupId];
    setOptionsById(newOptionsById);
  };

  // Toggle expanded
  const toggleExpanded = (groupId: string) => {
    if (expandedGroups.includes(groupId)) {
      setExpandedGroups(expandedGroups.filter(id => id !== groupId));
    } else {
      setExpandedGroups([...expandedGroups, groupId]);
    }
  };

  // Update group field
  const updateGroup = (groupId: string, updates: Partial<QuestionGroup>) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  // Update matching item
  const updateMatchingItem = (groupId: string, updates: Partial<MatchingItem>) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, matching_item: { ...g.matching_item, ...updates } }
        : g
    ));
  };

  // Statements management
  const addStatement = (groupId: string) => {
    const newStatement = { id: `stmt-${Date.now()}`, value: '' };
    const current = statementsById[groupId] || [];
    setStatementsById({
      ...statementsById,
      [groupId]: [...current, newStatement]
    });
  };

  const updateStatement = (groupId: string, stmtId: string, value: string) => {
    const current = statementsById[groupId] || [];
    setStatementsById({
      ...statementsById,
      [groupId]: current.map(s => s.id === stmtId ? { ...s, value } : s)
    });
    
    // Update backend array
    const statements = current
      .map(s => s.id === stmtId ? value : s.value)
      .filter(v => v.trim().length > 0);
    updateMatchingItem(groupId, { statement: statements });
  };

  const removeStatement = (groupId: string, stmtId: string) => {
    const current = statementsById[groupId] || [];
    const updated = current.filter(s => s.id !== stmtId);
    setStatementsById({
      ...statementsById,
      [groupId]: updated
    });
    
    // Update backend array
    const statements = updated.map(s => s.value).filter(v => v.trim().length > 0);
    updateMatchingItem(groupId, { statement: statements });
  };

  // Options management
  const addOption = (groupId: string) => {
    const newOption = { id: `opt-${Date.now()}`, value: '' };
    const current = optionsById[groupId] || [];
    setOptionsById({
      ...optionsById,
      [groupId]: [...current, newOption]
    });
  };

  const updateOption = (groupId: string, optId: string, value: string) => {
    const current = optionsById[groupId] || [];
    setOptionsById({
      ...optionsById,
      [groupId]: current.map(o => o.id === optId ? { ...o, value } : o)
    });
    
    // Update backend array
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const options = current
        .map(o => o.id === optId ? value : o.value)
        .filter(v => v.trim().length > 0)
        .map((val, idx) => {
          const key = getVariantLabel(idx, group.matching_item.variant_type);
          return { [key]: val };
        });
      updateMatchingItem(groupId, { option: options });
    }
  };

  const removeOption = (groupId: string, optId: string) => {
    const current = optionsById[groupId] || [];
    const updated = current.filter(o => o.id !== optId);
    setOptionsById({
      ...optionsById,
      [groupId]: updated
    });
    
    // Update backend array
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const options = updated
        .map(o => o.value)
        .filter(v => v.trim().length > 0)
        .map((val, idx) => {
          const key = getVariantLabel(idx, group.matching_item.variant_type);
          return { [key]: val };
        });
      updateMatchingItem(groupId, { option: options });
    }
  };

  // Update variant type and regenerate option keys
  const updateVariantType = (groupId: string, variantType: VariantType) => {
    const current = optionsById[groupId] || [];
    const options = current
      .map(o => o.value)
      .filter(v => v.trim().length > 0)
      .map((val, idx) => {
        const key = getVariantLabel(idx, variantType);
        return { [key]: val };
      });
    
    updateMatchingItem(groupId, { variant_type: variantType, option: options });
  };

  // Validation
  const validateGroup = (group: QuestionGroup): string[] => {
    const errors: string[] = [];
    
    if (group.from_value <= 0 || group.to_value <= 0) {
      errors.push('Dan va Gacha qiymatlari 0 dan katta bo\'lishi kerak');
    }
    if (group.to_value < group.from_value) {
      errors.push('Gacha qiymati Dan qiymatidan katta yoki teng bo\'lishi kerak');
    }
    if (group.matching_item.statement.length === 0) {
      errors.push('Kamida bitta statement qo\'shing');
    }
    if (group.matching_item.option.length === 0) {
      errors.push('Kamida bitta variant qo\'shing');
    }
    if (group.matching_item.answer_count > group.matching_item.statement.length) {
      errors.push('Javoblar soni statement lardan oshmasligi kerak');
    }
    if (group.matching_item.answer_count <= 0) {
      errors.push('Javoblar soni 0 dan katta bo\'lishi kerak');
    }

    return errors;
  };

  // Save handler
  const handleSave = () => {
    const allValid = groups.every(g => validateGroup(g).length === 0);
    if (!allValid) {
      alert('Iltimos, barcha guruhlarni to\'ldiring va xatolarni tuzating!');
      return;
    }

    console.log('Saving groups:', JSON.stringify(groups, null, 2));
    if (onSave) {
      onSave(groups);
    } else {
      alert('Guruhlar saqlandi! Console\'ga qarang.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg text-slate-900">Savol Guruhlari</h3>
          <p className="text-sm text-slate-500 mt-1">
            {groups.length > 0 
              ? `${groups.length} ta guruh qo'shilgan` 
              : 'Hali guruhlar yo\'q'}
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

      {/* Question Groups */}
      {groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group, groupIndex) => {
            const isExpanded = expandedGroups.includes(group.id);
            const validationErrors = validateGroup(group);
            const hasErrors = validationErrors.length > 0;
            const statements = statementsById[group.id] || [];
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
                {/* Header */}
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
                        <strong>Guruh {groupIndex + 1}</strong>
                      </span>

                      {group.from_value > 0 && group.to_value > 0 && (
                        <span className="px-2.5 py-1 bg-[#042d62] text-white text-xs rounded-md">
                          Q{group.from_value}-{group.to_value}
                        </span>
                      )}

                      <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                        {group.question_type}
                      </span>

                      {group.matching_item.statement.length > 0 && (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                          {group.matching_item.statement.length} statement
                        </span>
                      )}

                      {group.matching_item.option.length > 0 && (
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                          {group.matching_item.option.length} variant
                        </span>
                      )}

                      {!isExpanded && (
                        hasErrors ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )
                      )}
                    </div>
                  </div>

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

                {/* Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-6">
                    {/* Validation Errors */}
                    {hasErrors && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-red-900 mb-1">
                              <strong>Xatolar:</strong>
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

                    {/* Range */}
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
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={group.from_value}
                        />
                      </div>
                    </div>

                    {/* Title/Instruction */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Savol sarlavhasi
                      </label>
                      <input
                        type="text"
                        value={group.matching_item.title}
                        onChange={(e) => updateMatchingItem(group.id, { title: e.target.value })}
                        placeholder="Masalan: Match each sentence ending with the correct option"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* DYNAMIC STATEMENTS */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm text-slate-700">
                          Savollar (Statements) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          {group.matching_item.statement.length} ta
                        </span>
                      </div>

                      <div className="space-y-2">
                        {statements.map((stmt, idx) => (
                          <div 
                            key={stmt.id}
                            className="flex items-center gap-2 group animate-fadeIn"
                          >
                            <span className="text-xs text-slate-500 w-6">
                              {idx + 1}.
                            </span>
                            <input
                              type="text"
                              value={stmt.value}
                              onChange={(e) => updateStatement(group.id, stmt.id, e.target.value)}
                              placeholder={`Statement ${idx + 1}`}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removeStatement(group.id, stmt.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="O'chirish"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addStatement(group.id)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors w-full border border-dashed border-blue-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Statement</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Har bir statement alohida input sifatida kiritiladi
                      </p>
                    </div>

                    {/* Variant Type */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Variant Turi <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={group.matching_item.variant_type}
                        onChange={(e) => updateVariantType(group.id, e.target.value as VariantType)}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="letter">Harf (A, B, C, D...)</option>
                        <option value="number">Raqam (1, 2, 3...)</option>
                        <option value="romain">Rim (I, II, III...)</option>
                      </select>
                    </div>

                    {/* DYNAMIC OPTIONS */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm text-slate-700">
                          Variantlar (Options) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {group.matching_item.option.length} ta
                        </span>
                      </div>

                      <div className="space-y-2">
                        {options.map((opt, idx) => {
                          const label = getVariantLabel(idx, group.matching_item.variant_type);
                          return (
                            <div 
                              key={opt.id}
                              className="flex items-center gap-2 group animate-fadeIn"
                            >
                              <span className="text-sm font-semibold text-blue-600 w-8">
                                {label}.
                              </span>
                              <input
                                type="text"
                                value={opt.value}
                                onChange={(e) => updateOption(group.id, opt.id, e.target.value)}
                                placeholder={`Option ${label}`}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(group.id, opt.id)}
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
                          <span>Add Option</span>
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        Har bir variant alohida input. Belgi avtomatik qo'shiladi.
                      </p>
                    </div>

                    {/* Answer Count */}
                    <div>
                      <label className="block text-sm text-slate-700 mb-2">
                        Javoblar soni <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={group.matching_item.answer_count}
                        onChange={(e) => updateMatchingItem(group.id, { 
                          answer_count: parseInt(e.target.value) || 1 
                        })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max={group.matching_item.statement.length}
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Har bir statement uchun nechta javob (maksimal: {group.matching_item.statement.length || 0})
                      </p>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl text-green-600">
                          {group.matching_item.statement.length}
                        </div>
                        <div className="text-xs text-green-800 mt-1">Statements</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl text-purple-600">
                          {group.matching_item.option.length}
                        </div>
                        <div className="text-xs text-purple-800 mt-1">Options</div>
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

      {/* Save Button */}
      {groups.length > 0 && (
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSave}
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
