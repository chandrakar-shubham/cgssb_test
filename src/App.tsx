/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { PYPSection } from './components/PYPSection';
import { AnalyticsHub } from './components/AnalyticsHub';
import { ExamEngine } from './components/ExamEngine';
import { SolutionsScreen } from './components/SolutionsScreen';
import { AdminQuestionBank } from './components/AdminQuestionBank';
import { AdminPYPManager } from './components/AdminPYPManager';
import { AdminAITestCreator } from './components/AdminAITestCreator';
import { AndroidConnectModal } from './components/AndroidConnectModal';
import { AuthModal } from './components/AuthModal';
import {
  MockTest,
  Question,
  PreviousYearPaper,
  TestAttempt,
  ExamCategory,
  QuestionPaletteStatus
} from './types';
import {
  INITIAL_MOCK_TESTS,
  INITIAL_QUESTIONS,
  INITIAL_PYP_PAPERS,
  INITIAL_ATTEMPTS
} from './mockData';

function MainApp() {
  const { user, deductCredits } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('tests');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | 'ALL'>('ALL');

  // Modals
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active Exam Session & Review
  const [activeExamTest, setActiveExamTest] = useState<MockTest | null>(null);
  const [activeAttemptReview, setActiveAttemptReview] = useState<TestAttempt | null>(null);

  // App Data State (Synced with localStorage and backend endpoints)
  const [tests, setTests] = useState<MockTest[]>(() => {
    try {
      const saved = localStorage.getItem('cgssb_tests');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MOCK_TESTS;
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem('cgssb_questions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_QUESTIONS;
  });

  const [pypPapers, setPypPapers] = useState<PreviousYearPaper[]>(() => {
    try {
      const saved = localStorage.getItem('cgssb_pyp');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PYP_PAPERS;
  });

  const [attempts, setAttempts] = useState<TestAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('cgssb_attempts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ATTEMPTS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('cgssb_tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('cgssb_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('cgssb_pyp', JSON.stringify(pypPapers));
  }, [pypPapers]);

  useEffect(() => {
    localStorage.setItem('cgssb_attempts', JSON.stringify(attempts));
  }, [attempts]);

  // Fetch initial data from server if reachable
  useEffect(() => {
    async function loadData() {
      try {
        const [testsRes, pypRes, qRes] = await Promise.all([
          fetch('/api/tests').catch(() => null),
          fetch('/api/pyp').catch(() => null),
          fetch('/api/questions').catch(() => null),
        ]);

        if (testsRes && testsRes.ok) {
          const t = await testsRes.json();
          if (Array.isArray(t) && t.length > 0) setTests(t);
          else if (t && Array.isArray(t.tests) && t.tests.length > 0) setTests(t.tests);
        }
        if (pypRes && pypRes.ok) {
          const p = await pypRes.json();
          if (Array.isArray(p) && p.length > 0) setPypPapers(p);
          else if (p && Array.isArray(p.papers) && p.papers.length > 0) setPypPapers(p.papers);
        }
        if (qRes && qRes.ok) {
          const q = await qRes.json();
          if (Array.isArray(q) && q.length > 0) setQuestions(q);
          else if (q && Array.isArray(q.questions) && q.questions.length > 0) setQuestions(q.questions);
        }
      } catch {
        // Fallback to local data
      }
    }
    loadData();
  }, []);

  // START TEST HANDLER
  const handleStartTest = (test: MockTest) => {
    // Check credits if student
    if (user?.role === 'student') {
      deductCredits(10);
    }
    setActiveAttemptReview(null);
    setActiveExamTest(test);
  };

  // PRACTICE PYP AS TEST HANDLER
  const handlePracticePaper = (paper: PreviousYearPaper) => {
    // Find or construct a mock test from this paper
    const existingTest = tests.find(t => t.id === paper.linkedMockTestId);
    if (existingTest) {
      handleStartTest(existingTest);
      return;
    }

    // Dynamic mock test from PYP
    const relevantQs = questions.filter(q => q.category === paper.examCategory);
    const pypTest: MockTest = {
      id: `pyp-test-${paper.id}`,
      title: `${paper.title} (Real Exam Simulation)`,
      category: paper.examCategory,
      description: `Official past paper simulation. Converted from archived examination ${paper.year}.`,
      durationMinutes: paper.durationMinutes,
      questionCount: relevantQs.length > 0 ? relevantQs.length : paper.totalQuestions,
      marksPerQuestion: paper.examCategory === 'CGPSC' ? 2.0 : 1.0,
      negativeMarksPerQuestion: paper.examCategory === 'CGPSC' ? 0.666 : 0.333,
      sections: [
        {
          id: 'pyp-sec-1',
          name: 'Official Exam Paper',
          questionIds: relevantQs.length > 0 ? relevantQs.map(q => q.id) : questions.map(q => q.id),
        },
      ],
      difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
      attemptsCount: 142,
      createdAt: new Date().toISOString(),
    };

    handleStartTest(pypTest);
  };

  // SUBMIT TEST HANDLER (Auto-calculates scores & negative marking)
  const handleSubmitTest = async (submission: {
    testId: string;
    timeTakenSeconds: number;
    responses: Record<string, 'A' | 'B' | 'C' | 'D' | null>;
    questionStatuses: Record<string, QuestionPaletteStatus>;
  }) => {
    if (!activeExamTest) return;

    const currentTest = activeExamTest;
    const testQs = questions.filter(q => {
      return currentTest.sections.some(s => s.questionIds.includes(q.id));
    });

    const activeQuestionList = testQs.length > 0 ? testQs : questions;

    // Try server calculation first
    try {
      const res = await fetch(`/api/tests/${currentTest.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeTakenSeconds: submission.timeTakenSeconds,
          responses: submission.responses,
        }),
      });

      if (res.ok) {
        const attempt = await res.json();
        setAttempts(prev => [attempt, ...prev]);
        setActiveExamTest(null);
        setActiveAttemptReview(attempt);
        return;
      }
    } catch (e) {
      console.warn('Server submission failed, performing local evaluation:', e);
    }

    // Local evaluation engine
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const subjectMap: Record<string, { total: number; correct: number; incorrect: number; unattempted: number }> = {};

    activeQuestionList.forEach(q => {
      const resp = submission.responses[q.id];
      if (!subjectMap[q.subject]) {
        subjectMap[q.subject] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
      }
      subjectMap[q.subject].total += 1;

      if (resp == null) {
        unattemptedCount += 1;
        subjectMap[q.subject].unattempted += 1;
      } else if (resp === q.correctOption) {
        correctCount += 1;
        subjectMap[q.subject].correct += 1;
      } else {
        incorrectCount += 1;
        subjectMap[q.subject].incorrect += 1;
      }
    });

    const marksPerQ = currentTest.marksPerQuestion || 1.0;
    const negPenaltyPerQ = currentTest.negativeMarksPerQuestion || 0.333;

    const rawScore = correctCount * marksPerQ;
    const negDeduction = Number((incorrectCount * negPenaltyPerQ).toFixed(2));
    const netScore = Number(Math.max(0, rawScore - negDeduction).toFixed(2));
    const maxScore = activeQuestionList.length * marksPerQ;
    const percentage = Number(((netScore / maxScore) * 100).toFixed(1));
    const attemptedCount = correctCount + incorrectCount;
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

    const sectorAnalysis = Object.keys(subjectMap).map(subj => {
      const data = subjectMap[subj];
      const subjMax = data.total * marksPerQ;
      const subjScore = Number(Math.max(0, data.correct * marksPerQ - data.incorrect * negPenaltyPerQ).toFixed(2));
      const subjAtt = data.correct + data.incorrect;
      const subjAcc = subjAtt > 0 ? Math.round((data.correct / subjAtt) * 100) : 0;
      return {
        subject: subj,
        total: data.total,
        correct: data.correct,
        incorrect: data.incorrect,
        unattempted: data.unattempted,
        accuracy: subjAcc,
        score: subjScore,
        maxScore: subjMax,
      };
    });

    const newAttempt: TestAttempt = {
      id: `att-${Date.now()}`,
      testId: currentTest.id,
      testTitle: currentTest.title,
      category: currentTest.category,
      userId: user?.id || 'guest',
      userName: user?.name || 'Aspirant Student',
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: submission.timeTakenSeconds,
      totalDurationSeconds: (currentTest.durationMinutes || 90) * 60,
      score: netScore,
      maxScore: maxScore,
      percentage: percentage,
      accuracy: accuracy,
      simulatedRank: Math.floor(Math.random() * 45) + 12,
      totalParticipants: 3850,
      percentile: Number((96.0 + Math.random() * 3.8).toFixed(1)),
      correctCount: correctCount,
      incorrectCount: incorrectCount,
      unattemptedCount: unattemptedCount,
      negativeMarksDeducted: negDeduction,
      responses: submission.responses,
      questionStatuses: submission.questionStatuses,
      markedForReviewCount: 0,
      sectorAnalysis: sectorAnalysis,
    };

    setAttempts(prev => [newAttempt, ...prev]);
    setActiveExamTest(null);
    setActiveAttemptReview(newAttempt);
  };

  // ADMIN QUESTION BANK ACTIONS
  const handleAddQuestion = (qData: Partial<Question>) => {
    const newQ: Question = {
      id: qData.id || `q-cg-${Date.now().toString().slice(-6)}`,
      subject: qData.subject || 'Chhattisgarh Special Knowledge',
      topic: qData.topic || 'General',
      subtopic: qData.subtopic || 'General',
      difficulty: qData.difficulty || 'Medium',
      category: qData.category || 'CGSSB',
      questionText: qData.questionText || '',
      questionHindi: qData.questionHindi || '',
      options: qData.options || [],
      correctOption: qData.correctOption || 'A',
      marks: qData.marks || 1.0,
      negativeMarks: qData.negativeMarks || 0.333,
      explanation: qData.explanation || '',
      explanationHindi: qData.explanationHindi || '',
      pypSource: qData.pypSource || '',
      pypAppearances: qData.pypAppearances || [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuestions(prev => [newQ, ...prev]);
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQ),
    }).catch(() => {});
  };

  const handleUpdateQuestion = (id: string, qData: Partial<Question>) => {
    setQuestions(prev => prev.map(q => (q.id === id ? { ...q, ...qData } : q)));
    fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(qData),
    }).catch(() => {});
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    fetch(`/api/questions/${id}`, {
      method: 'DELETE',
    }).catch(() => {});
  };

  // ADMIN PYP ACTIONS
  const handleAddPYP = (pypData: Partial<PreviousYearPaper>) => {
    const newPaper: PreviousYearPaper = {
      id: `pyp-${Date.now()}`,
      title: pypData.title || 'Official Exam Paper',
      examCategory: pypData.examCategory || 'CGSSB',
      year: pypData.year || 2024,
      totalQuestions: pypData.totalQuestions || 100,
      durationMinutes: pypData.durationMinutes || 120,
      marks: pypData.marks || 100,
      negativeMarkingRatio: pypData.negativeMarkingRatio || '1/3rd (0.333)',
      paperSummary: pypData.paperSummary || '',
      subjectsWeightage: pypData.subjectsWeightage || [],
      isOfficialPaper: true,
      downloadFileName: pypData.downloadFileName,
    };
    setPypPapers(prev => [newPaper, ...prev]);
  };

  const handleDeletePYP = (id: string) => {
    setPypPapers(prev => prev.filter(p => p.id !== id));
  };

  const handleConvertPYPToMockTest = (pyp: PreviousYearPaper) => {
    const newTest: MockTest = {
      id: `test-from-${pyp.id}`,
      title: `${pyp.title} (Official Mock Test)`,
      category: pyp.examCategory,
      description: `Official past paper simulation. Converted from archived examination ${pyp.year}.`,
      durationMinutes: pyp.durationMinutes,
      questionCount: pyp.totalQuestions,
      marksPerQuestion: pyp.examCategory === 'CGPSC' ? 2.0 : 1.0,
      negativeMarksPerQuestion: pyp.examCategory === 'CGPSC' ? 0.66 : 0.333,
      sections: [
        {
          id: `sec-${pyp.id}`,
          name: 'Official Exam Paper',
          questionIds: questions.filter(q => q.category === pyp.examCategory).map(q => q.id),
        },
      ],
      difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
      attemptsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setTests(prev => [newTest, ...prev]);
    setPypPapers(prev =>
      prev.map(p => (p.id === pyp.id ? { ...p, linkedMockTestId: newTest.id } : p))
    );
  };

  // ADMIN AI TEST CREATOR PUBLISH ACTION
  const handleTestPublished = (newTest: MockTest, newQuestions: Question[]) => {
    setQuestions(prev => [...newQuestions, ...prev]);
    setTests(prev => [newTest, ...prev]);
  };

  // 1. IF ACTIVE EXAM RUNNING -> RENDER DEDICATED FULLSCREEN EXAM ENGINE
  if (activeExamTest) {
    const examQuestions = questions.filter(q =>
      activeExamTest.sections.some(s => s.questionIds.includes(q.id))
    );
    const resolvedQuestions = examQuestions.length > 0 ? examQuestions : questions;

    return (
      <ExamEngine
        test={activeExamTest}
        questions={resolvedQuestions}
        onExit={() => setActiveExamTest(null)}
        onSubmit={handleSubmitTest}
      />
    );
  }

  // 2. IF ACTIVE ATTEMPT REVIEW -> RENDER SOLUTIONS & PERFORMANCE REPORT SCREEN
  if (activeAttemptReview) {
    const attemptQuestions = questions.filter(q =>
      Object.keys(activeAttemptReview.responses).includes(q.id)
    );
    const resolvedQuestions = attemptQuestions.length > 0 ? attemptQuestions : questions;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar
          activeTab={activeTab}
          setActiveTab={tab => {
            setActiveAttemptReview(null);
            setActiveTab(tab);
          }}
          onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />
        <main className="flex-1">
          <SolutionsScreen
            attempt={activeAttemptReview}
            questions={resolvedQuestions}
            onBackToDashboard={() => setActiveAttemptReview(null)}
            onReattempt={() => {
              const test = tests.find(t => t.id === activeAttemptReview.testId);
              if (test) {
                handleStartTest(test);
              }
            }}
          />
        </main>
      </div>
    );
  }

  // 3. MAIN PORTAL VIEWS
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1">
        {/* STUDENT VIEWS */}
        {activeTab === 'tests' && (
          <StudentDashboard
            tests={tests}
            onStartTest={handleStartTest}
            onSelectCategory={cat => setSelectedCategory(cat)}
            selectedCategory={selectedCategory}
          />
        )}

        {activeTab === 'pyp' && (
          <PYPSection
            pypPapers={pypPapers}
            onPracticePaper={handlePracticePaper}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenAdminPYP={() => setActiveTab('admin-pyp')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsHub
            attempts={attempts}
            onReviewAttempt={attempt => setActiveAttemptReview(attempt)}
            onExploreTests={() => setActiveTab('tests')}
          />
        )}

        {/* ADMIN VIEWS */}
        {activeTab === 'admin-questions' && (
          <AdminQuestionBank
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        )}

        {activeTab === 'admin-pyp' && (
          <AdminPYPManager
            pypPapers={pypPapers}
            onAddPYP={handleAddPYP}
            onDeletePYP={handleDeletePYP}
            onConvertPYPToMockTest={handleConvertPYPToMockTest}
          />
        )}

        {activeTab === 'admin-ai' && (
          <AdminAITestCreator
            pypPapers={pypPapers}
            onTestPublished={handleTestPublished}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white">
              CGSSB <span className="text-emerald-400">Test</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>cgssbtest.com</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-semibold">Live Mock Test & PYP Platform</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAndroidModalOpen(true)}
              className="text-slate-300 hover:text-emerald-400 transition"
            >
              Android App Sync & API
            </button>
            <span className="text-slate-600">|</span>
            <span>Chhattisgarh State Exam Preparation</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <AndroidConnectModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
