/**
 * US-002 Action: ACT_SAVE_RECORD
 * Validates and persists the current item draft, then returns to Item Operations.
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

  function validate(item) {
    var errors = [];
    if (!item.name || !item.name.trim()) errors.push('Item name is required.');
    if (!item.sku || !item.sku.trim()) errors.push('SKU is required.');
    if (typeof item.dailyPrice !== 'number' || item.dailyPrice < 0) errors.push('Price must be a non-negative number.');
    if (typeof item.stock !== 'number' || item.stock < 0) errors.push('Stock must be a non-negative number.');
    return errors;
  }

  function saveRecord(formValues) {
    var state = getState();
    if (!state) return { ok: false, errors: ['App state unavailable.'] };

    var selected = state.get('selectedItem') || {};
    var item = Object.assign({}, selected, formValues);
    var errors = validate(item);
    if (errors.length) return { ok: false, errors: errors };

    var items = state.get('items') || [];
    var isNew = state.get('ui.isNewRecord') === true;
    var exists = items.some(function (i) { return i.id === item.id; });

    var nextItems;
    if (exists && !isNew) {
      nextItems = items.map(function (i) { return i.id === item.id ? item : i; });
    } else {
      nextItems = items.slice();
      nextItems.push(item);
    }

    state.set('items', nextItems);
    state.set('selectedItem', null);
    state.set('activePanel', 'inventory');
    state.set('ui.isNewRecord', false);

    if (global.TrailHausStorage && global.TrailHausStorage.save) {
      global.TrailHausStorage.save(state.getSnapshot());
    }

    return { ok: true, item: item };
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_SAVE_RECORD = {
    validate: validate,
    saveRecord: saveRecord
  };
})(typeof window !== 'undefined' ? window : globalThis);
