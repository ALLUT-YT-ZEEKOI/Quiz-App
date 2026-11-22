import React, { useMemo, useState } from 'react';
import {
  ClipboardCheck,
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
  Target,
  Trophy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { buildAssessmentRecords, computeSubjectMarks, latestPerAssessment } from '../../utils/assessmentRecords';
import { formatDate } from '../../utils/subscriptionUtils';
import { QuestionReviewList } from './QuestionReviewList';
import { AskDoubtModal } from '../doubts/AskDoubtModal';

export const pctTone = (pct) =>
  pct >= 75
    ? { text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-950/40' }
    : pct >= 50
    ? { text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-950/40' }
    : { text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500', soft: 'bg-red-50 dark:bg-red-950/40' };

export const KindBadge = ({ kind }) =>
  kind === 'exam' ? (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300 inline-flex items-center gap-1">
      <Radio className="w-2.5 h-2.5" /> Exam
    </span>
  ) : (
    <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 inline-flex items-center gap-1">
      <BookOpen className="w-2.5 h-2.5" /> Quiz
    </span>
  );

export const StudentAnswersDashboard = () => {
  const {
    currentUser,
    examAttempts,
    examinations,
    curriculumAttempts,
    getRetestFor,
    getExamAccess,
    requestRetest,
    startStudentExam,
    setActiveView,
    retests,
    doubts
  } = useApp();
  const studentId = currentUser?.id || 'STU001';

  const records = useMemo(
    () =>
      buildAssessmentRecords({ examAttempts, examinations, curriculumAttempts }).filter(
        (r) => r.studentId === studentId
      ),
    [examAttempts, examinations, curriculumAttempts, studentId]
  );
  const latest = useMemo(() => latestPerAssessment(records), [records]);
  const subjectMarks = useMemo(() => computeSubjectMarks(records), [records]);

  const [subjectFilter, setSubjectFilter] = useState('All');
  const [kindFilter, setKindFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const overallPct = latest.length ? Math.round(latest.reduce((s, r) => s + r.pct, 0) / latest.length) : 0;
  const answeredTotals = latest.reduce(
    (acc, r) => ({ correct: acc.correct + r.correct, answered: acc.answered + r.correct + r.wrong }),
    { correct: 0, answered: 0 }
  );
  const accuracy = answeredTotals.answered ? Math.round((answeredTotals.correct / answeredTotals.answered) * 100) : 0;
  const grantedRetests = retests.filter((r) => r.studentId === studentId && r.status === 'granted');

  const filtered = records.filter(
    (r) => (subjectFilter === 'All' || r.subjectName === subjectFilter) && (kindFilter === 'all' || r.kind === kindFilter)
  );

  const selected = records.find((r) => r.id === selectedId);
  if (selected) {
    return (
      <AttemptDetail
        record={selected}
        allRecords={records}
        onSelect={setSelectedId}
        onBack={() => setSelectedId(null)}
        studentId={studentId}
        examinations={examinations}
        getRetestFor={getRetestFor}
        getExamAccess={getExamAccess}
        requestRetest={requestRetest}
        retests={retests}
        doubts={doubts}
        onStartRetest={(examId) => {
          setActiveView('examinations');
          startStudentExam(examId);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#07242B] via-[#0A333C] to-[#0D4450] p-4 sm:p-7 text-white border border-[#145663]/60 shadow-premium">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-[#14B8A6]/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0D4E5B]/80 border border-[#20B8C7]/30 text-[#2DD4BF] text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider">
              <ClipboardCheck className="w-3 h-3" /> My Results
            </span>
            <h1 className="text-lg sm:text-3xl font-black tracking-tight mt-1.5">Marks & Answers</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              See your marks for each subject and check every question you answered: what you chose and the correct answer.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
            {[
              { label: 'Overall', value: `${overallPct}%`, Icon: Trophy, cls: 'text-emerald-300' },
              { label: 'Accuracy', value: `${accuracy}%`, Icon: Target, cls: 'text-cyan-300' },
              { label: 'Tests', value: latest.length, Icon: ClipboardCheck, cls: 'text-white' }
            ].map(({ label, value, Icon, cls }) => (
              <div key={label} className="px-3 py-2 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 text-center min-w-[84px]">
                <Icon className={`w-4 h-4 mx-auto mb-1 ${cls}`} />
                <div className={`text-base sm:text-2xl font-black leading-none ${cls}`}>{value}</div>
                <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-bold text-slate-300 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Retest available */}
      {grantedRetests.map((g) => (
        <div
          key={g.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold text-emerald-900 dark:text-emerald-200">Retest enabled by the admin</p>
              <p className="text-[11px] sm:text-xs text-emerald-800/80 dark:text-emerald-300/80 truncate">
                {g.examTitle} • {g.subjectName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveView('examinations');
              startStudentExam(g.examId);
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Start Retest
          </button>
        </div>
      ))}

      {/* Subject-wise marks */}
      <section className="space-y-2.5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">Subject-wise Marks</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Average of your latest result in each exam and quiz</p>
          </div>
          {subjectFilter !== 'All' && (
            <button type="button" onClick={() => setSubjectFilter('All')} className="text-[11px] font-bold text-[#087F8C] hover:underline">
              Show all
            </button>
          )}
        </div>
        {subjectMarks.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
            No marks yet. Take a module quiz or a live exam to see your results here.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {subjectMarks.map((m) => {
              const tone = pctTone(m.avgPct);
              const active = subjectFilter === m.subjectName;
              return (
                <button
                  key={m.subjectName}
                  type="button"
                  onClick={() => setSubjectFilter(active ? 'All' : m.subjectName)}
                  aria-pressed={active}
                  className={`text-left p-3 sm:p-4 rounded-2xl bg-white dark:bg-surface-darkCard border shadow-2xs transition-all hover:border-[#20B8C7]/60 ${
                    active ? 'border-[#087F8C] ring-2 ring-[#087F8C]/20' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <p className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 truncate" title={m.subjectName}>
                    {m.subjectName}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className={`text-xl sm:text-3xl font-black ${tone.text}`}>{m.avgPct}%</span>
                    <span className="text-[10px] text-slate-400 font-semibold">best {m.bestPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${m.avgPct}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 truncate">
                    {[m.examCount && `${m.examCount} exam${m.examCount > 1 ? 's' : ''}${m.examAvg !== null ? ` ${m.examAvg}%` : ''}`,
                      m.quizCount && `${m.quizCount} quiz${m.quizCount > 1 ? 'zes' : ''}${m.quizAvg !== null ? ` ${m.quizAvg}%` : ''}`]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Attempts */}
      <section className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            Your Answers{subjectFilter !== 'All' ? ` • ${subjectFilter}` : ''}
          </h2>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 text-[11px] font-bold">
            {[
              { id: 'all', label: 'All' },
              { id: 'exam', label: 'Exams' },
              { id: 'quiz', label: 'Quizzes' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setKindFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  kindFilter === t.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
            Nothing here yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden shadow-2xs">
            {filtered.map((r) => (
              <AttemptRow key={r.id} record={r} onClick={() => setSelectedId(r.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export const AttemptRow = ({ record: r, onClick, showStudent = false }) => {
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
          <KindBadge kind={r.kind} />
          {r.isRetest && (
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              Retest
            </span>
          )}
          {showStudent && <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{r.studentName}</span>}
        </div>
        <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5" title={r.title}>
          {r.title}
        </p>
        <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
          {r.subjectName} • {formatDate(r.date)}
        </p>
      </div>
      <div className="text-right shrink-0 space-y-0.5">
        {showStudent && <div className={`text-sm font-black ${tone.text}`}>{r.pct}%</div>}
        <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold justify-end">
          <span className="text-emerald-600 inline-flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" />{r.correct}</span>
          <span className="text-red-500 inline-flex items-center gap-0.5"><XCircle className="w-3 h-3" />{r.wrong}</span>
        </div>
        {!showStudent && <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />}
      </div>
    </button>
  );
};

const AttemptDetail = ({
  record,
  allRecords,
  onSelect,
  onBack,
  studentId,
  examinations,
  getRetestFor,
  getExamAccess,
  requestRetest,
  retests,
  doubts,
  onStartRetest
}) => {
  const [doubtFor, setDoubtFor] = useState(null);
  const [reason, setReason] = useState('');
  const [showReason, setShowReason] = useState(false);

  // All attempts of the same exam/quiz, oldest first, for the attempt switcher
  const sameAssessment = allRecords
    .filter((r) => r.assessmentKey === record.assessmentKey)
    .sort((a, b) => a.time - b.time);
  const isLatest = sameAssessment[sameAssessment.length - 1]?.id === record.id;
  const exam = record.kind === 'exam' ? examinations.find((e) => e.id === record.examId) : null;
  const retest = exam ? getRetestFor(studentId, exam.id) : null;
  const access = exam ? getExamAccess(studentId, exam) : null;
  const lastDeclined = exam
    ? retests.find((r) => r.studentId === studentId && r.examId === exam.id && r.status === 'declined')
    : null;
  const tone = pctTone(record.pct);

  const doubtedIndexes = new Set(
    doubts
      .filter((d) => d.studentId === studentId && d.context?.recordId === record.id)
      .map((d) => d.context.questionIndex)
  );

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#087F8C] px-2 py-1 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marks & Answers
      </button>

      {/* Summary */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <KindBadge kind={record.kind} />
              {record.isRetest && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                  Retest
                </span>
              )}
              <span className="text-[11px] text-slate-400">{formatDate(record.date)}</span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white mt-1 leading-snug">{record.title}</h1>
            <p className="text-xs text-slate-500">{record.subjectName}</p>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-2xl sm:text-3xl font-black ${tone.text}`}>{record.pct}%</div>
            <div className="text-[11px] text-slate-500 font-semibold">
              {record.score} / {record.maxScore} {record.kind === 'exam' ? 'marks' : 'correct'}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Correct', value: record.correct, cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
            { label: 'Wrong', value: record.wrong, cls: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
            { label: 'Skipped', value: record.skipped, cls: 'text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60' }
          ].map((c) => (
            <div key={c.label} className={`py-2 rounded-xl ${c.cls}`}>
              <div className="text-lg font-black leading-none">{c.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">{c.label}</div>
            </div>
          ))}
        </div>

        {sameAssessment.length > 1 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Attempts:</span>
            {sameAssessment.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect(r.id)}
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

      {/* Retest panel (latest exam attempt only) */}
      {exam && isLatest && (
        <div className="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-surface-darkCard border-slate-200/80 dark:border-slate-800 shadow-2xs">
          {retest?.status === 'granted' && access?.allowed ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">Retest enabled</p>
                  <p className="text-[11px] text-slate-500">
                    The admin allowed one more attempt. Your new score will replace this one.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onStartRetest(exam.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Retest
              </button>
            </div>
          ) : retest?.status === 'requested' ? (
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-extrabold text-amber-800 dark:text-amber-300">Retest requested</p>
                <p className="text-[11px] text-slate-500">Waiting for the admin to approve. Sent {formatDate(retest.requestedAt)}.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
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
          )}
        </div>
      )}

      {/* Question review */}
      {record.hasDetails ? (
        <QuestionReviewList
          answers={record.answers}
          perspective="student"
          doubtedIndexes={doubtedIndexes}
          onAskDoubt={(a) =>
            setDoubtFor({
              source: record.kind === 'exam' ? 'exam-review' : 'quiz',
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
          <span>
            Question-by-question answers weren't saved for this attempt (it was taken before answer review was added). New
            attempts are saved automatically.
          </span>
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
