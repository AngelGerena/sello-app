/* Which editor view someone prefers. Quick setup is an optional shortcut, never a gate:
   it is the default only for a person's very first card, and only until they choose otherwise. */
export const VIEW_KEY = 'fc.editor-view';

export function prefersQuick(): boolean {
  try { return localStorage.getItem(VIEW_KEY) === 'quick'; } catch { return false; }
}
