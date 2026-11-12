export interface PersistedStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
}

// External store backed by localStorage. Every storage access is guarded, and the
// in-memory value keeps working when storage is blocked or full.
export function createPersistedStore<T>(
  key: string,
  fallback: T,
  parse: (raw: unknown) => T,
): PersistedStore<T> {
  const listeners = new Set<() => void>();
  let current: T | undefined;

  function load(): T {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        return parse(JSON.parse(raw));
      }
    } catch {
      // storage unavailable or corrupt value: use the fallback
    }
    return fallback;
  }

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  function onStorage(event: StorageEvent): void {
    if (event.key === key || event.key === null) {
      current = load();
      notify();
    }
  }

  return {
    subscribe(listener) {
      if (listeners.size === 0) {
        window.addEventListener("storage", onStorage);
      }
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          window.removeEventListener("storage", onStorage);
        }
      };
    },
    getSnapshot() {
      current ??= load();
      return current;
    },
    getServerSnapshot() {
      return fallback;
    },
    set(next) {
      current = next;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // ignore: value stays in memory for this session
      }
      notify();
    },
  };
}
