import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import { Trophy, Medal, Award, Star, TrendingUp, CheckCircle, Search } from 'lucide-react';

export const StudentLeaderboard = () => {
  const { students, currentUser, setSelectedStudentForProfile } = useApp();
  const [selectedSemester, setSelectedSemester] = useState('All');

  // Filter and sort students by averageScore descending, then CGPA descending
  const sortedStudents = [...students]
    .filter((s) => selectedSemester === 'All' || s.semester === selectedSemester)
    .sort((a, b) => b.averageScore - a.averageScore || b.cgpa - a.cgpa);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
              Civil Engineering Leaderboard
            </h1>
            <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold font-mono">
              Academic Ranks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Top academic performers ranked across all 10 core Civil Engineering modules.
          </p>
        </div>

        {/* Semester Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Semester:</span>
          <CustomDropdown
            value={selectedSemester}
            onChange={setSelectedSemester}
            options={[
              { value: 'All', label: 'All Semesters' },
              { value: 'S2', label: 'Semester S2' },
              { value: 'S4', label: 'Semester S4' },
              { value: 'S6', label: 'Semester S6' },
              { value: 'S8', label: 'Semester S8' }
            ]}
            buttonClassName="py-1.5 text-xs rounded-xl"
          />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {sortedStudents.length >= 3 && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-1 sm:pt-2 items-end">
          {/* #2 Silver */}
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col items-center text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-[10px] sm:text-xs mb-1.5 sm:mb-2">
              #2
            </div>
            <img
              src={sortedStudents[1].avatar}
              alt={sortedStudents[1].name}
              className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-2 sm:ring-4 ring-slate-300 mb-1 sm:mb-2"
            />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-full">
              {sortedStudents[1].name.split(' ')[0]}
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden sm:block">
              {sortedStudents[1].studentId}
            </span>
            <div className="mt-1 sm:mt-2 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px] sm:text-xs text-slate-800 dark:text-slate-200">
              {sortedStudents[1].averageScore}%
            </div>
          </div>

          {/* #1 Gold (Elevated Center) */}
          <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-white dark:to-surface-darkCard border-2 border-amber-400 shadow-premium flex flex-col items-center text-center -mt-2 sm:-mt-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-400 text-navy-950 flex items-center justify-center font-extrabold text-xs sm:text-sm mb-1.5 sm:mb-2 shadow-md shadow-amber-500/30">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-navy-950" />
            </div>
            <img
              src={sortedStudents[0].avatar}
              alt={sortedStudents[0].name}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover ring-3 sm:ring-4 ring-amber-400 mb-1 sm:mb-2 shadow-lg"
            />
            <h3 className="font-extrabold text-xs sm:text-base text-slate-900 dark:text-white truncate max-w-full">
              {sortedStudents[0].name.split(' ')[0]}
            </h3>
            <span className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 font-mono font-bold">
              Rank 1
            </span>
            <div className="mt-1 sm:mt-2 px-2 sm:px-4 py-0.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-900/50 font-mono font-extrabold text-xs sm:text-sm text-amber-900 dark:text-amber-200 shadow-2xs">
              {sortedStudents[0].averageScore}%
            </div>
          </div>

          {/* #3 Bronze */}
          <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-surface-darkCard border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col items-center text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-700/20 text-amber-800 flex items-center justify-center font-extrabold text-[10px] sm:text-xs mb-1.5 sm:mb-2">
              #3
            </div>
            <img
              src={sortedStudents[2].avatar}
              alt={sortedStudents[2].name}
              className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover ring-2 sm:ring-4 ring-amber-700/30 mb-1 sm:mb-2"
            />
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-full">
              {sortedStudents[2].name.split(' ')[0]}
            </h3>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono hidden sm:block">
              {sortedStudents[2].studentId}
            </span>
            <div className="mt-1 sm:mt-2 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 font-mono font-bold text-[10px] sm:text-xs text-slate-800 dark:text-slate-200">
              {sortedStudents[2].averageScore}%
            </div>
          </div>
        </div>
      )}

      {/* Desktop Leaderboard Table */}
      <div className="hidden md:block bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-6 text-center w-16">Rank</th>
                <th className="py-3.5">Student</th>
                <th className="py-3.5 text-center">Semester</th>
                <th className="py-3.5 text-center">Batch</th>
                <th className="py-3.5 text-center">Quizzes Done</th>
                <th className="py-3.5 text-center">Attendance</th>
                <th className="py-3.5 text-center">CGPA</th>
                <th className="py-3.5 pr-6 text-right">Quiz Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedStudents.map((st, index) => {
                const isCurrentUser = currentUser?.id === st.id;
                const rank = index + 1;

                return (
                  <tr
                    key={st.id}
                    className={`transition-colors ${
                      isCurrentUser
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 font-semibold'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3.5 pl-6 text-center">
                      {rank === 1 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-400 text-navy-950 font-extrabold flex items-center justify-center mx-auto text-xs shadow-sm">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 font-extrabold flex items-center justify-center mx-auto text-xs">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-7 h-7 rounded-full bg-amber-700/20 text-amber-800 font-extrabold flex items-center justify-center mx-auto text-xs">
                          3
                        </span>
                      ) : (
                        <span className="font-mono text-slate-500 font-bold">{rank}</span>
                      )}
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{st.name}</span>
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-sans">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{st.studentId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 text-center font-mono text-slate-700 dark:text-slate-300">
                      {st.semester}
                    </td>

                    <td className="py-3.5 text-center font-mono text-slate-500 text-[11px]">
                      {st.batch}
                    </td>

                    <td className="py-3.5 text-center font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {st.completedQuizzes} / 10
                    </td>

                    <td className="py-3.5 text-center font-mono font-semibold text-emerald-600">
                      {st.attendancePct}%
                    </td>

                    <td className="py-3.5 text-center font-mono font-bold text-purple-600 dark:text-purple-400">
                      {st.cgpa}
                    </td>

                    <td className="py-3.5 pr-6 text-right font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {st.averageScore}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Alternative (App-like List View) */}
      <div className="md:hidden space-y-2.5">
        {sortedStudents.map((st, index) => {
          const isCurrentUser = currentUser?.id === st.id;
          const rank = index + 1;

          return (
            <div
              key={st.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                isCurrentUser
                  ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-sm'
                  : 'bg-white dark:bg-surface-darkCard border-slate-200 dark:border-slate-800 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-extrabold text-xs flex-shrink-0 ${
                    rank === 1
                      ? 'bg-amber-400 text-navy-950 shadow-sm'
                      : rank === 2
                      ? 'bg-slate-300 text-slate-800'
                      : rank === 3
                      ? 'bg-amber-700/20 text-amber-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {rank}
                </span>

                <img
                  src={st.avatar}
                  alt={st.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                />

                <div className="truncate">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                    <span className="truncate">{st.name}</span>
                    {isCurrentUser && (
                      <span className="text-[9px] px-1 py-0.2 bg-blue-600 text-white rounded font-sans flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {st.semester} • CGPA: {st.cgpa}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400 block">
                  {st.averageScore}%
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {st.completedQuizzes} Quizzes
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
