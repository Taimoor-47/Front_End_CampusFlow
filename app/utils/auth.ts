// JWT is stored in HTTP-only cookie by backend
// Frontend cannot access it directly (by design - more secure)
// All API requests to backend automatically include the cookie

export function logout() {
    // Call backend logout endpoint to clear the JWT cookie
    sessionStorage.removeItem("user");
    // Backend should handle clearing the HTTP-only cookie via an endpoint
}