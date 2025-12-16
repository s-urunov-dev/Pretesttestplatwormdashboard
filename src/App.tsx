import { useState, useEffect } from 'react';
import { QuestionPanel } from './components/QuestionPanel';
import { AddQuestionPage } from './components/AddQuestionPage';
import { NewAddQuestionPage } from './components/NewAddQuestionPage';
import { TestDetailPage } from './components/TestDetailPage';
import { CreateTestModal } from './components/CreateTestModal';
import { getTests, TestResponse, isOfflineMode } from './lib/api';

type Page = 'list' | 'add-test' | 'test-detail' | 'new-add-question';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('list');
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedTestData, setSelectedTestData] = useState<{ name: string; readingId?: number; listeningId?: number } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  // Load tests on mount
  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTests();
      setTests(data);
      
      // Check if we're in offline mode
      const isOffline = await isOfflineMode();
      setOffline(isOffline);
    } catch (error) {
      console.error('Failed to load tests:', error);
      // Don't show error, just use empty state
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToDetail = (testId: number) => {
    setSelectedTestId(testId);
    setCurrentPage('test-detail');
  };

  const handleNavigateToAddQuestion = (testId: number, testName: string, readingId?: number, listeningId?: number) => {
    setSelectedTestId(testId);
    setSelectedTestData({ name: testName, readingId, listeningId });
    setCurrentPage('new-add-question');
  };

  const handleCreateTest = () => {
    setShowCreateModal(true);
  };

  const handleTestCreated = (newTest: TestResponse) => {
    setTests([newTest, ...tests]);
    setShowCreateModal(false);
    handleNavigateToDetail(newTest.id);
  };

  const handleDeleteTest = async (testId: number) => {
    // TODO: implement delete API
    setTests(tests.filter(t => t.id !== testId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {currentPage === 'list' ? (
        <QuestionPanel 
          tests={tests}
          loading={loading}
          error={error}
          offline={offline}
          onNavigateToAdd={handleCreateTest}
          onNavigateToDetail={handleNavigateToDetail}
          onDeleteTest={handleDeleteTest}
        />
      ) : currentPage === 'add-test' ? (
        <AddQuestionPage onNavigateBack={() => setCurrentPage('list')} />
      ) : currentPage === 'new-add-question' && selectedTestId && selectedTestData ? (
        <NewAddQuestionPage 
          testId={selectedTestId}
          testName={selectedTestData.name}
          readingId={selectedTestData.readingId}
          listeningId={selectedTestData.listeningId}
          onBack={() => setCurrentPage('test-detail')}
        />
      ) : selectedTestId ? (
        <TestDetailPage 
          testId={selectedTestId}
          onNavigateBack={() => setCurrentPage('list')}
          onNavigateToAddQuestion={handleNavigateToAddQuestion}
        />
      ) : null}

      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onTestCreated={handleTestCreated}
        />
      )}
    </div>
  );
}