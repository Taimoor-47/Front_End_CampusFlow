import { apiClient } from "./apiClient";


export interface LoginStudentRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    name: string;
}

export async function loginStudent(student: LoginStudentRequest): Promise<LoginResponse> {
    return apiClient<LoginResponse>(
        "/student/loginStudent",
        {
            method: "POST",
            body: JSON.stringify(student)
        }
    );
}