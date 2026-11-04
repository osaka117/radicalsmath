export type TopicId = 
  | 'simplifying'
  | 'multiplication'
  | 'division'
  | 'addition'
  | 'combined';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface MathOption {
  id: string;
  label: 'A' | 'B' | 'C' | 'D';
  math: string; // TeX-like notation for MathRenderer e.g. "6\sqrt{2}"
  plainText?: string;
  isCorrect: boolean;
  explanation: string; // Explains why this is correct or why this common trap is wrong
}

export interface SolutionStep {
  stepNumber: number;
  title: string;
  math: string;
  explanation: string;
}

export interface Question {
  id: string;
  topic: TopicId;
  difficulty: DifficultyLevel;
  prompt: string;
  expression: string; // The main mathematical problem to solve
  options: MathOption[];
  solutionSteps: SolutionStep[];
  ruleSummary: string; // e.g. "Product Property: \sqrt[n]{a \cdot b} = \sqrt[n]{a} \cdot \sqrt[n]{b}"
  misconceptionAlert?: string; // e.g. "Caution: \sqrt{a + b} \ne \sqrt{a} + \sqrt{b}"
  notes?: string;
}

export interface TopicInfo {
  id: TopicId;
  name: string;
  code: string;
  description: string;
  formula: string;
  example: string;
}

export type RetroTheme = 'amber' | 'green' | 'blue' | 'paper';

export type AppMode = 'practice' | 'mock-test' | 'handbook';

export interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  topicBreakdown: Record<TopicId, { total: number; correct: number }>;
  userAnswers: Record<string, string>; // questionId -> optionId
  questions: Question[];
  completedAt: Date;
}
