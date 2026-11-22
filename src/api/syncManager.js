// Keeps the app's in-memory collections in sync with the backend.
//
// The app still updates its React state the same way as before. For every synced
// collection, this manager:
//   - compares the latest state with what the server last confirmed (by item key),
//   - sends only the changed / deleted items (debounced),
//   - applies the server's stored versions (e.g. server-scored attempts),
//   - polls for changes made by other people (admins, other devices) every 15s.

import { api } from './client';

const keyOf = (name, item) =>
  name === 'examMonitoring' ? (item?.examId && item?.studentId ? `${item.examId}:${item.studentId}` : undefined) : item?.id;

const POLL_MS = 15000;
const DEBOUNCE_MS = 400;
const RETRY_MS = 5000;

export class SyncManager {
  constructor({ onError } = {}) {
    this.setters = new Map(); // name -> setState
    this.readOnly = new Set();
    this.snapshots = new Map(); // name -> Map(key -> json the server has)
    this.latest = new Map(); // name -> latest array from React state
    this.timers = new Map();
    this.inFlight = new Map(); // name -> Promise
    this.ready = false;
    this.serverTime = null;
    this.pollTimer = null;
    this.onError = onError;
    this.onVisible = () => document.visibilityState === 'visible' && this.poll();
  }

  register(name, setState, { readOnly = false } = {}) {
    this.setters.set(name, setState);
    if (readOnly) this.readOnly.add(name);
  }

  /** Replaces all collections with the server's data (after sign-in). */
  load({ collections, serverTime }) {
    this.serverTime = serverTime;
    for (const [name, setState] of this.setters) {
      const docs = collections[name] || [];
      this.snapshots.set(name, new Map(docs.map((d) => [keyOf(name, d), JSON.stringify(d)])));
      this.latest.set(name, docs);
      setState(docs);
    }
    this.ready = true;
  }

  start() {
    this.stop();
    this.pollTimer = setInterval(() => this.poll(), POLL_MS);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  stop() {
    clearInterval(this.pollTimer);
    this.pollTimer = null;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    document.removeEventListener('visibilitychange', this.onVisible);
  }

  reset() {
    this.stop();
    this.ready = false;
    this.snapshots.clear();
    this.latest.clear();
  }

  /** Called whenever a collection's React state changes. */
  track(name, state) {
    if (!this.ready || !this.setters.has(name) || this.readOnly.has(name)) return;
    this.latest.set(name, state);
    clearTimeout(this.timers.get(name));
    this.timers.set(name, setTimeout(() => this.flush(name), DEBOUNCE_MS));
  }

  /** Flush everything now (e.g. before leaving the page). */
  flushAll() {
    return Promise.all([...this.setters.keys()].map((n) => this.flush(n)));
  }

  isDirty(name, key) {
    const item = (this.latest.get(name) || []).find((i) => keyOf(name, i) === key);
    if (!item) return this.snapshots.get(name)?.has(key) || false;
    return this.snapshots.get(name)?.get(key) !== JSON.stringify(item);
  }

  async flush(name) {
    if (!this.ready || this.readOnly.has(name)) return;
    if (this.inFlight.get(name)) {
      await this.inFlight.get(name);
    }
    const state = this.latest.get(name) || [];
    const snapshot = this.snapshots.get(name) || new Map();
    const upserts = [];
    const seen = new Set();
    for (const item of state) {
      const key = keyOf(name, item);
      if (!key) continue;
      seen.add(key);
      const json = JSON.stringify(item);
      if (snapshot.get(key) !== json) upserts.push({ key, item, json });
    }
    const deletes = [...snapshot.keys()].filter((k) => !seen.has(k));
    if (!upserts.length && !deletes.length) return;

    // Optimistically record as synced; roll back on failure
    const previous = new Map();
    upserts.forEach(({ key, json }) => {
      previous.set(key, snapshot.get(key));
      snapshot.set(key, json);
    });
    deletes.forEach((key) => {
      previous.set(key, snapshot.get(key));
      snapshot.delete(key);
    });

    const request = api(`/sync/${name}`, {
      method: 'POST',
      body: { upserts: upserts.map((u) => u.item), deletes }
    })
      .then((res) => {
        if (res.saved?.length) this.applyDocs(name, res.saved, []);
        if (res.rejected?.length) this.refetch(name); // server disagreed: take its version
      })
      .catch((err) => {
        previous.forEach((json, key) => (json === undefined ? snapshot.delete(key) : snapshot.set(key, json)));
        if (err.status && err.status < 500 && err.status !== 401) {
          this.onError?.(err);
          this.refetch(name);
        } else {
          setTimeout(() => this.flush(name), RETRY_MS); // offline / server error: retry
        }
      })
      .finally(() => this.inFlight.delete(name));
    this.inFlight.set(name, request);
    return request;
  }

  /** Merge server documents into state (skipping items with unsent local edits). */
  applyDocs(name, docs, deletedKeys) {
    const setState = this.setters.get(name);
    if (!setState) return;
    const snapshot = this.snapshots.get(name) || new Map();
    this.snapshots.set(name, snapshot);
    const incoming = new Map();
    docs.forEach((d) => {
      const key = keyOf(name, d);
      // Local edits not yet confirmed by the server win; they will be sent on the next flush
      if (!key || (!this.readOnly.has(name) && this.isDirty(name, key))) return;
      snapshot.set(key, JSON.stringify(d));
      incoming.set(key, d);
    });
    const removed = new Set(deletedKeys.filter((k) => !this.isDirty(name, k) || this.readOnly.has(name)));
    removed.forEach((k) => snapshot.delete(k));
    if (!incoming.size && !removed.size) return;

    setState((prev) => {
      const out = [];
      const placed = new Set();
      (prev || []).forEach((item) => {
        const key = keyOf(name, item);
        if (removed.has(key)) return;
        if (incoming.has(key)) {
          out.push(incoming.get(key));
          placed.add(key);
        } else out.push(item);
      });
      // New items go first (most lists show newest first)
      const fresh = [...incoming.entries()].filter(([k]) => !placed.has(k)).map(([, d]) => d);
      const next = [...fresh, ...out];
      this.latest.set(name, next);
      return next;
    });
  }

  /** Put a server-returned item into state as already synced (e.g. a submitted exam). */
  insertSynced(name, item) {
    this.applyDocs(name, [item], []);
  }

  async refetch(name) {
    try {
      const res = await api(`/sync/collection/${name}`);
      const setState = this.setters.get(name);
      this.snapshots.set(name, new Map(res.docs.map((d) => [keyOf(name, d), JSON.stringify(d)])));
      this.latest.set(name, res.docs);
      setState?.(res.docs);
    } catch (err) {
      this.onError?.(err);
    }
  }

  async poll() {
    if (!this.ready || !this.serverTime) return;
    try {
      const res = await api(`/sync/changes?since=${encodeURIComponent(this.serverTime)}`);
      this.serverTime = res.serverTime;
      Object.entries(res.changes || {}).forEach(([name, { docs, deleted }]) => this.applyDocs(name, docs || [], deleted || []));
      (res.refetch || []).forEach((name) => this.refetch(name));
    } catch {
      /* offline: try again on the next tick */
    }
  }
}
