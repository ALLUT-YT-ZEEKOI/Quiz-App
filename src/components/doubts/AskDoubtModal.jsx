import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircleQuestion, X, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { optionLetter } from '../../utils/assessmentRecords';

/**
 * Student sends a doubt to the admin.
 * - With `context` (a question from an exam/quiz/review) the question is attached automatically.
 * - Without it, the student writes the issue and can add a topic in their own words.
 * The correct answer is never shown here (the student may be mid-exam).
 */
export const AskDoubtModal = ({ context = null, subjectId = '', subjectName = '', onClose, onSent }) => {
  const { raiseDoubt, curriculumSubjects, studentModules } = useApp();
  const [message, setMessage] = useState('');
  const [topic, setTopic] = useState(subjectName);
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectId);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const term = topic.trim().toLowerCase();
  const subjects = studentModules?.subjects === false ? [] : (curriculumSubjects || []);
  const exactMatches = term ? subjects.filter((s) => s.name?.toLowerCase() === term) : [];
  const matchingSubject = exactMatches.length === 1 ? exactMatches[0] : exactMatches.find((s) => s.id === selectedSubjectId);
  const suggestions = !context && term.length >= 2 && !matchingSubject
    ? subjects.filter((s) => s.name?.toLowerCase().includes(term)).slice(0, 3)
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const doubt = raiseDoubt({
      subjectId: context ? subjectId : matchingSubject?.id || '',
      subjectName: context ? subjectName : matchingSubject?.name || topic.trim() || 'General',
      message,
      context
    });
    if (doubt) {
      onSent?.(doubt);
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ask a doubt"
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-surface-darkCard rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300 flex items-center justify-center shrink-0">
              <MessageCircleQuestion className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Ask a Doubt</h3>
              <p className="text-xs text-slate-400 truncate">
                {context ? context.assessmentTitle : 'Your question goes to the admin'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {context && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                Question {context.questionIndex + 1}
              </span>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                {context.questionText}
              </p>
              {context.options?.length > 0 && (
                <ul className="space-y-1">
                  {context.options.map((opt, i) => (
                    <li key={i} className="text-[11px] text-slate-600 dark:text-slate-300 flex gap-1.5">
                      <span className="font-black text-slate-400">{optionLetter(i)}.</span>
                      <span>{opt}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div>
            <label htmlFor="doubt-message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {context ? 'What is your doubt? (optional)' : 'Your doubt *'}
            </label>
            <textarea
              id="doubt-message"
              rows={4}
              autoFocus
              required={!context}
              placeholder={
                context
                  ? 'e.g. I think two options look correct. Can you explain?'
                  : 'What would you like help with?'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 leading-relaxed"
            />
            {context?.source === 'exam' && (
              <p className="text-[10px] text-slate-400 mt-1">
                Your exam timer keeps running. You'll see the admin's reply in My Doubts.
              </p>
            )}
          </div>

          {!context && (
            <div>
              <label htmlFor="doubt-topic" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Topic (optional)
              </label>
              <input
                id="doubt-topic"
                type="text"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setSelectedSubjectId('');
                }}
                placeholder="e.g. Surveying, Section 2, or a video title"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
              {suggestions.length > 0 && (
                <div role="group" aria-label="Matching subjects" className="mt-2 flex flex-wrap gap-1.5">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setTopic(s.name);
                        setSelectedSubjectId(s.id);
                      }}
                      className="max-w-full truncate rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:bg-violet-950/50 dark:text-violet-200 dark:hover:bg-violet-900/60"
                    >
                      {s.name}{s.code && ` · ${s.code}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white shadow-md shadow-violet-500/20 inline-flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Send to Admin
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
