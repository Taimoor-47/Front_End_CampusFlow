import { API_BASE_URL } from "../app/config/api";

const TECHNICAL_ERROR_PATTERN =
  /\b(exception|stack trace|clientconnectionid|error number|invalid column name|system\.|microsoft\.)\b|\bat\s+[\w.]+\(|[a-z]:\\/i;

const MAX_PUBLIC_ERROR_LENGTH = 240;

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function isSafePublicMessage(value: unknown): value is string {
  if (typeof value !== "string") return false;

  const message = value.trim();
  return (
    message.length > 0 &&
    message.length <= MAX_PUBLIC_ERROR_LENGTH &&
    !/[\r\n]/.test(message) &&
    !TECHNICAL_ERROR_PATTERN.test(message)
  );
}

async function getPublicErrorMessage(response: Response): Promise<string | null> {
  const body = (await response.text()).trim();
  if (!body) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("json")) {
    try {
      const payload: unknown = JSON.parse(body);

      if (typeof payload === "object" && payload !== null) {
        const error = payload as Record<string, unknown>;
        const candidates = [error.message, error.title];
        return candidates.find(isSafePublicMessage) ?? null;
      }

      return isSafePublicMessage(payload) ? payload : null;
    } catch {
      return null;
    }
  }

  return isSafePublicMessage(body) ? body : null;
}

function getFallbackMessage(status: number): string {
  if (status === 400) {
    return "The request could not be completed. Please check your information and try again.";
  }
  if (status === 401) {
    return "Your session has expired. Please sign in and try again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  if (status === 404) {
    return "The requested information could not be found.";
  }
  if (status === 409) {
    return "That request conflicts with existing information.";
  }
  if (status >= 500) {
    return "Something went wrong on the server. Please try again later.";
  }

  return "The request could not be completed. Please try again.";
}

/**
 * A thin wrapper around the browser's built-in `fetch`.
 *
 * WHY credentials: "include"?
 *   Our backend stores the JWT in an HTTP-only cookie.
 *   By default, fetch does NOT send cookies to a different origin/port.
 *   `credentials: "include"` tells the browser "please attach all cookies
 *   that belong to the backend's origin on every request".
 *
 * WHY Content-Type: application/json?
 *   Tells the backend we are sending JSON in the request body.
 *   Without this, ASP.NET Core won't parse [FromBody] automatically.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: "include",          // ← send the JWT cookie automatically
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });
  } catch (cause) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[apiClient] ${endpoint} could not reach the API`, cause);
    }

    throw new ApiError(
      0,
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!response.ok) {
    const publicMessage = await getPublicErrorMessage(response);

    if (process.env.NODE_ENV === "development") {
      // Keep diagnostics out of the rendered UI and never log response bodies,
      // because ASP.NET exception pages can contain cookies and other secrets.
      console.error(`[apiClient] ${endpoint} failed`, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    throw new ApiError(
      response.status,
      publicMessage ?? getFallbackMessage(response.status)
    );
  }

  // 204 No Content has no body — return undefined cast as T
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}
