import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ExamCategory, MockTest } from '../types';
import { EXAM_PATTERNS } from '../mockData';
import {
  Clock,
  Award,
  AlertCircle,
  Play,
  CheckCircle2,
  BookOpen,
  Filter,
  Search,
  Zap,
  Info,
  ChevronRight,
  TrendingUp,
  Target
} from 'lucide-react';

interface StudentDashboardProps {
  tests: MockTest[];
  onStartTest: (test: MockTest) => void;
  onSelectCategory: (category: ExamCategory) => void;
  selectedCategory: ExamCategory | 'ALL';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  tests,
  onStartTest,
  onSelectCategory,
  selectedCategory,
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatternModal, setSelectedPatternModal] = useState<ExamCategory | null>(null);

  const categories: { id: ExamCategory | 'ALL'; label: string; badge?: string }[] = [
    { id: 'ALL', label: 'All Exams' },
    { id: 'CGSSB', label: 'CGSSB / Vyapam', badge: '100 Qs • +1 • -⅓' },
    { id: 'CGPSC', label: 'CGPSC SSE', badge: '100 Qs • +2 • -⅓' },
    { id: 'SWAMI_ATMANAND', label: 'Swami Atmanand', badge: '100 Qs • +1 • -⅓' },
    { id: 'CENTRAL_EXAMS', label: 'Central (Rail, SSC, Bank)', badge: 'Coming Soon' },
  ];

  const filteredTests = tests.filter(test => {
    const matchesCategory = selectedCategory === 'ALL' || test.category === selectedCategory;
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Student Profile & Quick Stats Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xl shadow-inner shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Welcome back, {user?.name || 'Aspirant'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Target: CG State Exams 2024-25
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Practice Chhattisgarh Vyapam, CGPSC SSE Prelims & Swami Atmanand recruitments.
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-5 shrink-0">
            <div className="bg-slate-950/60 rounded-xl p-2 sm:p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Credits</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 flex items-center justify-center space-x-1 mt-0.5">
                <Zap className="w-3 h-3 fill-emerald-400" />
                <span>{user?.credits || 0}</span>
              </span>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-2 sm:p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Practiced</span>
              <span className="text-sm sm:text-base font-black text-white flex items-center justify-center space-x-1 mt-0.5">
                <Target className="w-3 h-3 text-blue-400" />
                <span>4</span>
              </span>
            </div>
            <div className="bg-slate-950/60 rounded-xl p-2 sm:p-2.5 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Accuracy</span>
              <span className="text-sm sm:text-base font-black text-teal-300 flex items-center justify-center space-x-1 mt-0.5">
                <TrendingUp className="w-3 h-3 text-teal-400" />
                <span>88.5%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Categories Navigation Tabs */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center space-x-2">
            <span>Official Exam Portals & Mock Tests</span>
          </h2>
          <span className="text-xs text-slate-400 hidden sm:inline">Filter by target authority</span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id as any)}
                className={`px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                {cat.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isSelected
                        ? 'bg-slate-950/20 text-slate-950'
                        : cat.badge === 'Coming Soon'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Category Pattern Guide Banner */}
      {selectedCategory !== 'ALL' && EXAM_PATTERNS[selectedCategory as ExamCategory] && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <div className="p-1.5 bg-emerald-500/15 rounded-lg text-emerald-400 mt-0.5 shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs sm:text-sm">
                  {EXAM_PATTERNS[selectedCategory as ExamCategory].name}
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-emerald-300 font-semibold border border-slate-700">
                  Official Pattern
                </span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed text-xs">
                {EXAM_PATTERNS[selectedCategory as ExamCategory].description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPatternModal(selectedCategory as ExamCategory)}
            className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold text-xs transition border border-slate-700 shrink-0"
          >
            Syllabus & Marking
          </button>
        </div>
      )}

      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search mock tests..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-emerald-400 font-bold">{filteredTests.length}</span> tests ready for practice
        </div>
      </div>

      {/* Mock Tests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredTests.map(test => {
          const pattern = EXAM_PATTERNS[test.category];
          return (
            <div
              key={test.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-emerald-950/20 group"
            >
              <div>
                {/* Card Top Category Pill & Questions Count */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-950 border border-slate-800 text-emerald-400">
                    {pattern?.shortName || test.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{test.durationMinutes} Mins</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {test.title}
                </h3>

                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {test.description}
                </p>

                {/* Exam Marking Spec Pill Box */}
                <div className="mt-3.5 bg-slate-950/70 rounded-xl p-2 border border-slate-850 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Questions</span>
                    <span className="font-bold text-white text-xs">{test.questionCount} Qs</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Correct</span>
                    <span className="font-bold text-emerald-400 text-xs">+{test.marksPerQuestion}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Negative</span>
                    <span className="font-bold text-rose-400 text-xs">
                      -{test.negativeMarksPerQuestion.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Section breakdown tags */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {test.sections.map(sec => (
                    <span
                      key={sec.id}
                      className="px-2 py-0.5 rounded bg-slate-800/70 text-[10px] text-slate-300 font-medium"
                    >
                      {sec.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span className="text-slate-300 font-semibold">{test.attemptsCount.toLocaleString()}</span> attempted
                </div>
                <button
                  onClick={() => onStartTest(test)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm active:scale-95"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Start Test</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Exams Coming Soon Preview Section */}
      {selectedCategory === 'CENTRAL_EXAMS' && (
        <div className="mt-8 bg-gradient-to-br from-amber-950/30 via-slate-800 to-slate-900 border border-amber-600/40 rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/40 inline-block mb-2">
            In Active Development
          </span>
          <h3 className="text-lg font-bold text-white">Central Competitive Exams (Railway, SSC, Banking, UPSC)</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            The curriculum setters are indexing previous 10 years question banks for RRB NTPC, SSC CGL Tier 1 & 2, IBPS PO/Clerk, and UPSC CSE Prelims. Full mock test series will launch shortly.
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <button
              onClick={() => onSelectCategory('CGSSB')}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition"
            >
              Practice CGSSB Tests Now
            </button>
          </div>
        </div>
      )}

      {/* Pattern Modal */}
      {selectedPatternModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{EXAM_PATTERNS[selectedPatternModal].name}</span>
              </h3>
              <button
                onClick={() => setSelectedPatternModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                <span className="font-bold text-emerald-400 block mb-1">Official Pattern & Duration</span>
                <p>{EXAM_PATTERNS[selectedPatternModal].description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">Positive Marks</span>
                  <span className="text-sm font-bold text-emerald-400">
                    +{EXAM_PATTERNS[selectedPatternModal].marksPerCorrect} Marks
                  </span>
                </div>
                <div className="bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block text-[10px]">Negative Penalty</span>
                  <span className="text-sm font-bold text-rose-400">
                    -{EXAM_PATTERNS[selectedPatternModal].negativeMarksPerWrong.toFixed(2)} Marks (1/3rd)
                  </span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPatternModal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
