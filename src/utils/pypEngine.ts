import { Question, ExamCategory } from '../types';

export type ExamPreset = 'CGSSB' | 'CGPSC' | 'HOSTEL_WARDEN' | 'CG_TEACHER';

export interface ExamPresetConfig {
  name: string;
  category: ExamCategory;
  marksPerQ: number;
  negativeMarksPerQ: number;
  durationMinutes: number;
  defaultModule: string;
}

export const EXAM_PRESETS: Record<ExamPreset, ExamPresetConfig> = {
  CGSSB: {
    name: 'CGSSB / CG Vyapam Combined Exam Standard',
    category: 'CGSSB',
    marksPerQ: 1.0,
    negativeMarksPerQ: 0.33,
    durationMinutes: 180,
    defaultModule: 'cg_special'
  },
  CGPSC: {
    name: 'CGPSC State Service Prelims (Paper-I GS)',
    category: 'CGPSC',
    marksPerQ: 2.0,
    negativeMarksPerQ: 0.67,
    durationMinutes: 120,
    defaultModule: 'cg_special'
  },
  HOSTEL_WARDEN: {
    name: 'CGSSB Hostel Warden (छात्रावास अधीक्षक)',
    category: 'CGSSB',
    marksPerQ: 1.0,
    negativeMarksPerQ: 0.25,
    durationMinutes: 150,
    defaultModule: 'computer'
  },
  CG_TEACHER: {
    name: 'CG Teacher Eligibility / Atmanand Recruitment',
    category: 'SWAMI_ATMANAND',
    marksPerQ: 1.0,
    negativeMarksPerQ: 0.33,
    durationMinutes: 150,
    defaultModule: 'cdp_education'
  }
};

/**
 * Generates an official unique question identifier:
 * e.g. QID-CGSSB-2024-001 or QID-CGPSC-2023-042
 */
export function generateUniqueQuestionId(
  category: ExamCategory | string,
  year: number,
  sequenceNum: number
): string {
  let prefix = 'CGSSB';
  if (category.includes('CGPSC')) prefix = 'CGPSC';
  else if (category.includes('Teacher') || category.includes('TET') || category.includes('SWAMI')) prefix = 'CGTET';
  else if (category.includes('Police')) prefix = 'CGPOL';
  else if (category.includes('CENTRAL')) prefix = 'CENTRAL';

  const paddedNum = String(sequenceNum).padStart(3, '0');
  return `QID-${prefix}-${year}-${paddedNum}`;
}

/**
 * Calculates string similarity (Levenshtein-based token overlap) to detect repeated questions
 */
export function calculateQuestionSimilarity(q1Text: string, q2Text: string): number {
  if (!q1Text || !q2Text) return 0;
  
  const cleanTokens = (t: string) => 
    t.toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

  const tokens1 = cleanTokens(q1Text);
  const tokens2 = cleanTokens(q2Text);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set2 = new Set(tokens2);
  let matchCount = 0;

  tokens1.forEach(t => {
    if (set2.has(t)) matchCount++;
  });

  const overlap1 = matchCount / tokens1.length;
  const overlap2 = matchCount / tokens2.length;
  return Math.round(((overlap1 + overlap2) / 2) * 100);
}

/**
 * Finds questions in existing question bank that match above threshold (70%+)
 */
export function findSimilarQuestions(
  newQuestionText: string,
  existingBank: Question[],
  thresholdPercent = 65
): Array<Question & { similarityScore: number }> {
  if (!newQuestionText || !existingBank || existingBank.length === 0) return [];

  const matches: Array<Question & { similarityScore: number }> = [];

  for (const q of existingBank) {
    const text1 = q.questionText || q.text || '';
    const textHindi1 = q.questionHindi || q.textHindi || '';
    const scoreEn = calculateQuestionSimilarity(newQuestionText, text1);
    const scoreHi = textHindi1 ? calculateQuestionSimilarity(newQuestionText, textHindi1) : 0;
    const maxScore = Math.max(scoreEn, scoreHi);

    if (maxScore >= thresholdPercent) {
      matches.push({
        ...q,
        similarityScore: maxScore
      });
    }
  }

  return matches.sort((a, b) => b.similarityScore - a.similarityScore);
}
