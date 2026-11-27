import React, { useState } from 'react';
import {
  ChevronRight,
  ArrowLeft,
  Radio,
  BookOpen,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Info,
  ClipboardList,
  Timer,
  CalendarClock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDuration, formatDateTime } from '../../utils/assessmentRecords';
import { formatDate } from '../../utils/subscriptionUtils';
import { QuestionReviewList } from './QuestionReviewList';
import { AskDoubtModal } from '../doubts/AskDoubtModal';
import { SaveQuestionButton } from '../saved/SaveQuestionButton';

// Shared pieces for showing attempt results inside each area (subject modules, mock tests, live exams).

export const pctTone = (pct) =>
  pct >= 75
    ? { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-950/40' }
    : pct >= 50
    ? { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-950/40' }
    : { text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500', soft: 'bg-red-50 dark:bg-red-950/40' };

export const KindBadge = ({ kind }) =>
  kind === 'mock' ? (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 inline-flex items-center gap-1">
      <ClipboardList className="w-2.5 h-2.5" /> Mock
    </span>
  ) : kind === 'exam' ? (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 inline-flex items-center gap-1">
      <Radio className="w-2.5 h-2.5" /> Exam
    </span>
  ) : (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 inline-flex items-center gap-1">
      <BookOpen className="w-2.5 h-2.5" /> Quiz
    </span>
  );

const RetestTag = () => (
  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
    Retest
  </span>
);

export const BackLink = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#087F8C] px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
  >
    <ArrowLeft className="w-4 h-4" /> {label}
  </button>
);

/** Correct / wrong / skipped / time taken for one attempt, plus when it started and was submitted. */
export const AttemptStats = ({ record }) => {
  const duration = formatDuration(record.timeSpentSeconds);
  const submitted = formatDateTime(record.submittedAt || record.date);
  const started = formatDateTime(record.startedAt);
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        {[
          { label: 'Correct', value: record.correct, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
          { label: 'Wrong', value: record.wrong, cls: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
          { label: 'Skipped', value: record.skipped, cls: 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60' },
          { label: 'Time taken', value: duration || '—', cls: 'text-[#087F8C] dark:text-teal-300 bg-[#E6F4F6] dark:bg-[#0E353E]/60' }
        ].map((c) => (
          <div key={c.label} className={`py-2 rounded-xl ${c.cls}`}>
            <div className="text-lg font-black leading-none">{c.value}</div>
            <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">{c.label}</div>
          </div>
        ))}
      </div>
      {record.negativeMark > 0 && (
        <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 rounded-lg px-2.5 py-1.5">
          Negative marking: {record.wrong} wrong × −{record.negativeMark} = <strong>−{record.negativeTotal}</strong> marks · Final{' '}
          <strong>
            {record.score} / {record.maxScore}
          </strong>
        </p>
      )}
      {(started || submitted) && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
          <CalendarClock className="w-3.5 h-3.5 shrink-0" />
          {started && <span>Started {started}</span>}
          {started && submitted && <span aria-hidden="true">&bull;</span>}
          {submitted && <span>Submitted {submitted}</span>}
        </p>
      )}
    </div>
  );
};

/** One attempt in a list. With showStudent, the student's name (and roll number) leads. */
export const AttemptRow = ({ record: r, onClick, showStudent = false, showKind = true }) => {
  const tone = pctTone(r.pct);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-3 sm:p-3.5 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
    >
      {showStudent ? (
        r.avatar ? (
          <img src={r.avatar} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300 shrink-0">
            {(r.studentName || '?').charAt(0)}
          </div>
        )
      ) : (
        <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 ${tone.soft}`}>
          <span className={`text-sm font-black leading-none ${tone.text}`}>{r.pct}%</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {showKind && <KindBadge kind={r.kind} />}
          {r.isRetest && <RetestTag />}
          {showStudent && <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">{r.studentName}</span>}
          {showStudent && r.rollNo && <span className="text-[10px] font-mono text-slate-400">{r.rollNo}</span>}
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5" title={r.title}>
          {showStudent ? <span className="font-semibold text-slate-600 dark:text-slate-300">{r.title}</span> : r.title}
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
          {formatDateTime(r.submittedAt || r.date) || formatDate(r.date)}
          {r.timeSpentSeconds ? (
            <>
              {' • '}
              <Timer className="w-3 h-3 inline -mt-0.5" /> {formatDuration(r.timeSpentSeconds)}
            </>
          ) : null}
        </p>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        {showStudent && <div className={`text-sm font-black ${tone.text}`}>{r.pct}%</div>}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold justify-end">
          <span className="text-emerald-600 inline-flex items-center gap-0.5" title="Correct"><CheckCircle2 className="w-3 h-3" />{r.correct}</span>
          <span className="text-red-500 inline-flex items-center gap-0.5" title="Wrong"><XCircle className="w-3 h-3" />{r.wrong}</span>
        </div>
        {!showStudent && <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />}
      </div>
    </button>
  );
};

/**
 * One attempt in full: score, correct / wrong / skipped / time, a switcher between the same
 * student's attempts, any extra panel (children, e.g. retest controls), and every question
 * with the right answer. Students can ask a doubt about a question.
 */
export const AttemptReview = ({ record, attempts = [], onSelect, perspective = 'student', children }) => {
  const { doubts, currentUser } = useApp();
  const [doubtFor, setDoubtFor] = useState(null);
  const tone = pctTone(record.pct);
  const admin = perspective === 'admin';
  const studentId = currentUser?.id;
  const doubtedIndexes = admin
    ? undefined
    : new Set(
        (doubts || [])
          .filter((d) => d.studentId === studentId && d.context?.recordId === record.id)
          .map((d) => d.context.questionIndex)
      );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-start gap-3">
          {admin &&
            (record.avatar ? (
              <img src={record.avatar} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-slate-600 shrink-0">
                {(record.studentName || '?').charAt(0)}
              </div>
            ))}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <KindBadge kind={record.kind} />
              {record.isRetest && <RetestTag />}
              <span className="text-[11px] text-slate-400">{formatDate(record.date)}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
              {admin ? record.studentName : record.title}
              {admin && record.rollNo && <span className="ml-2 text-xs font-mono font-bold text-slate-400">{record.rollNo}</span>}
            </h2>
            <p className="text-xs text-slate-500 truncate">{admin ? `${record.title} • ${record.subjectName}` : record.subjectName}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl sm:text-3xl font-black ${tone.text}`}>{record.pct}%</div>
            <div className="text-[11px] text-slate-500 font-semibold">
              {record.score} / {record.maxScore} {record.kind === 'quiz' && !record.negativeMark ? 'correct' : 'marks'}
            </div>
          </div>
        </div>
        <AttemptStats record={record} />

        {attempts.length > 1 && onSelect && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Attempts:</span>
            {attempts.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
                aria-pressed={r.id === record.id}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  r.id === record.id
                    ? 'bg-[#087F8C] border-[#087F8C] text-white'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                #{i + 1}
                {r.isRetest ? ' Retest' : ''} • {r.pct}%
              </button>
            ))}
          </div>
        )}
      </div>

      {children}

      {record.hasDetails ? (
        <QuestionReviewList
          answers={record.answers}
          perspective={admin ? 'admin' : 'student'}
          doubtedIndexes={doubtedIndexes}
          renderActions={
            admin
              ? undefined
              : (a) => (
                  <SaveQuestionButton
                    compact
                    source={record.kind}
                    sourceId={record.kind === 'quiz' ? record.moduleId : record.kind === 'mock' ? record.testId : record.examId}
                    sourceTitle={record.kind === 'quiz' ? (record.title || '').replace(/ \(.*\)$/, '') : record.title}
                    subjectId={record.subjectId}
                    subjectName={record.subjectName}
                    question={a}
                    questionIndex={a.questionIndex}
                  />
                )
          }
          onAskDoubt={
            admin
              ? undefined
              : (a) =>
                  setDoubtFor({
                    source: record.kind === 'exam' ? 'exam-review' : record.kind === 'mock' ? 'review' : 'quiz',
                    recordId: record.id,
                    examId: record.examId,
                    assessmentTitle: record.title,
                    questionIndex: a.questionIndex,
                    questionText: a.questionText,
                    options: a.options,
                    correctAnswer: a.correctAnswer,
                    selectedOption: a.selectedOption
                  })
          }
        />
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex gap-2">
          <Info className="w-4 h-4 shrink-0 text-slate-400" />
          <span>Question-by-question answers weren&apos;t saved for this older attempt. New attempts are saved automatically.</span>
        </div>
      )}

      {doubtFor && (
        <AskDoubtModal
          context={doubtFor}
          subjectId={record.subjectId}
          subjectName={record.subjectName}
          onClose={() => setDoubtFor(null)}
        />
      )}
    </div>
  );
};

const panelCls = 'p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-surface-darkCard border-slate-200/80 dark:border-slate-800 shadow-2xs';

/** Student: retest status for a live exam, and asking the admin for one. */
export const StudentRetestPanel = ({ examId, onStartRetest }) => {
  const { currentUser, examinations, getRetestFor, getExamAccess, requestRetest, retests } = useApp();
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState(false);
  const studentId = currentUser?.id;
  const exam = (examinations || []).find((e) => e.id === examId);
  if (!exam || !studentId) return null;
  const retest = getRetestFor(studentId, exam.id);
  const access = getExamAccess(studentId, exam);
  const lastDeclined = (retests || []).find((r) => r.studentId === studentId && r.examId === exam.id && r.status === 'declined');

  if (retest?.status === 'granted' && access?.allowed) {
    return (
      <div className={`${panelCls} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">Retest enabled</p>
            <p className="text-[11px] text-slate-500">The admin allowed one more attempt. Your new score will replace this one.</p>
          </div>
        </div>
        {onStartRetest && (
          <button
            type="button"
            onClick={() => onStartRetest(exam.id)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Start Retest
          </button>
        )}
      </div>
    );
  }
  if (retest?.status === 'requested') {
    return (
      <div className={`${panelCls} flex items-center gap-2.5`}>
        <Clock className="w-5 h-5 text-amber-500 shrink-0" />
        <div>
          <p className="text-sm font-extrabold text-amber-800 dark:text-amber-300">Retest requested</p>
          <p className="text-[11px] text-slate-500">Waiting for the admin to approve. Sent {formatDate(retest.requestedAt)}.</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`${panelCls} space-y-2.5`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <RotateCcw className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">Want another try?</p>
            <p className="text-[11px] text-slate-500">
              {lastDeclined
                ? `Your last request was declined${lastDeclined.adminNote ? `: "${lastDeclined.adminNote}"` : ''}. You can ask again.`
                : 'Ask the admin to enable a retest for this exam.'}
            </p>
          </div>
        </div>
        {!showReason && (
          <button
            type="button"
            onClick={() => setShowReason(true)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Request Retest
          </button>
        )}
      </div>
      {showReason && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            requestRetest(exam.id, reason);
            setShowReason(false);
            setReason('');
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label="Reason for the retest"
            placeholder="Reason (optional), e.g. network issue during the exam"
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20"
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowReason(false)} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-white text-xs font-bold">
              Send Request
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/** Admin: enable, decline or revoke a retest of a live exam for one student. */
export const AdminRetestPanel = ({ examId, studentId, studentName }) => {
  const { examinations, getRetestFor, grantRetest, declineRetest, revokeRetest } = useApp();
  const exam = (examinations || []).find((e) => e.id === examId);
  if (!exam) return null;
  const retest = getRetestFor(studentId, exam.id);
  return (
    <div className={`${panelCls} flex flex-col sm:flex-row sm:items-center justify-between gap-2.5`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <RotateCcw className={`w-5 h-5 shrink-0 ${retest?.status === 'granted' ? 'text-emerald-600' : retest ? 'text-amber-500' : 'text-slate-400'}`} />
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
            {retest?.status === 'granted' ? 'Retest enabled' : retest ? 'Student requested a retest' : 'Retest'}
          </p>
          <p className="text-[11px] text-slate-500">
            {retest?.status === 'granted'
              ? 'Waiting for the student to take it. Their new score will replace this one.'
              : retest
              ? retest.reason
                ? `Reason: "${retest.reason}"`
                : `Requested ${formatDate(retest.requestedAt)}`
              : `Allow ${studentName || 'this student'} to take this exam once more.`}
          </p>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        {retest?.status === 'granted' ? (
          <button
            type="button"
            onClick={() => revokeRetest(retest.id)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            Revoke
          </button>
        ) : (
          <>
            {retest && (
              <button
                type="button"
                onClick={() => declineRetest(retest.id)}
                className="px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-600 text-xs font-bold"
              >
                Decline
              </button>
            )}
            <button
              type="button"
              onClick={() => grantRetest(studentId, exam.id)}
              className="px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#0C4E5B] text-white text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Enable Retest
            </button>
          </>
        )}
      </div>
    </div>
  );
};
