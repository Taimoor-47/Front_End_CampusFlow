'use client';

/**
 * dashboard/page.tsx — Student Dashboard
 * ========================================
 * DATA FLOW:
 *   1. On mount, read { name, email, role } from sessionStorage.
 *      If missing → redirect to /LoginPage.
 *   2. Fetch GPA, schedules, and assignments from the backend in parallel.
 *      The browser sends the JWT cookie automatically (credentials:"include").
 *   3. Map backend shapes to what the chart/card components expect.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/navbar/Navbar';
import CgpaChart from '../components/Cards/GPACard';
import ScheduleTimeline from '../components/Cards/ScheduleTimeline';
import AssignmentsCard from '../components/Cards/Assignments';
import { getMyGpa, getMySchedules, getMyAssignments, getCurrentStudent } from '../../services/studentService';
import type { GpaRecord, ScheduleRecord, AssignmentRecord, SubmissionResponse } from '../../services/studentService';
import { ApiError } from '../../services/apiClient';
import type { SemesterGpa, ScheduleEntry, UpcomingAssignment } from '../../types/api';

type User = { name: string; email: string; role: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function toScheduleEntry(s: ScheduleRecord): ScheduleEntry {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(s.startTime);
  const endMin = timeToMinutes(s.endTime);
  return {
    entryId: s.id,
    courseCode: '',
    courseTitle: s.courseTitle,
    room: s.room,
    startTime: s.startTime,
    endTime: s.endTime,
    isNow: nowMin >= startMin && nowMin < endMin,
    isDone: nowMin >= endMin,
  };
}

function toUpcomingAssignment(a: AssignmentRecord): UpcomingAssignment {
  const msLeft = new Date(a.dueDate).getTime() - Date.now();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  const urgencyLabel: 'Urgent' | 'Soon' | 'Ok' =
    daysLeft <= 2 ? 'Urgent' : daysLeft <= 7 ? 'Soon' : 'Ok';
  return {
    assignmentId: a.id,
    courseSectionId: a.courseSectionId,
    courseCode: a.courseCode,
    courseTitle: a.courseTitle,
    sectionName: a.sectionName,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    urgencyLabel,
    isPastDue: msLeft < 0,
    filePath: a.filePath,
    isSubmitted: a.submitted,
    submissionFilePath: a.submissionFilePath,
    submittedAt: a.submittedAt,
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [gpaHistory, setGpaHistory] = useState<SemesterGpa[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [assignments, setAssignments] = useState<UpcomingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) {
      router.push('/LoginPage'); return;
    }
    let parsed: User;
    try { parsed = JSON.parse(stored); } catch { router.push('/LoginPage'); return; }
    if (parsed.role !== 'Student') { router.push('/teacherDashboard'); return; }
    // sessionStorage is an external browser store restored after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsed);

    // Verify the cookie-backed session with the server first; a 401 here means
    // the JWT is missing or expired regardless of what sessionStorage claims.
    getCurrentStudent()
      .then(() => Promise.all([getMyGpa(), getMySchedules(), getMyAssignments()]))
      .then(([gpa, sch, asgn]) => {
        setGpaHistory(gpa.map((g: GpaRecord) => ({ semester: g.semester, gpa: g.gpa })));
        setSchedules(sch.map(toScheduleEntry));
        setAssignments(asgn.map(toUpcomingAssignment));
      })
      .catch(err => {
        if (err instanceof ApiError && err.status === 401) {
          sessionStorage.removeItem('user');
          router.push('/LoginPage');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load data.');
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <p className="text-gray-500 text-sm animate-pulse">Loading your dashboard…</p>
    </div>
  );
  if (!user) return null;

  const handleAssignmentSubmitted = (
    assignmentId: string,
    submission: SubmissionResponse
  ) => {
    setAssignments(current => current.map(assignment =>
      assignment.assignmentId === assignmentId
        ? {
            ...assignment,
            isSubmitted: true,
            submissionFilePath: submission.filePath,
            submittedAt: submission.submittedAt,
          }
        : assignment
    ));
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar name={user.name} role="Student" />
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Welcome back, {user.name} </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <section className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gpaHistory.length > 0 ? (
              <CgpaChart data={gpaHistory} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center text-sm text-gray-400">
                No GPA records yet
              </div>
            )}
            <AssignmentsCard
              assignments={assignments}
              onSubmitted={handleAssignmentSubmitted}
            />
          </section>
          <aside>
            <ScheduleTimeline entries={schedules} />
          </aside>
        </div>
      </main>
    </div>
  );
}
