
export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Exam {
  examTitle: string;
  duration: number;
  questions: Question[];
}

export interface GeneratorOptions {
  sourceText: string;
  examType: string;
  questionCount: number;
  grade: string; // "10", "11", or "12"
}

// New types for Question Bank
export interface BankGeneratorOptions {
  baseQuestions: BankQuestion[];
  questionCount: number;
  grade: string;
  chapter: string;
  topic: string;
}

export interface BankQuestion {
  id: string;
  text: string;
}

export interface Topic {
  id: string;
  name: string;
  questions: BankQuestion[];
}

export interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Grade {
  id: string;
  name: string;
  chapters: Chapter[];
}
