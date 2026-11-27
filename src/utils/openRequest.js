// "Open this item" requests between pages (e.g. a search result that opens one subject, module or
// doubt). The request is kept in sessionStorage so a page that mounts afterwards can pick it up, and
// an event tells a page that is already showing to pick it up now.

export const OPEN_CURRICULUM = 'open_curriculum'; // { subjectId, moduleId? }
export const OPEN_DOUBT = 'open_doubt_id'; // doubt id

export const requestOpen = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
  window.dispatchEvent(new Event(key));
};

/** Returns the pending request for `key` (and clears it), or null. */
export const takeOpenRequest = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return null;
    sessionStorage.removeItem(key);
    try {
      return JSON.parse(raw);
    } catch (e) {
      return raw; // older plain-string values
    }
  } catch (e) {
    return null;
  }
};
