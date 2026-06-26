/**
 * TrailHaus state manager.
 * Provides a minimal reactive store for app shell, views, items and preferences.
 */
(function (global) {
  'use strict';

  const VIEWS = {
    INVENTORY: 'inventory',
    BOOKINGS: 'bookings',
    CUSTOMERS: 'customers',
    INSIGHTS: 'insights',
    MAINTENANCE: 'maintenance',
    SUPPORT: 'support',
    SETTINGS: 'settings'
  };

  const DEFAULT_STATE = {
    version: '1.0.0',
    currentView: VIEWS.INVENTORY,
    selectedItem: null,
    storageStatus: 'unknown',
    lastError: null,
    activePanel: null,
    items: [],
    activities: [],
    preferences: {
      viewDensity: 'Balanced',
      defaultCategory: 'All Items',
      notificationsEnabled: true,
      searchHistory: []
    },
    ui: {
      searchQuery: '',
      selectedCategory: 'All Items',
      isLoading: false,
      errorMessage: ''
    }
  };

  function deepClone(value) {
    if (value === undefined) return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function createState(initial) {
    let state = deepClone(Object.assign({}, DEFAULT_STATE, initial));
    const listeners = [];

    function notify(path, value, prev) {
      listeners.slice().forEach(function (listener) {
        try {
          listener(state, path, value, prev);
        } catch (err) {
          // eslint-disable-next-line no-console
          if (typeof console !== 'undefined' && console.error) {
            console.error('State listener error:', err);
          }
        }
      });
    }

    function set(path, value) {
      const segments = path.split('.');
      let target = state;
      for (let i = 0; i < segments.length - 1; i += 1) {
        const segment = segments[i];
        if (target[segment] === undefined || target[segment] === null) {
          target[segment] = {};
        }
        target = target[segment];
      }
      const key = segments[segments.length - 1];
      const prev = deepClone(target[key]);
      target[key] = deepClone(value);
      notify(path, value, prev);
    }

    function get(path) {
      if (!path) return deepClone(state);
      const segments = path.split('.');
      let target = state;
      for (let i = 0; i < segments.length; i += 1) {
        if (target === null || target === undefined) return undefined;
        target = target[segments[i]];
      }
      return deepClone(target);
    }

    function update(path, updater) {
      const current = get(path);
      const next = typeof updater === 'function' ? updater(current) : updater;
      set(path, next);
    }

    function replace(nextState) {
      const prev = deepClone(state);
      state = deepClone(Object.assign({}, DEFAULT_STATE, nextState));
      notify('*', state, prev);
    }

    function subscribe(listener) {
      if (typeof listener !== 'function') return function () {};
      listeners.push(listener);
      return function unsubscribe() {
        const idx = listeners.indexOf(listener);
        if (idx > -1) listeners.splice(idx, 1);
      };
    }

    function getSnapshot() {
      return deepClone(state);
    }

    return {
      VIEWS: VIEWS,
      set: set,
      get: get,
      update: update,
      replace: replace,
      subscribe: subscribe,
      getSnapshot: getSnapshot
    };
  }

  global.TrailHausState = {
    VIEWS: VIEWS,
    DEFAULT_STATE: DEFAULT_STATE,
    create: createState
  };
})(typeof window !== 'undefined' ? window : globalThis);
