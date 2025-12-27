import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TestDetailPage } from './pages/TestDetailPage';
import { AddQuestionPage } from './pages/AddQuestionPage';
import { NewReadingQuestionPage } from './pages/NewReadingQuestionPage';
import TableCompletionDemoPage from './pages/TableCompletionDemoPage';
import { MatchingEditorDemo } from './pages/MatchingEditorDemo';
import { DynamicFormDemo } from './pages/DynamicFormDemo';
import { CompleteFormShowcase } from './pages/CompleteFormShowcase';
import { MatchingGroupDemo } from './pages/MatchingGroupDemo';
import { IndividualInputsDemo } from './pages/IndividualInputsDemo';
import { FormCompletionDemo } from './pages/FormCompletionDemo';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test/:testId" element={<TestDetailPage />} />
          <Route path="/test/:testId/add-question" element={<AddQuestionPage />} />
          <Route path="/test/:testId/reading/:passageType" element={<NewReadingQuestionPage />} />
          <Route path="/demo/table-completion" element={<TableCompletionDemoPage />} />
          <Route path="/demo/matching-editor" element={<MatchingEditorDemo />} />
          <Route path="/demo/dynamic-form" element={<DynamicFormDemo />} />
          <Route path="/demo/complete-form" element={<CompleteFormShowcase />} />
          <Route path="/demo/matching-group" element={<MatchingGroupDemo />} />
          <Route path="/demo/individual-inputs" element={<IndividualInputsDemo />} />
          <Route path="/demo/form-completion" element={<FormCompletionDemo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}