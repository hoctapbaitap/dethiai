
import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratorOptions, BankGeneratorOptions, Exam } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. Please set it in your environment.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const examSchema = {
  type: Type.OBJECT,
  properties: {
    examTitle: {
      type: Type.STRING,
      description: "A suitable title for the exam in Vietnamese, based on the exam type and grade. For example: 'Đề kiểm tra 15 phút - Đại số 10' or 'Đề thi học kỳ 1 - Môn Toán Lớp 12'."
    },
    duration: {
      type: Type.INTEGER,
      description: "The duration of the exam in minutes. E.g., 15, 45, 90."
    },
    questions: {
      type: Type.ARRAY,
      description: "An array of multiple-choice questions.",
      items: {
        type: Type.OBJECT,
        properties: {
          questionText: {
            type: Type.STRING,
            description: "The full text of the question, including any mathematical formulas in LaTeX format if necessary (e.g., `$\\sqrt{x^2+1}$`)."
          },
          options: {
            type: Type.ARRAY,
            description: "An array of 4 strings, representing the possible answers (A, B, C, D).",
            items: {
              type: Type.STRING
            }
          },
          correctAnswerIndex: {
            type: Type.INTEGER,
            description: "The 0-based index of the correct answer in the 'options' array."
          },
          explanation: {
            type: Type.STRING,
            description: "A detailed step-by-step explanation for how to arrive at the correct answer."
          }
        },
        required: ["questionText", "options", "correctAnswerIndex", "explanation"]
      }
    }
  },
  required: ["examTitle", "duration", "questions"]
};

export async function generateExam(options: GeneratorOptions): Promise<Exam> {
  const { sourceText, examType, questionCount, grade } = options;

  const prompt = `
    Based on the following high school math learning materials, please create a practice exam.

    **Exam Specifications:**
    - **Grade Level:** Toán ${grade}
    - **Type:** ${examType}
    - **Number of Questions:** ${questionCount}
    - **Language:** Vietnamese

    **Learning Materials:**
    ---
    ${sourceText}
    ---

    Generate ${questionCount} multiple-choice questions that are relevant to the provided materials, grade level, and the specified exam type.
    Ensure the questions cover a range of difficulties if possible. For each question, provide 4 options (A, B, C, D), identify the correct answer, and give a clear explanation.
    Format the entire output as a single JSON object that strictly follows the provided schema.
    Do not include any text outside of the JSON object.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
        temperature: 0.8
      }
    });

    const jsonText = response.text.trim();
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const parsedExam: Exam = JSON.parse(cleanedJsonText);
    
    if (!parsedExam.questions || parsedExam.questions.length === 0) {
      throw new Error("AI returned an empty set of questions. Please try refining your source material or prompt.");
    }
    
    return parsedExam;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate exam. The AI model might be unavailable or the request was invalid. Check the source material for clarity and try again.");
  }
}


export async function generateExamFromBank(options: BankGeneratorOptions): Promise<Exam> {
  const { baseQuestions, questionCount, grade, chapter, topic } = options;

  const exampleQuestionsText = baseQuestions.map(q => `- ${q.text}`).join('\n');

  const prompt = `
    You are an AI assistant specialized in creating high school math exams in Vietnamese.
    Based on the following example questions from Grade ${grade}, Chapter "${chapter}", Topic "${topic}", create a new practice exam.

    **Example Questions:**
    ---
    ${exampleQuestionsText}
    ---

    **Exam Specifications:**
    - **Number of New Questions to Generate:** ${questionCount}
    - **Topic:** The new questions must be similar in topic, style, and difficulty to the examples provided.
    - **Language:** Vietnamese

    Generate ${questionCount} new, unique multiple-choice questions. Do not simply copy the examples.
    For each question, provide 4 options (A, B, C, D), identify the correct answer, and give a clear, step-by-step explanation.
    Format the entire output as a single JSON object that strictly follows the provided schema.
    Do not include any text outside of the JSON object. The title should reflect the topic, for example: "Đề ôn tập - ${topic}".
  `;
  
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: examSchema,
        temperature: 0.8
      }
    });

    const jsonText = response.text.trim();
    // In case the model wraps the JSON in markdown backticks
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    
    const parsedExam: Exam = JSON.parse(cleanedJsonText);
    
    if (!parsedExam.questions || parsedExam.questions.length === 0) {
      throw new Error("AI returned an empty set of questions. Please try refining your source material or prompt.");
    }
    
    return parsedExam;

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate exam. The AI model might be unavailable or the request was invalid. Check the source material for clarity and try again.");
  }
}
