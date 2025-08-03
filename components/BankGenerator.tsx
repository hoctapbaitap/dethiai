
import React, { useState, useMemo, useEffect } from 'react';
import type { BankGeneratorOptions } from '../types';
import { mathBank } from '../data/math-bank';
import { SparklesIcon, ArrowLeftIcon } from './icons/Icons';

interface BankGeneratorProps {
  onGenerate: (options: BankGeneratorOptions) => void;
  onBack: () => void;
  initialGradeId?: string;
  initialChapterId?: string;
  initialTopicId?: string;
}

export const BankGenerator: React.FC<BankGeneratorProps> = ({ onGenerate, onBack, initialGradeId, initialChapterId, initialTopicId }) => {
  const [gradeId, setGradeId] = useState(initialGradeId ?? mathBank[0].id);
  
  const chapters = useMemo(() => {
    return mathBank.find(g => g.id === gradeId)?.chapters ?? [];
  }, [gradeId]);

  const [chapterId, setChapterId] = useState(initialChapterId ?? chapters[0]?.id ?? '');

  const topics = useMemo(() => {
    return chapters.find(c => c.id === chapterId)?.topics ?? [];
  }, [chapterId, chapters]);

  const [topicId, setTopicId] = useState(initialTopicId ?? topics[0]?.id ?? '');
  
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const sampleQuestions = useMemo(() => topics.find(t => t.id === topicId)?.questions ?? [], [topicId, topics]);

  useEffect(() => {
    // When grade changes, reset chapter and topic
    const newChapters = mathBank.find(g => g.id === gradeId)?.chapters ?? [];
    const newChapterId = newChapters[0]?.id ?? '';
    setChapterId(newChapterId);
    
    const newTopics = newChapters.find(c => c.id === newChapterId)?.topics ?? [];
    setTopicId(newTopics[0]?.id ?? '');
    
    setSelectedQuestions(new Set());
  }, [gradeId]);

  useEffect(() => {
    // When chapter changes, reset topic
    const newTopics = chapters.find(c => c.id === chapterId)?.topics ?? [];
    setTopicId(newTopics[0]?.id ?? '');
    setSelectedQuestions(new Set());
  }, [chapterId, chapters]);

  useEffect(() => {
    setSelectedQuestions(new Set());
  }, [topicId]);


  const toggleQuestionSelection = (qId: string) => {
    const newSelection = new Set(selectedQuestions);
    if (newSelection.has(qId)) {
      newSelection.delete(qId);
    } else {
      newSelection.add(qId);
    }
    setSelectedQuestions(newSelection);
  };
  
  useEffect(() => {
    if (window.MathJax) {
      setTimeout(() => {
         window.MathJax.typesetPromise();
      }, 100);
    }
  }, [sampleQuestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestions.size === 0) {
      setError("Vui lòng chọn ít nhất một câu hỏi mẫu.");
      return;
    }
    setError(null);
    const baseQuestions = sampleQuestions.filter(q => selectedQuestions.has(q.id));
    const grade = mathBank.find(g => g.id === gradeId)?.name ?? '';
    const chapter = chapters.find(c => c.id === chapterId)?.name ?? '';
    const topic = topics.find(t => t.id === topicId)?.name ?? '';
    onGenerate({ baseQuestions, questionCount, grade, chapter, topic });
  };

  return (
    <div className="w-full h-full flex flex-col relative animate-fade-in">
       <button onClick={onBack} className="absolute top-0 left-0 flex items-center space-x-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      <div className="text-center mb-8 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
          Tạo đề từ Ngân hàng câu hỏi
        </h1>
        <p className="mt-2 text-lg text-text-secondary-light dark:text-text-secondary-dark">
          Chọn các câu hỏi mẫu để AI tạo ra các câu hỏi tương tự.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select id="grade" label="Khối lớp" value={gradeId} onChange={e => setGradeId(e.target.value)} options={mathBank.map(g => ({value: g.id, label: g.name}))}/>
          <Select id="chapter" label="Chương" value={chapterId} onChange={e => setChapterId(e.target.value)} options={chapters.map(c => ({value: c.id, label: c.name}))} disabled={chapters.length === 0} />
          <Select id="topic" label="Chuyên đề/Bài" value={topicId} onChange={e => setTopicId(e.target.value)} options={topics.map(t => ({value: t.id, label: t.name}))} disabled={topics.length === 0} />
        </div>

        <div className="flex-grow flex flex-col min-h-[250px] bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 space-y-3 overflow-y-auto">
           <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
            Chọn câu hỏi mẫu (chọn một hoặc nhiều)
          </label>
          {sampleQuestions.length > 0 ? sampleQuestions.map(q => (
            <div key={q.id} onClick={() => toggleQuestionSelection(q.id)}
              className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedQuestions.has(q.id) ? 'border-primary bg-primary/10' : 'border-border-light dark:border-border-dark hover:border-primary/50'}`}>
              <input type="checkbox" checked={selectedQuestions.has(q.id)} readOnly className="mt-1 flex-shrink-0" />
              <span className="flex-grow" dangerouslySetInnerHTML={{ __html: q.text }}></span>
            </div>
          )) : <p className="text-center text-text-secondary-light dark:text-text-secondary-dark py-10">Không có câu hỏi mẫu cho chuyên đề này.</p>}
        </div>
         {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Số câu hỏi tương tự cần tạo
            </label>
            <input
              id="questionCount"
              type="number"
              min="1"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
              className="w-full md:w-1/3 p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={selectedQuestions.size === 0}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-focus transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Tạo đề thi
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper component for selects
const Select: React.FC<{id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {value: string, label: string}[], disabled?: boolean}> = ({ id, label, value, onChange, options, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
      {label}
    </label>
    <select id={id} value={value} onChange={onChange} disabled={disabled}
      className="w-full p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-200 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed">
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);
