/**
 * US-002 Action: ACT_CANCEL_EDIT
 * Closes the Item Editor without persisting the draft and returns to Item Operations.
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

  function cancelEdit() {
    var state = getState();
    if (!state) return false;
    state.set('selectedItem', null);
    state.set('activePanel', 'inventory');
    state.set('ui.isNewRecord', false);
    return true;
  }

  function goBack() {
    cancelEdit();
    if (typeof global.location !== 'undefined') {
      global.location.href = 'item-operations-trailhaus.html';
    }
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_CANCEL_EDIT = {
    cancelEdit: cancelEdit,
    goBack: goBack
  };
})(typeof window !== 'undefined' ? window : globalThis);
