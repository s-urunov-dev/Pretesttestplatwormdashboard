import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Headphones, PenTool, Edit2, Save, FileText, Calendar, Check, Loader2, AlertCircle } from 'lucide-react';
import { AllQuestionTypesForm } from '../components/AllQuestionTypesForm';
import { getTestDetail, TestDetail, isOfflineMode } from '../lib/api';

type EditingSection = {
  type: 'reading' | 'listening' | 'writing';
  section: string;
} | null;

export function TestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [showWritingTaskSelector, setShowWritingTaskSelector] = useState(false);

  const loadTestDetail = async () => {
    if (!testId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const isOff = await isOfflineMode();
      setOffline(isOff);

      if (isOff) {
        setError('Test tafsilotlari offline rejimda mavjud emas');
        setLoading(false);
        return;
      }

      const data = await getTestDetail(parseInt(testId));
      console.log('✅ Test detail loaded:', data);
      setTest(data);
      setEditedTitle(data.name || '');
    } catch (err) {
      console.error('Failed to load test details:', err);
      setError(err instanceof Error ? err.message : 'Test ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTestDetail();
  }, [testId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveTitle = () => {
    if (test) {
      setTest({ ...test, name: editedTitle });
      setIsEditing(false);
    }
  };

  const handleNavigateToAddQuestion = () => {
    if (test) {
      navigate(`/test/${testId}/add-question`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#042d62] animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Test ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Orqaga
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-slate-900 mb-2">Xatolik yuz berdi</h2>
            <p className="text-slate-600 mb-6">{error || 'Test topilmadi'}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#042d62] hover:bg-[#053a75] text-white rounded-xl transition-all"
            >
              Orqaga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Orqaga
        </button>
      </div>

      {/* Test Title Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="flex-1 text-2xl px-4 py-2 border-2 border-[#042d62] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#042d62]"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="px-4 py-2 bg-[#042d62] hover:bg-[#053a75] text-white rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Saqlash
                </button>
                <button
                  onClick={() => {
                    setEditedTitle(test.name);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl text-slate-900">{test.name || 'Nomsiz test'}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-400 hover:text-[#042d62] hover:bg-slate-100 rounded-lg transition-all"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-6 mt-4 text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <div className="text-sm">
                  Yaratilgan: {test.created_at ? new Date(test.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <div className="text-sm">Test ID: {test.id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Reading Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-[#042d62]" />
            </div>
            <div>
              <h3 className="text-lg text-slate-900">Reading</h3>
              <div className="text-sm text-slate-500">
                ID: {typeof test.reading === 'object' && test.reading !== null ? test.reading.id : test.reading ?? 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <div>Passage 1:</div>
              <div className={test.reading_passage1_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.reading_passage1_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Passage 2:</div>
              <div className={test.reading_passage2_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.reading_passage2_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Passage 3:</div>
              <div className={test.reading_passage3_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.reading_passage3_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Listening Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Headphones className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg text-slate-900">Listening</h3>
              <div className="text-sm text-slate-500">
                ID: {typeof test.listening === 'object' && test.listening !== null ? test.listening.id : test.listening ?? 'N/A'}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <div>Part 1:</div>
              <div className={test.listening_part1_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.listening_part1_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Part 2:</div>
              <div className={test.listening_part2_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.listening_part2_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Part 3:</div>
              <div className={test.listening_part3_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.listening_part3_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Part 4:</div>
              <div className={test.listening_part4_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.listening_part4_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Writing Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <PenTool className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg text-slate-900">Writing</h3>
              <div className="text-sm text-slate-500">
                ID:
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <div>Task1:</div>
              <div className={test.writing_task1_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.writing_task1_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Task2:</div>
              <div className={test.writing_task2_completed ? 'text-green-600' : 'text-slate-400'}>
                {test.writing_task2_completed ? <Check className="w-4 h-4 inline" /> : <span>—</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Questions Button */}
      <div className="flex justify-center">
        <button
          onClick={handleNavigateToAddQuestion}
          className="px-8 py-4 bg-gradient-to-r from-[#042d62] to-[#0369a1] hover:shadow-xl text-white rounded-xl text-lg transition-all"
        >
          Savol Qo'shish
        </button>
      </div>
    </div>
  );
}