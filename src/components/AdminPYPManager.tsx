import React, { useState } from 'react';
import { PreviousYearPaper, ExamCategory } from '../types';
import {
  FileText,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  Layers,
  BarChart,
  CheckCircle,
  Download,
  Grid,
  Sparkles,
  Hash,
  BookOpenCheck,
  Tag
} from 'lucide-react';
import { ManualGridBuilder } from './ManualGridBuilder';
import { AIPYPExtractorModal } from './AIPYPExtractorModal';

interface AdminPYPManagerProps {
  pypPapers: PreviousYearPaper[];
  onAddPYP: (pyp: Partial<PreviousYearPaper>) => void;
  onDeletePYP: (id: string) => void;
  onConvertPYPToMockTest: (pyp: PreviousYearPaper) => void;
}

export const AdminPYPManager: React.FC<AdminPYPManagerProps> = ({
  pypPapers,
  onAddPYP,
  onDeletePYP,
  onConvertPYPToMockTest,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGridBuilderOpen, setIsGridBuilderOpen] = useState(false);
  const [isAIExtractorOpen, setIsAIExtractorOpen] = useState(false);
  const [convertedNotice, setConvertedNotice] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    examCategory: ExamCategory;
    year: number;
    totalQuestions: number;
    durationMinutes: number;
    marks: number;
    negativeMarkingRatio: string;
    paperSummary: string;
    subjectsWeightage: { subject: string; questionCount: number; percentage: number }[];
  }>({
    title: '',
    examCategory: 'CGSSB',
    year: 2024,
    totalQuestions: 100,
    durationMinutes: 120,
    marks: 100,
    negativeMarkingRatio: '1/3rd (0.333)',
    paperSummary: '',
    subjectsWeightage: [
      { subject: 'Chhattisgarh General Studies', questionCount: 30, percentage: 30 },
      { subject: 'General Mental Ability & Reasoning', questionCount: 20, percentage: 20 },
      { subject: 'Hindi & Chhattisgarhi Bhasha', questionCount: 20, percentage: 20 },
      { subject: 'Computer Awareness', questionCount: 15, percentage: 15 },
      { subject: 'General Science & Environment', questionCount: 15, percentage: 15 },
    ],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onAddPYP({
      ...formData,
      isOfficialPaper: true,
      downloadFileName: `${formData.title.replace(/\s+/g, '_')}_Official.pdf`,
    });
    setIsModalOpen(false);
  };

  const handleConvert = (paper: PreviousYearPaper) => {
    onConvertPYPToMockTest(paper);
    setConvertedNotice(paper.title);
    setTimeout(() => setConvertedNotice(null), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-block mb-1">
            Official Exam Archives
          </span>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Previous Year Papers (PYP) Manager</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Archive, index, and convert genuine past exam question papers into live mock test simulations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsGridBuilderOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-blue-500/20 border border-blue-400/30 cursor-pointer"
          >
            <Grid className="w-4 h-4" />
            <span>Interactive Grid Form</span>
          </button>

          <button
            onClick={() => setIsAIExtractorOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Smart Ingest</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center space-x-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Quick Index PYP</span>
          </button>
        </div>
      </div>

      {convertedNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>{convertedNotice}</strong> has been converted into an active live mock test! Candidates can now practice it in real exam mode.
          </span>
        </div>
      )}

      {/* Papers Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pypPapers.map(paper => (
          <div
            key={paper.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                  {paper.examCategory}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Exam Year: {paper.year}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white">{paper.title}</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{paper.paperSummary}</p>

              {/* Specs */}
              <div className="mt-4 grid grid-cols-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Questions</span>
                  <span className="font-bold text-white">{paper.totalQuestions}</span>
                </div>
                <div className="border-x border-slate-700/50">
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="font-bold text-emerald-400">{paper.durationMinutes}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Negative</span>
                  <span className="font-bold text-rose-400">{paper.negativeMarkingRatio}</span>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div className="mt-3 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subject Weightages
                </span>
                {paper.subjectsWeightage.slice(0, 3).map((sw, i) => (
                  <div key={i} className="flex justify-between text-[11px] text-slate-300">
                    <span>{sw.subject}</span>
                    <span className="text-emerald-400 font-mono font-bold">{sw.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => onDeletePYP(paper.id)}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition text-xs flex items-center space-x-1"
                title="Remove paper from repository"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>

              <button
                onClick={() => handleConvert(paper)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Publish as Mock Test</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add PYP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl my-8 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Index New Previous Year Paper</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Official Paper Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CGSSB Hostel Superintendent 2022 Official Paper"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Exam Authority</label>
                  <select
                    value={formData.examCategory}
                    onChange={e => setFormData({ ...formData, examCategory: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="CGSSB">CGSSB</option>
                    <option value="CGPSC">CGPSC</option>
                    <option value="SWAMI_ATMANAND">Swami Atmanand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Exam Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) || 2024 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 120 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Paper Summary & Curriculum Trend</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Official notification summary, syllabus coverage, and cut-off highlights..."
                  value={formData.paperSummary}
                  onChange={e => setFormData({ ...formData, paperSummary: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
                >
                  Index & Save Paper
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Grid Builder Modal */}
      {isGridBuilderOpen && (
        <ManualGridBuilder
          onClose={() => setIsGridBuilderOpen(false)}
          onSavePaper={(paper) => {
            onAddPYP({
              title: paper.title,
              examCategory: paper.category === 'CGPSC' ? 'CGPSC' : 'CGSSB',
              year: paper.year,
              totalQuestions: paper.totalQuestions,
              durationMinutes: paper.durationMinutes,
              marks: paper.totalMarks,
              negativeMarkingRatio: paper.category.includes('CGPSC') ? '1/3rd (0.67)' : '1/3rd (0.333)',
              paperSummary: `Comprehensive ${paper.totalQuestions}-question paper aligned with official CG syllabus. Includes full bilingual explanations.`,
              subjectsWeightage: [
                { subject: 'Chhattisgarh General Studies', questionCount: Math.round(paper.totalQuestions * 0.4), percentage: 40 },
                { subject: 'Aptitude, Computer & Language', questionCount: Math.round(paper.totalQuestions * 0.6), percentage: 60 },
              ],
            });
            setIsGridBuilderOpen(false);
            setConvertedNotice(paper.title);
            setTimeout(() => setConvertedNotice(null), 3500);
          }}
          existingQuestions={[]}
        />
      )}

      {/* Gemini AI Smart Ingestion Modal */}
      {isAIExtractorOpen && (
        <AIPYPExtractorModal
          onClose={() => setIsAIExtractorOpen(false)}
          onExtracted={() => {
            setIsAIExtractorOpen(false);
            setIsGridBuilderOpen(true);
          }}
          existingQuestions={[]}
        />
      )}
    </div>
  );
};
