import React, { useState } from 'react';
import {
  BookOpen,
  Radio,
  ClipboardList,
  Award,
  ClipboardCheck,
  MessageCircleQuestion,
  Bell,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertTriangle,
  Video,
  NotebookText,
  HelpCircle,
  ChevronDown,
  Layers,
  Trophy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STUDENT_MODULES, CONTENT_TYPES, getContentAccess } from '../../utils/studentModules';

const CONTENT_ICONS = { videos: Video, notes: NotebookText, questions: HelpCircle };

const ICONS = {
  subjects: BookOpen,
  examinations: Radio,
  'mock-tests': ClipboardList,
  quizzes: Award,
  review: ClipboardCheck,
  rankings: Trophy,
  doubts: MessageCircleQuestion,
  notifications: Bell
};

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
      checked ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-700'
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

export const StudentPermissions = () => {
  const { studentModules, updateStudentModules, showToast, curriculumSubjects, contentAccess, updateContentAccess } = useApp();
  const [openSubjectId, setOpenSubjectId] = useState(null);

  const setContent = (subject, module, type, enabled) => {
    updateContentAccess(subject.id, module?.id || null, type, enabled);
    const typeLabel = CONTENT_TYPES.find((t) => t.id === type)?.label;
    const where = module ? module.title : `all courses in ${subject.name}`;
    showToast(`${typeLabel} ${enabled ? 'shown' : 'hidden'} for ${where}`, enabled ? 'success' : 'info');
  };

  const enabledCount = STUDENT_MODULES.filter((m) => studentModules[m.id]).length;

  const setOne = (module, enabled) => {
    updateStudentModules({ [module.id]: enabled });
    showToast(`${module.label} ${enabled ? 'enabled' : 'disabled'} for students`, enabled ? 'success' : 'info');
  };

  const setAll = (enabled) => {
    updateStudentModules(Object.fromEntries(STUDENT_MODULES.map((m) => [m.id, enabled])));
    showToast(enabled ? 'All modules enabled for students' : 'All modules disabled for students', enabled ? 'success' : 'info');
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300">
            Access Control
          </span>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Student Permissions</h1>
          <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Choose which modules students can see. A disabled module is removed from every student's menu straight away.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAll(true)}
            disabled={enabledCount === STUDENT_MODULES.length}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <Eye className="w-4 h-4 text-emerald-600" /> Enable all
          </button>
          <button
            type="button"
            onClick={() => setAll(false)}
            disabled={enabledCount === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <EyeOff className="w-4 h-4 text-red-500" /> Disable all
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[#087F8C] bg-[#E6F4F6] dark:bg-[#0E353E] dark:text-cyan-300">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-none">
            {enabledCount} / {STUDENT_MODULES.length}
          </div>
          <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-1">Modules visible to students</div>
        </div>
      </div>

      {enabledCount === 0 && (
        <div className="p-3 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 flex items-start gap-2.5 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Every module is disabled. Students will only see their Settings page until you enable one.</span>
        </div>
      )}

      <div className="rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800">
        {STUDENT_MODULES.map((module) => {
          const Icon = ICONS[module.id] || BookOpen;
          const enabled = studentModules[module.id];
          return (
            <div key={module.id} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  enabled
                    ? 'text-teal-700 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-300'
                    : 'text-slate-400 bg-slate-100 dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-bold ${enabled ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {module.label}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      enabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {enabled ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{module.description}</p>
              </div>
              <Toggle checked={enabled} onChange={(v) => setOne(module, v)} label={`Show ${module.label} to students`} />
            </div>
          );
        })}
      </div>

      {/* Subject content access: lesson videos / study notes / Q&A per subject and per course */}
      <div className="pt-2">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">Subject Content Access</h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
          Inside each subject, choose whether students see Lesson Videos, Study Notes and Questions &amp; Answers.
          A subject switch applies to all its courses. Open a subject to set courses one by one.
        </p>
      </div>

      {!studentModules.subjects && (
        <div className="p-3 sm:p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 flex items-start gap-2.5 text-sm">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Subjects &amp; Curriculum is disabled above, so students can&apos;t open any subject right now.</span>
        </div>
      )}

      {(curriculumSubjects || []).length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-white dark:bg-surface-darkCard border border-dashed border-slate-300 dark:border-slate-700 text-sm text-slate-500">
          No subjects yet. Add a subject in Subjects &amp; Curriculum first.
        </div>
      ) : (
        <div className="space-y-3">
          {curriculumSubjects.map((subject) => {
            const subjectAccess = getContentAccess(contentAccess, subject.id);
            const modules = subject.modules || [];
            const open = openSubjectId === subject.id;
            // How many courses differ from the subject switch, per content type
            const customCount = (type) =>
              modules.filter((m) => getContentAccess(contentAccess, subject.id, m.id)[type] !== subjectAccess[type]).length;

            return (
              <div key={subject.id} className="rounded-2xl bg-white dark:bg-surface-darkCard border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
                <div className="p-3.5 sm:p-4 flex flex-col xl:flex-row xl:items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenSubjectId(open ? null : subject.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left group"
                    aria-expanded={open}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-teal-700 bg-teal-50 dark:bg-teal-950/50 dark:text-teal-300">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-300">
                        {subject.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {modules.length} {modules.length === 1 ? 'course' : 'courses'} &middot; {open ? 'Hide courses' : 'Set per course'}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xl:w-[690px] shrink-0">
                    {CONTENT_TYPES.map((type) => {
                      const Icon = CONTENT_ICONS[type.id];
                      const custom = customCount(type.id);
                      return (
                        <div key={type.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                              <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{type.label}</span>
                            </div>
                            {custom > 0 && (
                              <div className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                                {custom} {custom === 1 ? 'course differs' : 'courses differ'}
                              </div>
                            )}
                          </div>
                          <Toggle
                            checked={subjectAccess[type.id]}
                            onChange={(v) => setContent(subject, null, type.id, v)}
                            label={`Show ${type.label} in ${subject.name}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {open && (
                  <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 divide-y divide-slate-100 dark:divide-slate-800">
                    {modules.length === 0 && (
                      <div className="p-4 text-xs text-slate-500">This subject has no courses yet.</div>
                    )}
                    {modules.map((module, idx) => {
                      const access = getContentAccess(contentAccess, subject.id, module.id);
                      return (
                        <div key={module.id || idx} className="p-3 sm:px-4 flex flex-col xl:flex-row xl:items-center gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1 xl:pl-6">
                            <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Course {idx + 1}</div>
                              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{module.title}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xl:w-[690px] shrink-0">
                            {CONTENT_TYPES.map((type) => {
                              const Icon = CONTENT_ICONS[type.id];
                              return (
                                <div key={type.id} className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-surface-darkCard border border-slate-200/70 dark:border-slate-800">
                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 min-w-0">
                                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                    <span className="truncate">{type.label}</span>
                                  </span>
                                  <Toggle
                                    checked={access[type.id]}
                                    onChange={(v) => setContent(subject, module, type.id, v)}
                                    label={`Show ${type.label} in ${module.title}`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentPermissions;
