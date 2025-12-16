import { useState, useEffect } from 'react';
import { X, FileText, Loader2, WifiOff } from 'lucide-react';
import { createTest, createReading, createListening, TestResponse, isOfflineMode } from '../lib/api';

interface CreateTestModalProps {
  onClose: () => void;
  onTestCreated: (test: TestResponse) => void;
}

export function CreateTestModal({ onClose, onTestCreated }: CreateTestModalProps) {
  const [testName, setTestName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    checkOfflineStatus();
  }, []);

  const checkOfflineStatus = async () => {
    const isOffline = await isOfflineMode();
    setOffline(isOffline);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!testName.trim()) {
      setError('Test nomi kiritilishi shart');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Step 1: Create the test
      const newTest = await createTest({
        name: testName.trim(),
        is_active: isActive,
      });

      console.log('✅ Test yaratildi:', newTest);

      // Step 2: Try to create reading and listening sections
      // If these fail, the test is still created successfully
      let sectionsCreated = true;
      try {
        await Promise.all([
          createReading(newTest.id),
          createListening(newTest.id),
        ]);
        console.log('✅ Reading va Listening sections yaratildi');
      } catch (sectionError) {
        console.warn('⚠️ Sections yaratishda muammo:', sectionError);
        sectionsCreated = false;
        
        // Show warning but don't fail the whole operation
        const errorMsg = sectionError instanceof Error ? sectionError.message : 'Unknown error';
        setError(`Test yaratildi, lekin Reading/Listening sections yaratishda xatolik: ${errorMsg}. Test detail sahifasida qo'lda qo'shishingiz mumkin.`);
      }

      // Step 3: Notify parent and close modal
      onTestCreated(newTest);
      
      // If sections were created successfully, close modal after a short delay
      if (sectionsCreated) {
        setTimeout(() => {
          onClose();
        }, 500);
      }
    } catch (err) {
      console.error('Error creating test:', err);
      
      // Show the actual error message from backend
      const errorMessage = err instanceof Error ? err.message : 'Noma\'lum xatolik';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-[#042d62] to-[#0369a1] rounded-xl shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-slate-900">Yangi Test Yaratish</h2>
            <p className="text-sm text-slate-600">Test nomini kiriting</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 mb-2">
              Test Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={testName}
              onChange={(e) => {
                setTestName(e.target.value);
                setError('');
              }}
              placeholder="Masalan: IELTS Practice Test #1"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#042d62] focus:border-transparent bg-slate-50"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
            <input
              type="checkbox"
              id="is-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
              className="w-5 h-5 text-[#042d62] rounded focus:ring-2 focus:ring-[#042d62]"
            />
            <label htmlFor="is-active" className="text-slate-700 flex-1">
              Test faol holda bo&apos;lsin
            </label>
          </div>

          {/* Info box */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900 mb-2">
              ℹ️ <strong>Eslatma:</strong>
            </p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Test yaratilgandan so&apos;ng Reading va Listening bo&apos;limlari avtomatik qo&apos;shiladi</li>
              <li>Writing bo&apos;limini keyinroq qo&apos;shishingiz mumkin</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-5 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading || !testName.trim()}
              className="flex-1 px-5 py-3 bg-[#042d62] hover:bg-[#053a75] text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yaratilmoqda...
                </>
              ) : (
                'Test Yaratish'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}