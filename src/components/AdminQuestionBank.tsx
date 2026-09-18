import React, { useState, useMemo } from 'react';
import { Question, DifficultyLevel, ExamCategory, PYQAppearance } from '../types';
import { HIERARCHY_TREE } from '../mockData';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Copy,
  Check,
  CheckCircle2,
  Tag,
  BookOpen,
  HelpCircle,
  Sparkles,
  Layers,
  Calendar,
  Award,
  ChevronRight,
  Flame,
  FileText,
  Clock,
  History,
  Info,
  Hash,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

interface AdminQuestionBankProps {
  questions: Question[];
  onAddQuestion: (q: Partial<Question>) => void;
  onUpdateQuestion: (id: string, q: Partial<Question>) => void;
  onDeleteQuestion: (id: string) => void;
}

// Preset common CG competitive exams for quick selection
const CG_EXAM_PRESETS = [
  'CGPSC State Service Prelims (Paper-I GS)',
  'CGPSC State Service Prelims (Paper-II CSAT)',
  'CGPSC State Service Mains',
  'CGSSB / CG Vyapam Combined Exam',
  'CGSSB Patwari Examination',
  'CGSSB Revenue Inspector (RI)',
  'CGSSB Mandi Inspector & Sub-Inspector',
  'CGSSB Hostel Warden (Chhatrawas Adhikshak)',
  'CGSSB Rural Agriculture Extension Officer',
  'CG Police Sub-Inspector (SI) Prelims',
  'CG Police Constable Recruitment',
  'CG Forest Guard & Ranger Exam',
  'CG TET (Teacher Eligibility Test) Paper-I',
  'CG TET (Teacher Eligibility Test) Paper-II',
  'Swami Atmanand English Medium Teacher Recruitment',
  'Swami Atmanand Lecturer / Principal Exam',
  'CG Vyapam Labour Inspector',
  'CG Vyapam Apex Bank Recruitment',
];

const RECENT_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];

export const AdminQuestionBank: React.FC<AdminQuestionBankProps> = ({
  questions,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>('ALL');
  const [selectedSubtopic, setSelectedSubtopic] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [pyqFilter, setPyqFilter] = useState<'ALL' | 'REPEATED' | 'SINGLE_PYQ' | 'PRACTICE'>('ALL');

  // Taxonomy Explorer toggle
  const [showTaxonomyTree, setShowTaxonomyTree] = useState(false);

  // Copied ID indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    subject: string;
    topic: string;
    subtopic: string;
    difficulty: DifficultyLevel;
    category: ExamCategory;
    questionText: string;
    questionHindi: string;
    options: { id: 'A' | 'B' | 'C' | 'D'; text: string; textHindi: string }[];
    correctOption: 'A' | 'B' | 'C' | 'D';
    marks: number;
    negativeMarks: number;
    explanation: string;
    explanationHindi: string;
    pypAppearances: PYQAppearance[];
  }>({
    id: '',
    subject: HIERARCHY_TREE[0].subject,
    topic: HIERARCHY_TREE[0].topics[0].name,
    subtopic: HIERARCHY_TREE[0].topics[0].subtopics[0],
    difficulty: 'Medium',
    category: 'CGSSB',
    questionText: '',
    questionHindi: '',
    options: [
      { id: 'A', text: '', textHindi: '' },
      { id: 'B', text: '', textHindi: '' },
      { id: 'C', text: '', textHindi: '' },
      { id: 'D', text: '', textHindi: '' },
    ],
    correctOption: 'A',
    marks: 1.0,
    negativeMarks: 0.333,
    explanation: '',
    explanationHindi: '',
    pypAppearances: [],
  });

  // Current Subject and Topic objects for cascading dropdowns
  const currentSubjectObj = HIERARCHY_TREE.find(s => s.subject === formData.subject) || HIERARCHY_TREE[0];
  const currentTopicObj = currentSubjectObj.topics.find(t => t.name === formData.topic) || currentSubjectObj.topics[0];

  // Helper to generate a unique question ID
  const generateUniqueId = (prefix = 'q-cg') => {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${Date.now().toString().slice(-4)}-${randomHex}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingQuestionId(null);
    setFormData({
      id: generateUniqueId('q-cg'),
      subject: HIERARCHY_TREE[0].subject,
      topic: HIERARCHY_TREE[0].topics[0].name,
      subtopic: HIERARCHY_TREE[0].topics[0].subtopics[0],
      difficulty: 'Medium',
      category: 'CGSSB',
      questionText: '',
      questionHindi: '',
      options: [
        { id: 'A', text: '', textHindi: '' },
        { id: 'B', text: '', textHindi: '' },
        { id: 'C', text: '', textHindi: '' },
        { id: 'D', text: '', textHindi: '' },
      ],
      correctOption: 'A',
      marks: 1.0,
      negativeMarks: 0.333,
      explanation: '',
      explanationHindi: '',
      pypAppearances: [
        {
          examName: 'CGSSB Combined Exam',
          year: 2023,
          shift: 'Morning Shift',
        },
      ],
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (q: Question) => {
    setEditingQuestionId(q.id);

    // Normalize appearances
    let appearances: PYQAppearance[] = [];
    if (q.pypAppearances && q.pypAppearances.length > 0) {
      appearances = [...q.pypAppearances];
    } else if (q.pypSource) {
      appearances = [{ examName: q.pypSource, year: 2022 }];
    }

    setFormData({
      id: q.id,
      subject: q.subject,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      category: q.category,
      questionText: q.questionText,
      questionHindi: q.questionHindi || '',
      options: q.options.map(o => ({
        id: o.id,
        text: o.text,
        textHindi: o.textHindi || '',
      })),
      correctOption: q.correctOption,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      explanation: q.explanation,
      explanationHindi: q.explanationHindi || '',
      pypAppearances: appearances,
    });
    setIsModalOpen(true);
  };

  // Clone Question Action
  const handleCloneQuestion = (q: Question) => {
    const clonedId = generateUniqueId('q-cg');
    const clonedQ: Partial<Question> = {
      ...q,
      id: clonedId,
      questionText: `${q.questionText} (Clone)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onAddQuestion(clonedQ);
  };

  // Form Submit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.questionText.trim()) return;

    const payload = {
      ...formData,
      id: formData.id.trim() || generateUniqueId('q-cg'),
      // Keep pypSource backwards compatible with first appearance if present
      pypSource: formData.pypAppearances.length > 0
        ? `${formData.pypAppearances[0].examName} ${formData.pypAppearances[0].year}`
        : '',
    };

    if (editingQuestionId) {
      onUpdateQuestion(editingQuestionId, payload);
    } else {
      onAddQuestion(payload);
    }
    setIsModalOpen(false);
  };

  // Add another exam appearance to the form
  const handleAddAppearance = () => {
    setFormData(prev => ({
      ...prev,
      pypAppearances: [
        ...prev.pypAppearances,
        {
          examName: 'CGPSC State Service Prelims (Paper-I GS)',
          year: 2022,
          shift: '',
        },
      ],
    }));
  };

  const handleRemoveAppearance = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pypAppearances: prev.pypAppearances.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateAppearance = (index: number, field: keyof PYQAppearance, value: any) => {
    setFormData(prev => {
      const updated = [...prev.pypAppearances];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, pypAppearances: updated };
    });
  };

  // Statistics Calculations
  const stats = useMemo(() => {
    const total = questions.length;
    let repeatedPyqCount = 0;
    let singlePyqCount = 0;
    let practiceCount = 0;

    questions.forEach(q => {
      const appearances = q.pypAppearances?.length || (q.pypSource ? 1 : 0);
      if (appearances > 1) {
        repeatedPyqCount++;
      } else if (appearances === 1) {
        singlePyqCount++;
      } else {
        practiceCount++;
      }
    });

    return { total, repeatedPyqCount, singlePyqCount, practiceCount };
  }, [questions]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
      const matchTopic = selectedTopic === 'ALL' || q.topic === selectedTopic;
      const matchSubtopic = selectedSubtopic === 'ALL' || q.subtopic === selectedSubtopic;
      const matchDifficulty = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      const matchCategory = selectedCategory === 'ALL' || q.category === selectedCategory;

      // PYQ Filter
      const appCount = q.pypAppearances?.length || (q.pypSource ? 1 : 0);
      let matchPyq = true;
      if (pyqFilter === 'REPEATED') matchPyq = appCount > 1;
      else if (pyqFilter === 'SINGLE_PYQ') matchPyq = appCount === 1;
      else if (pyqFilter === 'PRACTICE') matchPyq = appCount === 0;

      // Search matching text, unique ID, Hindi, topic, subtopic, or any exam/year appearance
      const s = search.toLowerCase().trim();
      const matchSearch =
        !s ||
        q.id.toLowerCase().includes(s) ||
        q.questionText.toLowerCase().includes(s) ||
        (q.questionHindi && q.questionHindi.toLowerCase().includes(s)) ||
        q.topic.toLowerCase().includes(s) ||
        q.subtopic.toLowerCase().includes(s) ||
        (q.pypSource && q.pypSource.toLowerCase().includes(s)) ||
        (q.pypAppearances &&
          q.pypAppearances.some(
            app =>
              app.examName.toLowerCase().includes(s) ||
              String(app.year).includes(s) ||
              (app.shift && app.shift.toLowerCase().includes(s))
          ));

      return matchSubject && matchTopic && matchSubtopic && matchDifficulty && matchCategory && matchPyq && matchSearch;
    });
  }, [questions, selectedSubject, selectedTopic, selectedSubtopic, selectedDifficulty, selectedCategory, pyqFilter, search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wider">
              Question Bank
            </span>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
              Subject → Topic → Subtopic Hierarchy
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white flex items-center space-x-2">
            <FolderTree className="w-5 h-5 text-emerald-400" />
            <span>Question Bank Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Maintain Subject → Topic → Subtopic taxonomic question hierarchy with difficulty tagging, unique question IDs, and multi-exam PYQ provenance.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowTaxonomyTree(!showTaxonomyTree)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition border ${
              showTaxonomyTree
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showTaxonomyTree ? 'Hide Tree' : 'Explore Tree'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Questions</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white">{stats.total}</span>
            <span className="text-xs text-slate-400">indexed</span>
          </div>
        </div>

        <div
          onClick={() => setPyqFilter(pyqFilter === 'REPEATED' ? 'ALL' : 'REPEATED')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            pyqFilter === 'REPEATED'
              ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-amber-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Multi-Exam PYQs</span>
            </span>
            {pyqFilter === 'REPEATED' && <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">ACTIVE</span>}
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-400">{stats.repeatedPyqCount}</span>
            <span className="text-xs text-slate-400">asked 2+ times</span>
          </div>
        </div>

        <div
          onClick={() => setPyqFilter(pyqFilter === 'SINGLE_PYQ' ? 'ALL' : 'SINGLE_PYQ')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            pyqFilter === 'SINGLE_PYQ'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Single Exam PYQs</span>
            </span>
            {pyqFilter === 'SINGLE_PYQ' && <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">ACTIVE</span>}
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-400">{stats.singlePyqCount}</span>
            <span className="text-xs text-slate-400">official exams</span>
          </div>
        </div>

        <div
          onClick={() => setPyqFilter(pyqFilter === 'PRACTICE' ? 'ALL' : 'PRACTICE')}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            pyqFilter === 'PRACTICE'
              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-md shadow-cyan-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-cyan-500/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Practice Items</span>
            </span>
            {pyqFilter === 'PRACTICE' && <span className="text-[9px] bg-cyan-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">ACTIVE</span>}
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-cyan-400">{stats.practiceCount}</span>
            <span className="text-xs text-slate-400">curated</span>
          </div>
        </div>
      </div>

      {/* TAXONOMY EXPLORER DRAWER / PANEL */}
      {showTaxonomyTree && (
        <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Subject → Topic → Subtopic Taxonomic Directory</h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Click any node to filter questions instantly
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {HIERARCHY_TREE.map(subj => {
              const subjQuestionsCount = questions.filter(q => q.subject === subj.subject).length;
              const isSelectedSubj = selectedSubject === subj.subject;

              return (
                <div
                  key={subj.subject}
                  className={`p-3 rounded-xl border transition ${
                    isSelectedSubj
                      ? 'bg-emerald-500/10 border-emerald-500/50'
                      : 'bg-slate-850/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    onClick={() => {
                      if (isSelectedSubj) {
                        setSelectedSubject('ALL');
                        setSelectedTopic('ALL');
                        setSelectedSubtopic('ALL');
                      } else {
                        setSelectedSubject(subj.subject);
                        setSelectedTopic('ALL');
                        setSelectedSubtopic('ALL');
                      }
                    }}
                    className="flex items-center justify-between cursor-pointer font-bold text-slate-200 hover:text-emerald-400 pb-2 border-b border-slate-800/80"
                  >
                    <span className="truncate pr-2">{subj.subject}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[10px] shrink-0">
                      {subjQuestionsCount} Qs
                    </span>
                  </div>

                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {subj.topics.map(topic => {
                      const topicQuestionsCount = questions.filter(
                        q => q.subject === subj.subject && q.topic === topic.name
                      ).length;
                      const isSelectedTopic = selectedSubject === subj.subject && selectedTopic === topic.name;

                      return (
                        <div
                          key={topic.name}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedSubject(subj.subject);
                            setSelectedTopic(isSelectedTopic ? 'ALL' : topic.name);
                            setSelectedSubtopic('ALL');
                          }}
                          className={`p-1.5 rounded-lg text-[11px] flex items-center justify-between cursor-pointer transition ${
                            isSelectedTopic
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate pl-1">› {topic.name}</span>
                          <span className="text-[10px] opacity-75 font-mono ml-2">
                            {topicQuestionsCount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {(selectedSubject !== 'ALL' || selectedTopic !== 'ALL' || selectedSubtopic !== 'ALL') && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-slate-500">Active Taxonomy Filter:</span>
                <span className="font-bold text-emerald-400">{selectedSubject}</span>
                {selectedTopic !== 'ALL' && (
                  <>
                    <span className="text-slate-600">›</span>
                    <span className="font-bold text-white">{selectedTopic}</span>
                  </>
                )}
                {selectedSubtopic !== 'ALL' && (
                  <>
                    <span className="text-slate-600">›</span>
                    <span className="font-bold text-slate-300">{selectedSubtopic}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedSubject('ALL');
                  setSelectedTopic('ALL');
                  setSelectedSubtopic('ALL');
                }}
                className="text-xs text-rose-400 hover:underline font-bold"
              >
                Clear Taxonomy Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* FILTER TOOLBAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search by ID, Topic, Text, Exam, Year */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Unique ID (e.g. q-cg-01), question text, exam, or year..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={e => {
                setSelectedSubject(e.target.value);
                setSelectedTopic('ALL');
                setSelectedSubtopic('ALL');
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 truncate"
            >
              <option value="ALL">All Subjects ({HIERARCHY_TREE.length})</option>
              {HIERARCHY_TREE.map(s => (
                <option key={s.subject} value={s.subject}>
                  {s.subject}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="CGSSB">CGSSB / Vyapam</option>
              <option value="CGPSC">CGPSC SSE</option>
              <option value="SWAMI_ATMANAND">Swami Atmanand</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Second row: Subtopic & PYQ Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              PYQ Filter:
            </span>
            <button
              onClick={() => setPyqFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                pyqFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              All Questions ({questions.length})
            </button>
            <button
              onClick={() => setPyqFilter('REPEATED')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                pyqFilter === 'REPEATED'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/30'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Multi-Exam PYQs ({stats.repeatedPyqCount})</span>
            </button>
            <button
              onClick={() => setPyqFilter('SINGLE_PYQ')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                pyqFilter === 'SINGLE_PYQ'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Single Exam PYQs ({stats.singlePyqCount})</span>
            </button>
            <button
              onClick={() => setPyqFilter('PRACTICE')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                pyqFilter === 'PRACTICE'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-cyan-500/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Practice Items ({stats.practiceCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-emerald-400 font-bold">{filteredQuestions.length}</strong> of {questions.length} questions
          </div>
        </div>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No questions matched your filters</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your taxonomy filters, search query, or PYQ frequency filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedSubject('ALL');
                setSelectedTopic('ALL');
                setSelectedSubtopic('ALL');
                setSelectedDifficulty('ALL');
                setSelectedCategory('ALL');
                setPyqFilter('ALL');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const appearances = q.pypAppearances || (q.pypSource ? [{ examName: q.pypSource, year: 2022 }] : []);
            const isRepeated = appearances.length > 1;

            return (
              <div
                key={q.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition space-y-4 shadow-md"
              >
                {/* Header Line: Unique Question ID, Taxonomic Path & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Unique Question ID */}
                    <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700 px-2.5 py-1 rounded-lg">
                      <Hash className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-xs font-black text-white">{q.id}</span>
                      <button
                        onClick={() => copyToClipboard(q.id)}
                        className="text-slate-400 hover:text-emerald-400 transition p-0.5 ml-1"
                        title="Copy Question ID"
                      >
                        {copiedId === q.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Taxonomic Breadcrumb */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {q.subject}
                      </span>
                      <span className="text-slate-600 font-bold">›</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {q.topic}
                      </span>
                      <span className="text-slate-600 font-bold">›</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 border border-slate-700/60">
                        {q.subtopic}
                      </span>
                    </div>
                  </div>

                  {/* Right Meta & Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                        q.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : q.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {q.difficulty}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-mono font-bold border border-slate-700">
                      +{q.marks} / -{q.negativeMarks.toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleCloneQuestion(q)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                      title="Clone Question with new Unique ID"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 transition border border-slate-700"
                      title="Edit Question"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition border border-slate-700"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* PYQ EXAM & YEAR APPEARANCES SECTION */}
                {appearances.length > 0 && (
                  <div
                    className={`p-3 rounded-xl border space-y-2 ${
                      isRepeated
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-850/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        {isRepeated ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px] flex items-center space-x-1 shadow">
                            <Flame className="w-3 h-3 fill-slate-950" />
                            <span>REPEATED PYQ • Asked in {appearances.length} Exams</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] flex items-center space-x-1">
                            <History className="w-3 h-3" />
                            <span>Official Previous Year Question (PYQ)</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Exam Year Provenance Verified
                      </span>
                    </div>

                    {/* Appearances Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {appearances.map((app, appIdx) => (
                        <div
                          key={appIdx}
                          className={`px-2.5 py-1 rounded-lg border text-xs font-semibold flex items-center space-x-2 ${
                            isRepeated
                              ? 'bg-slate-900 border-amber-500/40 text-amber-200'
                              : 'bg-slate-900 border-slate-700 text-slate-200'
                          }`}
                        >
                          <span className="text-emerald-400 font-bold">{app.examName}</span>
                          <span className="text-slate-500">•</span>
                          <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[11px] font-mono text-emerald-300 font-bold">
                            {app.year}
                          </span>
                          {app.shift && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-400 text-[10px]">{app.shift}</span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Statements (English & Hindi) */}
                <div className="space-y-2">
                  <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                    {q.questionText}
                  </p>
                  {q.questionHindi && (
                    <p className="text-xs sm:text-sm text-emerald-300/90 font-medium leading-relaxed border-l-2 border-emerald-500/40 pl-3 py-0.5">
                      {q.questionHindi}
                    </p>
                  )}
                </div>

                {/* Options Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {q.options.map(opt => {
                    const isCorrect = opt.id === q.correctOption;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-xl border text-[11px] flex items-start space-x-2 transition ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200 font-semibold'
                            : 'bg-slate-800/40 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-500 text-slate-950 font-black shadow'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div className="overflow-hidden">
                          <p className="truncate font-medium">{opt.text}</p>
                          {opt.textHindi && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{opt.textHindi}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-emerald-400 text-[10px] uppercase tracking-wider block">
                      Step-by-step Solution:
                    </span>
                    <p>{q.explanation}</p>
                    {q.explanationHindi && (
                      <p className="text-emerald-300/80 text-[11px] pt-1 border-t border-slate-850 mt-1">
                        {q.explanationHindi}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                  <FolderTree className="w-5 h-5 text-emerald-400" />
                  <span>{editingQuestionId ? 'Edit Question in Bank' : 'Add New Question to Taxonomic Bank'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure hierarchy, marking rules, unique ID, and all PYQ exam appearances.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              {/* Unique ID & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-850 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-bold">
                      Unique Question ID <span className="text-emerald-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, id: generateUniqueId('q-cg') })}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Auto-Generate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.id}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. q-cg-1024 or QID-VYAPAM-01"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Exam Category Target</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CGSSB">CGSSB / CG Vyapam</option>
                    <option value="CGPSC">CGPSC State Service Exam</option>
                    <option value="SWAMI_ATMANAND">Swami Atmanand Recruitment</option>
                  </select>
                </div>
              </div>

              {/* Taxonomic Selectors: Subject -> Topic -> Subtopic */}
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">
                  Taxonomic Hierarchy (Subject → Topic → Subtopic) <span className="text-emerald-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 mb-0.5 block">1. Subject</span>
                    <select
                      value={formData.subject}
                      onChange={e => {
                        const newSubj = e.target.value;
                        const subjObj = HIERARCHY_TREE.find(s => s.subject === newSubj) || HIERARCHY_TREE[0];
                        setFormData({
                          ...formData,
                          subject: newSubj,
                          topic: subjObj.topics[0].name,
                          subtopic: subjObj.topics[0].subtopics[0],
                        });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    >
                      {HIERARCHY_TREE.map(s => (
                        <option key={s.subject} value={s.subject}>
                          {s.subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 mb-0.5 block">2. Topic</span>
                    <select
                      value={formData.topic}
                      onChange={e => {
                        const newTopic = e.target.value;
                        const topicObj = currentSubjectObj.topics.find(t => t.name === newTopic) || currentSubjectObj.topics[0];
                        setFormData({
                          ...formData,
                          topic: newTopic,
                          subtopic: topicObj.subtopics[0] || 'General',
                        });
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    >
                      {currentSubjectObj.topics.map(t => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 mb-0.5 block">3. Subtopic</span>
                    <select
                      value={formData.subtopic}
                      onChange={e => setFormData({ ...formData, subtopic: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                    >
                      {currentTopicObj.subtopics.map(st => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Difficulty & Marking Scheme */}
              <div className="grid grid-cols-3 gap-3 bg-slate-850 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Difficulty Tag</label>
                  <select
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Positive Marks (+)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.marks}
                    onChange={e => setFormData({ ...formData, marks: parseFloat(e.target.value) || 1 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Negative Penalty (-)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.negativeMarks}
                    onChange={e => setFormData({ ...formData, negativeMarks: parseFloat(e.target.value) || 0.333 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              {/* PYQ Appearances (All Exams and Years Asked) */}
              <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-slate-200 font-bold flex items-center space-x-1.5">
                      <History className="w-4 h-4 text-emerald-400" />
                      <span>PYQ Provenance (Exams & Years Question Was Asked)</span>
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      If this question appeared in multiple exams over the years, add all appearances below.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAppearance}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-[11px] font-bold flex items-center space-x-1 transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Exam & Year</span>
                  </button>
                </div>

                {formData.pypAppearances.length === 0 ? (
                  <div className="text-center py-3 border border-dashed border-slate-700 rounded-xl text-slate-400">
                    <p>No PYQ appearances specified (this will be marked as a Standard Practice item).</p>
                    <button
                      type="button"
                      onClick={handleAddAppearance}
                      className="mt-1 text-emerald-400 hover:underline font-bold text-xs"
                    >
                      + Tag as a Previous Year Question (PYQ)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {formData.pypAppearances.map((app, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        {/* Exam Name Selector / Input */}
                        <div className="sm:col-span-6">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Exam Name</span>
                          <input
                            type="text"
                            list="exam-presets"
                            value={app.examName}
                            onChange={e => handleUpdateAppearance(idx, 'examName', e.target.value)}
                            placeholder="e.g. CGPSC SSE Prelims Paper-I"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                          />
                          <datalist id="exam-presets">
                            {CG_EXAM_PRESETS.map(preset => (
                              <option key={preset} value={preset} />
                            ))}
                          </datalist>
                        </div>

                        {/* Year */}
                        <div className="sm:col-span-3">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Exam Year</span>
                          <select
                            value={app.year}
                            onChange={e => handleUpdateAppearance(idx, 'year', parseInt(e.target.value) || 2023)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs font-mono"
                          >
                            {RECENT_YEARS.map(yr => (
                              <option key={yr} value={yr}>
                                {yr}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Shift / Paper */}
                        <div className="sm:col-span-2">
                          <span className="text-[10px] text-slate-400 block mb-0.5">Shift / Paper</span>
                          <input
                            type="text"
                            value={app.shift || ''}
                            onChange={e => handleUpdateAppearance(idx, 'shift', e.target.value)}
                            placeholder="e.g. GS Shift 1"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs"
                          />
                        </div>

                        {/* Delete Button */}
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveAppearance(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950 transition"
                            title="Remove this appearance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Question Text (English & Hindi) */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Question Text (English) <span className="text-emerald-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Enter standard question statement..."
                    value={formData.questionText}
                    onChange={e => setFormData({ ...formData, questionText: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Question Text (Hindi Translation - Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="प्रश्न का हिंदी विवरण दर्ज करें..."
                    value={formData.questionHindi}
                    onChange={e => setFormData({ ...formData, questionHindi: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Options A, B, C, D */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold">Options (A, B, C, D)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {formData.options.map((opt, i) => (
                    <div key={opt.id} className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">Option {opt.id}</span>
                        <label className="flex items-center space-x-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="correctOpt"
                            checked={formData.correctOption === opt.id}
                            onChange={() => setFormData({ ...formData, correctOption: opt.id })}
                            className="accent-emerald-500"
                          />
                          <span className="text-[10px] text-slate-300 font-bold">Correct Key</span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={`Option ${opt.id} text (English)`}
                        value={opt.text}
                        onChange={e => {
                          const updatedOpts = [...formData.options];
                          updatedOpts[i].text = e.target.value;
                          setFormData({ ...formData, options: updatedOpts });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${opt.id} text (Hindi)`}
                        value={opt.textHindi}
                        onChange={e => {
                          const updatedOpts = [...formData.options];
                          updatedOpts[i].textHindi = e.target.value;
                          setFormData({ ...formData, options: updatedOpts });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Explanation */}
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Step-by-Step Explanation & Justification (English)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide detailed justification of the right answer..."
                    value={formData.explanation}
                    onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Step-by-Step Explanation (Hindi - Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="उत्तर का हिंदी में विस्तृत विश्लेषण..."
                    value={formData.explanationHindi}
                    onChange={e => setFormData({ ...formData, explanationHindi: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition"
                >
                  {editingQuestionId ? 'Save Changes' : 'Save Question to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
