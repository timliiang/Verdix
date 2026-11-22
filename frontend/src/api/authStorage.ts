// The only module that touches the stored session. AuthContext reads and writes it, the Axios
// interceptor reads the token. Moving to an HttpOnly cookie later means replacing this file.

export interface Session {
    token: string;
    username: string;
}

// One entry, not separate token/username keys, so the two are always saved and cleared together.
const STORAGE_KEY = 'verdix-session';

// Reads the exp claim (seconds since epoch) without verifying the signature: the browser cannot
// verify it and does not need to. This only decides whether the token is worth keeping; the
// backend still validates it on every request. A token that cannot be read counts as expired.
function isExpired(token: string): boolean {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const { exp } = JSON.parse(atob(payload)) as { exp?: unknown };
        return typeof exp === 'number' && exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}

export function loadSession(): Session | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const parsed: unknown = JSON.parse(raw);
        const session = parsed as Partial<Session> | null;
        if (typeof session?.token !== 'string' || typeof session.username !== 'string' || isExpired(session.token)) {
            clearSession();
            return null;
        }
        return { token: session.token, username: session.username };
    } catch {
        // Storage blocked (private mode, site data off) or a corrupt entry: treat as signed out.
        return null;
    }
}

export function saveSession(session: Session): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
        // Not persisted; the session still lives in React state until the tab closes.
    }
}

export function clearSession(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // Nothing stored to clear.
    }
}

export function getToken(): string | null {
    return loadSession()?.token ?? null;
}
