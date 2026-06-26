/**
 * US-002 Action: ACT_RETRY_LOAD
 * Retries seeding app state when the initial load failed.
 */
(function (global) {
  'use strict';

  function getState() {
    if (global.TrailHausState && global.TrailHausState._instance) {
      return global.TrailHausState._instance;
    }
    var app = global.TrailHausApp || global.app;
    return app && app.state ? app.state : null;
  }

  function retryLoad() {
    var state = getState();
    if (!state) return Promise.resolve(false);
    state.set('ui.isLoading', true);
    state.set('ui.errorMessage', '');

    return global.fetch('assets/data/trailhaus.json')
      .then(function (res) {
        if (!res.ok) throw new Error('Seed fetch failed: ' + res.statusText);
        return res.json();
      })
      .then(function (data) {
        state.replace(data);
        state.set('storageStatus', 'loaded');
        state.set('lastError', null);
        state.set('ui.isLoading', false);
        if (global.TrailHausStorage && global.TrailHausStorage.save) {
          global.TrailHausStorage.save(state.getSnapshot());
        }
        return true;
      })
      .catch(function (err) {
        state.set('storageStatus', 'error');
        state.set('lastError', err && err.message ? err.message : 'Retry failed');
        state.set('ui.isLoading', false);
        state.set('ui.errorMessage', 'Unable to load data. Please try again.');
        return false;
      });
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_RETRY_LOAD = {
    retryLoad: retryLoad
  };
})(typeof window !== 'undefined' ? window : globalThis);
