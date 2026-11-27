import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * Bookmark toggle for one question (students only; hidden when the admin turned
 * Saved Questions off on the Permissions page).
 * Props: source ('quiz' | 'mock' | 'exam'), sourceId, sourceTitle, subjectId, subjectName,
 *        question ({ id?, questionText | question, options }), questionIndex, compact (icon only).
 */
export const SaveQuestionButton = ({ compact = false, className = '', ...details }) => {
  const { currentRole, studentModules, isQuestionSaved, toggleSaveQuestion } = useApp();
  if (currentRole !== 'student' || studentModules?.saved === false) return null;
  if (!details.sourceId || !details.question) return null;

  const saved = isQuestionSaved(details.source, details.sourceId, details.question);
  const Icon = saved ? BookmarkCheck : Bookmark;
  const label = saved ? 'Saved' : 'Save';

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleSaveQuestion(details);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved questions' : 'Save this question'}
      title={saved ? 'Saved. Tap to remove from Saved Questions' : 'Save this question to revise later'}
      className={`shrink-0 inline-flex items-center justify-center gap-1 rounded-lg border text-[11px] font-bold transition-colors ${
        compact ? 'w-8 h-8' : 'px-2.5 py-1.5'
      } ${
        saved
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:border-amber-300 hover:text-amber-700'
      } ${className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${saved ? 'fill-amber-400/40' : ''}`} />
      {!compact && <span>{label}</span>}
    </button>
  );
};

export default SaveQuestionButton;
