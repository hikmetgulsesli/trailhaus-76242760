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
    if (!isStorageAvailable()) return null;
    try {
      const raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Keep a backup on every successful load for recovery.
      global.localStorage.setItem(BACKUP_KEY, raw);
      return parsed;
    } catch (err) {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('TrailHaus storage load failed:', err);
      }
      return loadBackup();
    }
  }

  function loadBackup() {
    if (!isStorageAvailable()) return null;
    try {
      const raw = global.localStorage.getItem(BACKUP_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function save(state) {
    if (!isStorageAvailable()) return false;
    try {
      const raw = JSON.stringify(state);
      global.localStorage.setItem(STORAGE_KEY, raw);
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('TrailHaus storage save failed:', err);
      }
      return false;
    }
  }

  function clear() {
    if (!isStorageAvailable()) return false;
    try {
      global.localStorage.removeItem(STORAGE_KEY);
      global.localStorage.removeItem(BACKUP_KEY);
      return true;
    } catch (err) {
      return false;
    }
  }

  global.TrailHausStorage = {
    STORAGE_KEY: STORAGE_KEY,
    BACKUP_KEY: BACKUP_KEY,
    isAvailable: isStorageAvailable,
    load: load,
    loadBackup: loadBackup,
    save: save,
    clear: clear
  };
})(typeof window !== 'undefined' ? window : globalThis);
