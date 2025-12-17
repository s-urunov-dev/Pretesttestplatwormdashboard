import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionPanel } from '../components/QuestionPanel';
import { CreateTestModal } from '../components/CreateTestModal';
import { getTests, TestResponse, isOfflineMode } from '../lib/api';

export function HomePage() {
  const navigate = useNavigate();
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
    navigate(`/test/${testId}`);
  };

  const handleNavigateToEdit = (testId: number) => {
    navigate(`/test/${testId}/add-question?mode=edit`);
  };

  const handleCreateTest = () => {
    setShowCreateModal(true);
  };

  const handleTestCreated = (newTest: TestResponse) => {
    setTests([newTest, ...tests]);
    setShowCreateModal(false);
    navigate(`/test/${newTest.id}`);
  };

  const handleDeleteTest = async (testId: number) => {
    // TODO: implement delete API
    setTests(tests.filter(t => t.id !== testId));
  };

  return (
    <>
      <QuestionPanel 
        tests={tests}
        loading={loading}
        error={error}
        offline={offline}
        onNavigateToAdd={handleCreateTest}
        onNavigateToDetail={handleNavigateToDetail}
        onNavigateToEdit={handleNavigateToEdit}
        onDeleteTest={handleDeleteTest}
      />

      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onTestCreated={handleTestCreated}
        />
      )}
    </>
  );
}