import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Plus,
  HelpCircle,
  Filter,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  BookOpen,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export const QuestionBank = ({ initialOpenAdd = false, onCloseAdd = () => {} }) => {
  const { questions, subjects, addQuestion, updateQuestion, deleteQuestion, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(initialOpenAdd);
  const [editQuestionItem, setEditQuestionItem] = useState(null);
  const [previewQuestionItem, setPreviewQuestionItem] = useState(null);
  const [deleteConfirmQuestion, setDeleteConfirmQuestion] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    subjectId: 'CE-301',
    subjectName: 'Structural Analysis',
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'Medium',
    marks: 1
  });

  const handleOpenAdd = () => {
    setFormData({
      subjectId: 'CE-301',
      subjectName: 'Structural Analysis',
      questionText: '',
      questionType: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'Medium',
      marks: 1
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditQuestionItem(q);
    setFormData({
      subjectId: q.subjectId,
      subjectName: q.subjectName,
      questionText: q.questionText,
      questionType: q.questionType || 'mcq',
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      marks: q.marks || 1
    });
  };

  const handleSubjectChangeInForm = (subjId) => {
    const foundSub = subjects.find((s) => s.id === subjId);
    setFormData({
      ...formData,
      subjectId: subjId,
      subjectName: foundSub ? foundSub.name : 'Civil Engineering'
    });
  };

  const handleOptionTextChange = (index, val) => {
    const newOpts = [...formData.options];
    newOpts[index] = val;
    setFormData({ ...formData, options: newOpts });
  };

  const handleSubmitQuestion = (e) => {
    e.preventDefault();
    if (!formData.questionText.trim()) {
      showToast('Please enter the question text', 'warning');
      return;
    }
    if (formData.options.some((opt) => !opt.trim())) {
      showToast('Please fill in all 4 MCQ options', 'warning');
      return;
    }

    if (editQuestionItem) {
      updateQuestion(editQuestionItem.id, formData);
      setEditQuestionItem(null);
    } else {
      addQuestion(formData);
      setIsAddModalOpen(false);
      onCloseAdd();
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmQuestion) {
      deleteQuestion(deleteConfirmQuestion.id);
      setDeleteConfirmQuestion(null);
    }
  };

  // Filtered questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = selectedSubject === 'All' || q.subjectId === selectedSubject;
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDiff;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Civil Engineering Question Bank
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold font-mono">
              {questions.length} Questions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Curated repository of IS-code aligned problems, explanations, and multi-choice questions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by keywords, formulas, codes (e.g. IS 456, slump, Darcy)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Subject Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All 10 Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code}: {sub.name}
              </option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {(searchTerm || selectedSubject !== 'All' || selectedDifficulty !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('All');
                setSelectedDifficulty('All');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-3.5">
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 text-xs">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-500" />
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              No questions found
            </p>
            <p className="mt-1">Try adjusting your search criteria or select another subject.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-5 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-blue-300 dark:hover:border-slate-700 transition-all space-y-3"
            >
              {/* Question Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                    #{idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    {q.subjectName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewQuestionItem(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                    title="Preview Question"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmQuestion(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                {q.questionText}
              </p>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = optIdx === q.correctAnswer;
                  return (
                    <div
                      key={optIdx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between ${
                        isCorrect
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>
                      {isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Collapsible/Footer */}
              {q.explanation && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="text-blue-700 dark:text-blue-400 mr-1.5">
                    Technical Explanation:
                  </strong>
                  {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {(isAddModalOpen || editQuestionItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editQuestionItem ? 'Edit Question Details' : 'Add New Civil Engineering Question'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditQuestionItem(null);
                  onCloseAdd();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuestion} className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Subject Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subject Discipline *
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => handleSubjectChangeInForm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
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
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question Text * (Problem statement or theoretical concept)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. As per IS 456:2000, what is the maximum compressive strain in concrete..."
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* 4 MCQ Options */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Multiple Choice Options & Select Correct Key *
                </label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, correctAnswer: idx })}
                      className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition-all ${
                        formData.correctAnswer === idx
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                      }`}
                      title="Click to mark as correct answer"
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      value={opt}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                    />
                    {formData.correctAnswer === idx && (
                      <span className="text-[11px] font-bold text-emerald-600 px-2">Correct</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Marks & Question Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Question Type
                  </label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="mcq">Single Answer MCQ</option>
                    <option value="true_false">True / False</option>
                    <option value="multiple_select">Multiple Selection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marks Assigned
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Technical Explanation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Technical Explanation & IS Code References
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. As per IS 456:2000 Clause 38.1(b)..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditQuestionItem(null);
                    onCloseAdd();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/25"
                >
                  {editQuestionItem ? 'Save Question Changes' : 'Add to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Question Modal */}
      {previewQuestionItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                {previewQuestionItem.subjectName} ({previewQuestionItem.difficulty})
              </span>
              <button
                onClick={() => setPreviewQuestionItem(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {previewQuestionItem.questionText}
            </p>

            <div className="space-y-2 text-xs">
              {previewQuestionItem.options.map((opt, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    i === previewQuestionItem.correctAnswer
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-800 dark:text-emerald-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>
                    {String.fromCharCode(65 + i)}. {opt}
                  </span>
                  {i === previewQuestionItem.correctAnswer && (
                    <span className="text-[10px] text-emerald-600 font-bold">Correct Key</span>
                  )}
                </div>
              ))}
            </div>

            {previewQuestionItem.explanation && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">Explanation: </span>
                {previewQuestionItem.explanation}
              </div>
            )}

            <button
              onClick={() => setPreviewQuestionItem(null)}
              className="w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Delete Question Confirmation */}
      {deleteConfirmQuestion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Question from Bank?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                "{deleteConfirmQuestion.questionText}"
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmQuestion(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-500/20"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

