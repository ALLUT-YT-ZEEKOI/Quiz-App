import React from 'react';
import { Pin, PinOff } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { testPinId } from '../../../backend/src/services/testPins';
import { canStudentSeeMockTest } from '../../utils/mockTests';
import { getContentAccess } from '../../utils/studentModules';
import { isSortedQuestion } from '../../utils/curriculumSections';
import { OPEN_CURRICULUM, OPEN_MOCK_TEST, requestOpen } from '../../utils/openRequest';

export const TestPinButton = ({ target, title }) => {
  const { currentUserId, studentModules, pinnedTests, toggleTestPin } = useApp();
  if (studentModules['pinned-tests'] === false) return null;
  const pinned = pinnedTests.some((p) => p.id === testPinId(currentUserId, target));
  const Icon = pinned ? PinOff : Pin;
  return (
    <button type="button" aria-label={`${pinned ? 'Unpin' : 'Pin'} ${title}`} aria-pressed={pinned}
      onClick={() => toggleTestPin(target)}
      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 hover:border-teal-500 aria-pressed:bg-teal-50 aria-pressed:text-teal-800 dark:border-slate-700 dark:text-slate-300 dark:aria-pressed:bg-teal-950 dark:aria-pressed:text-teal-300">
      <Icon className="size-3.5" aria-hidden="true" /> {pinned ? 'Pinned' : 'Pin'}
    </button>
  );
};

export const PinnedTests = () => {
  const { currentUserId, pinnedTests, curriculumSubjects, mockTests, studentModules, contentAccess, checkEnrollmentStatus, setActiveView, setActiveMockTest } = useApp();
  const mine = pinnedTests.filter((p) => p.studentId === currentUserId);
  const enrolled = (id) => checkEnrollmentStatus(currentUserId, id) === 'active';

  const resolve = (pin) => {
    if (pin.kind === 'mock') {
      const test = mockTests.find((t) => t.id === pin.testId);
      if (!studentModules['mock-tests'] || !canStudentSeeMockTest(test, enrolled)) return null;
      return { title: test.title, detail: `Mock Test · Day ${test.day}` };
    }
    if (!studentModules.subjects || !enrolled(pin.subjectId) || !getContentAccess(contentAccess, pin.subjectId, pin.moduleId).questions) return null;
    const subject = curriculumSubjects.find((s) => s.id === pin.subjectId);
    const module = subject?.modules?.find((m) => m.id === pin.moduleId);
    if (!module?.questions?.some((q) => pin.sectionId ? q.sectionId === pin.sectionId : !isSortedQuestion(module, q))) return null;
    const title = pin.sectionId ? module.sections?.find((s) => s.id === pin.sectionId)?.title : 'General practice';
    return title ? { title, detail: `${subject.name} · ${module.title}` } : null;
  };

  const open = (pin) => {
    if (pin.kind === 'mock') {
      // Return to the card even if an earlier attempt was left via the sidebar.
      // Its saved answers and deadline are restored by the usual Resume action.
      setActiveMockTest(null);
      requestOpen(OPEN_MOCK_TEST, pin.testId);
      setActiveView('mock-tests');
    } else {
      requestOpen(OPEN_CURRICULUM, { subjectId: pin.subjectId, moduleId: pin.moduleId, sectionId: pin.sectionId });
      setActiveView('subjects');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">Pinned Tests</h1>
      {mine.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">Pin a section in Questions &amp; Answers or a mock test to find it here.</p>}
      <ul className="grid gap-3 sm:grid-cols-2">
        {mine.map((pin) => {
          const item = resolve(pin);
          const title = item?.title || (pin.kind === 'mock' ? 'Unavailable mock test' : 'Unavailable practice section');
          return (
            <li key={pin.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-surface-darkCard">
              <button type="button" onClick={() => open(pin)} disabled={!item} className="flex-1 min-w-0 text-left enabled:hover:text-teal-700 dark:enabled:hover:text-teal-300">
                <span className="block break-words text-sm font-bold">{title}</span>
                {item && <span className="block break-words text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>}
              </button>
              <TestPinButton target={pin} title={title} />
            </li>
          );
        })}
      </ul>
    </div>
  );
};
