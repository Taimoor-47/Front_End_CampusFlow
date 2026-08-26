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

export interface CourseSectionOption {
  id: string;
  courseCode: string;
  courseTitle: string;
  sectionName: string;
  academicYear: string;
  semester: number;
}

export interface AddAssignmentRequest {
  courseSectionId: string;
  title: string;
  description: string;
  dueDate: string;
  file?: File | null;
}

export interface AssignmentCreateResponse {
  id: string;
  courseSectionId: string;
  courseCode: string;
  courseTitle: string;
  sectionName: string;
  title: string;
  description: string;
  dueDate: string;
  filePath: string | null;
}

export interface TeacherSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string | null;
  filePath: string;
  submittedAt: string;
}

// ── API calls ────────────────────────────────────────────────────────────────

/** Get safe student summaries available to the teacher. */
export async function getAllStudents(): Promise<Student[]> {
  // GET /api/teacher/students
  return apiClient<Student[]>("/teacher/students");
}

/** Get only the course sections assigned to the logged-in teacher. */
export async function getMySections(): Promise<CourseSectionOption[]> {
  return apiClient<CourseSectionOption[]>("/teacher/sections");
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

/** Create an assignment for every actively enrolled student in a course section. */
export async function addAssignment(
  data: AddAssignmentRequest
): Promise<AssignmentCreateResponse> {
  const formData = new FormData();

  formData.append("courseSectionId", data.courseSectionId);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("dueDate", data.dueDate);

  if (data.file) {
    formData.append("file", data.file);
  }

  return apiClient<AssignmentCreateResponse>("/teacher/assignments", {
    method: "POST",
    body: formData,
  });
}

/** Get submissions after backend ownership-checks the assignment against the JWT teacher. */
export async function getAssignmentSubmissions(
  assignmentId: string
): Promise<TeacherSubmission[]> {
  return apiClient<TeacherSubmission[]>(
    `/teacher/assignments/${assignmentId}/submissions`
  );
}

// ── Session verification ─────────────────────────────────────────────────────

export interface CurrentTeacher {
  teacherId: string;
  email: string;
}

/**
 * Server-verified identity of the signed-in teacher.
 * Fails with ApiError(401) when the JWT cookie is missing/expired.
 */
export async function getCurrentTeacher(): Promise<CurrentTeacher> {
  // GET /api/teacher/me
  return apiClient<CurrentTeacher>("/teacher/me");
}
