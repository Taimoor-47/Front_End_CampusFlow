import { apiClient } from "./apiClient";

export interface RegisterStudentRequest {
    name: string;
    email: string;
    phoneNumber: string;
    age: number;
    password: string;
}


export async function registerStudent(student: RegisterStudentRequest) {
    return apiClient("/student/registerStudent", {
        method: "POST",
        body: JSON.stringify(student),
    });
}
