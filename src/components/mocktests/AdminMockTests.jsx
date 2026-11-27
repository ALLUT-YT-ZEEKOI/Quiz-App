import React, { useMemo, useState } from 'react';
import { Plus, CalendarDays, Clock, ListChecks, Pencil, Trash2, BarChart3, ClipboardList, Eye, EyeOff, RotateCcw, Globe, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { confirmDialog } from '../common/ConfirmDialog';
import { QuestionSearchBox, SearchResultCard, questionMatches } from '../common/QuestionSearch';
import { MockTestFormModal } from './MockTestFormModal';
import { PageHero, Toggle, primaryBtn, secondaryBtn } from './MockTestUi';
import { formatDuration, groupByDay, isPrivateMockTest } from '../../utils/mockTests';

export const AdminMockTests = ({ onOpenQuestions, onOpenResults }) => {
  const { mockTests, mockAttempts, createMockTest, updateMockTest, deleteMockTest, showToast, curriculumSubjects } = useApp();
  const batchName = (id) => (curriculumSubjects || []).find((s) => s.id === id)?.name || 'Deleted batch';
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newForDay, setNewForDay] = useState(1);

  // Filter: all / public / private tests, and for private ones a single batch
  const [accessFilter, setAccessFilter] = useState('all'); // 'all' | 'public' | 'private'
  const [questionSearch, setQuestionSearch] = useState(''); // a word to find in every test's questions
  const [batchFilter, setBatchFilter] = useState('all'); // 'all' | batch (subject) id
  const privateTests = mockTests.filter(isPrivateMockTest);
  const counts = { all: mockTests.length, public: mockTests.length - privateTests.length, private: privateTests.length };
  // Batches that private tests are open to (for the batch picker)
  const usedBatchIds = [...new Set(privateTests.flatMap((t) => t.batchSubjectIds || []))].sort((a, b) =>
    batchName(a).localeCompare(batchName(b))
  );
  const shownTests = mockTests.filter((t) => {
    if (accessFilter === 'public') return !isPrivateMockTest(t);
    if (accessFilter === 'private') {
      return isPrivateMockTest(t) && (batchFilter === 'all' || (t.batchSubjectIds || []).includes(batchFilter));
    }
    return true;
  });
  const filtering = accessFilter !== 'all';
  const pickAccess = (value) => {
    setAccessFilter(value);
    setBatchFilter('all');
  };

  const days = groupByDay(shownTests);
  const existingDays = groupByDay(mockTests).map((d) => d.day);
  const visibleCount = mockTests.filter((t) => t.enabled).length;

  const attemptsByTest = useMemo(() => {
    const map = new Map();
    mockAttempts.forEach((a) => map.set(a.testId, (map.get(a.testId) || 0) + 1));
    return map;
  }, [mockAttempts]);

  const openCreate = (day) => {
    setEditing(null);
    setNewForDay(day ?? (existingDays.length ? Math.max(...existingDays) : 1));
    setFormOpen(true);
  };

  const handleSave = (data) => {
    if (editing) {
      updateMockTest(editing.id, data);
      showToast('Mock test updated', 'success');
      setFormOpen(false);
      setEditing(null);
      return;
    }
    const created = createMockTest(data);
    setFormOpen(false);
    onOpenQuestions(created.id); // next step: add questions
  };

  const toggleEnabled = (test, value) => {
    if (value && !(test.questions || []).length) {
      showToast('Add at least one question before making this test visible.', 'warning');
      return;
    }
    updateMockTest(test.id, { enabled: value });
    showToast(value ? `"${test.title}" is now visible to students` : `"${test.title}" is hidden from students`, 'info');
  };

  const handleDelete = async (test) => {
    const n = attemptsByTest.get(test.id) || 0;
    const ok = await confirmDialog({
      title: `Delete "${test.title}"?`,
      message: n
        ? `Its ${n} student attempt${n === 1 ? '' : 's'} will stay in the results, but the test itself is removed.`
        : 'The test and its questions are removed.',
      confirmLabel: 'Delete test',
      tone: 'danger'
    });
    if (ok) deleteMockTest(test.id);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300 pb-24 sm:pb-12">
      <PageHero
        eyebrow="Mock Tests"
        title="Mock Test Manager"
        description="Create timed practice tests for each day, add questions one by one or in bulk, and choose which tests students can see."
        action={
          <button type="button" onClick={() => openCreate()} className={`${primaryBtn} !bg-[#14B8A6] hover:!bg-[#0F9E8F] shrink-0`}>
            <Plus className="w-4 h-4" /> New Mock Test
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {[
          { label: 'Mock tests', value: mockTests.length },
          { label: 'Visible to students', value: visibleCount },
          { label: 'Student attempts', value: mockAttempts.length }
        ].map((s) => (
          <div key={s.label} className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#087F8C]/15 dark:border-slate-800 shadow-subtle">
            <div className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {mockTests.length > 0 && (
        <QuestionSearchBox
          value={questionSearch}
          onChange={setQuestionSearch}
          count={
            questionSearch.trim()
              ? mockTests.reduce((n, t) => n + (t.questions || []).filter((q) => questionMatches(q, questionSearch)).length, 0)
              : undefined
          }
          placeholder="Search questions in all mock tests, e.g. standard"
        />
      )}

      {/* Questions found in any mock test */}
      {questionSearch.trim() && (
        <div className="space-y-2.5">
          {mockTests
            .flatMap((t) =>
              (t.questions || []).map((q, i) => ({ t, q, i })).filter(({ q }) => questionMatches(q, questionSearch))
            )
            .map(({ t, q, i }) => (
              <SearchResultCard
                key={`${t.id}:${q.id || i}`}
                context={`${t.title} · Day ${t.day} · Q${i + 1}`}
                question={q}
                term={questionSearch}
                answer="shown"
                action={
                  <button
                    type="button"
                    onClick={() => onOpenQuestions(t.id)}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-[#087F8C] hover:bg-[#0C4E5B] text-white"
                  >
                    Open test
                  </button>
                }
              />
            ))}
          {!mockTests.some((t) => (t.questions || []).some((q) => questionMatches(q, questionSearch))) && (
            <p className="p-6 text-center text-xs text-slate-400">No mock test question contains &ldquo;{questionSearch.trim()}&rdquo;.</p>
          )}
        </div>
      )}

      {!questionSearch.trim() && mockTests.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div role="group" aria-label="Show tests" className="inline-flex p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle self-start">
            {[
              { id: 'all', label: 'All', Icon: ListChecks },
              { id: 'public', label: 'Public', Icon: Globe },
              { id: 'private', label: 'Private', Icon: Lock }
            ].map(({ id, label, Icon }) => {
              const active = accessFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => pickAccess(id)}
                  aria-pressed={active}
                  className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors ${
                    active
                      ? id === 'private'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : id === 'public'
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'bg-[#087F8C] text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`text-[10px] font-extrabold px-1.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {counts[id]}
                  </span>
                </button>
              );
            })}
          </div>

          {accessFilter === 'private' && usedBatchIds.length > 0 && (
            <select
              aria-label="Batch"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-subtle focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 sm:max-w-xs"
            >
              <option value="all">All batches</option>
              {usedBatchIds.map((id) => (
                <option key={id} value={id}>
                  {batchName(id)} ({privateTests.filter((t) => (t.batchSubjectIds || []).includes(id)).length})
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {!questionSearch.trim() && mockTests.length > 0 && filtering && days.length === 0 && (
        <div className="p-6 sm:p-10 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
            No {accessFilter} mock tests{batchFilter !== 'all' ? ` for ${batchName(batchFilter)}` : ''}.
          </p>
          <button type="button" onClick={() => pickAccess('all')} className="text-xs font-bold text-[#087F8C] dark:text-teal-300 hover:underline">
            Show all tests
          </button>
        </div>
      )}

      {mockTests.length === 0 && (
        <div className="p-8 sm:p-14 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-slate-800 dark:text-slate-100">No mock tests yet</p>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Create your first mock test for Day 1. You can add several mock tests to the same day.
          </p>
          <button type="button" onClick={() => openCreate(1)} className={primaryBtn}>
            <Plus className="w-4 h-4" /> Create Mock Test
          </button>
        </div>
      )}

      {!questionSearch.trim() && days.map(({ day, tests }) => (
        <section key={day} className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-[#087F8C] dark:text-teal-300" />
              Day {day}
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#E8F3F4] dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 font-bold">
                {tests.length} test{tests.length === 1 ? '' : 's'}
              </span>
            </h2>
            <button type="button" onClick={() => openCreate(day)} className="text-xs font-bold text-[#087F8C] dark:text-teal-300 hover:underline flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add to Day {day}
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
            {tests.map((test) => {
              const qCount = (test.questions || []).length;
              const attempts = attemptsByTest.get(test.id) || 0;
              return (
                <article
                  key={test.id}
                  className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border shadow-subtle space-y-4 ${
                    test.enabled ? 'border-[#087F8C]/30 dark:border-teal-800/60' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          test.enabled
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {test.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {test.enabled ? 'Visible' : 'Hidden'}
                      </span>
                      <span
                        className={`ml-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          isPrivateMockTest(test)
                            ? 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800'
                            : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
                        }`}
                      >
                        {isPrivateMockTest(test) ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                        {isPrivateMockTest(test) ? 'Private' : 'Public'}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug break-words">{test.title}</h3>
                      {test.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{test.description}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(test);
                          setFormOpen(true);
                        }}
                        aria-label={`Edit ${test.title}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-[#087F8C] hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(test)}
                        aria-label={`Delete ${test.title}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5 text-slate-400" />{qCount} question{qCount === 1 ? '' : 's'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" />{formatDuration(test.durationMinutes)}</span>
                    <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5 text-slate-400" />{test.allowRetest ? 'Retest allowed' : 'One attempt'}</span>
                  </div>

                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    {isPrivateMockTest(test) ? (
                      <>
                        <Lock className="w-3.5 h-3.5 mt-px text-violet-500 shrink-0" />
                        <span>
                          Only for:{' '}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {(test.batchSubjectIds || []).map(batchName).join(', ') || 'no batch chosen'}
                          </strong>
                        </span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5 mt-px text-sky-500 shrink-0" />
                        <span>Open to every student who signs in</span>
                      </>
                    )}
                  </p>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
                    <Toggle
                      checked={!!test.enabled}
                      onChange={(v) => toggleEnabled(test, v)}
                      label="Visible to students"
                      hint={!qCount ? 'Add questions first' : undefined}
                    />
                    <Toggle
                      checked={!!test.allowRetest}
                      onChange={(v) => updateMockTest(test.id, { allowRetest: v })}
                      label="Allow retest"
                      tone="amber"
                    />
                    <Toggle
                      checked={!!test.shuffleQuestions}
                      onChange={(v) => updateMockTest(test.id, { shuffleQuestions: v })}
                      label="Shuffle questions"
                    />
                    <Toggle
                      checked={!!test.shuffleOptions}
                      onChange={(v) => updateMockTest(test.id, { shuffleOptions: v })}
                      label="Shuffle answers"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => onOpenQuestions(test.id)} className={`${primaryBtn} flex-1`}>
                      <ListChecks className="w-4 h-4" /> Questions
                    </button>
                    <button type="button" onClick={() => onOpenResults(test.id)} className={`${secondaryBtn} flex-1`}>
                      <BarChart3 className="w-4 h-4" /> Results ({attempts})
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <MockTestFormModal
        open={formOpen}
        test={editing}
        existingDays={existingDays}
        defaultDay={newForDay}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
};
