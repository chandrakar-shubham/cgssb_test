import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  EXAM_PATTERNS,
  HIERARCHY_TREE,
  INITIAL_QUESTIONS,
  INITIAL_MOCK_TESTS,
  INITIAL_PYP_PAPERS,
  SAMPLE_USER_ATTEMPTS
} from './src/mockData';
import {
  Question,
  MockTest,
  PreviousYearPaper,
  TestAttempt,
  SectorAnalysis,
  ExamCategory
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database Store (persisting across actions)
let questions: Question[] = [...INITIAL_QUESTIONS];
let mockTests: MockTest[] = [...INITIAL_MOCK_TESTS];
let pypPapers: PreviousYearPaper[] = [...INITIAL_PYP_PAPERS];
let attempts: TestAttempt[] = [...SAMPLE_USER_ATTEMPTS];

// Gemini Client initialization (server-side only)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS support for Android clients connecting over network
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // 1. Health & Android Status Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'CGSSB Test (cgssbtest.com)',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      androidCompatibility: {
        minSdkVersion: 24,
        targetSdkVersion: 34,
        supportsOfflineSync: true,
      },
    });
  });

  // 2. Exam Patterns
  app.get('/api/patterns', (req, res) => {
    res.json({ success: true, patterns: EXAM_PATTERNS });
  });

  // 3. Question Bank Hierarchy Tree
  app.get('/api/hierarchy', (req, res) => {
    res.json({ success: true, hierarchy: HIERARCHY_TREE });
  });

  // 4. Questions CRUD
  app.get('/api/questions', (req, res) => {
    const { subject, topic, subtopic, difficulty, category, search } = req.query;
    let filtered = [...questions];

    if (subject) filtered = filtered.filter(q => q.subject === subject);
    if (topic) filtered = filtered.filter(q => q.topic === topic);
    if (subtopic) filtered = filtered.filter(q => q.subtopic === subtopic);
    if (difficulty) filtered = filtered.filter(q => q.difficulty === difficulty);
    if (category) filtered = filtered.filter(q => q.category === category);
    if (search && typeof search === 'string') {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        q =>
          q.questionText.toLowerCase().includes(s) ||
          (q.questionHindi && q.questionHindi.toLowerCase().includes(s)) ||
          q.topic.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, total: filtered.length, questions: filtered });
  });

  app.post('/api/questions', (req, res) => {
    try {
      const qData = req.body;
      const newQuestion: Question = {
        id: qData.id || `q-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        subject: qData.subject || 'Chhattisgarh Special Knowledge',
        topic: qData.topic || 'General',
        subtopic: qData.subtopic || 'General',
        difficulty: qData.difficulty || 'Medium',
        category: qData.category || 'CGSSB',
        questionText: qData.questionText || '',
        questionHindi: qData.questionHindi || '',
        options: qData.options || [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ],
        correctOption: qData.correctOption || 'A',
        marks: Number(qData.marks) || 1.0,
        negativeMarks: Number(qData.negativeMarks) || 0.333,
        explanation: qData.explanation || '',
        explanationHindi: qData.explanationHindi || '',
        pypSource: qData.pypSource || '',
        pypAppearances: qData.pypAppearances || [],
        createdAt: new Date().toISOString().split('T')[0],
      };

      questions.unshift(newQuestion);
      res.status(201).json({ success: true, question: newQuestion });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }
    questions[index] = { ...questions[index], ...req.body, id };
    res.json({ success: true, question: questions[index] });
  });

  app.delete('/api/questions/:id', (req, res) => {
    const { id } = req.params;
    questions = questions.filter(q => q.id !== id);
    res.json({ success: true, message: 'Question deleted successfully' });
  });

  // 5. Mock Tests CRUD
  app.get('/api/tests', (req, res) => {
    const { category } = req.query;
    let list = [...mockTests];
    if (category) {
      list = list.filter(t => t.category === category);
    }
    res.json({ success: true, tests: list });
  });

  app.get('/api/tests/:id', (req, res) => {
    const test = mockTests.find(t => t.id === req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Gather question IDs from all sections
    const allQIds: string[] = [];
    test.sections.forEach(s => {
      s.questionIds.forEach(qid => {
        if (!allQIds.includes(qid)) allQIds.push(qid);
      });
    });

    const testQuestions = questions.filter(q => allQIds.includes(q.id));

    res.json({
      success: true,
      test,
      questions: testQuestions,
    });
  });

  app.post('/api/tests', (req, res) => {
    try {
      const data = req.body;
      const pattern = EXAM_PATTERNS[data.category as ExamCategory] || EXAM_PATTERNS.CGSSB;

      const newTest: MockTest = {
        id: `test-${Date.now()}`,
        title: data.title || 'New Mock Test',
        category: data.category || 'CGSSB',
        description: data.description || '',
        durationMinutes: Number(data.durationMinutes) || pattern.durationMinutes,
        totalMarks: Number(data.totalMarks) || pattern.totalQuestions * pattern.marksPerCorrect,
        marksPerQuestion: Number(data.marksPerQuestion) || pattern.marksPerCorrect,
        negativeMarksPerQuestion: Number(data.negativeMarksPerQuestion) || pattern.negativeMarksPerWrong,
        sections: data.sections || [
          {
            id: 'sec-1',
            name: 'Section 1',
            questionIds: data.questionIds || [],
          },
        ],
        questionCount: data.questionCount || (data.questionIds ? data.questionIds.length : 10),
        attemptsCount: 0,
        passingPercentage: data.passingPercentage || 45,
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      mockTests.unshift(newTest);
      res.status(201).json({ success: true, test: newTest });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 6. Test Submission & Analytics Evaluation Engine
  app.post('/api/tests/:id/submit', (req, res) => {
    try {
      const { id } = req.params;
      const {
        userId = 'u-student-01',
        userName = 'Aspirant Student',
        timeTakenSeconds = 600,
        responses = {},
        questionStatuses = {},
      } = req.body;

      const test = mockTests.find(t => t.id === id);
      if (!test) {
        return res.status(404).json({ success: false, error: 'Test not found' });
      }

      // Gather question objects
      const allQIds: string[] = [];
      test.sections.forEach(s => {
        s.questionIds.forEach(qid => {
          if (!allQIds.includes(qid)) allQIds.push(qid);
        });
      });

      const testQuestions = questions.filter(q => allQIds.includes(q.id));

      let correctCount = 0;
      let incorrectCount = 0;
      let unattemptedCount = 0;
      let markedForReviewCount = 0;
      let rawScore = 0;
      let negativeMarksDeducted = 0;

      // Group by subject for sector-wise analysis
      const sectorMap: Record<string, {
        total: number;
        correct: number;
        incorrect: number;
        unattempted: number;
        score: number;
        maxScore: number;
      }> = {};

      testQuestions.forEach(q => {
        const markedOption = responses[q.id];
        const status = questionStatuses[q.id];
        if (status === 'marked_for_review' || status === 'answered_and_marked') {
          markedForReviewCount++;
        }

        if (!sectorMap[q.subject]) {
          sectorMap[q.subject] = {
            total: 0,
            correct: 0,
            incorrect: 0,
            unattempted: 0,
            score: 0,
            maxScore: 0,
          };
        }
        sectorMap[q.subject].total++;
        sectorMap[q.subject].maxScore += q.marks;

        if (!markedOption) {
          unattemptedCount++;
          sectorMap[q.subject].unattempted++;
        } else if (markedOption === q.correctOption) {
          correctCount++;
          rawScore += q.marks;
          sectorMap[q.subject].correct++;
          sectorMap[q.subject].score += q.marks;
        } else {
          incorrectCount++;
          const penalty = q.negativeMarks || (q.marks * (1 / 3));
          rawScore -= penalty;
          negativeMarksDeducted += penalty;
          sectorMap[q.subject].incorrect++;
          sectorMap[q.subject].score -= penalty;
        }
      });

      const totalAttempted = correctCount + incorrectCount;
      const accuracy = totalAttempted > 0 ? (correctCount / totalAttempted) * 100 : 0;
      const finalScore = Math.max(0, parseFloat(rawScore.toFixed(2)));
      const maxPossibleScore = testQuestions.reduce((sum, q) => sum + q.marks, 0);
      const percentage = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0;

      // Simulated All-India Rank & Percentile
      const totalParticipants = (test.attemptsCount || 1200) + 1;
      test.attemptsCount = totalParticipants;

      // Rank formula simulation based on percentile score
      const percentile = Math.min(99.9, Math.max(15.0, parseFloat((percentage * 0.95 + (accuracy * 0.05)).toFixed(1))));
      const simulatedRank = Math.max(1, Math.round(totalParticipants * (1 - percentile / 100)));

      const sectorAnalysis: SectorAnalysis[] = Object.keys(sectorMap).map(subj => {
        const s = sectorMap[subj];
        const subAttempts = s.correct + s.incorrect;
        return {
          subject: subj,
          total: s.total,
          correct: s.correct,
          incorrect: s.incorrect,
          unattempted: s.unattempted,
          accuracy: subAttempts > 0 ? parseFloat(((s.correct / subAttempts) * 100).toFixed(1)) : 0,
          score: parseFloat(s.score.toFixed(2)),
          maxScore: parseFloat(s.maxScore.toFixed(2)),
          timeSpentSeconds: Math.round(timeTakenSeconds / Math.max(1, Object.keys(sectorMap).length)),
        };
      });

      const attemptResult: TestAttempt = {
        id: `att-${Date.now()}`,
        userId,
        userName,
        testId: test.id,
        testTitle: test.title,
        category: test.category,
        submittedAt: new Date().toISOString(),
        timeTakenSeconds,
        totalDurationSeconds: test.durationMinutes * 60,
        responses,
        questionStatuses,
        score: finalScore,
        maxScore: maxPossibleScore,
        percentage: parseFloat(percentage.toFixed(1)),
        accuracy: parseFloat(accuracy.toFixed(1)),
        correctCount,
        incorrectCount,
        unattemptedCount,
        markedForReviewCount,
        negativeMarksDeducted: parseFloat(negativeMarksDeducted.toFixed(2)),
        simulatedRank,
        totalParticipants,
        percentile,
        sectorAnalysis,
      };

      attempts.unshift(attemptResult);

      res.json({
        success: true,
        attempt: attemptResult,
        solutions: testQuestions,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Attempts History
  app.get('/api/attempts', (req, res) => {
    const { userId } = req.query;
    let list = [...attempts];
    if (userId) {
      list = list.filter(a => a.userId === userId);
    }
    res.json({ success: true, attempts: list });
  });

  app.get('/api/attempts/:id', (req, res) => {
    const attempt = attempts.find(a => a.id === req.params.id);
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }
    const test = mockTests.find(t => t.id === attempt.testId);
    let testQuestions: Question[] = [];
    if (test) {
      const qids: string[] = [];
      test.sections.forEach(s => qids.push(...s.questionIds));
      testQuestions = questions.filter(q => qids.includes(q.id));
    }
    res.json({ success: true, attempt, questions: testQuestions });
  });

  // 8. Previous Year Papers (PYP)
  app.get('/api/pyp', (req, res) => {
    const { category } = req.query;
    let list = [...pypPapers];
    if (category) {
      list = list.filter(p => p.examCategory === category);
    }
    res.json({ success: true, pypPapers: list });
  });

  app.post('/api/pyp', (req, res) => {
    try {
      const data = req.body;
      const newPyp: PreviousYearPaper = {
        id: `pyp-${Date.now()}`,
        title: data.title || 'Official Previous Year Paper',
        examCategory: data.examCategory || 'CGSSB',
        year: Number(data.year) || new Date().getFullYear() - 1,
        totalQuestions: Number(data.totalQuestions) || 100,
        durationMinutes: Number(data.durationMinutes) || 120,
        marks: Number(data.marks) || 100,
        negativeMarkingRatio: data.negativeMarkingRatio || '-⅓rd (0.33 Marks)',
        paperSummary: data.paperSummary || 'Official Solved Archive paper with detailed weightage.',
        subjectsWeightage: data.subjectsWeightage || [
          { subject: 'Chhattisgarh Special Knowledge', questionCount: 40, percentage: 40 },
          { subject: 'General Mental Ability & Reasoning', questionCount: 30, percentage: 30 },
          { subject: 'Language & Computers', questionCount: 30, percentage: 30 },
        ],
        downloadFileName: data.downloadFileName || `${data.title ? data.title.replace(/\s+/g, '_') : 'PYP_Paper'}.pdf`,
        fileSize: '3.2 MB',
      };

      pypPapers.unshift(newPyp);
      res.status(201).json({ success: true, pyp: newPyp });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // 9. AI-Powered Smart Mock Test Creator
  app.post('/api/ai/generate-test', async (req, res) => {
    try {
      const {
        examCategory = 'CGSSB',
        targetSubjects = [],
        pypReferenceId,
        questionCount = 10,
        difficultyRatio = { Easy: 40, Medium: 40, Hard: 20 },
        testTitle,
      } = req.body;

      const pattern = EXAM_PATTERNS[examCategory as ExamCategory] || EXAM_PATTERNS.CGSSB;
      const referencedPyp = pypReferenceId ? pypPapers.find(p => p.id === pypReferenceId) : null;

      // Query question bank that match target category and subjects
      let candidatePool = questions.filter(q => {
        const catMatch = q.category === examCategory || q.category === 'CGSSB';
        const subjMatch = targetSubjects.length === 0 || targetSubjects.includes(q.subject);
        return catMatch && subjMatch;
      });

      if (candidatePool.length < questionCount) {
        candidatePool = [...questions];
      }

      const ai = getGeminiClient();
      let generatedFreshQuestions: Question[] = [];

      if (ai) {
        try {
          const prompt = `You are a senior question paper setter for ${pattern.name}.
We are assembling an authentic mock test matching the historical pattern of: ${referencedPyp ? referencedPyp.title : pattern.name}.
Target Subjects: ${targetSubjects.length > 0 ? targetSubjects.join(', ') : 'Chhattisgarh Special Knowledge, Reasoning, Language, Computers'}.
Exam Pattern Rules:
- Marks per right question: ${pattern.marksPerCorrect}
- Negative marking per wrong answer: ${pattern.negativeMarksPerWrong}
- Number of fresh questions needed: ${Math.min(questionCount, 5)}
- Bilingual: Provide both English and Hindi text for each question, options, and explanation.

Respond strictly with a JSON object having key "questions" containing an array of objects matching:
{
  "subject": string,
  "topic": string,
  "subtopic": string,
  "difficulty": "Easy" | "Medium" | "Hard",
  "questionText": string,
  "questionHindi": string,
  "options": [{"id": "A", "text": string, "textHindi": string}, {"id": "B", "text": string, "textHindi": string}, {"id": "C", "text": string, "textHindi": string}, {"id": "D", "text": string, "textHindi": string}],
  "correctOption": "A" | "B" | "C" | "D",
  "explanation": string,
  "explanationHindi": string
}`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.4,
            },
          });

          const jsonText = response.text?.trim() || '{}';
          const parsed = JSON.parse(jsonText);
          if (Array.isArray(parsed.questions)) {
            generatedFreshQuestions = parsed.questions.map((item: any, idx: number) => ({
              id: `q-ai-${Date.now()}-${idx}`,
              subject: item.subject || 'Chhattisgarh Special Knowledge',
              topic: item.topic || 'General Topic',
              subtopic: item.subtopic || 'General Subtopic',
              difficulty: (['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : 'Medium') as any,
              category: examCategory as ExamCategory,
              questionText: item.questionText || 'Sample competitive question',
              questionHindi: item.questionHindi || '',
              options: Array.isArray(item.options) && item.options.length === 4 ? item.options : [
                { id: 'A', text: 'Option A' },
                { id: 'B', text: 'Option B' },
                { id: 'C', text: 'Option C' },
                { id: 'D', text: 'Option D' },
              ],
              correctOption: item.correctOption || 'A',
              marks: pattern.marksPerCorrect,
              negativeMarks: pattern.negativeMarksPerWrong,
              explanation: item.explanation || 'Detailed analysis step.',
              explanationHindi: item.explanationHindi || '',
              pypSource: `AI PYP Synthesizer (${referencedPyp ? referencedPyp.year : '2024'})`,
              createdAt: new Date().toISOString().split('T')[0],
            }));
            // Add generated questions to main question bank
            questions.push(...generatedFreshQuestions);
          }
        } catch (geminiError) {
          console.warn('Gemini API call skipped or fell back to tagged question bank synthesis:', geminiError);
        }
      }

      // Combine fresh questions and tagged bank questions to fill target count
      const finalSelectedQuestions: Question[] = [...generatedFreshQuestions];
      const neededFromBank = questionCount - finalSelectedQuestions.length;

      // Shuffle pool
      const shuffledBank = [...candidatePool].sort(() => 0.5 - Math.random());
      for (const q of shuffledBank) {
        if (finalSelectedQuestions.length >= questionCount) break;
        if (!finalSelectedQuestions.find(x => x.id === q.id)) {
          finalSelectedQuestions.push(q);
        }
      }

      // Group into balanced sections
      const sec1Questions = finalSelectedQuestions.slice(0, Math.ceil(finalSelectedQuestions.length / 2));
      const sec2Questions = finalSelectedQuestions.slice(Math.ceil(finalSelectedQuestions.length / 2));

      const newTest: MockTest = {
        id: `test-ai-${Date.now()}`,
        title: testTitle || `AI Smart Mock: ${pattern.shortName} Balanced Test`,
        category: examCategory as ExamCategory,
        description: `Automated AI-synthesized mock test aligned with ${referencedPyp ? referencedPyp.title : pattern.name} historical trends. Negative marking: -${pattern.negativeMarksRatio.toFixed(2)} (${pattern.negativeMarksPerWrong} marks).`,
        durationMinutes: Math.min(120, questionCount * 1.5),
        totalMarks: finalSelectedQuestions.reduce((s, q) => s + q.marks, 0),
        marksPerQuestion: pattern.marksPerCorrect,
        negativeMarksPerQuestion: pattern.negativeMarksPerWrong,
        sections: [
          {
            id: 'sec-ai-1',
            name: 'Section 1: Core Subject Specialization',
            questionIds: sec1Questions.map(q => q.id),
          },
          {
            id: 'sec-ai-2',
            name: 'Section 2: Aptitude, Reasoning & Language',
            questionIds: sec2Questions.map(q => q.id),
          },
        ],
        questionCount: finalSelectedQuestions.length,
        attemptsCount: 0,
        passingPercentage: 45,
        isPublished: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      mockTests.unshift(newTest);

      res.status(201).json({
        success: true,
        test: newTest,
        assembledQuestionCount: finalSelectedQuestions.length,
        aiGeneratedCount: generatedFreshQuestions.length,
        bankRetrievedCount: finalSelectedQuestions.length - generatedFreshQuestions.length,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 10. Android App Connectivity & Sync Endpoints
  app.get('/api/android/info', (req, res) => {
    const host = req.headers.host || 'cgssbtest.com';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${host}`;

    res.json({
      success: true,
      platform: 'CGSSB Test Android Integration Hub',
      version: 'v1.4.0',
      baseUrl,
      apiDocumentation: {
        authentication: {
          endpoint: 'POST /api/auth/login',
          description: 'Authenticate mobile user & obtain authorization token',
          samplePayload: { email: 'student@cgssbtest.com', password: 'password123', role: 'student' },
        },
        testsList: {
          endpoint: 'GET /api/tests?category=CGSSB',
          description: 'Fetch list of available active mock tests for mobile catalog',
        },
        testDetails: {
          endpoint: 'GET /api/tests/{testId}',
          description: 'Download full test paper with questions and options for offline/online test taking',
        },
        submitTest: {
          endpoint: 'POST /api/tests/{testId}/submit',
          description: 'Submit candidate responses and receive instant Rank, Accuracy & Solutions',
          samplePayload: {
            userId: 'u-android-student',
            timeTakenSeconds: 3400,
            responses: { 'q-cg-01': 'A', 'q-cg-02': 'B' },
          },
        },
        pypList: {
          endpoint: 'GET /api/pyp',
          description: 'Fetch Previous Year Papers archive with PDF download endpoints',
        },
        offlineSync: {
          endpoint: 'GET /api/android/sync',
          description: 'One-click full sync of categories, questions, and tests to populate Android SQLite / Room database',
        },
      },
      androidKotlinSnippet: `// Retrofit API Interface for CGSSB Test Android App
interface CgssbApiService {
    @GET("api/tests")
    suspend fun getMockTests(@Query("category") category: String?): Response<TestsResponse>

    @GET("api/tests/{id}")
    suspend fun getTestDetails(@Path("id") testId: String): Response<TestDetailsResponse>

    @POST("api/tests/{id}/submit")
    suspend fun submitTest(
        @Path("id") testId: String,
        @Body submission: TestSubmissionRequest
    ): Response<TestSubmissionResult>

    @GET("api/android/sync")
    suspend fun syncOfflineData(): Response<OfflineSyncPayload>
}`,
    });
  });

  // 11. Android Offline Full Sync Endpoint
  app.get('/api/android/sync', (req, res) => {
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      patterns: EXAM_PATTERNS,
      hierarchy: HIERARCHY_TREE,
      tests: mockTests,
      questions: questions,
      pypPapers: pypPapers,
    });
  });

  // Mount Vite middleware for dev or static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CGSSB Test Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
