// ─────────────────────────────────────────────────────────────────────────────
// api.ts  —  TypeScript types that mirror backend DTO shapes EXACTLY.
//
// RULE: Every property name here must match the JSON key the backend sends.
//       C# uses PascalCase but ASP.NET's JSON serialiser converts to camelCase
//       by default, so "StudentName" in C# → "studentName" in JSON → matches below.
// ─────────────────────────────────────────────────────────────────────────────

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  studentName: string
  rollNumber: string
  program: string
  currentSemester: number
  currentGpa: number
  cumulativeGpa: number
  attendancePercent: number
  rank: number
  totalStudents: number
  cgpaHistory: SemesterGpa[]
  upcomingAssignments: UpcomingAssignment[]
  todaySchedule: ScheduleEntry[]
}

export interface SemesterGpa {
  semester: number
  gpa: number
}

// ── Assignments ───────────────────────────────────────────────────────────────

export interface UpcomingAssignment {
  assignmentId: string
  courseSectionId: string
  courseCode: string
  courseTitle: string
  sectionName: string
  title: string
  description: string
  dueDate: string                            // ISO 8601
  urgencyLabel: 'Urgent' | 'Soon' | 'Ok'
  isPastDue: boolean
  filePath: string | null
  isSubmitted: boolean
  submissionFilePath: string | null
  submittedAt: string | null
}

// ── Schedule ──────────────────────────────────────────────────────────────────

export interface ScheduleEntry {
  entryId: string
  courseCode: string
  courseTitle: string
  room: string
  startTime: string                          // "HH:mm:ss"
  endTime: string
  isNow: boolean
  isDone: boolean
}

// ── Attendance ────────────────────────────────────────────────────────────────

export interface AttendanceSummary {
  overallPercent: number
  perCourse: CourseAttendance[]
}

export interface CourseAttendance {
  courseCode: string
  courseTitle: string
  totalClasses: number
  attendedClasses: number
  percent: number
  belowThreshold: boolean
}

// ── Grade Card ────────────────────────────────────────────────────────────────
//
// This is the main type for the Grades page.
// It describes a university-style academic transcript.

/** One row in the semester results table — one subject. */
export interface CourseGrade {
  courseCode: string       // e.g. "CS-301"
  courseTitle: string      // e.g. "Data Structures"
  creditHours: number      // e.g. 3
  marksObtained: number    // e.g. 82  (out of totalMarks)
  totalMarks: number       // e.g. 100
  gradePoints: number      // e.g. 3.3  (on 4.0 scale)
  letterGrade: string      // e.g. "B+"
}

/** All subjects for one semester + calculated GPA for that semester. */
export interface SemesterResult {
  semester: number         // e.g. 3
  academicYear: string     // e.g. "2024-25"
  courses: CourseGrade[]
  semesterGpa: number      // e.g. 3.45 — calculated by backend
  totalCreditHours: number // sum of credit hours attempted
  earnedCreditHours: number// sum of credit hours passed (grade >= D)
}

/** The full grade card for a student — returned by GET /api/student/grade-card */
export interface GradeCard {
  studentName: string
  rollNumber: string       // e.g. "BSCS-2022-015"
  program: string          // e.g. "BS Computer Science"
  department: string       // e.g. "Department of Computing"
  semesterResults: SemesterResult[]
  cgpa: number             // cumulative GPA across all semesters
  totalCreditHours: number // total credits attempted
  totalEarnedCredits: number
}
