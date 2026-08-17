'use client';

import { useState, useCallback } from "react";
import { registerStudent } from "../../../services/authService";
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentForm {
  name: string;
  email: string;
  phoneNumber: string;
  age: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof StudentForm, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,15}$/;

function validateField(
  name: keyof StudentForm,
  value: string,
  allValues: StudentForm
): string {
  switch (name) {
    case "name":
      if (!value.trim()) return "Name is required.";
      if (value.trim().length < 3) return "Name must be at least 3 characters.";
      return "";

    case "email":
      if (!value.trim()) return "Email is required.";
      if (!EMAIL_REGEX.test(value)) return "Enter a valid email address.";
      return "";

    case "phoneNumber":
      if (!value.trim()) return "Phone number is required.";
      if (!PHONE_REGEX.test(value)) return "Enter a valid phone number.";
      return "";

    case "age":
      if (!value) return "Age is required.";
      const age = Number(value);
      if (!Number.isInteger(age) || age < 5 || age > 120)
        return "Enter a valid age between 5 and 120.";
      return "";

    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      return "";

    case "confirmPassword":
      if (!value) return "Please confirm your password.";
      if (value !== allValues.password) return "Passwords do not match.";
      return "";

    default:
      return "";
  }
}

function validateAll(values: StudentForm): FormErrors {
  return (Object.keys(values) as (keyof StudentForm)[]).reduce<FormErrors>(
    (acc, key) => {
      const msg = validateField(key, values[key], values);
      if (msg) acc[key] = msg;
      return acc;
    },
    {}
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_FORM: StudentForm = {
  name: "",
  email: "",
  phoneNumber: "",
  age: "",
  password: "",
  confirmPassword: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [student, setStudent] = useState<StudentForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof StudentForm, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Update field value and re-validate only if already touched
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target as { name: keyof StudentForm; value: string };

      const updated = { ...student, [name]: value };
      setStudent(updated);

      if (touched[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: validateField(name, value, updated),
        }));
      }
    },
    [student, touched]
  );

  // Mark field as touched and validate on blur
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const { name, value } = e.target as { name: keyof StudentForm; value: string };
      setTouched((prev) => ({ ...prev, [name]: true }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, student),
      }));
    },
    [student]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all fields as touched so errors become visible
    const allTouched = (Object.keys(student) as (keyof StudentForm)[]).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof StudentForm, boolean>
    );
    setTouched(allTouched);

    const validationErrors = validateAll(student);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await registerStudent({
        ...student,
        age: Number(student.age),
      });
      setSubmitSuccess(true);
      setStudent(INITIAL_FORM);
      setTouched({});
      setErrors({});
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">

      {/* ── Left Panel ── */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col items-center justify-center gap-4 px-12">
        <h1 className="text-4xl font-bold tracking-tight">Student Portal</h1>
        <p className="text-blue-100 text-center text-sm leading-relaxed max-w-xs">
          Create your account to access courses, grades, and campus resources.
        </p>
        <Link href="/LoginPage">
          Already have an account? Log in
        </Link>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 px-4 py-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">

          <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
            Register
          </h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            Fill in the details below to create your account.
          </p>

          {/* Global success / error banners */}
          {submitSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Registration successful! You can now log in.
            </div>
          )}
          {submitError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            <Field
              label="Full Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={student.name}
              error={errors.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Field
              label="Age"
              name="age"
              type="number"
              placeholder="20"
              value={student.age}
              error={errors.age}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={student.email}
              error={errors.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Field
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              placeholder="+1 234 567 8900"
              value={student.phoneNumber}
              error={errors.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={student.password}
              error={errors.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <Field
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={student.confirmPassword}
              error={errors.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium
                         hover:bg-blue-700 active:scale-95 transition-all
                         disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? "Registering…" : "Register"}
            </button>

          </form>
        </div>
      </div>

    </div>
  );
}

// ─── Reusable Field Component ─────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: keyof StudentForm;
  type: React.HTMLInputTypeAttribute;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

function Field({ label, name, type, placeholder, value, error, onChange, onBlur }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-3 py-2 border rounded-lg text-sm outline-none transition
          focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}`}
      />
      {error && (
        <p id={`${name}-error`} className="text-xs text-red-500 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}