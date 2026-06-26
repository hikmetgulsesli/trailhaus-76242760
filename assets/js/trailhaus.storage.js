/**
 * TrailHaus persistence layer.
 * Loads and saves app state from localStorage with graceful degradation.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'trailhaus-state';
  const BACKUP_KEY = 'trailhaus-state-backup';

  function isStorageAvailable() {
    try {
      const storage = global.localStorage;
      const testKey = '__th_test__';
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      return true;
    } catch (err) {
      return false;
    }
  }

  function load() {
    if (!isStorageAvailable()) {
      return { ok: false, state: null, error: 'localStorage unavailable' };
    }
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ok: true, state: null, recovered: false };
      }
      const parsed = JSON.parse(raw);
      // Keep a backup on every successful load for recovery.
      global.localStorage.setItem(BACKUP_KEY, raw);
      return { ok: true, state: parsed, recovered: false };
    } catch (err) {
      const backup = loadBackupState();
      if (backup.ok && backup.state) {
        return {
          ok: true,
          state: backup.state,
          recovered: true,
          error: err && err.message ? err.message : 'Corrupted persisted JSON'
        };
      }
      return {
        ok: false,
        state: null,
        recovered: false,
        error: err && err.message ? err.message : 'Failed to load persisted state'
      };
    }
  }

  function loadBackupState() {
    if (!isStorageAvailable()) {
      return { ok: false, state: null, error: 'localStorage unavailable' };
    }
    try {
      const raw = global.localStorage.getItem(BACKUP_KEY);
      if (!raw) {
        return { ok: true, state: null, recovered: false };
      }
      return { ok: true, state: JSON.parse(raw), recovered: false };
    } catch (err) {
      return {
        ok: false,
        state: null,
        recovered: false,
        error: err && err.message ? err.message : 'Backup load failed'
      };
    }
  }

  function save(state) {
    if (!isStorageAvailable()) {
      return { ok: false, error: 'localStorage unavailable' };
    }
    try {
      const raw = JSON.stringify(state);
      global.localStorage.setItem(STORAGE_KEY, raw);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err && err.message ? err.message : 'Failed to save state'
      };
    }
  }

  function clear() {
    if (!isStorageAvailable()) {
      return { ok: false, error: 'localStorage unavailable' };
    }
    try {
      global.localStorage.removeItem(STORAGE_KEY);
      global.localStorage.removeItem(BACKUP_KEY);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err && err.message ? err.message : 'Failed to clear storage'
      };
    }
  }

  global.TrailHausStorage = {
    STORAGE_KEY: STORAGE_KEY,
    BACKUP_KEY: BACKUP_KEY,
    isAvailable: isStorageAvailable,
    load: load,
    loadBackup: loadBackupState,
    save: save,
    clear: clear
  };
})(typeof window !== 'undefined' ? window : globalThis);
