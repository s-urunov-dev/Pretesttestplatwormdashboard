import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TestDetailPage } from './pages/TestDetailPage';
import { AddQuestionPage } from './pages/AddQuestionPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test/:testId" element={<TestDetailPage />} />
            <Route path="/test/:testId/add-question" element={<AddQuestionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}