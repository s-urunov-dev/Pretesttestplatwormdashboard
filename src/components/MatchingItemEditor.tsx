import React, { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

interface MatchingItemEditorProps {
  statements: string[];
  options: string[];
  onStatementsChange: (statements: string[]) => void;
  onOptionsChange: (options: string[]) => void;
}

export function MatchingItemEditor({ 
  statements, 
  options, 
  onStatementsChange, 
  onOptionsChange 
}: MatchingItemEditorProps) {
  const addStatement = () => {
    onStatementsChange([...statements, '']);
  };

  const updateStatement = (index: number, value: string) => {
    const updated = [...statements];
    updated[index] = value;
    onStatementsChange(updated);
  };

  const removeStatement = (index: number) => {
    onStatementsChange(statements.filter((_, i) => i !== index));
  };

  const addOption = () => {
    onOptionsChange([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    onOptionsChange(updated);
  };

  const removeOption = (index: number) => {
    onOptionsChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Statements Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-slate-700">
            Savollar/Statements <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addStatement}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Savol qo'shish
          </button>
        </div>
        
        <div className="space-y-2">
          {statements.length === 0 && (
            <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-500">Savol qo'shing</p>
            </div>
          )}
          {statements.map((statement, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <div className="flex items-center gap-2 mt-3">
                <GripVertical className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 min-w-[20px]">
                  {index + 1}.
                </span>
              </div>
              <textarea
                value={statement}
                onChange={(e) => updateStatement(index, e.target.value)}
                placeholder={`Savol ${index + 1} matnini kiriting...`}
                rows={2}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white resize-none"
                required
              />
              <button
                type="button"
                onClick={() => removeStatement(index)}
                className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Options Section */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <label className="block text-slate-700">
            Javob Variantlari/Options <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Variant qo'shish
          </button>
        </div>
        
        <div className="space-y-2">
          {options.length === 0 && (
            <div className="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
              <p className="text-slate-500">Javob varianti qo'shing</p>
            </div>
          )}
          {options.map((option, index) => (
            <div key={index} className="flex items-start gap-2 group">
              <div className="flex items-center gap-2 mt-3">
                <GripVertical className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-green-600 min-w-[20px]">
                  {String.fromCharCode(65 + index)}
                </span>
              </div>
              <textarea
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Variant ${String.fromCharCode(65 + index)} matnini kiriting...`}
                rows={2}
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-white resize-none"
                required
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        
        {options.length > 0 && (
          <p className="text-sm text-slate-500 mt-2">
            💡 Talabalar bu variantlardan birini yoki bir nechtasini tanlaydi
          </p>
        )}
      </div>
    </div>
  );
}
