'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Printer, GraduationCap, TrendingUp, BookOpen, Award } from 'lucide-react';
import Sidebar from '../components/navbar/Navbar';
import { getMyGradeCard } from '../../services/studentService';
import type { GradeCard, SemesterResult, CourseGrade } from '../../types/api';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — remove this and uncomment the real API call once the backend
// endpoint GET /api/student/grade-card is implemented (see guide at bottom).
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_GRADE_CARD: GradeCard = {
  studentName: 'Ali Hassan',
  rollNumber: 'BSCS-2022-015',
  program: 'BS Computer Science',
  department: 'Department of Computing',
  cgpa: 3.61,
  totalCreditHours: 72,
  totalEarnedCredits: 72,
  semesterResults: [
    {
      semester: 1, academicYear: '2022-23',
      semesterGpa: 3.50, totalCreditHours: 18, earnedCreditHours: 18,
      courses: [
        { courseCode: 'CS-101',   courseTitle: 'Introduction to Programming', creditHours: 3, marksObtained: 82, totalMarks: 100, gradePoints: 3.3, letterGrade: 'B+' },
        { courseCode: 'MATH-101', courseTitle: 'Calculus I',                  creditHours: 3, marksObtained: 78, totalMarks: 100, gradePoints: 3.0, letterGrade: 'B'  },
        { courseCode: 'ENG-101',  courseTitle: 'English Composition',         creditHours: 3, marksObtained: 88, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
        { courseCode: 'PHY-101',  courseTitle: 'Applied Physics',             creditHours: 3, marksObtained: 75, totalMarks: 100, gradePoints: 3.0, letterGrade: 'B'  },
        { courseCode: 'HUM-101',  courseTitle: 'Islamic Studies',             creditHours: 2, marksObtained: 91, totalMarks: 100, gradePoints: 4.0, letterGrade: 'A'  },
        { courseCode: 'CS-102',   courseTitle: 'Digital Logic Design',        creditHours: 4, marksObtained: 80, totalMarks: 100, gradePoints: 3.3, letterGrade: 'B+' },
      ],
    },
    {
      semester: 2, academicYear: '2022-23',
      semesterGpa: 3.72, totalCreditHours: 18, earnedCreditHours: 18,
      courses: [
        { courseCode: 'CS-201',   courseTitle: 'Object-Oriented Programming', creditHours: 3, marksObtained: 90, totalMarks: 100, gradePoints: 4.0, letterGrade: 'A'  },
        { courseCode: 'MATH-201', courseTitle: 'Calculus II',                 creditHours: 3, marksObtained: 84, totalMarks: 100, gradePoints: 3.3, letterGrade: 'B+' },
        { courseCode: 'CS-202',   courseTitle: 'Data Structures',             creditHours: 4, marksObtained: 87, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
        { courseCode: 'ENG-201',  courseTitle: 'Technical Writing',           creditHours: 2, marksObtained: 88, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
        { courseCode: 'MATH-202', courseTitle: 'Discrete Mathematics',        creditHours: 3, marksObtained: 79, totalMarks: 100, gradePoints: 3.0, letterGrade: 'B'  },
        { courseCode: 'CS-203',   courseTitle: 'Computer Organisation',       creditHours: 3, marksObtained: 85, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
      ],
    },
    {
      semester: 3, academicYear: '2023-24',
      semesterGpa: 3.45, totalCreditHours: 18, earnedCreditHours: 18,
      courses: [
        { courseCode: 'CS-301',   courseTitle: 'Algorithms Analysis',         creditHours: 3, marksObtained: 77, totalMarks: 100, gradePoints: 3.0, letterGrade: 'B'  },
        { courseCode: 'CS-302',   courseTitle: 'Database Systems',            creditHours: 3, marksObtained: 83, totalMarks: 100, gradePoints: 3.3, letterGrade: 'B+' },
        { courseCode: 'CS-303',   courseTitle: 'Operating Systems',           creditHours: 3, marksObtained: 81, totalMarks: 100, gradePoints: 3.3, letterGrade: 'B+' },
        { courseCode: 'STAT-301', courseTitle: 'Probability & Statistics',    creditHours: 3, marksObtained: 86, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
        { courseCode: 'CS-304',   courseTitle: 'Software Engineering',        creditHours: 3, marksObtained: 72, totalMarks: 100, gradePoints: 2.7, letterGrade: 'B-' },
        { courseCode: 'CS-305',   courseTitle: 'Computer Networks',           creditHours: 3, marksObtained: 79, totalMarks: 100, gradePoints: 3.0, letterGrade: 'B'  },
      ],
    },
    {
      semester: 4, academicYear: '2023-24',
      semesterGpa: 3.78, totalCreditHours: 18, earnedCreditHours: 18,
      courses: [
        { courseCode: 'CS-401',   courseTitle: 'Web Engineering',             creditHours: 3, marksObtained: 91, totalMarks: 100, gradePoints: 4.0, letterGrade: 'A'  },
        { courseCode: 'CS-402',   courseTitle: 'Artificial Intelligence',     creditHours: 3, marksObtained: 88, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
        { courseCode: 'CS-403',   courseTitle: 'Machine Learning',            creditHours: 3, marksObtained: 85, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
        { courseCode: 'CS-404',   courseTitle: 'Information Security',        creditHours: 3, marksObtained: 80, totalMarks: 100, gradePoints: 3.3, letterGrade: 'B+' },
        { courseCode: 'CS-405',   courseTitle: 'Mobile Application Dev',      creditHours: 3, marksObtained: 92, totalMarks: 100, gradePoints: 4.0, letterGrade: 'A'  },
        { courseCode: 'HUM-401',  courseTitle: 'Professional Ethics',         creditHours: 3, marksObtained: 87, totalMarks: 100, gradePoints: 3.7, letterGrade: 'A-' },
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Grade styling helpers
// ─────────────────────────────────────────────────────────────────────────────

function getGradeColor(letter: string): string {
  if (letter.startsWith('A')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (letter.startsWith('B')) return 'text-blue-700 bg-blue-50 border-blue-200';
  if (letter.startsWith('C')) return 'text-amber-700 bg-amber-50 border-amber-200';
  if (letter.startsWith('D')) return 'text-orange-700 bg-orange-50 border-orange-200';
  return 'text-red-700 bg-red-50 border-red-200';   // F
}

function getGpaBadgeColor(gpa: number): string {
  if (gpa >= 3.5) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  if (gpa >= 3.0) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (gpa >= 2.5) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function getStanding(cgpa: number): { label: string; color: string } {
  if (cgpa >= 3.7) return { label: 'Distinction', color: 'text-emerald-700' };
  if (cgpa >= 3.0) return { label: 'First Division', color: 'text-blue-700' };
  if (cgpa >= 2.0) return { label: 'Second Division', color: 'text-amber-700' };
  return { label: 'Warning', color: 'text-red-700' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Top summary banner — CGPA, total credits, standing */
function TranscriptHeader({ card }: { card: GradeCard }) {
  const standing = getStanding(card.cgpa);
  const cgpaPercent = (card.cgpa / 4.0) * 100;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none">
      {/* University header stripe */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 opacity-90" />
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-75">
              EduPortal University
            </p>
            <h1 className="text-xl font-bold tracking-tight">Official Academic Transcript</h1>
          </div>
        </div>
      </div>

      {/* Student info grid */}
      <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-3 border-b border-gray-100">
        <InfoField label="Student Name"  value={card.studentName} />
        <InfoField label="Roll Number"   value={card.rollNumber} />
        <InfoField label="Program"       value={card.program} />
        <InfoField label="Department"    value={card.department} />
      </div>

      {/* CGPA + stats row */}
      <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* CGPA big tile */}
        <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center
                        bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-blue-500 mb-1">CGPA</p>
          <p className="text-4xl font-extrabold text-blue-700 leading-none">
            {card.cgpa.toFixed(2)}
          </p>
          <p className="text-xs text-blue-400 mt-1">out of 4.00</p>
          {/* Progress bar */}
          <div className="w-full mt-3 h-1.5 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all"
                 style={{ width: `${cgpaPercent}%` }} />
          </div>
        </div>

        <StatTile icon={<BookOpen className="w-5 h-5" />}  label="Credit Hours"   value={`${card.totalEarnedCredits} / ${card.totalCreditHours}`} />
        <StatTile icon={<TrendingUp className="w-5 h-5" />} label="Semesters"      value={card.semesterResults.length.toString()} />
        <StatTile
          icon={<Award className="w-5 h-5" />}
          label="Academic Standing"
          value={standing.label}
          valueClass={standing.color}
        />
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
    </div>
  );
}

function StatTile({
  icon, label, value, valueClass = 'text-gray-800',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex flex-col gap-1 bg-gray-50 rounded-xl border border-gray-100 p-4">
      <div className="text-gray-400">{icon}</div>
      <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mt-1">{label}</p>
      <p className={`text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}

/** One semester block — heading + table of subjects */
function SemesterCard({ result }: { result: SemesterResult }) {
  const totalAttempted = result.courses.reduce((s, c) => s + c.creditHours, 0);
  const totalEarned    = result.earnedCreditHours;
  const totalPoints    = result.courses.reduce((s, c) => s + c.gradePoints * c.creditHours, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden print:shadow-none print:break-inside-avoid">

      {/* Semester header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold">
            {result.semester}
          </span>
          <div>
            <p className="text-sm font-bold text-gray-800">Semester {result.semester}</p>
            <p className="text-xs text-gray-400">{result.academicYear}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Credits</p>
            <p className="text-sm font-bold text-gray-700">{totalEarned}/{totalAttempted}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-sm font-bold ${getGpaBadgeColor(result.semesterGpa)}`}>
            GPA&nbsp;{result.semesterGpa.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Subjects table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-24">Code</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Course Title</th>
              <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-16">Cr.Hrs</th>
              <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-24">Marks</th>
              <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">Grd Pts</th>
              <th className="px-5 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-20">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {result.courses.map((course) => (
              <CourseRow key={course.courseCode} course={course} />
            ))}
          </tbody>
          {/* Semester totals row */}
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={2} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Semester Totals
              </td>
              <td className="px-5 py-3 text-center text-sm font-bold text-gray-700">{totalAttempted}</td>
              <td className="px-5 py-3 text-center text-xs text-gray-400">—</td>
              <td className="px-5 py-3 text-center text-sm font-bold text-gray-700">
                {totalPoints.toFixed(1)}
              </td>
              <td className="px-5 py-3 text-center">
                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold border ${getGpaBadgeColor(result.semesterGpa)}`}>
                  {result.semesterGpa.toFixed(2)}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function CourseRow({ course }: { course: CourseGrade }) {
  const pct = Math.round((course.marksObtained / course.totalMarks) * 100);
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3 font-mono text-xs text-gray-500 font-semibold">{course.courseCode}</td>
      <td className="px-5 py-3 text-gray-800 font-medium">{course.courseTitle}</td>
      <td className="px-5 py-3 text-center text-gray-600">{course.creditHours}</td>
      <td className="px-5 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-gray-700 font-semibold text-xs">
            {course.marksObtained}/{course.totalMarks}
          </span>
          {/* Marks progress bar */}
          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct >= 85 ? 'bg-emerald-500' : pct >= 70 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">{pct}%</span>
        </div>
      </td>
      <td className="px-5 py-3 text-center text-gray-700 font-semibold">{course.gradePoints.toFixed(1)}</td>
      <td className="px-5 py-3 text-center">
        <span className={`inline-block px-2 py-0.5 rounded border text-xs font-bold ${getGradeColor(course.letterGrade)}`}>
          {course.letterGrade}
        </span>
      </td>
    </tr>
  );
}

/** Grading scale reference card at the bottom */
function GradingScale() {
  const scale = [
    { range: '90 – 100', letter: 'A',  points: '4.00' },
    { range: '85 – 89',  letter: 'A-', points: '3.70' },
    { range: '80 – 84',  letter: 'B+', points: '3.30' },
    { range: '75 – 79',  letter: 'B',  points: '3.00' },
    { range: '70 – 74',  letter: 'B-', points: '2.70' },
    { range: '65 – 69',  letter: 'C+', points: '2.30' },
    { range: '60 – 64',  letter: 'C',  points: '2.00' },
    { range: '50 – 59',  letter: 'D',  points: '1.00' },
    { range: 'Below 50', letter: 'F',  points: '0.00' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 print:shadow-none">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
        Grading Scale Reference
      </h3>
      <div className="flex flex-wrap gap-2">
        {scale.map(s => (
          <div key={s.letter}
               className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${getGradeColor(s.letter)}`}>
            <span className="font-bold w-5 text-center">{s.letter}</span>
            <span className="text-gray-400">|</span>
            <span>{s.range}</span>
            <span className="text-gray-400">|</span>
            <span className="font-semibold">{s.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function GradesPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const [user, setUser]       = useState<{ name: string; role: string } | null>(null);
  const [card, setCard]       = useState<GradeCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeSem, setActiveSem] = useState<number | 'all'>('all');

  useEffect(() => {
    const stored = sessionStorage.getItem('user');
    if (!stored) { router.push('/LoginPage'); return; }
    let parsed: { name: string; role: string };
    try { parsed = JSON.parse(stored); } catch { router.push('/LoginPage'); return; }
    if (parsed.role !== 'Student') { router.push('/teacherDashboard'); return; }
    // sessionStorage is an external browser store restored after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(parsed);

    // ── Try the real API first; fall back to mock data ──────────────────────
    // Once you build GET /api/student/grade-card, this will automatically
    // use real data. Until then the mock keeps the UI working.
    getMyGradeCard()
      .then(setCard)
      .catch((err: unknown) => {
        // API not yet built — use mock data so you can develop the UI now
        setCard(MOCK_GRADE_CARD);
        setError(
          err instanceof Error
            ? err.message
            : 'Live grade card is not available yet; showing demo data.'
        );
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <p className="text-sm text-gray-500 animate-pulse">Loading grade card…</p>
    </div>
  );
  if (!user || !card) return null;

  const visibleSemesters = activeSem === 'all'
    ? card.semesterResults
    : card.semesterResults.filter(r => r.semester === activeSem);

  return (
    <>
      {/* ── Print styles — only applied when Ctrl+P is pressed ── */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .print-area { padding: 0; }
        }
      `}</style>

      <div className="flex min-h-screen bg-slate-100">
        <div className="no-print">
          <Sidebar name={user.name} role="Student" />
        </div>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 print-area">

          {/* ── Toolbar ── */}
          <div className="flex items-center justify-between mb-5 no-print">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Grade Card</h1>
              <p className="text-sm text-gray-500">Your complete academic transcript</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200
                           rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50
                           shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>

          {/* ── Semester filter tabs ── */}
          <div className="flex gap-2 flex-wrap mb-5 no-print">
            <TabBtn active={activeSem === 'all'} onClick={() => setActiveSem('all')}>
              All Semesters
            </TabBtn>
            {card.semesterResults.map(r => (
              <TabBtn key={r.semester} active={activeSem === r.semester} onClick={() => setActiveSem(r.semester)}>
                Semester {r.semester}
              </TabBtn>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              ⚠️ Could not load from server — showing demo data. ({error})
            </div>
          )}

          {/* ── Printable area ── */}
          <div ref={printRef} className="space-y-6">
            <TranscriptHeader card={card} />

            {visibleSemesters.map(result => (
              <SemesterCard key={result.semester} result={result} />
            ))}

            {activeSem === 'all' && <GradingScale />}
          </div>

        </main>
      </div>
    </>
  );
}

function TabBtn({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
    >
      {children}
    </button>
  );
}
