/**
 * authService.ts
 * ==============
 * Handles login, registration, and logout for both roles.
 *
 * KEY CONCEPT — why two separate login endpoints?
 *   The backend has /api/student/login and /api/teacher/login.
 *   Each one looks up the right table (Students vs Teachers) and
 *   embeds the correct Role claim inside the JWT token.
 *   That Role claim is what [Authorize(Roles = "Teacher")] checks.
 */

import { apiClient } from "./apiClient";

// ── Shared types ────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

// What the backend returns after a successful login (same shape for both roles)
export interface AuthResponse {
  name: string;
  email: string;
  role: "Student" | "Teacher";
}

// ── Student auth ─────────────────────────────────────────────────────────────

export interface RegisterStudentRequest {
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  password: string;
}

export async function registerStudent(data: RegisterStudentRequest): Promise<AuthResponse> {
  // POST /api/student/register
  return apiClient<AuthResponse>("/student/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginStudent(data: LoginRequest): Promise<AuthResponse> {
  // POST /api/student/login
  // The backend verifies the password, generates a JWT, and stores it
  // in an HTTP-only cookie called "jwt". We never see the token ourselves.
  return apiClient<AuthResponse>("/student/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Teacher auth ─────────────────────────────────────────────────────────────

export interface RegisterTeacherRequest {
  name: string;
  email: string;
  password: string;
}

export async function registerTeacher(data: RegisterTeacherRequest): Promise<AuthResponse> {
  // POST /api/teacher/register
  return apiClient<AuthResponse>("/teacher/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginTeacher(data: LoginRequest): Promise<AuthResponse> {
  // POST /api/teacher/login
  return apiClient<AuthResponse>("/teacher/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Logout (both roles) ──────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  // POST /api/auth/logout
  // Tells the backend to clear the HTTP-only cookie.
  // We can't delete it from JavaScript because it's HttpOnly.
  await apiClient<void>("/auth/logout", { method: "POST" });

  // Also clear the user info we stored in sessionStorage.
  sessionStorage.removeItem("user");
}
