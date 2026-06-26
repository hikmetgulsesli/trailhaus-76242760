/**
 * US-003 Action: ACT_FILTER_INSIGHTS
 * Updates the insights query and category/status filters used by the Insights screen.
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

  function setSearchQuery(query) {
    var state = getState();
    if (!state) return;
    state.set('ui.searchQuery', typeof query === 'string' ? query : '');
  }

  function setCategory(category) {
    var state = getState();
    if (!state) return;
    state.set('ui.selectedCategory', category || 'All Items');
  }

  function setStatus(status) {
    var state = getState();
    if (!state) return;
    state.set('ui.insightsStatusFilter', status || 'All');
  }

  function setTimeRange(range) {
    var state = getState();
    if (!state) return;
    state.set('ui.insightsTimeRange', range || 'All');
  }

  function resetFilters() {
    var state = getState();
    if (!state) return;
    state.set('ui.searchQuery', '');
    state.set('ui.selectedCategory', 'All Items');
    state.set('ui.insightsStatusFilter', 'All');
    state.set('ui.insightsTimeRange', 'All');
  }

  function applyFilter(options) {
    options = options || {};
    if (options.category !== undefined) setCategory(options.category);
    if (options.status !== undefined) setStatus(options.status);
    if (options.timeRange !== undefined) setTimeRange(options.timeRange);
    if (options.query !== undefined) setSearchQuery(options.query);
  }

  function handleInput(event) {
    setSearchQuery(event && event.target ? event.target.value : '');
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_FILTER_INSIGHTS = {
    setSearchQuery: setSearchQuery,
    setCategory: setCategory,
    setStatus: setStatus,
    setTimeRange: setTimeRange,
    resetFilters: resetFilters,
    applyFilter: applyFilter,
    handleInput: handleInput
  };
})(typeof window !== 'undefined' ? window : globalThis);
