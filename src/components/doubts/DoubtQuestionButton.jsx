import React, { useState } from 'react';
import { MessageCircleQuestion, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AskDoubtModal } from './AskDoubtModal';
import { requestOpen, OPEN_DOUBT } from '../../utils/openRequest';

const textOf = (q) => String(q?.questionText ?? q?.question ?? '').trim();

/** Where a doubt came from, for the admin's Doubts page. */
const contextSource = (kind, duringTest) =>
  kind === 'exam' ? (duringTest ? 'exam' : 'exam-review') : kind === 'mock' ? (duringTest ? 'mock' : 'review') : 'quiz';

/** The student's doubt about this question, if they already sent one. */
export const findQuestionDoubt = (doubts, studentId, sourceId, question) => {
  const text = textOf(question);
  return (doubts || []).find(
    (d) => d.studentId === studentId && d.context && d.context.questionText === text && (d.context.sourceId || d.context.examId) === sourceId
  );
};

/**
 * "Doubt" button for one question (students only; hidden when the admin turned Doubts off).
 * Sends the question to the Doubts section. Afterwards it shows the doubt's progress:
 * Doubt sent -> Answered -> Cleared, and opens the conversation (not while a test is running).
 *
 * Props: kind ('quiz' | 'mock' | 'exam'), sourceId, sourceTitle, subjectId, subjectName, question,
 *        questionIndex, selectedOption, correctAnswer (only once the answer is revealed),
 *        duringTest (true while the test is running), compact (icon only).
 */
export const DoubtQuestionButton = ({
  kind,
  sourceId,
  sourceTitle,
  subjectId,
  subjectName,
  question,
  questionIndex,
  selectedOption = null,
  correctAnswer,
  duringTest = false,
  compact = false
}) => {
  const { currentRole, currentUserId, studentModules, doubts, setActiveView } = useApp();
  const [asking, setAsking] = useState(false);
  if (currentRole !== 'student' || studentModules?.doubts === false) return null;
  if (!sourceId || !textOf(question)) return null;

  const existing = findQuestionDoubt(doubts, currentUserId, sourceId, question);
  const status = existing?.status;
  const label = !existing ? 'Doubt' : status === 'resolved' ? 'Cleared' : status === 'answered' ? 'Answered' : 'Doubt sent';

  const onClick = (e) => {
    e.stopPropagation();
    if (!existing) {
      setAsking(true);
      return;
    }
    if (duringTest) return; // don't leave a running test
    requestOpen(OPEN_DOUBT, existing.id);
    setActiveView('doubts');
  };

  const tone = !existing
    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40'
    : status === 'resolved'
    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
    : status === 'answered'
    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
    : 'bg-violet-50 dark:bg-violet-950/40 border-violet-300 dark:border-violet-800 text-violet-700 dark:text-violet-300';

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={existing ? `Doubt: ${label}` : 'Send this question as a doubt'}
        title={
          !existing
            ? 'Send this question to the admin as a doubt'
            : duringTest
            ? `Doubt ${label.toLowerCase()}. Open My Doubts after the test to read the reply.`
            : `${label}. Open the conversation`
        }
        className={`shrink-0 inline-flex items-center justify-center gap-1 rounded-lg border text-[11px] font-bold transition-colors ${
          compact ? 'w-8 h-8' : 'px-2.5 py-1.5'
        } ${tone}`}
      >
        {status === 'resolved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <MessageCircleQuestion className="w-3.5 h-3.5" />}
        {!compact && <span>{label}</span>}
      </button>
      {asking && (
        <AskDoubtModal
          context={{
            source: contextSource(kind, duringTest),
            kind,
            sourceId,
            examId: kind === 'exam' ? sourceId : undefined,
            assessmentTitle: sourceTitle || '',
            questionIndex: Number.isInteger(questionIndex) ? questionIndex : 0,
            questionText: textOf(question),
            options: (question?.options || []).map(String),
            ...(typeof correctAnswer === 'number' ? { correctAnswer } : {}),
            selectedOption: Number.isInteger(selectedOption) ? selectedOption : null
          }}
          subjectId={subjectId || ''}
          subjectName={subjectName || sourceTitle || 'General'}
          onClose={() => setAsking(false)}
        />
      )}
    </>
  );
};

export default DoubtQuestionButton;
