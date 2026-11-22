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
            // expireSession, not clearSession: the Axios interceptor calls this before each request,
            // and if it dropped the token silently React would still think the user is signed in.
            expireSession();
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

// The session can die outside React: the token's exp passes, or the backend rejects it with a 401.
// Plain modules (this one, the Axios interceptor) cannot set React state, so AuthContext registers
// a callback here and expireSession triggers it. Before AuthContext mounts there is no callback,
// which is fine: its initial state comes from loadSession and is already null in that case.
let onExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null): void {
    onExpired = handler;
}

export function expireSession(): void {
    clearSession();
    onExpired?.();
}
