// Note file storage (IndexedDB)
//
// Uploaded note files (PDF, images, Word, slides...) are stored as Blobs in IndexedDB,
// NOT in localStorage. localStorage only holds ~5MB in total, and the curriculum is saved
// there; a few base64 PDFs would fill it and silently stop every curriculum change from saving.
// The curriculum keeps only the note's metadata (title, fileName, size...) keyed by note id.

import { api, backendEnabled } from '../api/client';

// With the backend enabled (VITE_API_URL), files are stored on the server (MongoDB GridFS)
// instead of this browser's IndexedDB.

const DB_NAME = 'cohesion_notes';
const STORE = 'files';
const DB_VERSION = 1;

export const MAX_NOTE_FILE_BYTES = 25 * 1024 * 1024; // 25 MB per file

let dbPromise = null;

const openDb = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support file storage (IndexedDB).'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((err) => {
    dbPromise = null; // allow a retry later
    throw err;
  });
  return dbPromise;
};

const run = async (mode, operation) => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = operation(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Storage transaction aborted'));
  });
};

// Files saved in this browser (used directly in local mode, and for the one-time import)
export const getLocalNoteFile = (noteId) => run('readonly', (store) => store.get(noteId));

export const saveNoteFile = (noteId, blob) => {
  if (backendEnabled) {
    return api(`/files/${encodeURIComponent(noteId)}?name=${encodeURIComponent(blob.name || '')}`, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': blob.type || 'application/octet-stream' }
    });
  }
  return run('readwrite', (store) => store.put(blob, noteId));
};

export const getNoteFile = async (noteId) => {
  if (backendEnabled) {
    try {
      return await api(`/files/${encodeURIComponent(noteId)}`, { responseType: 'blob' });
    } catch (err) {
      if (err.status === 404) return undefined;
      throw err;
    }
  }
  return getLocalNoteFile(noteId);
};

export const deleteNoteFiles = async (noteIds) => {
  const ids = (noteIds || []).filter(Boolean);
  if (ids.length === 0) return;
  if (backendEnabled) {
    await Promise.all(ids.map((id) => api(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {})));
    return;
  }
  try {
    await run('readwrite', (store) => {
      let last;
      ids.forEach((id) => {
        last = store.delete(id);
      });
      return last;
    });
  } catch (e) {
    console.warn('Note file cleanup notice:', e);
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${parseFloat((bytes / (1024 * 1024)).toFixed(1))} MB`;
};

// Collects the ids of uploaded-file notes in a module/subject so their blobs can be removed
export const collectFileNoteIds = (modules) =>
  (modules || []).flatMap((m) => (m.notes || []).filter((n) => n.type === 'file').map((n) => n.id));
