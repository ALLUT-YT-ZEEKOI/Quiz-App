import React, { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Upload, Pencil, Trash2, ListChecks, Check, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { confirmDialog } from '../common/ConfirmDialog';
import { BulkQuestionUploadModal } from '../curriculum/BulkQuestionUploadModal';
import { Modal, Toggle, primaryBtn, secondaryBtn, inputCls, labelCls } from './MockTestUi';
import { formatDuration } from '../../utils/mockTests';

const LETTERS = ['A', 'B', 'C', 'D'];
const newQuestionId = () => `MQ-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Add or edit one question. */
const QuestionFormModal = ({ open, onClose, onSave, question }) => {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setText(question?.questionText || '');
    setOptions(question?.options?.length === 4 ? [...question.options] : ['', '', '', '']);
    setCorrect(Number.isInteger(question?.correctAnswer) ? question.correctAnswer : 0);
    setExplanation(question?.explanation || '');
    setError('');
  }, [open, question]);

  const save = (addAnother) => {
    if (!text.trim()) return setError('Enter the question.');
    if (options.some((o) => !o.trim())) return setError('Fill in all four options.');
    onSave(
      {
        id: question?.id || newQuestionId(),
        questionText: text.trim(),
        options: options.map((o) => o.trim()),
        correctAnswer: correct,
        explanation: explanation.trim(),
        difficulty: question?.difficulty || 'Medium'
      },
      addAnother
    );
    if (addAnother) {
      setText('');
      setOptions(['', '', '', '']);
      setCorrect(0);
      setExplanation('');
      setError('');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={ListChecks}
      title={question ? 'Edit Question' : 'Add Question'}
      subtitle="Choose the correct option with the circle next to it"
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryBtn}>Cancel</button>
          {!question && (
            <button type="button" onClick={() => save(true)} className={secondaryBtn}>Save & Add Another</button>
          )}
          <button type="button" onClick={() => save(false)} className={primaryBtn}>
            {question ? 'Save Question' : 'Add Question'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls} htmlFor="mq-text">Question</label>
          <textarea id="mq-text" rows={3} className={inputCls} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </div>
        <fieldset className="space-y-2">
          <legend className={labelCls}>Options</legend>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCorrect(i)}
                aria-label={`Mark option ${LETTERS[i]} as correct`}
                aria-pressed={correct === i}
                className={`w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-extrabold transition-colors ${
                  correct === i
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:border-emerald-400'
                }`}
              >
                {correct === i ? <Check className="w-4 h-4" /> : LETTERS[i]}
              </button>
              <input
                className={inputCls}
                value={opt}
                placeholder={`Option ${LETTERS[i]}`}
                onChange={(e) => setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))}
              />
            </div>
          ))}
          <p className="text-[11px] text-slate-500">Correct answer: <strong className="text-emerald-600 dark:text-emerald-400">Option {LETTERS[correct]}</strong></p>
        </fieldset>
        <div>
          <label className={labelCls} htmlFor="mq-exp">Explanation (optional, shown to students after they submit)</label>
          <textarea id="mq-exp" rows={2} className={inputCls} value={explanation} onChange={(e) => setExplanation(e.target.value)} />
        </div>
        {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    </Modal>
  );
};

/** Admin page for one mock test's questions. */
export const MockTestQuestions = ({ testId, onBack }) => {
  const { mockTests, updateMockTest, showToast } = useApp();
  const test = mockTests.find((t) => t.id === testId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  if (!test) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={onBack} className={secondaryBtn}><ArrowLeft className="w-4 h-4" /> Back to Mock Tests</button>
        <p className="text-sm text-slate-500">This mock test no longer exists.</p>
      </div>
    );
  }

  const questions = test.questions || [];

  const setQuestions = (next) => {
    const fields = { questions: next };
    // A visible test must have questions
    if (!next.length && test.enabled) {
      fields.enabled = false;
      showToast('The last question was removed, so this mock test is now hidden from students.', 'info', 5000);
    }
    updateMockTest(test.id, fields);
  };

  const handleSave = (q, addAnother) => {
    const exists = questions.some((x) => x.id === q.id);
    setQuestions(exists ? questions.map((x) => (x.id === q.id ? q : x)) : [...questions, q]);
    showToast(exists ? 'Question updated' : 'Question added', 'success', 2000);
    if (!addAnother) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  const handleDelete = async (q, idx) => {
    const ok = await confirmDialog({
      title: `Delete question ${idx + 1}?`,
      message: q.questionText,
      confirmLabel: 'Delete',
      tone: 'danger'
    });
    if (!ok) return;
    setQuestions(questions.filter((x) => x.id !== q.id));
  };

  const handleBulkImport = (items) => {
    const added = items.map((it) => ({
      id: newQuestionId(),
      questionText: it.question,
      options: it.options,
      correctAnswer: it.correctAnswer,
      explanation: it.explanation || '',
      difficulty: it.difficulty || 'Medium'
    }));
    setQuestions([...questions, ...added]);
    showToast(`${added.length} question${added.length === 1 ? '' : 's'} added to "${test.title}"`, 'success');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <button type="button" onClick={onBack} className={secondaryBtn}>
        <ArrowLeft className="w-4 h-4" /> Back to Mock Tests
      </button>

      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-[#087F8C]/15 dark:border-slate-800 shadow-premium space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#087F8C] dark:text-teal-300">Day {test.day}</span>
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">{test.title}</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
              <span><strong>{questions.length}</strong> questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(test.durationMinutes)}</span>
              <span>{test.allowRetest ? 'Retest allowed' : 'One attempt only'}</span>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button type="button" onClick={() => setBulkOpen(true)} className={secondaryBtn}>
              <Upload className="w-4 h-4" /> Bulk Upload
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className={primaryBtn}
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <Toggle
            checked={!!test.enabled}
            disabled={!questions.length}
            onChange={(v) => updateMockTest(test.id, { enabled: v })}
            label="Visible to students"
            hint={questions.length ? (test.enabled ? 'Students can see and take this test.' : 'Hidden: students cannot see this test.') : 'Add at least one question first.'}
          />
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
          <ListChecks className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No questions yet</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Add questions one at a time, or paste many at once with Bulk Upload.</p>
        </div>
      ) : (
        <ol className="space-y-3">
          {questions.map((q, idx) => (
            <li key={q.id} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                  <span className="text-[#087F8C] dark:text-teal-300 mr-1.5">Q{idx + 1}.</span>
                  {q.questionText}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(q);
                      setFormOpen(true);
                    }}
                    aria-label={`Edit question ${idx + 1}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-[#087F8C] hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q, idx)}
                    aria-label={`Delete question ${idx + 1}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                {q.options.map((opt, i) => (
                  <div
                    key={i}
                    className={`px-3 py-2 rounded-xl text-xs sm:text-sm border ${
                      i === q.correctAnswer
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <strong className="mr-1.5">{LETTERS[i]}.</strong>{opt}
                    {i === q.correctAnswer && <Check className="inline w-3.5 h-3.5 ml-1.5 -mt-0.5" />}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400"><strong>Explanation:</strong> {q.explanation}</p>
              )}
            </li>
          ))}
        </ol>
      )}

      <QuestionFormModal
        open={formOpen}
        question={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
      <BulkQuestionUploadModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        subjectName={test.title}
        moduleName={`${test.title} · Day ${test.day}`}
        onImport={handleBulkImport}
      />
    </div>
  );
};
