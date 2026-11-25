import axios from 'axios';

const GENERIC_ERROR = 'Something went wrong. Please try again.';

// What went wrong, independent of wording, so callers can branch (retry, sign in, refresh) without
// parsing messages. Derived from the HTTP status, or "network" when no response arrived.
export type ApiErrorKind =
    | 'network'        // no response: offline, backend down, CORS, timeout
    | 'unauthorized'   // 401: the session ended (the Axios interceptor has already signed out)
    | 'forbidden'      // 403: signed in, but not allowed (someone else's review)
    | 'not-found'      // 404: gone (deleted in another tab) or never existed
    | 'validation'     // 400: the request was rejected; fieldErrors may say why
    | 'conflict'       // 409: clashes with existing data
    | 'server'         // 5xx: our fault or TMDB's (502), not the user's
    | 'unknown';       // not an HTTP error at all (a bug in our own code)

export interface ApiError {
    kind: ApiErrorKind;
    // HTTP status, or null when no response arrived.
    status: number | null;
    // Form-level message: the backend's text, a caller's override for this kind, or a fallback.
    message: string;
    // Per-field messages from a failed @Valid check, keyed by request field name
    fieldErrors: Record<string, string>;
}

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
    network: "Can't reach Verdix right now. Check your connection and try again.",
    unauthorized: 'Your session ended. Sign in again to continue.',
    forbidden: "You don't have permission to do that.",
    'not-found': "That couldn't be found. It may have been removed.",
    validation: 'Some details need fixing. Check the highlighted fields.',
    conflict: 'That conflicts with something that already exists.',
    server: GENERIC_ERROR,
    unknown: GENERIC_ERROR,
};

function kindOf(status: number): ApiErrorKind {
    if (status === 400) return 'validation';
    if (status === 401) return 'unauthorized';
    if (status === 403) return 'forbidden';
    if (status === 404) return 'not-found';
    if (status === 409) return 'conflict';
    if (status >= 500) return 'server';
    return 'unknown';
}

// The backend sends { error: "..." } for rule failures (bad credentials, username taken),
// { message: "..." } from its 403/404 handlers, and { field: "..." } for a failed @Valid check.
// 5xx bodies (Spring's default error page, or the Vite proxy when the backend is down) are not
// meant for users, so their text is never shown.
//
// overrides: copy for a kind in this caller's context, used instead of the backend's text. The
// backend's 404 says "Review with id 12 not found"; the delete flow would rather say "This review
// was already deleted."
export function parseApiError(err: unknown, overrides: Partial<Record<ApiErrorKind, string>> = {}): ApiError {
    const fallback = (kind: ApiErrorKind, status: number | null): ApiError =>
        ({ kind, status, message: overrides[kind] ?? DEFAULT_MESSAGES[kind], fieldErrors: {} });

    if (!axios.isAxiosError(err)) return fallback('unknown', null);
    if (!err.response) return fallback('network', null);

    const { status } = err.response;
    const kind = kindOf(status);
    const body: unknown = err.response.data;
    if (kind === 'server' || typeof body !== 'object' || body === null) return fallback(kind, status);

    let serverMessage: string | null = null;
    const fieldErrors: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
        if (typeof value !== 'string') continue;
        if (key === 'error' || key === 'message') serverMessage = value;
        else fieldErrors[key] = value;
    }
    return {
        kind,
        status,
        message: overrides[kind] ?? serverMessage ?? DEFAULT_MESSAGES[kind],
        fieldErrors,
    };
}

// Whether repeating the same request could succeed: the network dropped, or the server (or TMDB
// behind it) failed. A 4xx will fail the same way again, so it is not retried. Only ever used for
// reads; writes are never retried automatically (see queryClient.ts).
export function isRetryable(err: unknown): boolean {
    if (!axios.isAxiosError(err)) return false;
    if (!err.response) return err.code !== 'ERR_CANCELED';
    return err.response.status >= 500 || err.response.status === 408 || err.response.status === 429;
}
