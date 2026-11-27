import React, { useEffect, useState } from 'react';
import { ClipboardList, Globe, Lock, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal, Toggle, primaryBtn, secondaryBtn, inputCls, labelCls } from './MockTestUi';
import { NegativeMarkPicker } from '../common/NegativeMarkPicker';
import { formatDuration } from '../../utils/mockTests';

const DURATION_PRESETS = [30, 60, 90, 120, 180];

/** Create a mock test, or edit its details (title, day, duration, retest). */
export const MockTestFormModal = ({ open, onClose, onSave, test, existingDays = [], defaultDay = 1 }) => {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(1);
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [allowRetest, setAllowRetest] = useState(false);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [negativeMark, setNegativeMark] = useState(0);
  const [access, setAccess] = useState('public');
  const [batchIds, setBatchIds] = useState([]);
  const [error, setError] = useState('');
  const { curriculumSubjects } = useApp();
  // Batches are the courses students subscribe to (e.g. Normal Batch, Revision Batch)
  const batches = curriculumSubjects || [];
  const isFree = (b) => !b.price || Number(b.price) === 0;

  useEffect(() => {
    if (!open) return;
    const total = test?.durationMinutes ?? 60;
    setTitle(test?.title || '');
    setDay(test?.day || defaultDay);
    setDescription(test?.description || '');
    setHours(Math.floor(total / 60));
    setMinutes(total % 60);
    setAllowRetest(!!test?.allowRetest);
    setShuffleQuestions(!!test?.shuffleQuestions);
    setShuffleOptions(!!test?.shuffleOptions);
    setNegativeMark(Math.max(0, Number(test?.negativeMark) || 0));
    setAccess(test?.access === 'private' ? 'private' : 'public');
    setBatchIds(test?.batchSubjectIds || []);
    setError('');
  }, [open, test, defaultDay]);

  const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);

  const setPreset = (m) => {
    setHours(Math.floor(m / 60));
    setMinutes(m % 60);
  };

  const handleSave = () => {
    if (!title.trim()) return setError('Enter a title for the mock test.');
    if (!(Number(day) >= 1)) return setError('Day must be 1 or more.');
    if (totalMinutes < 1) return setError('Set an exam time of at least 1 minute.');
    if (totalMinutes > 600) return setError('Exam time can be at most 10 hours.');
    const chosen = batchIds.filter((id) => batches.some((b) => b.id === id));
    if (access === 'private' && chosen.length === 0) return setError('Choose at least one batch for a private mock test.');
    onSave({
      title: title.trim(),
      day: Math.floor(Number(day)),
      description: description.trim(),
      durationMinutes: totalMinutes,
      allowRetest,
      shuffleQuestions,
      shuffleOptions,
      negativeMark,
      access,
      batchSubjectIds: access === 'private' ? chosen : []
    });
  };

  const nextDay = existingDays.length ? Math.max(...existingDays) + 1 : 1;
  const dayChoices = [...new Set([...existingDays, nextDay])].sort((a, b) => a - b);

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={ClipboardList}
      title={test ? 'Edit Mock Test' : 'Create Mock Test'}
      subtitle={test ? test.title : 'Set the day, exam time and retest rule'}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryBtn}>Cancel</button>
          <button type="button" onClick={handleSave} className={primaryBtn}>
            {test ? 'Save Changes' : 'Create Mock Test'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className={labelCls} htmlFor="mock-title">Mock test title</label>
          <input
            id="mock-title"
            className={inputCls}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mock Test 1 – Building Materials"
            autoFocus
          />
        </div>

        <div>
          <label className={labelCls} htmlFor="mock-day">Day</label>
          <div className="flex flex-wrap items-center gap-2">
            {dayChoices.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  Number(day) === d
                    ? 'bg-[#087F8C] border-[#087F8C] text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/50'
                }`}
              >
                Day {d}{!existingDays.includes(d) && ' (new)'}
              </button>
            ))}
            <span className="text-xs text-slate-400">or</span>
            <input
              id="mock-day"
              type="number"
              min={1}
              className={`${inputCls} !w-24`}
              value={day}
              onChange={(e) => setDay(e.target.value)}
              aria-label="Day number"
            />
          </div>
        </div>

        {/* Who can take this test */}
        <div>
          <span className={labelCls}>Who can take this test</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Who can take this test">
            {[
              { id: 'public', Icon: Globe, title: 'Public', text: 'Every student who signs in can take it.' },
              { id: 'private', Icon: Lock, title: 'Private', text: 'Only students of the batches you choose.' }
            ].map(({ id, Icon, title: t, text }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={access === id}
                onClick={() => setAccess(id)}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-colors ${
                  access === id
                    ? 'border-[#087F8C] bg-[#E6F4F6] dark:bg-[#0E353E]/70 ring-2 ring-[#087F8C]/15'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#087F8C]/40'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    access === id ? 'bg-[#087F8C] text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900 dark:text-white">{t}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{text}</span>
                </span>
              </button>
            ))}
          </div>

          {access === 'private' && (
            <div className="mt-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Batches that can take it <span className="font-semibold text-slate-400">({batchIds.length} chosen)</span>
                </span>
                {batches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setBatchIds(batchIds.length === batches.length ? [] : batches.map((b) => b.id))}
                    className="text-[11px] font-bold text-[#087F8C] dark:text-teal-300 hover:underline"
                  >
                    {batchIds.length === batches.length ? 'Clear all' : 'Select all batches'}
                  </button>
                )}
              </div>
              {batches.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  No batches yet. Create the courses (for example Normal Batch and Revision Batch) in Subjects &amp; Curriculum first.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {batches.map((b) => {
                    const on = batchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        onClick={() => setBatchIds(on ? batchIds.filter((x) => x !== b.id) : [...batchIds, b.id])}
                        className={`px-2.5 py-2 rounded-xl border text-left flex items-center gap-2 text-xs transition-colors ${
                          on
                            ? 'border-[#087F8C] bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                            : 'border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/40'
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                            on ? 'bg-[#087F8C] border-[#087F8C] text-white' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {on && <Check className="w-3 h-3" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate font-semibold" title={b.name}>{b.name}</span>
                        {isFree(b) && <span className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400 shrink-0">Free</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Students with an active subscription to any chosen batch can take it. Tick several batches to share one test
                between them (e.g. Normal and Revision).
                {batches.some((b) => batchIds.includes(b.id) && isFree(b)) && (
                  <strong className="text-amber-700 dark:text-amber-400"> A free batch is open to every student, so this test works like a public one.</strong>
                )}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Examination time</label>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {DURATION_PRESETS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setPreset(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                  totalMinutes === m
                    ? 'bg-[#087F8C] border-[#087F8C] text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#087F8C]/50'
                }`}
              >
                {formatDuration(m)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={10}
              className={`${inputCls} !w-20`}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              aria-label="Hours"
            />
            <span className="text-xs font-semibold text-slate-500">hours</span>
            <input
              type="number"
              min={0}
              max={59}
              className={`${inputCls} !w-20`}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              aria-label="Minutes"
            />
            <span className="text-xs font-semibold text-slate-500">minutes</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            Each student gets <strong>{formatDuration(totalMinutes)}</strong> from the moment they start. The test submits itself when the time runs out.
          </p>
        </div>

        <div>
          <label className={labelCls} htmlFor="mock-desc">Instructions for students (optional)</label>
          <textarea
            id="mock-desc"
            rows={2}
            className={inputCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Covers Units 1–3. Each question carries 1 mark."
          />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
          <Toggle
            checked={allowRetest}
            onChange={setAllowRetest}
            label="Allow retest"
            hint="When on, students can take this mock test again after submitting."
          />
          <Toggle
            checked={shuffleQuestions}
            onChange={setShuffleQuestions}
            label="Shuffle questions"
            hint="Each student gets the questions in a different order."
          />
          <div className="pt-3 border-t border-slate-200/70 dark:border-slate-700">
            <NegativeMarkPicker
              value={negativeMark}
              onChange={setNegativeMark}
              hint="Correct = +1, wrong = minus this, skipped = 0. Students are told before they start."
            />
          </div>
          <Toggle
            checked={shuffleOptions}
            onChange={setShuffleOptions}
            label="Shuffle answers"
            hint="The A / B / C / D options appear in a different order. Marking is not affected."
          />
        </div>

        {!test && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            New mock tests start hidden from students. Add questions, then switch on <strong>Visible to students</strong>.
          </p>
        )}

        {error && <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>}
      </div>
    </Modal>
  );
};
