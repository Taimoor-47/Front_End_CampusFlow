/**
 * teacherService.ts
 * =================
 * Functions for the TEACHER dashboard.
 * All endpoints require [Authorize(Roles = "Teacher")] on the backend.
 */

import { apiClient } from "./apiClient";

// ── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  age: number;
  isActive: boolean;
  role: string;
}

export interface AddGpaRequest {
  studentId: string;
  semester: number;
  gpa: number;
}

export interface AddScheduleRequest {
  studentId: string;
  courseTitle: string;
  room: string;
  startTime: string;   // "HH:mm:ss"
  endTime: string;     // "HH:mm:ss"
}

export interface AddAssignmentRequest {
  studentId: string;
  title: string;
  description: string;
  dueDate: string;     // ISO 8601
}

// ── API calls ────────────────────────────────────────────────────────────────

/** Get every student with their GPA, schedules, and assignments. */
export async function getAllStudents(): Promise<Student[]> {
  // GET /api/teacher/students
  return apiClient<Student[]>("/teacher/students");
}

/** Add a GPA record for a student. */
export async function addGpa(data: AddGpaRequest): Promise<unknown> {
  // POST /api/teacher/add-gpa
  return apiClient("/teacher/add-gpa", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Add a schedule entry for a student. */
export async function addSchedule(data: AddScheduleRequest): Promise<unknown> {
  // POST /api/teacher/add-schedule
  return apiClient("/teacher/add-schedule", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/** Create an assignment for a student. */
export async function addAssignment(data: AddAssignmentRequest): Promise<unknown> {
  // POST /api/teacher/add-assignment
  return apiClient("/teacher/add-assignment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
