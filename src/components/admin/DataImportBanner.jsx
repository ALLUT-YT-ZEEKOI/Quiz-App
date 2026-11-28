import React, { useState } from 'react';
import { DatabaseZap, Upload, LoaderCircle } from 'lucide-react';
import { useApp, DEFAULT_DIFFICULTY_LEVELS } from '../../context/AppContext';
import { api } from '../../api/client';
import { STUDENTS } from '../../data/initialData';
import { QUESTIONS_BANK } from '../../data/questionsData';
import { INITIAL_QUIZZES, INITIAL_ATTEMPTS, INITIAL_NOTIFICATIONS } from '../../data/quizzesData';
import { INITIAL_CURRICULUM, INITIAL_CURRICULUM_ATTEMPTS, INITIAL_SUBSCRIPTIONS, INITIAL_DOUBTS } from '../../data/curriculumData';
import { INITIAL_EXAMINATIONS, generateLiveMonitoringData, generateCompletedExamAttempts } from '../../data/examinationsData';
import { normalizeCurriculumSections } from '../../utils/curriculumSections';
import { formatEmbedUrl } from '../../utils/videoUtils';
import { getLocalNoteFile, saveNoteFile, collectFileNoteIds, MAX_NOTE_FILE_BYTES } from '../../utils/notesStorage';
import { compressDataUrl } from '../../utils/imageCompress';

const PART_LIMIT = 3 * 1024 * 1024; // characters of JSON per request

/** Splits the import into requests that each stay under PART_LIMIT. */
const splitIntoParts = ({ collections, accounts }) => {
  const parts = [];
  let current = {};
  let size = 0;
  const push = () => {
    if (size) parts.push(current);
    current = {};
    size = 0;
  };
  Object.entries(collections).forEach(([name, items]) => {
    items.forEach((item) => {
      const itemSize = JSON.stringify(item).length;
      if (size && size + itemSize > PART_LIMIT) push();
      (current[name] ||= []).push(item);
      size += itemSize;
    });
  });
  push();
  if (!parts.length) parts.push({});
  return parts.map((part, i) => ({ collections: part, accounts: i === parts.length - 1 ? accounts : [], final: i === parts.length - 1 }));
};

/** Shrinks cover images and payment screenshots saved in this browser before upload. */
const shrinkImages = async (collections) => {
  const big = (v) => typeof v === 'string' && v.startsWith('data:image/') && v.length > 300 * 1024;
  collections.curriculum = await Promise.all(
    collections.curriculum.map(async (s) => (big(s.thumbnail) ? { ...s, thumbnail: await compressDataUrl(s.thumbnail, { maxDim: 1200 }) } : s))
  );
  collections.subscriptions = await Promise.all(
    collections.subscriptions.map(async (r) =>
      big(r.screenshot) ? { ...r, screenshot: await compressDataUrl(r.screenshot, { maxDim: 1600, quality: 0.75 }) } : r
    )
  );
};

// API collection name -> [this browser's localStorage key, built-in sample data]
const SOURCES = {
  curriculum: ['cohesion_curriculum', () => INITIAL_CURRICULUM],
  curriculumAttempts: ['cohesion_curriculum_attempts', () => INITIAL_CURRICULUM_ATTEMPTS],
  subscriptions: ['cohesion_subscriptions', () => INITIAL_SUBSCRIPTIONS],
  examinations: ['cohesion_examinations', () => INITIAL_EXAMINATIONS],
  examAttempts: ['cohesion_exam_attempts', () => generateCompletedExamAttempts()],
  examMonitoring: ['cohesion_exam_monitoring', () => generateLiveMonitoringData('EXAM-2026-001')],
  retests: ['cohesion_retests', () => []],
  doubts: ['cohesion_doubts', () => INITIAL_DOUBTS],
  pinnedTests: ['cohesion_pinned_tests', () => []],
  notifications: ['qsap_notifications', () => INITIAL_NOTIFICATIONS],
  students: ['qsap_students', () => STUDENTS],
  questions: ['qsap_questions', () => QUESTIONS_BANK],
  quizzes: ['qsap_quizzes', () => INITIAL_QUIZZES],
  attempts: ['qsap_attempts', () => INITIAL_ATTEMPTS],
  difficultyLevels: ['cohesion_difficulty_levels', () => DEFAULT_DIFFICULTY_LEVELS]
};

const readLocal = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** Everything built in this browser before the backend existed (sample data where nothing was saved). */
const collectBrowserData = () => {
  const collections = {};
  Object.entries(SOURCES).forEach(([name, [key, fallback]]) => {
    collections[name] = readLocal(key) ?? fallback();
  });
  collections.curriculum = normalizeCurriculumSections(
    collections.curriculum.map((s) => ({
      ...s,
      modules: (s.modules || []).map((m) => ({
        ...m,
        videos: (m.videos || []).map((v) => ({ ...v, videoUrl: formatEmbedUrl(v.videoUrl) }))
      }))
    }))
  );
  return { collections, accounts: readLocal('cohesion_student_accounts') || [] };
};

/** Shown to the admin while the online database has not been set up yet. */
export const DataImportBanner = () => {
  const { loadServerData, setServerInitialized, showToast } = useApp();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('');

  const runImport = async () => {
    setBusy(true);
    try {
      setStep('Preparing your data…');
      const payload = collectBrowserData();
      await shrinkImages(payload.collections);
      const parts = splitIntoParts(payload);
      const summary = {};
      for (const [i, part] of parts.entries()) {
        setStep(`Uploading subjects, exams, students and results${parts.length > 1 ? ` (part ${i + 1}/${parts.length})` : ''}…`);
        const res = await api('/admin/import', { method: 'POST', body: part });
        Object.entries(res.summary || {}).forEach(([k, v]) => (summary[k] = (summary[k] || 0) + v));
      }

      const noteIds = collectFileNoteIds(payload.collections.curriculum.flatMap((s) => s.modules || []));
      let files = 0;
      let tooBig = 0;
      for (const [i, id] of noteIds.entries()) {
        setStep(`Uploading note files (${i + 1}/${noteIds.length})…`);
        const blob = await getLocalNoteFile(id).catch(() => null);
        if (!blob) continue;
        if (blob.size > MAX_NOTE_FILE_BYTES) {
          tooBig++; // open the note and upload a smaller copy (e.g. a compressed PDF)
          continue;
        }
        await saveNoteFile(id, blob);
        files++;
      }

      setStep('Loading your data from the server…');
      await loadServerData();
      const total = Object.entries(summary).reduce((n, [, v]) => n + v, 0);
      showToast(`Imported ${total} records${files ? ` and ${files} note files` : ''} to the online database.`, 'success', 6000);
      if (tooBig) {
        showToast(`${tooBig} note file(s) are larger than the online limit and were skipped. Upload smaller copies in those notes.`, 'warning', 9000);
      }
    } catch (err) {
      showToast(`Import failed: ${err.message}`, 'warning', 7000);
    } finally {
      setBusy(false);
      setStep('');
    }
  };

  const startEmpty = async () => {
    setBusy(true);
    try {
      await api('/admin/initialize', { method: 'POST', body: {} });
      setServerInitialized(true);
    } catch (err) {
      showToast(err.message, 'warning');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-white dark:bg-surface-darkCard border-2 border-blue-200 dark:border-blue-900/60 shadow-premium flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
          <DatabaseZap className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h2 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">Your online database is empty</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Upload the subjects, videos, notes, exams, students and results saved in this browser, so every student and
            device sees them. Students who already registered keep their passwords. Do this once, from the browser you've
            been using.
          </p>
          {busy && step && (
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mt-2 inline-flex items-center gap-1.5">
              <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> {step}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={startEmpty}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
        >
          Start empty
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={runImport}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold inline-flex items-center gap-1.5"
        >
          {busy ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload my existing data
        </button>
      </div>
    </div>
  );
};

/** Full-screen state while the signed-in user's data loads from the server. */
export const ServerLoadingScreen = ({ error, onRetry, onSignOut }) => (
  <div className="h-screen flex items-center justify-center bg-[#F4F7F8] dark:bg-surface-darkBg p-6">
    <div className="text-center space-y-4 max-w-sm">
      <img src="/logo.jpg" alt="CohesionTech" className="w-14 h-14 rounded-2xl mx-auto shadow-md" />
      {error ? (
        <div className="space-y-3">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Can't load your data</p>
          <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900 leading-relaxed font-medium">
            {error}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
            <button
              type="button"
              onClick={onRetry}
              className="px-4 py-2 rounded-xl bg-[#087F8C] hover:bg-[#06636D] text-white text-xs font-bold transition-all shadow-sm"
            >
              Try again
            </button>
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 inline-flex items-center gap-2">
            <LoaderCircle className="w-4 h-4 animate-spin text-[#087F8C]" /> Loading your data…
          </p>
          <p className="text-[11px] text-slate-400">Connecting to database...</p>
        </div>
      )}
    </div>
  </div>
);
