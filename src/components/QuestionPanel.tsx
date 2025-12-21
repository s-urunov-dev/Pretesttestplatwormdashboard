import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Headphones, PenTool, FileText, Loader2, WifiOff } from 'lucide-react';
import { TestList } from './TestList';
import { TestResponse } from '../lib/api';

export interface Question {
  id: string;
  type: 'reading' | 'listening' | 'writing';
  section?: string; // e.g., "Part 1", "Part 2", "Passage 1"
  category: string;
  title: string;
  content: string;
  questionType: string;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  timeLimit?: number;
  createdAt: Date;
  // New fields for complex questions
  questionRange?: string; // e.g., "1-7", "11-14"
  passage?: string; // Full passage or context
  imageUrl?: string; // For maps, diagrams
  tableData?: {
    headers: string[];
    rows: string[][];
  };
  instructions?: string; // e.g., "Complete the form. Write ONE WORD AND/OR A NUMBER"
  answerFormat?: string; // e.g., "ONE WORD ONLY", "TWO LETTERS"
  subQuestions?: {
    number: string;
    text: string;
    answer: string | string[];
  }[];
}

interface QuestionPanelProps {
  tests: TestResponse[];
  loading: boolean;
  onNavigateToAdd: () => void;
  onNavigateToDetail?: (testId: number) => void;
  onNavigateToEdit?: (testId: number) => void;
  onDeleteTest: (testId: number) => void;
  error?: string | null;
  offline?: boolean;
}

export function QuestionPanel({ tests, loading, onNavigateToAdd, onNavigateToDetail, onNavigateToEdit, onDeleteTest, error, offline }: QuestionPanelProps) {
  const handleDeleteTest = (id: number) => {
    onDeleteTest(id);
  };

  const handleViewTest = (id: number) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(id);
    }
  };

  const handleEditTest = (id: number) => {
    if (onNavigateToEdit) {
      onNavigateToEdit(id);
    }
  };

  // Calculate stats from tests
  const stats = {
    reading: tests.filter(t => t.reading).length,
    listening: tests.filter(t => t.listening).length,
    writing: tests.filter(t => t.writing).length,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 mb-2">IELTS Savol Paneli</h1>
            <p className="text-slate-600">
              Testlarni yarating va boshqaring
            </p>
          </div>
          <button
            onClick={onNavigateToAdd}
            className="flex items-center gap-2 bg-[#042d62] hover:bg-[#053a75] text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-200"
          >
            <Plus className="w-5 h-5" />
            Yangi Test Yaratish
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Tests */}
          <div className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl shadow-md border border-slate-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-md">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Jami Testlar</p>
                <p className="text-slate-900 text-3xl">{tests.length}</p>
              </div>
            </div>
          </div>

          {/* Reading */}
          <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-2xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-[#042d62] to-[#0369a1] rounded-xl shadow-md">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Reading</p>
                <p className="text-slate-900 text-3xl">{stats.reading}</p>
              </div>
            </div>
          </div>

          {/* Listening */}
          <div className="bg-gradient-to-br from-white to-emerald-50 p-6 rounded-2xl shadow-md border border-emerald-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-md">
                <Headphones className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Listening</p>
                <p className="text-slate-900 text-3xl">{stats.listening}</p>
              </div>
            </div>
          </div>

          {/* Writing */}
          <div className="bg-gradient-to-br from-white to-violet-50 p-6 rounded-2xl shadow-md border border-violet-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl shadow-md">
                <PenTool className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-1">Writing</p>
                <p className="text-slate-900 text-3xl">{stats.writing}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <TestList
        tests={tests}
        onDelete={handleDeleteTest}
        onView={handleViewTest}
        onEdit={handleEditTest}
        loading={loading}
        error={error}
        offline={offline}
      />
    </div>
  );
}