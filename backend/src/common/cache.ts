/**
 * Tiny in-process TTL cache for expensive read paths.
 * The backend runs as a single long-lived process (Coolify/Docker),
 * and the underlying data is batch-ingested monthly, so in-memory is enough.
 */

type Entry = { value: unknown; expiresAt: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export const TTL = {
  /** 5 minutes — hot landing endpoints. */
  SHORT: 5 * 60_000,
  /** 15 minutes — heavy scans / slowly changing reference data. */
  LONG: 15 * 60_000,
} as const;

/**
 * Return the cached value for `key` when fresh, otherwise run `fn`,
 * cache its result for `ttlMs`, and share the in-flight promise so
 * concurrent callers don't stampede the database.
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.value as T;
  }
  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }
  const promise = fn()
    .then((value) => {
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

/** Drop all entries, or only those whose key starts with `prefix`. */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
