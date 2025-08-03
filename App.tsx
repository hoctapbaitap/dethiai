
import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { GeneratorForm } from './components/GeneratorForm';
import { BankGenerator } from './components/BankGenerator';
import { ExamView } from './components/ExamView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateExam, generateExamFromBank } from './services/geminiService';
import type { Exam, GeneratorOptions, BankGeneratorOptions } from './types';
import { AlertTriangleIcon } from './components/icons/Icons';
import { Home } from './components/Home';

type View = 'home' | 'text-generator' | 'bank-generator';
type BankSelection = { gradeId: string; chapterId: string; topicId: string; };

export default function App() {
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<View>('home');
  const [bankSelection, setBankSelection] = useState<BankSelection | null>(null);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleGenerateFromText = useCallback(async (options: GeneratorOptions) => {
    setIsLoading(true);
    setError(null);
    setExam(null);
    try {
      const generatedExam = await generateExam(options);
      setExam(generatedExam);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleGenerateFromBank = useCallback(async (options: BankGeneratorOptions) => {
    setIsLoading(true);
    setError(null);
    setExam(null);
    try {
      const generatedExam = await generateExamFromBank(options);
      setExam(generatedExam);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetState = () => {
    setExam(null);
    setError(null);
    setIsLoading(false);
    setBankSelection(null);
  }

  const handleGoHome = () => {
    resetState();
    setCurrentView('home');
  };
  
  const handleSelectTextGenerator = () => {
    resetState();
    setCurrentView('text-generator');
  }

  const handleSelectBankGenerator = (gradeId: string, chapterId: string, topicId: string) => {
    resetState();
    setBankSelection({ gradeId, chapterId, topicId });
    setCurrentView('bank-generator');
  }


  const toggleDarkMode = () => setIsDarkMode(prev => !prev);
  
  const handleSelectMode = (mode: View) => {
    resetState();
    setCurrentView(mode);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-text-secondary-light dark:text-text-secondary-dark">
            AI đang soạn đề cho bạn...
          </p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <AlertTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-red-400">Tạo đề thất bại</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-lg">
            {error}
          </p>
           <button
              onClick={handleGoHome}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Thử lại
            </button>
        </div>
      );
    }

    if (exam) {
      return <ExamView exam={exam} />;
    }

    switch(currentView) {
      case 'home':
        return <Home onSelectMode={handleSelectMode} />;
      case 'text-generator':
        return <GeneratorForm onGenerate={handleGenerateFromText} onBack={handleGoHome} />;
      case 'bank-generator':
        return <BankGenerator 
                  onGenerate={handleGenerateFromBank} 
                  onBack={handleGoHome}
                  key={bankSelection ? `${bankSelection.gradeId}-${bankSelection.chapterId}-${bankSelection.topicId}` : 'default'}
                  initialGradeId={bankSelection?.gradeId}
                  initialChapterId={bankSelection?.chapterId}
                  initialTopicId={bankSelection?.topicId}
                />;
      default:
        return <Home onSelectMode={handleSelectMode} />;
    }
  };

  return (
    <div className="flex h-screen w-full font-sans bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      <Sidebar 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode}
        onGoHome={handleGoHome}
        onSelectTextGenerator={handleSelectTextGenerator}
        onSelectBankGenerator={handleSelectBankGenerator}
      />
      <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-4xl h-full flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
