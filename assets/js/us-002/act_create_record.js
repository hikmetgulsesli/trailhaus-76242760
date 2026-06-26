/**
 * US-002 Action: ACT_CREATE_RECORD
 * Opens the Item Editor with a fresh draft item.
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

  function createDraft() {
    var state = getState();
    if (!state) return null;
    var draft = {
      id: 'item-' + Date.now(),
      name: '',
      sku: '',
      category: 'Tents',
      status: 'Available',
      dailyPrice: 0,
      stock: 1,
      description: ''
    };
    state.set('selectedItem', draft);
    state.set('activePanel', 'item-editor');
    state.set('ui.isNewRecord', true);
    return draft;
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_CREATE_RECORD = {
    createDraft: createDraft,
    openEditor: function () {
      createDraft();
      if (typeof global.location !== 'undefined') {
        global.location.href = 'item-editor-trailhaus.html?mode=create';
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
