import axios from 'axios';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

export interface ApiError {
    // Form-level message: the backend's { error } text, or a fallback
    message: string;
    // Per-field messages from a failed @Valid check, keyed by request field name
    fieldErrors: Record<string, string>;
}

// The backend sends { error: "..." } for rule failures (bad credentials, username taken) and
// { field: "..." } for a failed @Valid check. 5xx bodies (Spring's default error page, or the
// Vite proxy when the backend is down) are not meant for users.
export function parseApiError(err: unknown): ApiError {
    if (!axios.isAxiosError(err)) return { message: GENERIC_ERROR, fieldErrors: {} };
    if (!err.response) {
        return { message: "Can't reach Verdix right now. Check your connection and try again.", fieldErrors: {} };
    }

    const body: unknown = err.response.data;
    if (err.response.status >= 500 || typeof body !== 'object' || body === null) {
        return { message: GENERIC_ERROR, fieldErrors: {} };
    }

    let message = GENERIC_ERROR;
    const fieldErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
        if (typeof value !== 'string') continue;
        if (key === 'error') message = value;
        else fieldErrors[key] = value;
    }
    return { message, fieldErrors };
}
