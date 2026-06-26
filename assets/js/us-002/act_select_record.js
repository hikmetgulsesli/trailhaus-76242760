/**
 * US-002 Action: ACT_SELECT_RECORD
 * Selects an existing item and opens the Item Editor for inline edits.
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

  function selectRecord(itemId) {
    var state = getState();
    if (!state) return null;
    var items = state.get('items') || [];
    var item = items.find(function (i) { return i.id === itemId; }) || null;
    state.set('selectedItem', item);
    state.set('activePanel', item ? 'item-editor' : state.get('currentView'));
    state.set('ui.isNewRecord', false);
    return item;
  }

  function openEditor(itemId) {
    var item = selectRecord(itemId);
    if (item && typeof global.location !== 'undefined') {
      global.location.href = 'item-editor-trailhaus.html?id=' + encodeURIComponent(itemId);
    }
    return item;
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_SELECT_RECORD = {
    selectRecord: selectRecord,
    openEditor: openEditor
  };
})(typeof window !== 'undefined' ? window : globalThis);
