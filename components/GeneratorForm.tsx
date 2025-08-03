
import React, { useState } from 'react';
import type { GeneratorOptions } from '../types';
import { SparklesIcon, ArrowLeftIcon } from './icons/Icons';

interface GeneratorFormProps {
  onGenerate: (options: GeneratorOptions) => void;
  onBack: () => void;
}

const examTypes = [
  "Kiểm tra 15 phút",
  "Kiểm tra 45 phút (1 tiết)",
  "Thi học kỳ 1",
  "Thi học kỳ 2",
  "Thi thử Tốt nghiệp THPT",
];

const grades = ["10", "11", "12"];

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, onBack }) => {
  const [sourceText, setSourceText] = useState('');
  const [examType, setExamType] = useState(examTypes[0]);
  const [questionCount, setQuestionCount] = useState(10);
  const [grade, setGrade] = useState(grades[2]); // Default to Grade 12
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim()) {
      setError("Vui lòng dán nội dung tài liệu học tập.");
      return;
    }
    if (sourceText.trim().length < 100) {
        setError("Nội dung tài liệu quá ngắn. Vui lòng cung cấp thêm để có kết quả tốt hơn.");
        return;
    }
    setError(null);
    onGenerate({ sourceText, examType, questionCount, grade });
  };

  return (
    <div className="w-full h-full flex flex-col relative animate-fade-in">
       <button onClick={onBack} className="absolute top-0 left-0 flex items-center space-x-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors">
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Quay lại</span>
        </button>
      <div className="text-center mb-8 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
          Tạo đề từ Văn bản
        </h1>
        <p className="mt-2 text-lg text-text-secondary-light dark:text-text-secondary-dark">
          Dán nội dung tài liệu (từ DOC, PDF, TeX) để tạo đề thi thử ngay lập tức.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow flex flex-col space-y-6">
        <div className="flex-grow flex flex-col">
          <label htmlFor="sourceText" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
            Nội dung tài liệu nguồn
          </label>
          <textarea
            id="sourceText"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Dán nội dung bài học, chương, hoặc ghi chú toán học của bạn vào đây..."
            className="flex-grow w-full p-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
            rows={10}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Khối lớp
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {grades.map((g) => (
                <option key={g} value={g}>Toán {g}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="examType" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Loại đề thi
            </label>
            <select
              id="examType"
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {examTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="questionCount" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Số câu hỏi
            </label>
            <input
              id="questionCount"
              type="number"
              min="5"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
              className="w-full p-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-primary hover:bg-primary-focus transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <SparklesIcon className="w-5 h-5 mr-2" />
            Tạo đề thi
          </button>
        </div>
      </form>
    </div>
  );
};
