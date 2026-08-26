'use client';

/**
 * Login.tsx
 * =========
 * One login page for both Students and Teachers.
 *
 * HOW THE ROLE SELECTOR WORKS:
 *   The user picks "Student" or "Teacher" before submitting.
 *   Based on that choice we call a different backend endpoint:
 *     Student  → POST /api/student/login
 *     Teacher  → POST /api/teacher/login
 *   Both return { name, email, role }.
 *   We store that in sessionStorage (cleared when the tab closes).
 *   Then we redirect:
 *     Student  → /StudentDashboard
 *     Teacher  → /teacher
 */

import { useState, useCallback } from 'react';
import { loginStudent, loginTeacher } from '../../../services/authService';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginForm {
  email: string;
  password: string;
}

type FormErrors = Partial<Record<keyof LoginForm, string>>;
type Role = 'Student' | 'Teacher';

// ── Validation ────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name: keyof LoginForm, value: string): string {
  switch (name) {
    case 'email':
      if (!value.trim()) return 'Email is required.';
      if (!EMAIL_REGEX.test(value)) return 'Enter a valid email address.';
      if (/[A-Z]/.test(value.trim())) return 'Email must be in lowercase letters.';
      return '';
    case 'password':
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      return '';
    default:
      return '';
  }
}

function validateAll(values: LoginForm): FormErrors {
  return (Object.keys(values) as (keyof LoginForm)[]).reduce<FormErrors>((acc, key) => {
    const msg = validateField(key, values[key]);
    if (msg) acc[key] = msg;
    return acc;
  }, {});
}

const INITIAL_FORM: LoginForm = { email: '', password: '' };

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>('Student');
  const [form, setForm] = useState<LoginForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginForm, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Switch role tab → reset the form so old errors don't linger
  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setSubmitError(null);
  };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target as { name: keyof LoginForm; value: string };
      const updated = { ...form, [name]: value };
      setForm(updated);
      if (touched[name]) {
        setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
      }
    },
    [form, touched]
  );

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof LoginForm; value: string };
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const allTouched = Object.keys(form).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof LoginForm, boolean>
    );
    setTouched(allTouched);

    const validationErrors = validateAll(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the right endpoint based on the selected role tab
      const data =
        role === 'Student'
          ? await loginStudent(form)
          : await loginTeacher(form);

      // Save user info so layout/sidebar can read the name & role.
      // JWT cookie is managed by the browser automatically — we never touch it.
      sessionStorage.setItem('user', JSON.stringify(data));

      // Redirect to the correct dashboard
      router.push(data.role === 'Teacher' ? '/teacherDashboard' : '/StudentDashboard');
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : 'Invalid email or password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">

      {/* ── Left decorative panel ── */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col items-center justify-center gap-4 px-12">
        <h1 className="text-4xl font-bold tracking-tight">
          {role === 'Teacher' ? 'Teacher Portal' : 'Student Portal'}
        </h1>
        <p className="text-blue-100 text-center text-sm leading-relaxed max-w-xs">
          {role === 'Teacher'
            ? 'Manage your students, grades, schedules, and assignments.'
            : 'Welcome back! Access your courses, grades, and campus resources.'}
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

          {/* Role toggle */}
          <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
            {(['Student', 'Teacher'] as Role[]).map(r => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2 text-sm font-medium transition-colors
                  ${role === r ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Sign In</h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            Signing in as <strong>{role}</strong>
          </p>

          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-blue-500
                  ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password} onChange={handleChange} onBlur={handleBlur}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-blue-500
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7a9.77 9.77 0 012.168-3.168M6.34 6.34A9.77 9.77 0 0112 5c5 0 9 4 9 7a9.77 9.77 0 01-2.168 3.168M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <button
              type="submit" disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium
                hover:bg-blue-700 active:scale-95 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {role === 'Student' && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/" className="text-blue-600 hover:underline">Register</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
