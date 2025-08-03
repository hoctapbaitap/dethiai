import React, { useState, useRef, useEffect } from 'react';
import type { Exam, Question } from '../types';
import { DownloadIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from './icons/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
    interface Window {
      MathJax: {
        typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
        startup: {
          promise: Promise<void>;
        };
      };
    }
}

interface ExamViewProps {
  exam: Exam;
}

/**
 * Generates a PDF from an HTML string content.
 * @param htmlContent The HTML content to render.
 * @param fileName The name of the file to save.
 */
const downloadAsPDF = async (htmlContent: string, fileName: string) => {
    // Wait for MathJax to be ready
    if (window.MathJax && window.MathJax.startup) {
        await window.MathJax.startup.promise;
    }

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '210mm';
    printContainer.style.padding = '15mm';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.color = 'black';
    printContainer.style.fontFamily = 'Inter, sans-serif';
    printContainer.style.fontSize = '14px';
    printContainer.style.lineHeight = '1.6';

    printContainer.innerHTML = htmlContent;
    document.body.appendChild(printContainer);

    // Process MathJax for the container
    if (window.MathJax) {
        await window.MathJax.typesetPromise([printContainer]);
        // Wait longer for complex formulas to render
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    try {
        const canvas = await html2canvas(printContainer, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            allowTaint: true,
            foreignObjectRendering: true,
            logging: false,
        });

        document.body.removeChild(printContainer);
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = pdfHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft > 0) {
          position = -heightLeft;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save(fileName);
    } catch (error) {
        document.body.removeChild(printContainer);
        console.error('Error generating PDF:', error);
        throw new Error('Không thể tạo file PDF. Vui lòng thử lại.');
    }
};

export const ExamView: React.FC<ExamViewProps> = ({ exam }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(exam.questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const examContentRef = useRef<HTMLDivElement>(null);

  // Re-render MathJax when exam changes or when submitted
  useEffect(() => {
    const renderMath = async () => {
      if (window.MathJax) {
        try {
          await window.MathJax.startup.promise;
          await window.MathJax.typesetPromise();
        } catch (error) {
          console.warn('MathJax rendering error:', error);
        }
      }
    };

    // Delay to ensure DOM is updated
    const timer = setTimeout(renderMath, 100);
    return () => clearTimeout(timer);
  }, [exam, isSubmitted]);

  // Re-render MathJax when answers change
  useEffect(() => {
    const renderMath = async () => {
      if (window.MathJax && !isSubmitted) {
        try {
          await window.MathJax.typesetPromise();
        } catch (error) {
          console.warn('MathJax rendering error:', error);
        }
      }
    };

    const timer = setTimeout(renderMath, 50);
    return () => clearTimeout(timer);
  }, [selectedAnswers, isSubmitted]);

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const calculateScore = () => {
    return exam.questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswerIndex ? 1 : 0);
    }, 0);
  };

  const handleDownloadExamPDF = async () => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    let htmlContent = `
        <div style="font-family: Inter, sans-serif; color: black; line-height: 1.6;">
            <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 8px; text-align: center;">${exam.examTitle}</h1>
            <p style="font-size: 14px; margin-bottom: 24px; text-align: center;">Thời gian: ${exam.duration} phút</p>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    exam.questions.forEach((q, qIndex) => {
        htmlContent += `
            <div style="break-inside: avoid; margin-bottom: 20px;">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 12px; line-height: 1.6;"><strong>Câu ${qIndex + 1}:</strong> ${q.questionText}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding-left: 16px;">
        `;
        q.options.forEach((option, oIndex) => {
            htmlContent += `<div style="display: flex; align-items: flex-start; gap: 8px; font-size: 15px; line-height: 1.6; margin-bottom: 4px;"><span style="font-weight: bold; min-width: 20px;">${optionLabels[oIndex]}.</span><span style="flex: 1;">${option}</span></div>`;
        });
        htmlContent += `</div></div>`;
    });

    htmlContent += `</div></div>`;
    
    try {
        await downloadAsPDF(htmlContent, `${exam.examTitle.replace(/ /g, '_')}_DeGoc.pdf`);
    } catch (error) {
        alert('Không thể tạo file PDF. Vui lòng thử lại.');
    }
  };

  const handleDownloadSolutionPDF = async () => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    let htmlContent = `
        <div style="font-family: Inter, sans-serif; color: black; line-height: 1.6;">
            <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 8px; text-align: center;">${exam.examTitle} - Đáp Án & Lời Giải</h1>
            <p style="font-size: 14px; margin-bottom: 24px; text-align: center;">Thời gian: ${exam.duration} phút</p>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    exam.questions.forEach((q, qIndex) => {
        htmlContent += `
            <div style="break-inside: avoid; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 12px; line-height: 1.6;"><strong>Câu ${qIndex + 1}:</strong> ${q.questionText}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding-left: 16px; margin-bottom: 12px;">
        `;
        q.options.forEach((option, oIndex) => {
            const isCorrect = oIndex === q.correctAnswerIndex;
            htmlContent += `<div style="display: flex; align-items: flex-start; gap: 8px; font-size: 15px; line-height: 1.6; margin-bottom: 4px; ${isCorrect ? 'font-weight: bold; color: #16a34a;' : ''}"><span style="font-weight: bold; min-width: 20px;">${optionLabels[oIndex]}.</span><span style="flex: 1;">${option}</span></div>`;
        });
        htmlContent += `</div>
            <div style="font-size: 15px; background-color: #f3f4f6; padding: 12px; border-radius: 8px; line-height: 1.6;">
                <p style="margin-bottom: 8px;"><strong>Đáp án đúng: ${optionLabels[q.correctAnswerIndex]}</strong></p>
                <p><strong>Giải thích:</strong> ${q.explanation}</p>
            </div>
        </div>`;
    });

    htmlContent += `</div></div>`;
    
    try {
        await downloadAsPDF(htmlContent, `${exam.examTitle.replace(/ /g, '_')}_LoiGiai.pdf`);
    } catch (error) {
        alert('Không thể tạo file PDF. Vui lòng thử lại.');
    }
  };

  const handleDownloadDocx = async () => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    
    // Create proper HTML structure for Word
    let htmlContent = `
      <!DOCTYPE html>
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <meta name=ProgId content=Word.Document>
        <meta name=Generator content="Microsoft Word 15">
        <meta name=Originator content="Microsoft Word 15">
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 1in; }
          h1 { text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 10pt; }
          .exam-info { text-align: center; font-size: 12pt; margin-bottom: 20pt; }
          .question { margin-bottom: 15pt; page-break-inside: avoid; }
          .question-text { font-weight: bold; margin-bottom: 8pt; }
          .options { margin-left: 20pt; }
          .option { margin-bottom: 3pt; }
          .answer-key { margin-top: 30pt; page-break-before: always; }
          .answer-key h2 { text-align: center; font-size: 14pt; font-weight: bold; }
          .answers { display: flex; flex-wrap: wrap; }
          .answer-item { width: 10%; margin-right: 2%; margin-bottom: 5pt; }
        </style>
      </head>
      <body>
        <h1>${exam.examTitle}</h1>
        <div class="exam-info">Thời gian làm bài: ${exam.duration} phút</div>
    `;

    // Add questions
    exam.questions.forEach((q, qIndex) => {
      htmlContent += `
        <div class="question">
          <div class="question-text">Câu ${qIndex + 1}: ${q.questionText.replace(/\$/g, '')}</div>
          <div class="options">
      `;
      q.options.forEach((opt, idx) => {
        htmlContent += `<div class="option">${optionLabels[idx]}. ${opt.replace(/\$/g, '')}</div>`;
      });
      htmlContent += `</div></div>`;
    });

    // Add answer key
    htmlContent += `
        <div class="answer-key">
          <h2>ĐÁP ÁN</h2>
          <div class="answers">
    `;
    
    exam.questions.forEach((q, i) => {
      htmlContent += `<div class="answer-item">${i + 1}. ${optionLabels[q.correctAnswerIndex]}</div>`;
    });
    
    htmlContent += `
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const blob = new Blob([htmlContent], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${exam.examTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error creating DOCX:', error);
      alert('Không thể tạo file Word. Vui lòng thử lại.');
    }
  };

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-6 md:p-8 animate-fade-in">
      {/* Enhanced CSS for better MathJax rendering */}
      <style>{`
        .math-content {
          line-height: 1.8 !important;
          display: inline-block !important;
          vertical-align: middle !important;
          word-break: keep-all !important;
          white-space: nowrap !important;
          overflow-x: auto !important;
          max-width: 100% !important;
        }
        
        .math-content .MathJax,
        .math-content .mjx-math,
        .math-content .mjx-container {
          display: inline !important;
          vertical-align: middle !important;
          margin: 0 2px !important;
          line-height: 1.8 !important;
        }
        
        .math-display {
          display: block !important;
          text-align: center !important;
          margin: 1em 0 !important;
          overflow-x: auto !important;
        }
        
        .question-text,
        .option-text {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          hyphens: auto !important;
          line-height: 1.8 !important;
        }
        
        .mjx-container {
          overflow-x: auto !important;
          overflow-y: visible !important;
          max-width: 100% !important;
        }
        
        .mjx-container[jax="SVG"] {
          direction: ltr !important;
        }
        
        .mjx-container[jax="SVG"] > svg {
          overflow: visible !important;
          min-height: 1ex !important;
          min-width: 1ex !important;
        }
        
        /* Prevent line breaks in math expressions */
        .mjx-math {
          white-space: nowrap !important;
        }
        
        /* Better spacing for inline math */
        .mjx-container[display="true"] {
          display: block !important;
          text-align: center !important;
          margin: 1em 0 !important;
        }
        
        .mjx-container[display="false"] {
          display: inline !important;
          margin: 0 0.1em !important;
        }
      `}</style>
      
      <div className="flex justify-between items-start mb-6 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-light dark:text-text-dark">{exam.examTitle}</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Thời gian: {exam.duration} phút</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={handleDownloadExamPDF} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <DownloadIcon className="w-4 h-4" />
              <span>Tải PDF (Đề gốc)</span>
          </button>
          <button onClick={handleDownloadSolutionPDF} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-green-100 dark:bg-green-800/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700/50 transition-colors">
              <DownloadIcon className="w-4 h-4" />
              <span>Tải PDF (Lời giải)</span>
          </button>
          <button onClick={handleDownloadDocx} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700/50 transition-colors">
              <DocumentTextIcon className="w-4 h-4" />
              <span>Tải Word</span>
          </button>
        </div>
      </div>

      {isSubmitted && (
        <div className="mb-6 p-4 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 border border-primary print:hidden">
          <h3 className="text-xl font-bold text-primary">Kết quả</h3>
          <p className="text-lg">Bạn đạt {calculateScore()} trên {exam.questions.length} điểm</p>
        </div>
      )}
      
      <div ref={examContentRef}>
           <div className="printable-area bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark">
              <div className="hidden print:block text-black">
                 <h1 className="text-2xl font-bold mb-1 text-center">{exam.examTitle}</h1>
                 <p className="text-sm mb-4 text-center">Thời gian: {exam.duration} phút</p>
              </div>
              <div className="space-y-8">
                {exam.questions.map((q, qIndex) => (
                  <QuestionItem 
                    key={qIndex} 
                    question={q} 
                    qIndex={qIndex} 
                    selectedAnswer={selectedAnswers[qIndex]}
                    isSubmitted={isSubmitted}
                    onSelectAnswer={handleSelectAnswer}
                  />
                ))}
              </div>
          </div>
      </div>
      

      {!isSubmitted && (
        <div className="mt-8 text-center print:hidden">
          <button onClick={handleSubmit} className="px-8 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary-focus transition-transform transform hover:scale-105">
            Nộp bài
          </button>
        </div>
      )}
    </div>
  );
};

interface QuestionItemProps {
    question: Question;
    qIndex: number;
    selectedAnswer: number | null;
    isSubmitted: boolean;
    onSelectAnswer: (qIndex: number, oIndex: number) => void;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, qIndex, selectedAnswer, isSubmitted, onSelectAnswer }) => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    
    return (
        <div className="border-b border-border-light dark:border-border-dark pb-6 break-inside-avoid">
            <div className="font-semibold mb-3 text-lg question-text">
                <strong className="mr-2">Câu {qIndex + 1}:</strong>
                <span 
                    className="math-content"
                    dangerouslySetInnerHTML={{ __html: question.questionText }}
                ></span>
            </div>
            <div className="space-y-2">
            {question.options.map((option, oIndex) => {
                const isCorrect = oIndex === question.correctAnswerIndex;
                const isSelected = selectedAnswer === oIndex;
                
                let optionClass = 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-primary';
                let statusIcon = null;

                if (isSubmitted) {
                    if (isCorrect) {
                        optionClass = 'border-green-500 bg-green-500/10 text-green-800 dark:text-green-300';
                        statusIcon = <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
                    } else if (isSelected && !isCorrect) {
                        optionClass = 'border-red-500 bg-red-500/10 text-red-800 dark:text-red-300';
                        statusIcon = <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
                    }
                } else if (isSelected) {
                    optionClass = 'border-primary bg-primary/10';
                }

                return (
                <div key={oIndex} onClick={() => onSelectAnswer(qIndex, oIndex)} className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${optionClass}`}>
                    <span className="font-bold flex-shrink-0">{optionLabels[oIndex]}.</span>
                    <span 
                        className="flex-grow option-text math-content" 
                        dangerouslySetInnerHTML={{ __html: option }}
                    ></span>
                    <div className="print:hidden flex-shrink-0">{statusIcon}</div>
                </div>
                );
            })}
            </div>

            {isSubmitted && (
            <div className="explanation-block mt-4 p-3 rounded-lg bg-gray-100 dark:bg-slate-700/50 print:bg-gray-100 print:hidden">
                <h4 className="font-bold text-green-600 dark:text-green-400">Đáp án đúng: {optionLabels[question.correctAnswerIndex]}</h4>
                <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    <strong className="font-semibold">Giải thích:</strong> 
                    <span 
                        className="math-content ml-1"
                        dangerouslySetInnerHTML={{ __html: question.explanation }}
                    ></span>
                </p>
            </div>
            )}
        </div>
    );
}

const printStyles = `
  @media print {
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print\\:hidden {
        display: none !important;
    }
    .print\\:block {
        display: block !important;
    }
    .break-inside-avoid {
      break-inside: avoid;
    }
    aside, .print-hidden-parent > *:not(.printable-area) {
      display: none !important;
    }
    main, #root, body, html {
        padding: 0 !important;
        margin: 0 !important;
        background: white !important;
        color: black !important;
    }
    .printable-area {
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      margin: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    .printable-area * {
       color: black !important;
       border-color: #ccc !important;
       background-color: transparent !important;
    }
  }
`;

// Inject styles into the head
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = printStyles;
document.head.appendChild(styleSheet);