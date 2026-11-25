import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminMockTests } from './AdminMockTests';
import { MockTestQuestions } from './MockTestQuestions';
import { AdminMockTestResults } from './AdminMockTestResults';
import { StudentMockTests } from './StudentMockTests';
import { MockTestAttempt } from './MockTestAttempt';
import { MockTestResult } from './MockTestResult';

/** Mock Tests module: admin manages tests by day, students take timed tests. */
export const MockTestsMain = () => {
  const { currentRole, mockTests, activeMockTest, setActiveMockTest, startMockTest } = useApp();
  const [adminView, setAdminView] = useState({ page: 'list', testId: null });
  const [viewingAttempt, setViewingAttempt] = useState(null);

  if (currentRole === 'teacher' || currentRole === 'admin') {
    const back = () => setAdminView({ page: 'list', testId: null });
    if (adminView.page === 'questions') return <MockTestQuestions testId={adminView.testId} onBack={back} />;
    if (adminView.page === 'results') return <AdminMockTestResults testId={adminView.testId} onBack={back} />;
    return (
      <AdminMockTests
        onOpenQuestions={(testId) => setAdminView({ page: 'questions', testId })}
        onOpenResults={(testId) => setAdminView({ page: 'results', testId })}
      />
    );
  }

  if (activeMockTest) {
    return (
      <MockTestAttempt
        key={activeMockTest.test.id + activeMockTest.session.startedAt}
        test={activeMockTest.test}
        session={activeMockTest.session}
        onExit={() => setActiveMockTest(null)}
        onSubmitted={(attempt) => {
          setActiveMockTest(null);
          setViewingAttempt(attempt);
        }}
      />
    );
  }

  if (viewingAttempt) {
    const test = mockTests.find((t) => t.id === viewingAttempt.testId);
    const canRetake = !!(test && test.enabled && test.allowRetest && (test.questions || []).length);
    return (
      <MockTestResult
        attempt={viewingAttempt}
        onBack={() => setViewingAttempt(null)}
        onRetake={
          canRetake
            ? async () => {
                if (await startMockTest(test.id)) setViewingAttempt(null);
              }
            : undefined
        }
      />
    );
  }

  return <StudentMockTests onStart={startMockTest} onViewResult={setViewingAttempt} />;
};
