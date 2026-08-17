const CACHE_PREFIX = "solver:pro-access:";
const MAX_AGE_MS = 5 * 60 * 1000;

type CachedAccess = {
  hasAccess: boolean;
  checkedAt: number;
};

function key(userId: string) {
  return `${CACHE_PREFIX}${userId}`;
}

export function readProAccess(userId: string | undefined) {
  if (typeof window === "undefined" || !userId) return false;
  try {
    const raw = window.sessionStorage.getItem(key(userId));
    if (!raw) return false;
    const cached = JSON.parse(raw) as CachedAccess;
    if (!cached.hasAccess || Date.now() - cached.checkedAt > MAX_AGE_MS) {
      window.sessionStorage.removeItem(key(userId));
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function writeProAccess(userId: string | undefined, hasAccess: boolean) {
  if (typeof window === "undefined" || !userId) return;
  try {
    if (hasAccess) {
      window.sessionStorage.setItem(
        key(userId),
        JSON.stringify({ hasAccess: true, checkedAt: Date.now() } satisfies CachedAccess),
      );
    } else {
      window.sessionStorage.removeItem(key(userId));
    }
  } catch {
    // The cache is only an optimistic UI hint; server authorization remains authoritative.
  }
}
