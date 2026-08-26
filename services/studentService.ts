/**
 * studentService.ts
 * =================
 * Functions that fetch data for the STUDENT dashboard.
 * All these endpoints require [Authorize(Roles = "Student")] on the backend,
 * meaning the JWT cookie must be present and contain Role = "Student".
 */

import { apiClient } from "./apiClient";
import type { GradeCard } from "../types/api";

// ── Types that mirror backend model fields ───────────────────────────────────

export interface GpaRecord {
  id: string;
  semester: number;
  gpa: number;
  studentId: string;
}

export interface ScheduleRecord {
  id: string;
  courseTitle: string;
  room: string;
  startTime: string;   // "HH:mm:ss" e.g. "09:00:00"
  endTime: string;     // "HH:mm:ss" e.g. "10:30:00"
  studentId: string;
}

export interface AssignmentRecord {
  id: string;
  courseSectionId: string;
  courseCode: string;
  courseTitle: string;
  sectionName: string;
  title: string;
  description: string;
  dueDate: string;     // ISO 8601 e.g. "2026-06-15T00:00:00"
  filePath: string | null;
  submitted: boolean;
  submissionFilePath: string | null;
  submittedAt: string | null;
}

export interface SubmissionResponse {
  id: string;
  assignmentId: string;
  filePath: string;
  submittedAt: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

/** Fetch all GPA records for the logged-in student. */
export async function getMyGpa(): Promise<GpaRecord[]> {
  // GET /api/student/my-gpa
  // The backend reads the student ID from the JWT cookie automatically.
  return apiClient<GpaRecord[]>("/student/my-gpa");
}

/** Fetch all schedule entries for the logged-in student. */
export async function getMySchedules(): Promise<ScheduleRecord[]> {
  // GET /api/student/my-schedules
  return apiClient<ScheduleRecord[]>("/student/my-schedules");
}

/** Fetch all assignments for the logged-in student. */
export async function getMyAssignments(): Promise<AssignmentRecord[]> {
  // GET /api/student/my-assignments
  return apiClient<AssignmentRecord[]>("/student/my-assignments");
}

/** Submit a file for an assignment visible to the logged-in student. */
export async function submitAssignment(
  assignmentId: string,
  file: File
): Promise<SubmissionResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return apiClient<SubmissionResponse>(
    `/student/assignments/${assignmentId}/submit`,
    {
      method: "POST",
      body: formData,
    }
  );
}

/** Fetch the full grade card (all semesters + subjects) for the logged-in student. */
export async function getMyGradeCard(): Promise<GradeCard> {
  // GET /api/student/grade-card
  // NOTE: This endpoint needs to be created in the backend — see the guide below.
  return apiClient<GradeCard>("/student/grade-card");
}

// ── Session verification ─────────────────────────────────────────────────────

export interface CurrentStudent {
  studentId: string;
  email: string;
}

/**
 * Server-verified identity of the signed-in student.
 * Fails with ApiError(401) when the JWT cookie is missing/expired — used by
 * dashboards to validate the session instead of trusting sessionStorage.
 */
export async function getCurrentStudent(): Promise<CurrentStudent> {
  // GET /api/student/me
  return apiClient<CurrentStudent>("/student/me");
}
