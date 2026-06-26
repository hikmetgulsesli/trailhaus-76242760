/**
 * Test bridge exposing deterministic handles for the TrailHaus app shell.
 */
(function (global) {
  'use strict';

  function getApp() {
    return global.TrailHausApp || null;
  }

  function getState() {
    var app = getApp();
    return app && app.state ? app.state.getSnapshot() : null;
  }

  function setView(viewName) {
    var app = getApp();
    if (app && app.state && app.state.VIEWS[viewName.toUpperCase()]) {
      app.state.set('currentView', app.state.VIEWS[viewName.toUpperCase()]);
      return true;
    }
    return false;
  }

  function waitForStable(timeoutMs) {
    return new Promise(function (resolve) {
      var elapsed = 0;
      var interval = 50;
      var timer = setInterval(function () {
        elapsed += interval;
        var app = getApp();
        if (app && app.state) {
          clearInterval(timer);
          resolve(getState());
          return;
        }
        if (elapsed >= timeoutMs) {
          clearInterval(timer);
          resolve(null);
        }
      }, interval);
    });
  }

  global.__SETFARM_TEST_BRIDGE__ = {
    stack: 'static-html',
    ready: true,
    get app() {
      return getApp();
    },
    get state() {
      return getState();
    },
    get storage() {
      var app = getApp();
      return app ? app.storage : null;
    },
    getState: getState,
    setView: setView,
    waitForStable: waitForStable
  };
})(typeof window !== 'undefined' ? window : globalThis);
