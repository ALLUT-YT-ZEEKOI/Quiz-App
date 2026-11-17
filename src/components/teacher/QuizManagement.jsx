import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Plus,
  Search,
  FileQuestion,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Clock,
  Award,
  Layers,
  X,
  Check,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';

export const QuizManagement = ({ initialOpenCreate = false, onCloseCreate = () => {} }) => {
  const {
    quizzes,
    subjects,
    questions,
    attempts,
    addQuiz,
    updateQuiz,
    deleteQuiz,
    togglePublishQuiz,
    setActiveView,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(initialOpenCreate);
  const [editModalQuiz, setEditModalQuiz] = useState(null);
  const [deleteConfirmQuiz, setDeleteConfirmQuiz] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    faculty: 'Dr. Rajesh Sharma',
    difficulty: 'Medium',
    durationMinutes: 15,
    totalMarks: 10,
    passingScorePct: 60,
    allowedAttempts: 2,
    status: 'Published',
    description: '',
    questionIds: []
  });

  const handleOpenCreate = () => {
    // Default pick questions for the first subject
    const defaultSubQuestions = questions
      .filter((q) => q.subjectId === 'CE-301')
      .slice(0, 10)
      .map((q) => q.id);

    setFormData({
      title: '',
      subjectId: 'CE-301',
      subjectName: 'Structural Analysis',
      faculty: 'Dr. Rajesh Sharma',
      difficulty: 'Medium',
      durationMinutes: 15,
      totalMarks: 12,
      passingScorePct: 60,
      allowedAttempts: 2,
      status: 'Published',
      description: 'Comprehensive assessment on core civil engineering principles.',
      questionIds: defaultSubQuestions
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (quiz) => {
    setEditModalQuiz(quiz);
    setFormData({
      title: quiz.title,
      subjectId: quiz.subjectId,
      subjectName: quiz.subjectName,
      faculty: quiz.faculty || 'Civil Engineering Faculty',
      difficulty: quiz.difficulty,
      durationMinutes: quiz.durationMinutes,
      totalMarks: quiz.totalMarks,
      passingScorePct: quiz.passingScorePct,
      allowedAttempts: quiz.allowedAttempts,
      status: quiz.status,
      description: quiz.description,
      questionIds: [...quiz.questionIds]
    });
  };

  const handleSubjectChange = (subjId) => {
    const foundSub = subjects.find((s) => s.id === subjId);
    const relatedQuestions = questions
      .filter((q) => q.subjectId === subjId)
      .slice(0, 10)
      .map((q) => q.id);

    setFormData({
      ...formData,
      subjectId: subjId,
      subjectName: foundSub ? foundSub.name : 'Civil Engineering',
      faculty: foundSub ? foundSub.faculty : 'Faculty',
      questionIds: relatedQuestions
    });
  };

  const toggleQuestionSelection = (qId) => {
    const exists = formData.questionIds.includes(qId);
    if (exists) {
      setFormData({
        ...formData,
        questionIds: formData.questionIds.filter((id) => id !== qId)
      });
    } else {
      setFormData({
        ...formData,
        questionIds: [...formData.questionIds, qId]
      });
    }
  };

  const handleSubmitQuiz = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please specify a title for the quiz', 'warning');
      return;
    }
    if (formData.questionIds.length === 0) {
      showToast('Please attach at least 1 question to the quiz', 'warning');
      return;
    }

    if (editModalQuiz) {
      updateQuiz(editModalQuiz.id, formData);
      setEditModalQuiz(null);
    } else {
      addQuiz(formData);
      setCreateModalOpen(false);
      onCloseCreate();
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmQuiz) {
      deleteQuiz(deleteConfirmQuiz.id);
      setDeleteConfirmQuiz(null);
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSub = subjectFilter === 'All' || q.subjectId === subjectFilter;
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesSub && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Civil Engineering Quiz Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold font-mono">
              {quizzes.length} Quizzes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure examination rules, publish status, timers, passing criteria, and question pools.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search quizzes by title or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <CustomDropdown
            value={subjectFilter}
            onChange={setSubjectFilter}
            options={[
              { value: 'All', label: 'All Subjects' },
              ...subjects.map((sub) => ({ value: sub.id, label: `${sub.code}: ${sub.name}` }))
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Published', label: 'Published Live' },
              { value: 'Draft', label: 'Draft (Hidden from students)' }
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          {(searchTerm || subjectFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSubjectFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop Responsive Table */}
      <div className="hidden md:block bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-5">Quiz Title & Subject</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-center">Questions</th>
                <th className="py-3.5 text-center">Duration</th>
                <th className="py-3.5 text-center">Pass %</th>
                <th className="py-3.5 text-center">Attempts Logged</th>
                <th className="py-3.5 text-center">Created Date</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No quizzes found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => {
                  const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
                  const isPublished = quiz.status === 'Published';

                  return (
                    <tr
                      key={quiz.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 pl-5">
                        <div className="font-bold text-slate-900 dark:text-white max-w-xs truncate">
                          {quiz.title}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {quiz.subjectName}
                          </span>
                          <span>•</span>
                          <span className="font-mono">{quiz.difficulty}</span>
                        </div>
                      </td>

                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => togglePublishQuiz(quiz.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            isPublished
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                          title="Click to toggle publish status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPublished ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{quiz.status}</span>
                        </button>
                      </td>

                      <td className="py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {quiz.questionIds.length} Qs
                      </td>

                      <td className="py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">
                        {quiz.durationMinutes} mins
                      </td>

                      <td className="py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                        {quiz.passingScorePct}%
                      </td>

                      <td className="py-3.5 text-center font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {quizAttempts.length} Submissions
                      </td>

                      <td className="py-3.5 text-center font-mono text-[11px] text-slate-400">
                        {quiz.createdDate}
                      </td>

                      <td className="py-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveView('results')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                            title="View Quiz Results"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(quiz)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Quiz"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmQuiz(quiz)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Alternatives */}
      <div className="md:hidden space-y-3">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {quiz.subjectName}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                  {quiz.title}
                </h3>
              </div>
              <button
                onClick={() => togglePublishQuiz(quiz.id)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  quiz.status === 'Published'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {quiz.status}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Questions</span>
                <span className="font-bold font-mono">{quiz.questionIds.length} Qs</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Duration</span>
                <span className="font-bold font-mono">{quiz.durationMinutes}m</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Passing</span>
                <span className="font-bold font-mono text-emerald-600">{quiz.passingScorePct}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400 text-[11px] font-mono">{quiz.createdDate}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(quiz)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirmQuiz(quiz)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Quiz Wizard Modal */}
      {(createModalOpen || editModalQuiz) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editModalQuiz ? 'Edit Quiz Settings & Questions' : 'Create New Civil Engineering Assessment'}
              </h3>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditModalQuiz(null);
                  onCloseCreate();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuiz} className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Structural Analysis – Determinate & Indeterminate Frames"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Civil Engineering Subject *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => handleSubjectChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}: {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Passing Criteria (%)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="100"
                    value={formData.passingScorePct}
                    onChange={(e) =>
                      setFormData({ ...formData, passingScorePct: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Allowed Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.allowedAttempts}
                    onChange={(e) =>
                      setFormData({ ...formData, allowedAttempts: Number(e.target.value) })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Publish Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Published">Published Live to Students</option>
                    <option value="Draft">Draft (Faculty Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quiz Description & Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline syllabus topics, calculator permissions, and grading rules."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Question Selection from Question Bank */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">
                    Select Questions from Bank ({formData.questionIds.length} Selected)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Showing available questions for {formData.subjectName}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {questions
                    .filter((q) => q.subjectId === formData.subjectId)
                    .map((q) => {
                      const isSelected = formData.questionIds.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleQuestionSelection(q.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100 font-semibold'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate mr-2">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-400'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <span className="truncate">{q.questionText}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono flex-shrink-0">
                            {q.difficulty}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditModalQuiz(null);
                    onCloseCreate();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/25"
                >
                  {editModalQuiz ? 'Save Quiz Changes' : 'Create & Publish Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Quiz Confirmation */}
      {deleteConfirmQuiz && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete Quiz?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Are you sure you want to delete "{deleteConfirmQuiz.title}"? Students will no longer
                be able to attempt this quiz.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmQuiz(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-500/20"
              >
                Delete Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

