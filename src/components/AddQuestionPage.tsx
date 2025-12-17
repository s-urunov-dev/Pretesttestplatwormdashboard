import { useState } from 'react';
import { ArrowLeft, BookOpen, Headphones, PenTool, ChevronLeft, ChevronRight, FileText, Check } from 'lucide-react';
import { ReadingQuestionForm } from './ReadingQuestionForm';
import { AllQuestionTypesForm } from './AllQuestionTypesForm';

interface AddQuestionPageProps {
  testId?: number;
  onNavigateBack: () => void;
}

interface TestSection {
  type: 'reading' | 'listening' | 'writing';
  selectedPart: string;
  isCompleted: boolean;
}

export function AddQuestionPage({ testId, onNavigateBack }: AddQuestionPageProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<'reading' | 'listening' | 'writing'>('reading');
  
  const [testSections, setTestSections] = useState<Record<'reading' | 'listening' | 'writing', TestSection>>({
    reading: { type: 'reading', selectedPart: 'passage-1', isCompleted: false },
    listening: { type: 'listening', selectedPart: 'part-1', isCompleted: false },
    writing: { type: 'writing', selectedPart: 'task-1', isCompleted: false },
  });

  // Parts/Passages based on section
  const partsBySection = {
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

  const sections = [
    { id: 'reading' as const, label: 'Reading', icon: BookOpen, color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { id: 'listening' as const, label: 'Listening', icon: Headphones, color: 'emerald', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'writing' as const, label: 'Writing', icon: PenTool, color: 'violet', gradient: 'from-violet-500 to-violet-600' },
  ];

  const currentSection = testSections[activeSection];
  const currentParts = partsBySection[activeSection];

  const handlePartChange = (partId: string) => {
    setTestSections({
      ...testSections,
      [activeSection]: { ...currentSection, selectedPart: partId },
    });
  };

  const handleSectionComplete = () => {
    setTestSections({
      ...testSections,
      [activeSection]: { ...currentSection, isCompleted: true },
    });
    
    // Move to next incomplete section
    const nextSection = sections.find(s => !testSections[s.id].isCompleted && s.id !== activeSection);
    if (nextSection) {
      setActiveSection(nextSection.id);
    }
  };

  const allSectionsComplete = Object.values(testSections).every(s => s.isCompleted);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="flex">
        {/* Collapsible Sidebar */}
        <div 
          className={`${
            isSidebarCollapsed ? 'w-20' : 'w-80'
          } bg-gradient-to-br from-[#042d62] via-[#053572] to-[#053a75] min-h-screen shadow-2xl transition-all duration-300 ease-in-out relative`}
        >
          <div className="p-6">
            {/* Back Button */}
            <button
              onClick={onNavigateBack}
              className={`flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-all ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
              title="Orqaga"
            >
              <ArrowLeft className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Orqaga</span>}
            </button>

            {/* Header */}
            {!isSidebarCollapsed && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-white">Yangi Test</h2>
                </div>
                <p className="text-blue-200 text-sm">
                  3 ta bo'limni to'ldiring
                </p>
              </div>
            )}

            {/* Sections */}
            <div className="space-y-3">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const sectionData = testSections[section.id];
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 border-2 group relative overflow-hidden ${
                      isActive
                        ? `bg-white/15 border-white/30 shadow-xl`
                        : 'text-white/70 hover:bg-white/10 border-transparent hover:border-white/20'
                    } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    title={isSidebarCollapsed ? section.label : ''}
                  >
                    {/* Icon Container */}
                    <div className={`relative p-3 rounded-xl transition-all ${
                      isActive 
                        ? `bg-gradient-to-br ${section.gradient} shadow-lg` 
                        : 'bg-white/10 group-hover:bg-white/15'
                    }`}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/70'}`} />
                      
                      {/* Completion Badge */}
                      {sectionData.isCompleted && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Label */}
                    {!isSidebarCollapsed && (
                      <div className="flex-1 text-left">
                        <span className={`block ${isActive ? 'text-white' : 'text-white/90'}`}>
                          {section.label}
                        </span>
                        {sectionData.isCompleted && (
                          <span className="text-xs text-green-300">
                            ✓ To'ldirildi
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress Indicator */}
            {!isSidebarCollapsed && (
              <div className="mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-100">Jarayon</span>
                  <span className="text-sm text-white">
                    {Object.values(testSections).filter(s => s.isCompleted).length}/3
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ 
                      width: `${(Object.values(testSections).filter(s => s.isCompleted).length / 3) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#042d62] hover:bg-[#053a75] rounded-full shadow-lg flex items-center justify-center border-2 border-white/20 transition-all hover:scale-110"
            title={isSidebarCollapsed ? 'Kengaytirish' : 'Yig\'ish'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-slate-900 mb-2">
                {sections.find(s => s.id === activeSection)?.label} Bo'limi
              </h1>
              <p className="text-slate-600">
                {activeSection.toUpperCase()} uchun savollarni yarating
              </p>
            </div>

            {/* Parts/Passages Tabs */}
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-3 mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {currentParts.map((part) => (
                  <button
                    key={part.id}
                    onClick={() => handlePartChange(part.id)}
                    className={`px-6 py-3 rounded-xl transition-all whitespace-nowrap ${
                      currentSection.selectedPart === part.id
                        ? 'bg-[#042d62] text-white shadow-lg'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>{part.label}</div>
                    <div className={`text-xs mt-0.5 ${
                      currentSection.selectedPart === part.id ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      {part.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Question Form */}
            {activeSection === 'reading' ? (
              <ReadingQuestionForm
                testId={testId}
                passageNumber={parseInt(currentSection.selectedPart.split('-')[1])}
                onSubmit={() => {
                  console.log('Reading section saved');
                  handleSectionComplete();
                }}
                onBack={onNavigateBack}
              />
            ) : (
              <AllQuestionTypesForm
                selectedType={activeSection}
                selectedSection={currentSection.selectedPart}
                onSubmit={(question) => {
                  console.log('Section saved:', question);
                  handleSectionComplete();
                }}
                onBack={onNavigateBack}
                allSectionsComplete={allSectionsComplete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}