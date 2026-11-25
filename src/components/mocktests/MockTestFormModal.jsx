import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Modal, Toggle, primaryBtn, secondaryBtn, inputCls, labelCls } from './MockTestUi';
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const total = test?.durationMinutes ?? 60;
    setTitle(test?.title || '');
    setDay(test?.day || defaultDay);
    setDescription(test?.description || '');
    setHours(Math.floor(total / 60));
    setMinutes(total % 60);
    setAllowRetest(!!test?.allowRetest);
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
    onSave({
      title: title.trim(),
      day: Math.floor(Number(day)),
      description: description.trim(),
      durationMinutes: totalMinutes,
      allowRetest
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

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <Toggle
            checked={allowRetest}
            onChange={setAllowRetest}
            label="Allow retest"
            hint="When on, students can take this mock test again after submitting."
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
