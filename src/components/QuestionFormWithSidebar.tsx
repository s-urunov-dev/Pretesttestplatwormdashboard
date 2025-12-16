import { useState } from 'react';
import { Check } from 'lucide-react';
import { Question } from './QuestionPanel';
import { AllQuestionTypesForm } from './AllQuestionTypesForm';

interface QuestionFormWithSidebarProps {
  selectedType: 'reading' | 'listening' | 'writing';
  onBack: () => void;
  onSuccess: () => void;
}

export function QuestionFormWithSidebar({ selectedType, onBack, onSuccess }: QuestionFormWithSidebarProps) {
  const [selectedSection, setSelectedSection] = useState<string>('');

  // Define sections based on type
  const sections = {
    listening: [
      { id: 'part-1', label: 'Part 1', description: 'Social needs' },
      { id: 'part-2', label: 'Part 2', description: 'Social needs' },
      { id: 'part-3', label: 'Part 3', description: 'Educational/Training' },
      { id: 'part-4', label: 'Part 4', description: 'Academic' },
    ],
    reading: [
      { id: 'passage-1', label: 'Passage 1', description: 'Easier' },
      { id: 'passage-2', label: 'Passage 2', description: 'Medium' },
      { id: 'passage-3', label: 'Passage 3', description: 'Most difficult' },
    ],
    writing: [
      { id: 'task-1', label: 'Task 1', description: 'Graph/Chart/Letter' },
      { id: 'task-2', label: 'Task 2', description: 'Essay' },
    ],
  };

  const currentSections = sections[selectedType];

  const handleSubmit = (question: Omit<Question, 'id' | 'createdAt'>) => {
    // Here you would save the question
    console.log('Saving question:', question);
    onSuccess();
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 sticky top-8">
          <h3 className="text-slate-900 mb-4">Section ni tanlang</h3>
          <div className="space-y-2">
            {currentSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  selectedSection === section.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{section.label}</span>
                      {selectedSection === section.id && (
                        <Check className="w-4 h-4" />
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${
                      selectedSection === section.id ? 'text-indigo-200' : 'text-slate-500'
                    }`}>
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="flex-1">
        {selectedSection ? (
          <AllQuestionTypesForm
            selectedType={selectedType}
            selectedSection={selectedSection}
            onSubmit={handleSubmit}
            onBack={onBack}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 mb-2">Section ni tanlang</h3>
            <p className="text-slate-600">
              Chap tarafdagi sectionlardan birini tanlang
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
