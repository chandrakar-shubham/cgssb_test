import React from 'react';
import { TestAttempt } from '../types';
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  BarChart3,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Zap,
  Target
} from 'lucide-react';

interface AnalyticsHubProps {
  attempts: TestAttempt[];
  onReviewAttempt: (attempt: TestAttempt) => void;
  onExploreTests: () => void;
}

export const AnalyticsHub: React.FC<AnalyticsHubProps> = ({
  attempts,
  onReviewAttempt,
  onExploreTests,
}) => {
  const totalAttempts = attempts.length;
  const avgAccuracy = totalAttempts > 0
    ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts)
    : 0;
  const avgScore = totalAttempts > 0
    ? (attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts).toFixed(1)
    : '0';
  const bestRank = totalAttempts > 0
    ? Math.min(...attempts.map(a => a.simulatedRank))
    : '-';

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Overview Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mb-2">
            Historical Progress Hub
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Performance & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Track your score trajectories, test attempts history, negative marking discipline, and estimated All-India rankings for CGSSB and CGPSC exams.
          </p>
        </div>

        {/* Global Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium block">Tests Attempted</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-white">{totalAttempts}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium block">Average Accuracy</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-teal-300">{avgAccuracy}%</span>
              <span className="text-[10px] text-teal-400 font-semibold">Normalized</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium block">Average Score</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{avgScore}</span>
              <span className="text-[10px] text-slate-400 font-semibold">Marks</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850">
            <span className="text-[10px] text-slate-400 font-medium block">Best Rank</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-amber-400">#{bestRank}</span>
              <span className="text-[10px] text-amber-400 font-semibold">Top Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attempt History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white">Completed Mock Tests & Previous Attempts</h2>
            <p className="text-xs text-slate-400">Click on any attempt to inspect question solutions and sector analysis.</p>
          </div>
          <button
            onClick={onExploreTests}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center space-x-1"
          >
            <span>Take New Test</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No mock tests attempted yet. Practice your first CGSSB or CGPSC test to see your analytics!
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map(att => (
              <div
                key={att.id}
                onClick={() => onReviewAttempt(att)}
                className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-emerald-400 border border-slate-700">
                      {att.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{new Date(att.submittedAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {att.testTitle}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                    <span>Rank: <strong className="text-amber-400">#{att.simulatedRank}</strong></span>
                    <span>•</span>
                    <span>Accuracy: <strong className="text-teal-300">{att.accuracy}%</strong></span>
                    <span>•</span>
                    <span>Neg. penalty: <strong className="text-rose-400">-{att.negativeMarksDeducted}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:border-l sm:border-slate-700/60 sm:pl-4">
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 block font-mono">
                      {att.score} / {att.maxScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{att.percentage}% score</span>
                  </div>
                  <button className="p-2 rounded-xl bg-slate-700 group-hover:bg-emerald-500 text-slate-300 group-hover:text-slate-950 transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
