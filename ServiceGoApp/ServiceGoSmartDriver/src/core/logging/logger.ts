export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: Record<string, unknown>;
}

type Listener = (entries: LogEntry[]) => void;

const listeners = new Set<Listener>();
const entries: LogEntry[] = [];
const MAX_ENTRIES = 200;

function notify() {
  const snapshot = [...entries];
  listeners.forEach(listener => listener(snapshot));
}

export function logEvent(
  level: LogLevel,
  category: string,
  message: string,
  details?: Record<string, unknown>,
) {
  entries.unshift({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
  });

  if (entries.length > MAX_ENTRIES) {
    entries.length = MAX_ENTRIES;
  }

  notify();
}

export function subscribeLogs(listener: Listener) {
  listeners.add(listener);
  listener([...entries]);
  return () => {
    listeners.delete(listener);
  };
}

export function getLogs() {
  return [...entries];
}

