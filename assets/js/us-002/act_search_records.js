/**
 * US-002 Action: ACT_SEARCH_RECORDS
 * Updates the persistent query/filter state and refreshes the visible result set.
 */
(function (global) {
  'use strict';

  function setSearchQuery(query) {
    var state = global.TrailHausState && global.TrailHausState._instance;
    if (!state) {
      var app = global.TrailHausApp || global.app;
      state = app && app.state;
    }
    if (!state) return;
    state.set('ui.searchQuery', typeof query === 'string' ? query : '');
  }

  function setCategory(category) {
    var state = global.TrailHausState && global.TrailHausState._instance;
    if (!state) {
      var app = global.TrailHausApp || global.app;
      state = app && app.state;
    }
    if (!state) return;
    state.set('ui.selectedCategory', category || 'All Items');
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_SEARCH_RECORDS = {
    setSearchQuery: setSearchQuery,
    setCategory: setCategory,
    handleInput: function (event) {
      setSearchQuery(event && event.target ? event.target.value : '');
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
