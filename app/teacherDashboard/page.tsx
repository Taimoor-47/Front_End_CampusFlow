'use client';

/**
 * teacher/page.tsx — Teacher Dashboard
 * ======================================
 * Teachers can:
 *   1. See a list of all registered students
 *   2. Add a GPA record for any student
 *   3. Add a class schedule for any student
 *   4. Add an assignment for an assigned course section
 *
 * The page is split into tabs so everything lives in one place.
 * Each form sends data to the backend using teacherService functions.
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/navbar/Navbar';
import {
  getAllStudents,
  getMySections,
  getAssignmentSubmissions,
  addGpa,
  addSchedule,
  addAssignment,
} from '../../services/teacherService';
import type {
  AssignmentCreateResponse,
  CourseSectionOption,
  Student,
  TeacherSubmission,
} from '../../services/teacherService';
import { getApiFileUrl } from '../config/api';

type User = { name: string; email: string; role: string };
type Tab = 'students' | 'gpa' | 'schedule' | 'assignment';

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('students');
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { router.push('/LoginPage'); return; }
    let parsed: User;
    try { parsed = JSON.parse(stored); } catch { router.push('/LoginPage'); return; }
    if (parsed.role !== 'Teacher') { router.push('/StudentDashboard'); return; }
    // sessionStorage is an external browser store restored after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsed);

    getAllStudents()
      .then(setStudents)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load students.'))
      .finally(() => setLoadingStudents(false));
  }, [router]);

  if (!user) return null;

  const TAB_LABELS: { key: Tab; label: string }[] = [
    { key: 'students',   label: ' Students' },
    { key: 'gpa',        label: ' Add GPA' },
    { key: 'schedule',   label: ' Add Schedule' },
    { key: 'assignment', label: ' Add Assignment' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar name={user.name} role="Teacher" />

      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Teacher Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user.name}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TAB_LABELS.map(({ key, label }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'students' && (
          <StudentsTab students={students} loading={loadingStudents} />
        )}
        {tab === 'gpa' && (
          <AddGpaTab students={students} />
        )}
        {tab === 'schedule' && (
          <AddScheduleTab students={students} />
        )}
        {tab === 'assignment' && (
          <AddAssignmentTab />
        )}
      </main>
    </div>
  );
}

// ── Students list tab ─────────────────────────────────────────────────────────

function StudentsTab({ students, loading }: { students: Student[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-gray-500">Loading students…</p>;
  if (students.length === 0)
    return <p className="text-sm text-gray-500">No students registered yet.</p>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {['Name', 'Email', 'Phone', 'Age', 'Status'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map(s => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
              <td className="px-4 py-3 text-gray-500">{s.email}</td>
              <td className="px-4 py-3 text-gray-500">{s.phoneNumber}</td>
              <td className="px-4 py-3 text-gray-500">{s.age}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                  ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Add GPA tab ───────────────────────────────────────────────────────────────

function AddGpaTab({ students }: { students: Student[] }) {
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState('');
  const [gpa, setGpaValue] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await addGpa({ studentId, semester: Number(semester), gpa: Number(gpa) });
      setStatus({ ok: true, msg: 'GPA added successfully!' });
      setSemester(''); setGpaValue('');
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'Failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Add GPA Record">
      <form onSubmit={handleSubmit} className="space-y-4">
        <StudentSelect students={students} value={studentId} onChange={setStudentId} />
        <FormInput label="Semester" type="number" placeholder="e.g. 1" value={semester} onChange={setSemester} min="1" max="8" />
        <FormInput label="GPA" type="number" placeholder="e.g. 3.75" value={gpa} onChange={setGpaValue} step="0.01" min="0" max="4" />
        <StatusMessage status={status} />
        <SubmitButton loading={loading} label="Add GPA" />
      </form>
    </FormCard>
  );
}

// ── Add Schedule tab ──────────────────────────────────────────────────────────

function AddScheduleTab({ students }: { students: Student[] }) {
  const [studentId, setStudentId] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [room, setRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      // Time pickers return "HH:MM", but backend expects "HH:MM:SS"
      await addSchedule({
        studentId,
        courseTitle,
        room,
        startTime: startTime + ':00',
        endTime: endTime + ':00',
      });
      setStatus({ ok: true, msg: 'Schedule added successfully!' });
      setCourseTitle(''); setRoom(''); setStartTime(''); setEndTime('');
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'Failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Add Class Schedule">
      <form onSubmit={handleSubmit} className="space-y-4">
        <StudentSelect students={students} value={studentId} onChange={setStudentId} />
        <FormInput label="Course Title" type="text" placeholder="e.g. Mathematics 101" value={courseTitle} onChange={setCourseTitle} />
        <FormInput label="Room" type="text" placeholder="e.g. Room A-201" value={room} onChange={setRoom} />
        <FormInput label="Start Time" type="time" value={startTime} onChange={setStartTime} />
        <FormInput label="End Time" type="time" value={endTime} onChange={setEndTime} />
        <StatusMessage status={status} />
        <SubmitButton loading={loading} label="Add Schedule" />
      </form>
    </FormCard>
  );
}

// ── Add Assignment tab ────────────────────────────────────────────────────────

const MAX_ASSIGNMENT_FILE_BYTES = 25 * 1024 * 1024;
const ASSIGNMENT_FILE_TYPES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg';

function AddAssignmentTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sections, setSections] = useState<CourseSectionOption[]>([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [courseSectionId, setCourseSectionId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [createdAssignment, setCreatedAssignment] = useState<AssignmentCreateResponse | null>(null);
  const [submissions, setSubmissions] = useState<TeacherSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMySections()
      .then(setSections)
      .catch(err => setStatus({
        ok: false,
        msg: err instanceof Error ? err.message : 'Failed to load course sections.',
      }))
      .finally(() => setLoadingSections(false));
  }, []);

  const handleFileChange = (selected: File | null) => {
    setStatus(null);
    if (selected && selected.size > MAX_ASSIGNMENT_FILE_BYTES) {
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStatus({ ok: false, msg: 'The attachment must be 25 MB or smaller.' });
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    if (!courseSectionId) {
      setStatus({ ok: false, msg: 'Select a course section.' });
      return;
    }
    setLoading(true);
    try {
      const created = await addAssignment({
        courseSectionId,
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        file,
      });
      setCreatedAssignment(created);
      setSubmissions([]);
      setStatus({ ok: true, msg: 'Assignment published to the selected section.' });
      setTitle(''); setDescription(''); setDueDate(''); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setStatus({ ok: false, msg: err instanceof Error ? err.message : 'Failed.' });
    } finally {
      setLoading(false);
    }
  };

  const refreshSubmissions = async () => {
    if (!createdAssignment) return;
    setLoadingSubmissions(true);
    setStatus(null);
    try {
      setSubmissions(await getAssignmentSubmissions(createdAssignment.id));
    } catch (err) {
      setStatus({
        ok: false,
        msg: err instanceof Error ? err.message : 'Failed to load submissions.',
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  return (
    <FormCard title="Create Section Assignment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Course section</label>
          <select
            required
            value={courseSectionId}
            onChange={e => setCourseSectionId(e.target.value)}
            disabled={loadingSections || sections.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">
              {loadingSections ? 'Loading sections…' : '— Select a course section —'}
            </option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.courseCode} — {section.courseTitle} · {section.sectionName} · Semester {section.semester} ({section.academicYear})
              </option>
            ))}
          </select>
          {!loadingSections && sections.length === 0 && (
            <p className="text-xs text-amber-700">
              No course sections are assigned to your teacher account.
            </p>
          )}
        </div>
        <FormInput label="Title" type="text" placeholder="e.g. Chapter 5 Exercise" value={title} onChange={setTitle} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Optional details about the assignment…"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <FormInput label="Due date and time" type="datetime-local" value={dueDate} onChange={setDueDate} />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Assignment brief (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ASSIGNMENT_FILE_TYPES}
            onChange={e => handleFileChange(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-blue-700"
          />
          <p className="text-xs text-gray-500">Allowed document, archive, and image files; maximum 25 MB.</p>
        </div>
        <StatusMessage status={status} />
        <SubmitButton
          loading={loading}
          disabled={loadingSections || sections.length === 0}
          label="Publish Assignment"
        />
        {createdAssignment && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-gray-800">Submissions: {createdAssignment.title}</p>
                <p className="text-xs text-gray-500">
                  {createdAssignment.courseCode} · Section {createdAssignment.sectionName}
                </p>
              </div>
              <button
                type="button"
                onClick={refreshSubmissions}
                disabled={loadingSubmissions}
                className="rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
              >
                {loadingSubmissions ? 'Refreshing…' : 'Refresh submissions'}
              </button>
            </div>
            {!loadingSubmissions && submissions.length === 0 ? (
              <p className="mt-3 text-xs text-gray-500">No submissions received yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-200">
                {submissions.map(submission => (
                  <li key={submission.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                    <div>
                      <p className="font-medium text-gray-700">{submission.studentName ?? 'Student'}</p>
                      <p className="text-gray-500">{new Date(submission.submittedAt).toLocaleString()}</p>
                    </div>
                    <a
                      href={getApiFileUrl(submission.filePath)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Open file
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </form>
    </FormCard>
  );
}

// ── Shared small components ───────────────────────────────────────────────────

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
      <h2 className="text-base font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StudentSelect({
  students, value, onChange,
}: {
  students: Student[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Student</label>
      <select
        required value={value} onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">— Select a student —</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
        ))}
      </select>
    </div>
  );
}

interface FormInputProps {
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  step?: string;
}

function FormInput({ label, type, placeholder, value, onChange, ...rest }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        required type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
        {...rest}
      />
    </div>
  );
}

function StatusMessage({ status }: { status: { ok: boolean; msg: string } | null }) {
  if (!status) return null;
  return (
    <div className={`rounded-lg px-4 py-3 text-sm border
      ${status.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
      {status.msg}
    </div>
  );
}

function SubmitButton({
  loading,
  label,
  disabled = false,
}: {
  loading: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button type="submit" disabled={loading || disabled}
      className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm
        hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? 'Saving…' : label}
    </button>
  );
}
