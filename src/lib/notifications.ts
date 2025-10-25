const LS_KEY = "admin_notif_read_v1";

function loadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return new Set();
    return new Set<string>(JSON.parse(raw));
  } catch {
    return new Set();
  }
}
function saveSet(s: Set<string>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(s)));
  } catch {}
}

/** key is like "order:123", "review:45", "contact:67" */
export function isRead(key: string) {
  return loadSet().has(key);
}
export function markRead(key: string) {
  const s = loadSet();
  s.add(key);
  saveSet(s);
}
export function markReadMany(keys: string[]) {
  const s = loadSet();
  keys.forEach((k) => s.add(k));
  saveSet(s);
}
export function clearAllRead() {
  localStorage.removeItem(LS_KEY);
}
