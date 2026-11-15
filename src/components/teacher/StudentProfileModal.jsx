import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Clock,
  Download
} from 'lucide-react';

export const StudentProfileModal = ({ student, onClose, onEdit }) => {
  const { attempts, subjects, quizzes } = useApp();

  if (!student) return null;

  // Filter student attempts
  const studentAttempts = attempts.filter((a) => a.studentId === student.id);
  const passedCount = studentAttempts.filter((a) => a.status === 'PASSED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-navy-950 to-navy-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-extrabold">{student.name}</h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {student.studentId}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    student.performanceStatus === 'Excellent'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : student.performanceStatus === 'Good'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : student.performanceStatus === 'Average'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-red-500/20 text-red-300 border border-red-400/30'
                  }`}
                >
                  {student.performanceStatus}
                </span>
              </div>

              <p className="text-xs text-slate-300">{student.bio || 'Civil Engineering Undergraduate'}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  {student.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Enrolled: {student.enrollmentDate}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          {/* Key Academic Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold block">Semester & Batch</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                {student.semester} ({student.batch})
              </span>
              <span className="text-[10px] text-slate-500">Dept of Civil Engineering</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold block">Attendance Rate</span>
              <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
                {student.attendancePct}%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Eligible for Exams</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold block">Cumulative CGPA</span>
              <span className="text-base font-extrabold text-purple-600 dark:text-purple-400 mt-1 block font-mono">
                {student.cgpa} / 10.0
              </span>
              <span className="text-[10px] text-slate-500">Academic Standing</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold block">Quiz Average</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                {student.averageScore}%
              </span>
              <span className="text-[10px] text-slate-500">{student.completedQuizzes} Quizzes Completed</span>
            </div>
          </div>

          {/* Subject-Wise Mastery Progress */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Subject-Wise Progress & Proficiency</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((sub) => {
                const progress = (student.subjectProgress && student.subjectProgress[sub.id]) || 78;
                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {sub.name}
                      </span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          progress >= 85
                            ? 'bg-emerald-500'
                            : progress >= 75
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiz Attempt History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Verified Assessment Attempts ({studentAttempts.length})</span>
              </h4>
              <span className="text-xs text-slate-500">
                Passed: {passedCount} / {studentAttempts.length}
              </span>
            </div>

            {studentAttempts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs">
                No official quiz attempts logged for this student yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                {studentAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {att.quizTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Date: {new Date(att.submittedAt).toLocaleDateString()} • Time spent:{' '}
                        {Math.floor(att.timeSpentSeconds / 60)}m {att.timeSpentSeconds % 60}s
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {att.score} / {att.totalMarks} ({att.percentage}%)
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {att.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (onEdit) onEdit(student);
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Edit Student Details
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

