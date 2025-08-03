
import React, { useState, useRef, useEffect } from 'react';
import type { Exam, Question } from '../types';
import { DownloadIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon } from './icons/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
    interface Window {
      MathJax: {
        typesetPromise: (elements?: HTMLElement[]) => Promise<void>;
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
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.width = '210mm';
    printContainer.style.padding = '15mm';
    printContainer.style.boxSizing = 'border-box';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.color = 'black';
    printContainer.style.fontFamily = 'Inter, sans-serif';

    printContainer.innerHTML = htmlContent;
    document.body.appendChild(printContainer);

    if (window.MathJax) {
        await window.MathJax.typesetPromise([printContainer]);
        // Tăng delay để chắc chắn MathJax render xong
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
    });

    document.body.removeChild(printContainer);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps= pdf.getImageProperties(imgData);
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
};


export const ExamView: React.FC<ExamViewProps> = ({ exam }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(exam.questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const examContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (exam && window.MathJax) {
      setTimeout(() => {
        window.MathJax.typesetPromise();
      }, 100);
    }
  }, [exam, isSubmitted]);


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
        <div style="font-family: Inter, sans-serif; color: black;">
            <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 8px; text-align: center;">${exam.examTitle}</h1>
            <p style="font-size: 14px; margin-bottom: 24px; text-align: center;">Thời gian: ${exam.duration} phút</p>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    exam.questions.forEach((q, qIndex) => {
        htmlContent += `
            <div style="break-inside: avoid;">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"><strong>Câu ${qIndex + 1}:</strong> ${q.questionText}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding-left: 16px;">
        `;
        q.options.forEach((option, oIndex) => {
            htmlContent += `<div style="display: flex; align-items: start; gap: 8px; font-size: 15px;"><span style="font-weight: bold;">${optionLabels[oIndex]}.</span><span>${option}</span></div>`;
        });
        htmlContent += `</div></div>`;
    });

    htmlContent += `</div></div>`;
    
    await downloadAsPDF(htmlContent, `${exam.examTitle.replace(/ /g, '_')}_DeGoc.pdf`);
  };

  const handleDownloadSolutionPDF = async () => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    let htmlContent = `
        <div style="font-family: Inter, sans-serif; color: black;">
            <h1 style="font-size: 22px; font-weight: bold; margin-bottom: 8px; text-align: center;">${exam.examTitle} - Đáp Án & Lời Giải</h1>
            <p style="font-size: 14px; margin-bottom: 24px; text-align: center;">Thời gian: ${exam.duration} phút</p>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
    `;

    exam.questions.forEach((q, qIndex) => {
        htmlContent += `
            <div style="break-inside: avoid; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 16px;">
                <p style="font-size: 16px; font-weight: 600; margin-bottom: 12px;"><strong>Câu ${qIndex + 1}:</strong> ${q.questionText}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; padding-left: 16px; margin-bottom: 12px;">
        `;
        q.options.forEach((option, oIndex) => {
            htmlContent += `<div style="display: flex; align-items: start; gap: 8px; font-size: 15px; ${oIndex === q.correctAnswerIndex ? 'font-weight: bold; color: #16a34a;' : ''}"><span style="font-weight: bold;">${optionLabels[oIndex]}.</span><span>${option}</span></div>`;
        });
        htmlContent += `</div>
            <div style="font-size: 15px; background-color: #f3f4f6; padding: 12px; border-radius: 8px;">
                <p><strong>Đáp án đúng: ${optionLabels[q.correctAnswerIndex]}</strong></p>
                <p style="margin-top: 8px;"><strong>Giải thích:</strong> ${q.explanation}</p>
            </div>
        </div>`;
    });

    htmlContent += `</div></div>`;
    
    await downloadAsPDF(htmlContent, `${exam.examTitle.replace(/ /g, '_')}_LoiGiai.pdf`);
  };

  const handleDownloadDocx = async () => {
    const optionLabels = ['A', 'B', 'C', 'D'];
    let docxBodyContent = '';
    docxBodyContent += `${exam.examTitle}\nThời gian làm bài: ${exam.duration} phút\n\n`;
    exam.questions.forEach((q, qIndex) => {
      docxBodyContent += `Câu ${qIndex + 1}: ${q.questionText}\n`;
      q.options.forEach((opt, idx) => {
        docxBodyContent += `   ${optionLabels[idx]}. ${opt}\n`;
      });
      docxBodyContent += '\n';
    });
    docxBodyContent += '\nĐÁP ÁN\n';
    for(let i = 0; i < exam.questions.length; i++) {
      docxBodyContent += `${i + 1}. ${optionLabels[exam.questions[i].correctAnswerIndex]}  `;
      if ((i+1) % 10 === 0) docxBodyContent += '\n';
    }
    // Tạo file HTML đơn giản, giữ nguyên LaTeX, đổi đuôi thành .docx
    const html = `
      <html><head><meta charset='utf-8'></head><body><pre style="font-family: 'Times New Roman', serif; font-size: 12pt;">${docxBodyContent}</pre></body></html>
    `;
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${exam.examTitle.replace(/ /g, '_')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-6 md:p-8 animate-fade-in">
      {/* CSS fix cho MathJax và công thức toán */}
      <style>{`
        .math-inline, .MathJax, .mjx-math {
          display: inline !important;
          vertical-align: middle !important;
          white-space: normal !important;
          line-height: 1.6 !important;
        }
        .math-display, .MathJax_Display, .mjx-block {
          display: block !important;
          text-align: center;
          margin: 1em 0;
        }
        .mjx-container {
          overflow-x: auto;
          max-width: 100%;
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
              <span>Tải DOCX</span>
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
            <div 
                className="font-semibold mb-3 text-lg"
                >
                <strong className="mr-2">Câu {qIndex + 1}:</strong>
                <span dangerouslySetInnerHTML={{ __html: question.questionText }}></span>
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
                    <span className="font-bold">{optionLabels[oIndex]}.</span>
                    <span className="flex-grow" dangerouslySetInnerHTML={{ __html: option }}></span>
                    <div className="print:hidden">{statusIcon}</div>
                </div>
                );
            })}
            </div>

            {isSubmitted && (
            <div className="explanation-block mt-4 p-3 rounded-lg bg-gray-100 dark:bg-slate-700/50 print:bg-gray-100 print:hidden">
                <h4 className="font-bold text-green-600 dark:text-green-400">Đáp án đúng: {optionLabels[question.correctAnswerIndex]}</h4>
                <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark"><strong className="font-semibold">Giải thích:</strong> <span dangerouslySetInnerHTML={{ __html: question.explanation }}></span></p>
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
