'use client';

import { useSyncExternalStore } from 'react';

/**
 * PROTOTYPE PERSISTENCE LAYER
 * ---------------------------
 * A tiny, dependency-free collection store. It wraps an initial array of
 * records (our existing mock data), persists changes to localStorage, and lets
 * React components subscribe via `useCollection`. This turns the demo from
 * "toast-only, resets on navigation" into a working app whose create/edit/
 * delete survive navigation and reload — WITHOUT a backend.
 *
 * WHY THIS SHAPE
 *   - `useSyncExternalStore` gives correct, tearing-free subscriptions and is
 *     SSR-safe (server snapshot returns the seed data).
 *   - Each collection is independent and keyed by a storage key, so modules
 *     don't share state accidentally.
 *   - The public surface (list/get/create/update/remove) mirrors what a real
 *     REST/service client would expose, so swapping this for the CIC-BANCA
 *     `apiMethods` fetch client later is mechanical: replace the store body,
 *     keep the same method names at call sites.
 *
 * NOT a global state manager, cache, or query library — deliberately minimal.
 */

export interface Collection<T extends { id: string }> {
  /** Current records (a stable snapshot; safe to render directly). */
  list: () => T[];
  /** One record by id, or undefined. */
  get: (id: string) => T | undefined;
  /** Insert a record. If it has no id, one is generated. Returns the record. */
  create: (record: Omit<T, 'id'> & { id?: string }) => T;
  /** Merge a partial update into the record with this id. Returns it, or undefined. */
  update: (id: string, patch: Partial<T>) => T | undefined;
  /** Remove a record by id. Returns true if it existed. */
  remove: (id: string) => boolean;
  /** Replace the whole collection (used by bulk ops / reset-to-seed). */
  replaceAll: (records: T[]) => void;
  /** Restore the original seed data. */
  reset: () => void;
  /** Subscribe to changes; returns an unsubscribe fn. */
  subscribe: (cb: () => void) => () => void;
  /** The seed the collection was created from (immutable reference copy). */
  readonly seed: readonly T[];
}

let idCounter = 0;
function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

/**
 * Create a persisted collection.
 * @param storageKey unique localStorage key, e.g. 'emtech.store.vendors.v1'
 * @param seed the initial records (usually imported mock data)
 * @param idPrefix prefix for generated ids, e.g. 'ven'
 */
export function createCollection<T extends { id: string }>(
  storageKey: string,
  seed: T[],
  idPrefix = 'rec'
): Collection<T> {
  // Deep-clone the seed so callers mutating records can't corrupt the baseline.
  const seedCopy: T[] = JSON.parse(JSON.stringify(seed));
  let data: T[] = JSON.parse(JSON.stringify(seed));
  const listeners = new Set<() => void>();

  const isBrowser = typeof window !== 'undefined';

  function load() {
    if (!isBrowser) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) data = JSON.parse(raw);
    } catch {
      /* malformed storage — keep seed */
    }
  }

  function persist() {
    if (isBrowser) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {
        /* storage unavailable — in-memory still works */
      }
    }
    listeners.forEach((cb) => cb());
  }

  // Hydrate from storage once at module load (client only).
  load();

  return {
    list: () => data,
    get: (id) => data.find((r) => r.id === id),
    create: (record) => {
      const full = { ...record, id: record.id ?? generateId(idPrefix) } as T;
      data = [full, ...data];
      persist();
      return full;
    },
    update: (id, patch) => {
      let updated: T | undefined;
      data = data.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...patch };
        return updated;
      });
      if (updated) persist();
      return updated;
    },
    remove: (id) => {
      const before = data.length;
      data = data.filter((r) => r.id !== id);
      const existed = data.length !== before;
      if (existed) persist();
      return existed;
    },
    replaceAll: (records) => {
      data = records;
      persist();
    },
    reset: () => {
      data = JSON.parse(JSON.stringify(seedCopy));
      persist();
    },
    subscribe: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    get seed() {
      return seedCopy;
    }
  };
}

/**
 * Subscribe a component to a collection. Re-renders on any change and returns
 * the live list. Use the collection's create/update/remove to mutate.
 */
export function useCollection<T extends { id: string }>(collection: Collection<T>): T[] {
  return useSyncExternalStore(
    collection.subscribe,
    collection.list,
    // Server snapshot: the seed (stable across server render).
    () => collection.seed as T[]
  );
}
