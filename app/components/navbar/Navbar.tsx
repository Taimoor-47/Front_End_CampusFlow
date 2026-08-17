'use client';

/**
 * Navbar.tsx (Sidebar)
 * ====================
 * One sidebar used by BOTH student and teacher dashboards.
 * Pass role="Student" or role="Teacher" — it shows the right nav links.
 * Includes a Sign Out button that calls the backend to clear the cookie.
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Menu, X, GraduationCap, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logout } from '../../../services/authService';
import {
  LayoutDashboard, BarChart2, UserCheck, BookOpen,
  ClipboardList, CalendarDays, Bell, Settings, Users,
} from 'lucide-react';

// ── Nav link definitions ──────────────────────────────────────────────────────

const STUDENT_NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/StudentDashboard',   label: 'Dashboard',   icon: LayoutDashboard },
      { href: '/Grades',      label: 'My Grades',   icon: BarChart2 },
      { href: '/attendance',  label: 'Attendance',  icon: UserCheck },
    ],
  },
  {
    label: 'Academics',
    items: [
      { href: '/courses',     label: 'Courses',     icon: BookOpen },
      { href: '/assignments', label: 'Assignments', icon: ClipboardList },
    ],
  },
  {
    label: 'More',
    items: [
      { href: '/timetable',     label: 'Timetable',      icon: CalendarDays },
      { href: '/notifications', label: 'Notifications',  icon: Bell },
      { href: '/settings',      label: 'Settings',       icon: Settings },
    ],
  },
];

const TEACHER_NAV = [
  {
    label: 'Overview',
    items: [
      { href: '/teacherDashboard',          label: 'Dashboard',    icon: LayoutDashboard },
      { href: '/teacher/students', label: 'All Students', icon: Users },
    ],
  },
  {
    label: 'Manage',
    items: [
      { href: '/teacher/add-gpa',        label: 'Add GPA',        icon: BarChart2 },
      { href: '/teacher/add-schedule',   label: 'Add Schedule',   icon: CalendarDays },
      { href: '/teacher/add-assignment', label: 'Add Assignment',  icon: ClipboardList },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  name: string;
  role: 'Student' | 'Teacher';
}

export default function Sidebar({ name, role }: Props) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navSections = role === 'Teacher' ? TEACHER_NAV : STUDENT_NAV;
  const displayName = name || 'Guest';
  const initials = displayName.split(' ').map((n: string) => n[0] ?? '').join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();   // POST /api/auth/logout → clears cookie + sessionStorage
    } finally {
      router.push('/LoginPage');
    }
  };

  const SidebarContent = (
    <>
      {/* Brand + role badge */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-200">
        <GraduationCap className="w-5 h-5 text-blue-700" />
        <span className="font-semibold text-sm">EduPortal</span>
        <span className={clsx(
          'ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium',
          role === 'Teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
        )}>
          {role}
        </span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navSections.map(section => (
          <div key={section.label}>
            <p className="text-[10px] text-gray-400 px-3 py-2 uppercase font-semibold">
              {section.label}
            </p>
            {section.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                    active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={clsx(
            'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
            role === 'Teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
          )}>
            {initials}
          </div>
          <div className="text-sm min-w-0">
            <p className="font-medium truncate">{displayName}</p>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout} disabled={loggingOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm
            text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          {loggingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-56 h-screen border-r bg-gray-50 sticky top-0 flex-shrink-0">
        {SidebarContent}
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-white border-b z-50 flex items-center px-2">
        <button onClick={() => setOpen(true)} className="p-1.5 rounded-md hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-800" />
        </button>
        <div className="flex items-center gap-1 ml-2">
          <GraduationCap className="w-4 h-4 text-blue-700" />
          <span className="text-sm font-semibold">EduPortal</span>
        </div>
      </div>

      {open && <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />}

      <aside className={clsx(
        'fixed top-0 left-0 z-50 h-full w-64 bg-gray-50 transition-transform md:hidden flex flex-col',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex justify-end p-3">
          <button onClick={() => setOpen(false)}><X className="w-5 h-5" /></button>
        </div>
        {SidebarContent}
      </aside>
    </>
  );
}
