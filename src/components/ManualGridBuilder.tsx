import React, { useState } from 'react';
import { 
  X, 
  Grid, 
  Plus, 
  Trash2, 
  Save
} from 'lucide-react';
import { Question, ExamCategory, QuestionOption } from '../types';
import { CG_MASTER_SYLLABUS } from '../data/cgMasterSyllabus';
import { generateUniqueQuestionId, EXAM_PRESETS, ExamPreset, findSimilarQuestions } from '../utils/pypEngine';

interface ManualGridBuilderProps {
  onClose: () => void;
  onSavePaper: (paper: any) => void;
  existingQuestions?: Question[];
}

export const ManualGridBuilder: React.FC<ManualGridBuilderProps> = ({
  onClose,
  onSavePaper,
  existingQuestions = []
}) => {
  const [examTitle, setExamTitle] = useState('CGSSB Vyapam Combined Exam 2024');
  const [examCategory, setExamCategory] = useState<ExamCategory>('CGSSB');
  const [year, setYear] = useState<number>(2024);
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>('CGSSB');
  const [marksPerQ, setMarksPerQ] = useState(1.0);
  const [negativeMarksPerQ, setNegativeMarksPerQ] = useState(0.33);
  
  // Rows in the form grid
  const [rows, setRows] = useState<any[]>([
    {
      rowId: 'row-1',
      id: generateUniqueQuestionId('CGSSB', 2024, 1),
      uniqueQuestionId: generateUniqueQuestionId('CGSSB', 2024, 1),
      questionText: '',
      questionHindi: '',
      options: [
        { id: 'A', text: '', textHindi: '' },
        { id: 'B', text: '', textHindi: '' },
        { id: 'C', text: '', textHindi: '' },
        { id: 'D', text: '', textHindi: '' }
      ],
      correctOption: 'A',
      moduleId: 'cg_special',
      chapterId: 'cg-his-02',
      chapterName: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
      subject: 'Chhattisgarh General Studies',
      topic: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
      subtopic: 'Ratanpur & Raipur branches',
      difficulty: 'Medium',
      marks: 1.0,
      negativeMarks: 0.33,
      explanation: '',
      explanationHindi: '',
      keyFactHindi: ''
    }
  ]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Apply preset marks & negatives
  const handlePresetChange = (presetKey: ExamPreset) => {
    setSelectedPreset(presetKey);
    const p = EXAM_PRESETS[presetKey];
    setMarksPerQ(p.marksPerQ);
    setNegativeMarksPerQ(p.negativeMarksPerQ);
    setDurationMinutes(p.durationMinutes);
    setExamCategory(p.category);

    setRows(prev => prev.map(r => ({
      ...r,
      marks: p.marksPerQ,
      negativeMarks: p.negativeMarksPerQ
    })));
  };

  // Quick populate N empty rows
  const handleGenerateRows = (count: number) => {
    const newRows = [];
    for (let i = 1; i <= count; i++) {
      const qId = generateUniqueQuestionId(examCategory, year, i);
      newRows.push({
        rowId: `row-${i}-${Date.now()}`,
        id: qId,
        uniqueQuestionId: qId,
        questionText: '',
        questionHindi: '',
        options: [
          { id: 'A' as const, text: '', textHindi: '' },
          { id: 'B' as const, text: '', textHindi: '' },
          { id: 'C' as const, text: '', textHindi: '' },
          { id: 'D' as const, text: '', textHindi: '' }
        ],
        correctOption: 'A' as const,
        moduleId: 'cg_special',
        chapterId: 'cg-his-02',
        chapterName: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
        subject: 'Chhattisgarh General Studies',
        topic: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
        subtopic: 'General Subtopic',
        difficulty: (i % 3 === 0 ? 'Hard' : i % 2 === 0 ? 'Medium' : 'Easy') as 'Easy' | 'Medium' | 'Hard',
        marks: marksPerQ,
        negativeMarks: negativeMarksPerQ,
        explanation: '',
        explanationHindi: '',
        keyFactHindi: ''
      });
    }
    setRows(newRows);
    setNotification({ type: 'success', text: `Generated ${count} blank structured question rows ready for entry!` });
  };

  const handleAddSingleRow = () => {
    const nextNum = rows.length + 1;
    const qId = generateUniqueQuestionId(examCategory, year, nextNum);
    const newRow = {
      rowId: `row-${nextNum}-${Date.now()}`,
      id: qId,
      uniqueQuestionId: qId,
      questionText: '',
      questionHindi: '',
      options: [
        { id: 'A' as const, text: '', textHindi: '' },
        { id: 'B' as const, text: '', textHindi: '' },
        { id: 'C' as const, text: '', textHindi: '' },
        { id: 'D' as const, text: '', textHindi: '' }
      ],
      correctOption: 'A' as const,
      moduleId: 'cg_special',
      chapterId: 'cg-his-02',
      chapterName: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
      subject: 'Chhattisgarh General Studies',
      topic: 'कलचुरी राजवंश एवं रतनपुर/रायपुर शाखा',
      subtopic: 'General Subtopic',
      difficulty: 'Medium' as const,
      marks: marksPerQ,
      negativeMarks: negativeMarksPerQ,
      explanation: '',
      explanationHindi: '',
      keyFactHindi: ''
    };
    setRows([...rows, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: string, value: any) => {
    setRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleUpdateOption = (rowIndex: number, optId: 'A' | 'B' | 'C' | 'D', field: 'text' | 'textHindi', val: string) => {
    setRows(prev => {
      const updated = [...prev];
      const opts: QuestionOption[] = updated[rowIndex].options || [
        { id: 'A', text: '', textHindi: '' },
        { id: 'B', text: '', textHindi: '' },
        { id: 'C', text: '', textHindi: '' },
        { id: 'D', text: '', textHindi: '' }
      ];
      const targetOptIndex = opts.findIndex(o => o.id === optId);
      if (targetOptIndex >= 0) {
        opts[targetOptIndex] = { ...opts[targetOptIndex], [field]: val };
      }
      updated[rowIndex].options = opts;
      return updated;
    });
  };

  const handlePublish = () => {
    if (!examTitle.trim()) {
      setNotification({ type: 'error', text: 'Exam title is required.' });
      return;
    }

    const filledRows = rows.filter(r => (r.questionText && r.questionText.trim()) || (r.questionHindi && r.questionHindi.trim()));
    if (filledRows.length === 0) {
      setNotification({ type: 'error', text: 'Please fill in question text for at least 1 question.' });
      return;
    }

    const finalQuestions: Question[] = filledRows.map((r, i) => {
      const qText = r.questionText || r.questionHindi || '';
      const similar = findSimilarQuestions(qText, existingQuestions);
      const pastAppearances = similar.length > 0
        ? Array.from(new Set(similar.flatMap(s => s.repeatedInExams || [s.pypSource || 'Past Exam'])))
        : [`${examCategory} ${year}`];

      return {
        id: r.id || generateUniqueQuestionId(examCategory, year, i + 1),
        uniqueQuestionId: r.uniqueQuestionId || generateUniqueQuestionId(examCategory, year, i + 1),
        questionText: r.questionText || r.questionHindi || `Question ${i + 1}`,
        text: r.questionText || r.questionHindi || `Question ${i + 1}`,
        questionHindi: r.questionHindi || undefined,
        textHindi: r.questionHindi || undefined,
        options: r.options || [
          { id: 'A', text: 'Option A' },
          { id: 'B', text: 'Option B' },
          { id: 'C', text: 'Option C' },
          { id: 'D', text: 'Option D' }
        ],
        correctOption: r.correctOption || 'A',
        correctAnswer: r.correctOption || 'A',
        moduleId: r.moduleId || 'cg_special',
        chapterId: r.chapterId || 'cg-his-01',
        chapterName: r.chapterName || 'General Chhattisgarh Studies',
        subject: r.subject || 'Chhattisgarh General Studies',
        topic: r.chapterName || 'General Topic',
        subtopic: r.subtopic || 'General Subtopic',
        difficulty: r.difficulty || 'Medium',
        marks: r.marks || marksPerQ,
        negativeMarks: r.negativeMarks || negativeMarksPerQ,
        explanation: r.explanation || 'Official explanation.',
        explanationHindi: r.explanationHindi || undefined,
        keyFactHindi: r.keyFactHindi || undefined,
        repeatedInExams: pastAppearances,
        similarQuestionIds: similar.map(s => s.id),
        category: examCategory,
        year,
        pypSource: `${examCategory} ${year}`
      };
    });

    const newPaper = {
      id: `paper-${Date.now()}`,
      title: examTitle,
      category: examCategory,
      year,
      durationMinutes,
      totalQuestions: finalQuestions.length,
      totalMarks: finalQuestions.reduce((acc, q) => acc + q.marks, 0),
      marksPerQuestion: marksPerQ,
      negativeMarksPerQuestion: negativeMarksPerQ,
      questions: finalQuestions,
      sections: [
        {
          id: 'sec-all',
          name: 'All Sections',
          questionIds: finalQuestions.map(q => q.id)
        }
      ],
      questionCount: finalQuestions.length,
      attemptsCount: 0,
      description: `Indexed ${finalQuestions.length}-question paper with complete bilingual explanations and chapter mapping.`,
      isPublished: true,
      createdAt: new Date().toISOString()
    };

    onSavePaper(newPaper);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Interactive Question Form Grid</span>
              <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md font-mono">
                Bilingual CG Edition
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Direct structured data entry with Auto-QIDs, syllabus chapter tagging & repeat radar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Configuration Strip */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-4 text-xs shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-slate-400 block font-medium mb-1">Exam Paper Title</label>
            <input
              type="text"
              value={examTitle}
              onChange={e => setExamTitle(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white w-64 focus:border-blue-500 outline-none"
              placeholder="e.g. CGSSB Patwari Exam 2024"
            />
          </div>

          <div>
            <label className="text-slate-400 block font-medium mb-1">Preset Profile</label>
            <select
              value={selectedPreset}
              onChange={e => handlePresetChange(e.target.value as ExamPreset)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:border-blue-500 outline-none"
            >
              <option value="CGSSB">CGSSB / Vyapam (+1 / -0.33)</option>
              <option value="CGPSC">CGPSC Prelims (+2 / -0.67)</option>
              <option value="HOSTEL_WARDEN">Hostel Warden (+1 / -0.25)</option>
              <option value="CG_TEACHER">CG Teacher / Shikshak (+1 / -0.33)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block font-medium mb-1">Exam Year</label>
            <input
              type="number"
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white w-24 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-slate-400 block font-medium mb-1">Marks / Neg</label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                value={marksPerQ}
                onChange={e => setMarksPerQ(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white w-14 text-center"
              />
              <span className="text-slate-500">/</span>
              <input
                type="number"
                step="0.01"
                value={negativeMarksPerQ}
                onChange={e => setNegativeMarksPerQ(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-rose-400 w-16 text-center"
              />
            </div>
          </div>
        </div>

        {/* Rapid Generation Helpers */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Quick Rows:</span>
          {[5, 10, 25, 50].map(n => (
            <button
              key={n}
              onClick={() => handleGenerateRows(n)}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-blue-600/30 text-blue-300 border border-slate-700 hover:border-blue-500/40 font-mono transition"
            >
              +{n} Qs
            </button>
          ))}
          <button
            onClick={handleAddSingleRow}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 shadow-md shadow-blue-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className={`mx-6 mt-3 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Interactive Table Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {rows.map((row, idx) => {
          const currentModule = CG_MASTER_SYLLABUS.find(m => m.id === row.moduleId) || CG_MASTER_SYLLABUS[0];
          const chapters = currentModule.chapters;

          return (
            <div
              key={row.rowId || idx}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all space-y-3"
            >
              {/* Row Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold font-mono flex items-center justify-center text-xs border border-blue-500/30">
                    #{idx + 1}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                    {row.uniqueQuestionId}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Marks: <strong className="text-emerald-400">+{row.marks}</strong> / <strong className="text-rose-400">-{row.negativeMarks}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={row.moduleId || 'cg_special'}
                    onChange={e => {
                      const modId = e.target.value;
                      const mod = CG_MASTER_SYLLABUS.find(m => m.id === modId);
                      const defaultCh = mod?.chapters[0];
                      handleUpdateRow(idx, 'moduleId', modId);
                      handleUpdateRow(idx, 'subject', mod?.name);
                      if (defaultCh) {
                        handleUpdateRow(idx, 'chapterId', defaultCh.id);
                        handleUpdateRow(idx, 'chapterName', defaultCh.nameHindi);
                        handleUpdateRow(idx, 'topic', defaultCh.nameHindi);
                      }
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none"
                  >
                    {CG_MASTER_SYLLABUS.map(m => (
                      <option key={m.id} value={m.id}>{m.nameHindi}</option>
                    ))}
                  </select>

                  <select
                    value={row.chapterId}
                    onChange={e => {
                      const chId = e.target.value;
                      const ch = chapters.find(c => c.id === chId);
                      handleUpdateRow(idx, 'chapterId', chId);
                      if (ch) {
                        handleUpdateRow(idx, 'chapterName', ch.nameHindi);
                        handleUpdateRow(idx, 'topic', ch.nameHindi);
                      }
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-purple-300 border-purple-500/30 outline-none max-w-xs"
                  >
                    {chapters.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.nameHindi}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bilingual Question Text Input */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Question Text (English)
                  </label>
                  <textarea
                    rows={2}
                    value={row.questionText || ''}
                    onChange={e => handleUpdateRow(idx, 'questionText', e.target.value)}
                    placeholder="Enter question in English..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-emerald-400 font-medium block mb-1">
                    प्रश्न विवरण (हिन्दी / Chhattisgarhi)
                  </label>
                  <textarea
                    rows={2}
                    value={row.questionHindi || ''}
                    onChange={e => handleUpdateRow(idx, 'questionHindi', e.target.value)}
                    placeholder="हिन्दी में प्रश्न प्रविष्ट करें..."
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-emerald-200 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* 4 Options Grid with Radio Answer selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {(['A', 'B', 'C', 'D'] as const).map(optId => {
                  const opt = (row.options || []).find((o: any) => o.id === optId) || { id: optId, text: '', textHindi: '' };
                  const isCorrect = row.correctOption === optId;

                  return (
                    <div
                      key={optId}
                      className={`p-3 rounded-xl border transition-all ${
                        isCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10' 
                          : 'bg-slate-800/50 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                          isCorrect ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {optId}
                        </span>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${row.rowId || idx}`}
                            checked={isCorrect}
                            onChange={() => handleUpdateRow(idx, 'correctOption', optId)}
                            className="text-emerald-500 focus:ring-emerald-500"
                          />
                          <span className={`text-[11px] font-bold ${isCorrect ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isCorrect ? 'Correct' : 'Mark'}
                          </span>
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder={`Option ${optId} (En)`}
                        value={opt.text}
                        onChange={e => handleUpdateOption(idx, optId, 'text', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white mb-1.5 outline-none"
                      />
                      <input
                        type="text"
                        placeholder={`विकल्प ${optId} (हिन्दी)`}
                        value={opt.textHindi || ''}
                        onChange={e => handleUpdateOption(idx, optId, 'textHindi', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Explanations & Key Revision Fact */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 pt-1">
                <div>
                  <input
                    type="text"
                    placeholder="English explanation / rationale..."
                    value={row.explanation || ''}
                    onChange={e => handleUpdateRow(idx, 'explanation', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="विस्तृत हिन्दी व्याख्या..."
                    value={row.explanationHindi || ''}
                    onChange={e => handleUpdateRow(idx, 'explanationHindi', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-200 outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="⚡ 1-लाइन विशेष तथ्य (Quick Revision Fact)..."
                    value={row.keyFactHindi || ''}
                    onChange={e => handleUpdateRow(idx, 'keyFactHindi', e.target.value)}
                    className="w-full bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs text-amber-300 outline-none"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Footer Actions */}
      <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="text-xs text-slate-400">
          Total Ready Questions: <strong className="text-white font-mono">{rows.length}</strong> • 
          Estimated Total Marks: <strong className="text-emerald-400 font-mono">{(rows.length * marksPerQ).toFixed(1)}</strong>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center space-x-2 transition shadow-lg shadow-emerald-500/25"
          >
            <Save className="w-4 h-4" />
            <span>Publish Paper to Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
