import React, { useState } from 'react';
import { BookOpenCheck, CalendarCog, CalendarPlus, Clock, Infinity as InfinityIcon, Hourglass } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AccessPeriodModal, subscriptionStart } from '../curriculum/AccessPeriodModal';
import { getSubscriptionTiming, pickLatestApproved, formatDate, formatDaysLeft } from '../../utils/subscriptionUtils';

const STATE_STYLE = {
  lifetime: { label: 'Lifetime', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' },
  expiring: { label: 'Ending soon', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
  expired: { label: 'Expired', cls: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  pending: { label: 'Payment pending', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' }
};

const isPaid = (subject) => Number(subject?.price) > 0;

/**
 * Registered Students > student details: the student's subject/batch access.
 * The admin can give access without a payment, change when access ends, or approve a pending payment.
 */
export const StudentAccessSection = ({ account }) => {
  const {
    subscriptions,
    curriculumSubjects,
    students,
    grantSubscription,
    getGrantDefaultPeriod,
    updateSubscriptionEnd,
    approveSubscription,
    getDefaultAccessPeriod
  } = useApp();

  const studentId = account.studentId;
  const record = (students || []).find((s) => s.id === studentId) || {};
  const student = {
    id: studentId,
    name: account.name,
    avatar: record.avatar || '',
    phone: record.phone || account.phone || '',
    rollNo: account.registrationId || ''
  };

  const [pickedSubjectId, setPickedSubjectId] = useState('');
  // { mode: 'grant' | 'edit' | 'approve', subjectId, sub? }
  const [dialog, setDialog] = useState(null);

  const subjects = curriculumSubjects || [];
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name;
  const mine = (subscriptions || []).filter((s) => s.studentId === studentId);
  const now = new Date();

  // One row per subject the student has paid for, asked for, or been given
  const rows = [...new Set(mine.map((s) => s.subjectId))]
    .map((subjectId) => {
      const subs = mine.filter((s) => s.subjectId === subjectId);
      const latest = pickLatestApproved(subs, now);
      const pending = subs.find((s) => s.status === 'pending');
      const state = latest && latest.timing.state !== 'expired' ? latest.timing.state : pending ? 'pending' : latest ? 'expired' : null;
      return {
        subjectId,
        name: subjectName(subjectId) || subs[0]?.subjectName || 'Deleted subject',
        latest,
        pending,
        state,
        given: latest?.subscription.grantedByAdmin
      };
    })
    .filter((r) => r.state)
    .sort((a, b) => a.name.localeCompare(b.name));

  const paidSubjects = subjects.filter(isPaid);
  const freeCount = subjects.length - paidSubjects.length;
  const rowFor = (subjectId) => rows.find((r) => r.subjectId === subjectId);

  // Dialog inputs
  const dialogProps = (() => {
    if (!dialog) return null;
    const name = subjectName(dialog.subjectId) || dialog.sub?.subjectName || '';
    const request = { studentName: account.name, subjectName: name };
    if (dialog.mode === 'grant') {
      const p = getGrantDefaultPeriod(studentId, dialog.subjectId);
      return { request, startsAt: p.startsAt, initialEnd: p.expiresAt, otherAccessEnd: null };
    }
    if (dialog.mode === 'approve') {
      const p = getDefaultAccessPeriod(dialog.sub.id);
      if (!p) return null;
      return { request, startsAt: p.startsAt, initialEnd: p.expiresAt, otherAccessEnd: null };
    }
    // edit: the furthest-reaching approved period; others can't reach further by definition
    return { request, startsAt: subscriptionStart(dialog.sub), initialEnd: getSubscriptionTiming(dialog.sub).expiresAt, otherAccessEnd: null };
  })();

  const btn =
    'px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 border transition-colors whitespace-nowrap';

  return (
    <section className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-start gap-2.5">
        <BookOpenCheck className="w-5 h-5 text-[#087F8C] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Subscriptions</h3>
          <p className="text-[11px] text-slate-500">
            Give this student access to a batch or subject without a payment, or change when their access ends.
          </p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-slate-400 px-1">No paid batches or subjects yet.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => {
            const style = STATE_STYLE[r.state];
            const timing = r.latest?.timing;
            return (
              <li
                key={r.subjectId}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">{r.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${style.cls}`}>
                      {style.label}
                    </span>
                    {r.given && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-[#E6F4F6] text-[#0C4E5B] dark:bg-[#0E353E] dark:text-cyan-300">
                        Given by admin
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                    {r.state === 'pending' && !r.latest ? (
                      <>
                        <Hourglass className="w-3 h-3" /> Waiting for payment approval
                      </>
                    ) : timing?.state === 'lifetime' ? (
                      <>
                        <InfinityIcon className="w-3 h-3" /> Never expires
                      </>
                    ) : timing?.state === 'expired' ? (
                      <>
                        <Clock className="w-3 h-3" /> Ended {formatDate(timing.expiresAt)}
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" /> Until {formatDate(timing.expiresAt)} · {formatDaysLeft(timing.daysLeft)}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {r.pending && (
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: 'approve', subjectId: r.subjectId, sub: r.pending })}
                      className={`${btn} bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white`}
                    >
                      Approve payment
                    </button>
                  )}
                  {r.latest && r.state !== 'expired' && (
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: 'edit', subjectId: r.subjectId, sub: r.latest.subscription })}
                      className={`${btn} bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#087F8C]/60`}
                    >
                      <CalendarCog className="w-3.5 h-3.5" /> Change end date
                    </button>
                  )}
                  {r.state === 'expired' && subjects.some((s) => s.id === r.subjectId) && (
                    <button
                      type="button"
                      onClick={() => setDialog({ mode: 'grant', subjectId: r.subjectId })}
                      className={`${btn} bg-[#087F8C] hover:bg-[#066a75] border-[#087F8C] text-white`}
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> Give access again
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Give access to another batch / subject */}
      {paidSubjects.length > 0 ? (
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <label htmlFor={`grant-${account.id}`} className="sr-only">
            Batch or subject to give access to
          </label>
          <select
            id={`grant-${account.id}`}
            value={pickedSubjectId}
            onChange={(e) => setPickedSubjectId(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#087F8C]/20 focus:border-[#087F8C]"
          >
            <option value="">Choose a batch or subject…</option>
            {paidSubjects.map((s) => {
              const row = rowFor(s.id);
              const note =
                row && ['active', 'expiring', 'lifetime'].includes(row.state)
                  ? row.state === 'lifetime'
                    ? ' (has lifetime access)'
                    : ` (active until ${formatDate(row.latest.timing.expiresAt)})`
                  : '';
              return (
                <option key={s.id} value={s.id} disabled={row?.state === 'lifetime'}>
                  {s.name} · ₹{s.price}
                  {note}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            disabled={!pickedSubjectId}
            onClick={() => setDialog({ mode: 'grant', subjectId: pickedSubjectId })}
            className="px-3.5 py-2 rounded-xl bg-[#087F8C] hover:bg-[#066a75] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
          >
            <CalendarPlus className="w-3.5 h-3.5" /> Give access
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">There are no paid batches or subjects to give access to.</p>
      )}
      {freeCount > 0 && (
        <p className="text-[10px] text-slate-400">
          Free batches and subjects ({freeCount}) are open to every student, so they aren&apos;t listed here.
        </p>
      )}

      {dialog && dialogProps && (
        <AccessPeriodModal
          key={`${dialog.mode}:${dialog.subjectId}:${dialog.sub?.id || ''}`}
          mode={dialog.mode}
          request={dialogProps.request}
          startsAt={dialogProps.startsAt}
          initialEnd={dialogProps.initialEnd}
          otherAccessEnd={dialogProps.otherAccessEnd}
          onClose={() => setDialog(null)}
          onConfirm={(expiresAt) => {
            if (dialog.mode === 'grant') {
              grantSubscription({ student, subjectId: dialog.subjectId, expiresAt });
              setPickedSubjectId('');
            } else if (dialog.mode === 'approve') {
              approveSubscription(dialog.sub.id, { expiresAt });
            } else {
              updateSubscriptionEnd(dialog.sub.id, expiresAt);
            }
            setDialog(null);
          }}
        />
      )}
    </section>
  );
};

export default StudentAccessSection;
