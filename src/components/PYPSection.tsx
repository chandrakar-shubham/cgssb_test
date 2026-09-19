import React, { useState } from 'react';
import { PreviousYearPaper, ExamCategory, MockTest } from '../types';
import {
  FileText,
  Download,
  Play,
  Calendar,
  Clock,
  Award,
  BookOpen,
  CheckCircle,
  BarChart,
  Layers,
  Sparkles,
  Grid,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PYPSectionProps {
  pypPapers: PreviousYearPaper[];
  onPracticePaper: (pyp: PreviousYearPaper) => void;
  selectedCategory: ExamCategory | 'ALL';
  onSelectCategory: (category: ExamCategory | 'ALL') => void;
  onOpenAdminPYP?: () => void;
}

export const PYPSection: React.FC<PYPSectionProps> = ({
  pypPapers,
  onPracticePaper,
  selectedCategory,
  onSelectCategory,
  onOpenAdminPYP,
}) => {
  const { user, switchRole } = useAuth();
  const [activePaperForAnalysis, setActivePaperForAnalysis] = useState<PreviousYearPaper | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const filteredPapers = pypPapers.filter(paper => {
    return selectedCategory === 'ALL' || paper.examCategory === selectedCategory;
  });

  const handleDownload = (paper: PreviousYearPaper) => {
    // Generate text/pdf simulation download
    const content = `========================================================
CGSSB TEST (cgssbtest.com) - OFFICIAL PREVIOUS YEAR PAPER
========================================================
Title: ${paper.title}
Exam Category: ${paper.examCategory}
Year: ${paper.year}
Total Questions: ${paper.totalQuestions}
Duration: ${paper.durationMinutes} Minutes
Total Marks: ${paper.marks}
Negative Marking: ${paper.negativeMarkingRatio}

EXAMINATION SUMMARY:
${paper.paperSummary}

SUBJECT-WISE WEIGHTAGE ANALYSIS:
${paper.subjectsWeightage.map(s => `- ${s.subject}: ${s.questionCount} Questions (${s.percentage}%)`).join('\n')}

========================================================
Verified and Archived by CGSSB Test Academic Wing.
Visit https://cgssbtest.com for online mock test simulation.
========================================================
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = paper.downloadFileName || `${paper.title.replace(/\s+/g, '_')}_Official.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(paper.title);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center space-x-1.5 mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Official Exam Archive & Solution Vault</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Previous Year Papers (PYP) Repository
          </h1>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Practice past year question papers conducted by CG Vyapam, CGPSC, and Swami Atmanand authorities under genuine timed exam conditions with automated negative marking calculation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => {
              if (user?.role !== 'admin') switchRole('admin');
              if (onOpenAdminPYP) onOpenAdminPYP();
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Open Ingestion Grid & AI</span>
          </button>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Paper archive downloaded: <strong>{downloadSuccess}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400">PDF Ready</span>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {(['ALL', 'CGSSB', 'CGPSC', 'SWAMI_ATMANAND'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat === 'ALL' ? 'All Previous Papers' : cat === 'CGSSB' ? 'CGSSB / Vyapam' : cat === 'CGPSC' ? 'CGPSC SSE' : 'Swami Atmanand'}
          </button>
        ))}
      </div>

      {/* PYP Papers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {filteredPapers.map(paper => (
          <div
            key={paper.id}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition shadow-md"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-emerald-400">
                  {paper.examCategory}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1 font-semibold">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Exam Year: {paper.year}</span>
                </span>
              </div>

              <h3 className="font-bold text-sm sm:text-base text-white hover:text-emerald-300 transition-colors">
                {paper.title}
              </h3>

              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {paper.paperSummary}
              </p>

              {/* Exam Marking Rules Pill Box */}
              <div className="mt-3.5 bg-slate-950/70 rounded-xl p-2.5 border border-slate-850 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Questions</span>
                  <span className="font-bold text-white text-xs">{paper.totalQuestions} Qs</span>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="font-bold text-emerald-400 text-xs">{paper.durationMinutes} Mins</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Negative</span>
                  <span className="font-bold text-rose-400 text-xs">{paper.negativeMarkingRatio}</span>
                </div>
              </div>

              {/* Subject Weightage Bars */}
              <div className="mt-3.5 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                  <BarChart className="w-3 h-3 text-emerald-400" />
                  <span>Historical Subject Weightage</span>
                </span>
                <div className="space-y-1">
                  {paper.subjectsWeightage.slice(0, 3).map((sub, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 truncate max-w-[200px]">{sub.subject}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{sub.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setActivePaperForAnalysis(paper)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition border border-slate-700"
              >
                Weightage Analysis
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(paper)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-700"
                  title="Download Solved Paper"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => onPracticePaper(paper)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow-sm active:scale-95"
                >
                  <Play className="w-3 h-3 fill-slate-950" />
                  <span>Practice Test</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paper Weightage Details Modal */}
      {activePaperForAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{activePaperForAnalysis.title}</h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  Exam Pattern & Sectional Weightage Matrix ({activePaperForAnalysis.year})
                </span>
              </div>
              <button
                onClick={() => setActivePaperForAnalysis(null)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                {activePaperForAnalysis.paperSummary}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-200 mb-2">Subject Distribution in This Exam:</h4>
                <div className="space-y-2">
                  {activePaperForAnalysis.subjectsWeightage.map((item, idx) => (
                    <div key={idx} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-200 font-semibold">{item.subject}</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {item.questionCount} Questions ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => handleDownload(activePaperForAnalysis)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Save Question Paper</span>
              </button>
              <button
                onClick={() => {
                  const p = activePaperForAnalysis;
                  setActivePaperForAnalysis(null);
                  onPracticePaper(p);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Start Timed Exam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
