import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CustomDropdown } from '../common/CustomDropdown';
import {
  Search,
  Plus,
  Download,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { StudentProfileModal } from './StudentProfileModal';

export const StudentDirectory = () => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    exportStudentsCSV,
    selectedStudentForProfile,
    setSelectedStudentForProfile
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalStudent, setEditModalStudent] = useState(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    email: '',
    phone: '',
    semester: 'S6',
    batch: '2022-2026',
    department: 'Civil Engineering',
    attendancePct: 90,
    cgpa: 8.0,
    performanceStatus: 'Good',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: ''
  });

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSemester = semesterFilter === 'All' || s.semester === semesterFilter;
    const matchesBatch = batchFilter === 'All' || s.batch === batchFilter;
    const matchesStatus = statusFilter === 'All' || s.performanceStatus === statusFilter;

    return matchesSearch && matchesSemester && matchesBatch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      studentId: `CE-2024-${(students.length + 1).toString().padStart(3, '0')}`,
      email: '',
      phone: '+91 98450 00000',
      semester: 'S4',
      batch: '2023-2027',
      department: 'Civil Engineering',
      attendancePct: 92,
      cgpa: 8.2,
      performanceStatus: 'Good',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 9999999)}?auto=format&fit=crop&q=80&w=250`,
      bio: 'Enrolled in Department of Civil Engineering.'
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditModalStudent(student);
    setFormData({ ...student });
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    if (editModalStudent) {
      updateStudent(editModalStudent.id, formData);
      setEditModalStudent(null);
    } else {
      addStudent(formData);
      setAddModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmStudent) {
      deleteStudent(deleteConfirmStudent.id);
      setDeleteConfirmStudent(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Directory Title & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white tracking-tight">
            Civil Engineering Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student records, attendance metrics, assessment eligibility, and academic standings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportStudentsCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-darkCard hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-md shadow-blue-500/25 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Ribbon */}
      <div className="p-4 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name, ID (e.g. CE-2022-001), or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester */}
          <CustomDropdown
            value={semesterFilter}
            onChange={setSemesterFilter}
            options={[
              { value: 'All', label: 'All Semesters' },
              { value: 'S2', label: 'Semester S2' },
              { value: 'S4', label: 'Semester S4' },
              { value: 'S6', label: 'Semester S6' },
              { value: 'S8', label: 'Semester S8' }
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          {/* Batch */}
          <CustomDropdown
            value={batchFilter}
            onChange={setBatchFilter}
            options={[
              { value: 'All', label: 'All Batches' },
              { value: '2021-2025', label: 'Batch 2021–2025' },
              { value: '2022-2026', label: 'Batch 2022–2026' },
              { value: '2023-2027', label: 'Batch 2023–2027' },
              { value: '2024-2028', label: 'Batch 2024–2028' }
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          {/* Performance Status */}
          <CustomDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Excellent', label: 'Excellent (≥85%)' },
              { value: 'Good', label: 'Good (75–84%)' },
              { value: 'Average', label: 'Average (60–74%)' },
              { value: 'At Risk', label: 'At Risk (<60%)' }
            ]}
            className="w-full sm:w-auto"
            buttonClassName="py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900"
          />

          {(searchTerm || semesterFilter !== 'All' || batchFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSemesterFilter('All');
                setBatchFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-2 font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Directory Records Summary Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
        </span>
        <span className="hidden sm:inline text-[11px] text-slate-400">
          Click student name to view comprehensive profile & progress sheet
        </span>
      </div>

      {/* Desktop Responsive Table View */}
      <div className="hidden md:block bg-white dark:bg-surface-darkCard rounded-3xl border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-5">Student Details</th>
                <th className="py-3.5">Department & Sem</th>
                <th className="py-3.5 text-center">Attendance</th>
                <th className="py-3.5 text-center">CGPA</th>
                <th className="py-3.5 text-center">Quizzes Taken</th>
                <th className="py-3.5 text-center">Avg Score</th>
                <th className="py-3.5 text-center">Performance</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No students found matching your search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 pl-5">
                      <div
                        onClick={() => setSelectedStudentForProfile(st)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-500 transition-all"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 flex items-center gap-2">
                            <span>{st.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                              {st.studentId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{st.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {st.semester} • {st.batch}
                      </div>
                      <div className="text-[10px] text-slate-400">{st.department}</div>
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`font-mono font-bold ${
                          st.attendancePct >= 85
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : st.attendancePct >= 75
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {st.attendancePct}%
                      </span>
                    </td>

                    <td className="py-3.5 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                      {st.cgpa}
                    </td>

                    <td className="py-3.5 text-center font-mono text-slate-700 dark:text-slate-300 font-semibold">
                      {st.completedQuizzes} / 10
                    </td>

                    <td className="py-3.5 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                      {st.averageScore}%
                    </td>

                    <td className="py-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.performanceStatus === 'Excellent'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : st.performanceStatus === 'Good'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : st.performanceStatus === 'Average'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                        }`}
                      >
                        {st.performanceStatus}
                      </span>
                    </td>

                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStudentForProfile(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmStudent(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards Alternative */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white dark:bg-surface-darkCard rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            No students found matching your criteria.
          </div>
        ) : (
          filteredStudents.map((st) => (
            <div
              key={st.id}
              className="bg-white dark:bg-surface-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3"
            >
              <div className="flex items-center justify-between">
                <div
                  onClick={() => setSelectedStudentForProfile(st)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <img
                    src={st.avatar}
                    alt={st.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{st.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{st.studentId}</div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    st.performanceStatus === 'Excellent'
                      ? 'bg-emerald-100 text-emerald-700'
                      : st.performanceStatus === 'Good'
                      ? 'bg-blue-100 text-blue-700'
                      : st.performanceStatus === 'Average'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {st.performanceStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Attendance</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                    {st.attendancePct}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">CGPA</span>
                  <span className="font-bold font-mono text-purple-600 dark:text-purple-400">
                    {st.cgpa}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg Score</span>
                  <span className="font-bold font-mono text-blue-600 dark:text-blue-400">
                    {st.averageScore}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">
                  {st.semester} • {st.batch}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudentForProfile(st)}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold text-xs"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => handleOpenEdit(st)}
                    className="p-1 rounded-lg text-slate-500 hover:text-amber-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmStudent(st)}
                    className="p-1 rounded-lg text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {(addModalOpen || editModalStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-surface-darkCard rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editModalStudent ? 'Edit Student Details' : 'Register New Civil Engineering Student'}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalStudent(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Adithyan S."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student Roll ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="e.g. CE-2022-021"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. adithyan@student.qsap.edu.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <CustomDropdown
                    fullWidth
                    options={[
                      { value: 'S2', label: 'Semester S2' },
                      { value: 'S4', label: 'Semester S4' },
                      { value: 'S6', label: 'Semester S6' },
                      { value: 'S8', label: 'Semester S8' }
                    ]}
                    value={formData.semester}
                    onChange={(val) => setFormData({ ...formData, semester: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Batch
                  </label>
                  <CustomDropdown
                    fullWidth
                    options={[
                      { value: '2021-2025', label: '2021–2025' },
                      { value: '2022-2026', label: '2022–2026' },
                      { value: '2023-2027', label: '2023–2027' },
                      { value: '2024-2028', label: '2024–2028' }
                    ]}
                    value={formData.batch}
                    onChange={(val) => setFormData({ ...formData, batch: val })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendance Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendancePct}
                    onChange={(e) => setFormData({ ...formData, attendancePct: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cumulative CGPA
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Academic Specialization & Biography
                </label>
                <textarea
                  rows={2}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="e.g. Focus on Structural Dynamics and Earthquake Resistant Design."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalStudent(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/25"
                >
                  {editModalStudent ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-surface-darkCard rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Student Record?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to remove <strong>{deleteConfirmStudent.name}</strong> (
                {deleteConfirmStudent.studentId}) from the CohesionTech platform? All quiz logs associated with
                this student will be archived.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-md shadow-red-500/20"
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Student Profile Modal */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onEdit={(stu) => handleOpenEdit(stu)}
        />
      )}
    </div>
  );
};

