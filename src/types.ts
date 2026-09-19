export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  credits: number;
  avatar?: string;
  token?: string;
  registeredAt: string;
}

export type ExamCategory = 'CGSSB' | 'CGPSC' | 'SWAMI_ATMANAND' | 'CENTRAL_EXAMS';

export interface ExamPatternConfig {
  id: ExamCategory;
  name: string;
  shortName: string;
  totalQuestions: number;
  durationMinutes: number;
  marksPerCorrect: number;
  negativeMarksRatio: number; // e.g. 1/3 = 0.333
  negativeMarksPerWrong: number; // calculated e.g. 0.33 for CGSSB, 0.67 for CGPSC
  description: string;
  color: string;
  badge: string;
  isComingSoon?: boolean;
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuestionOption {
  id: 'A' | 'B' | 'C' | 'D';
  text: string;
  textHindi?: string;
}

export interface PYQAppearance {
  id?: string;
  examName: string;
  year: number;
  shift?: string;
}

export interface Question {
  id: string; // Unique Question ID (e.g. QID-CGSSB-2024-001)
  uniqueQuestionId?: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  questionText: string;
  text?: string; // alias for compatibility
  questionHindi?: string;
  textHindi?: string; // alias for compatibility
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  correctAnswer?: 'A' | 'B' | 'C' | 'D'; // alias for compatibility
  marks: number;
  negativeMarks: number;
  explanation: string;
  explanationHindi?: string;
  pypSource?: string;
  examSource?: string;
  pypAppearances?: PYQAppearance[]; // Multiple exam appearances with year and exam name
  repeatedInExams?: string[];
  similarQuestionIds?: string[];
  moduleId?: string;
  chapterId?: string;
  chapterName?: string;
  keyFactHindi?: string;
  category: ExamCategory;
  year?: number;
  createdAt?: string;
}

export type ExamPaper = MockTest;

export type QuestionPaletteStatus = 
  | 'not_visited' 
  | 'unanswered' 
  | 'answered' 
  | 'marked_for_review' 
  | 'answered_and_marked';

export interface MockTestSection {
  id: string;
  name: string;
  questionIds: string[];
}

export interface MockTest {
  id: string;
  title: string;
  category: ExamCategory;
  description: string;
  durationMinutes: number;
  totalMarks?: number;
  marksPerQuestion: number;
  negativeMarksPerQuestion: number;
  isPYP?: boolean;
  pypYear?: number;
  pypExamName?: string;
  sections: MockTestSection[];
  questionCount: number;
  attemptsCount: number;
  passingPercentage?: number;
  isPublished?: boolean;
  difficultyDistribution?: { easy: number; medium: number; hard: number };
  createdAt: string;
}

export interface PreviousYearPaper {
  id: string;
  title: string;
  examCategory: ExamCategory;
  year: number;
  totalQuestions: number;
  durationMinutes: number;
  marks: number;
  negativeMarkingRatio: string;
  testId?: string; // If linked to playable test
  linkedMockTestId?: string;
  isOfficialPaper?: boolean;
  paperSummary: string;
  subjectsWeightage: { subject: string; questionCount: number; percentage: number }[];
  downloadFileName?: string;
  fileSize?: string;
  downloadUrl?: string;
}

export interface SectorAnalysis {
  subject: string;
  total: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  score: number;
  maxScore: number;
  timeSpentSeconds?: number;
}

export interface TestAttempt {
  id: string;
  userId: string;
  userName: string;
  testId: string;
  testTitle: string;
  category: ExamCategory;
  submittedAt: string;
  timeTakenSeconds: number;
  totalDurationSeconds: number;
  responses: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
  questionStatuses: Record<string, QuestionPaletteStatus>;
  score: number;
  maxScore: number;
  percentage: number;
  accuracy: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  markedForReviewCount: number;
  negativeMarksDeducted: number;
  simulatedRank: number;
  totalParticipants: number;
  percentile: number;
  sectorAnalysis: SectorAnalysis[];
}

export interface HierarchicalSubjectNode {
  subject: string;
  topics: {
    name: string;
    subtopics: string[];
  }[];
}
