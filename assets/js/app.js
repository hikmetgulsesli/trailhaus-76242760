/**
 * TrailHaus app shell bootstrap.
 * Wires state, persistence, navigation and view rendering.
 */
(function (global) {
  'use strict';

  var VIEWS = global.TrailHausState.VIEWS;
  var state = global.TrailHausState.create();
  var storage = global.TrailHausStorage;
  var seedUrl = 'assets/data/trailhaus.json';

  var viewTitles = {
    [VIEWS.INVENTORY]: 'Item Operations',
    [VIEWS.BOOKINGS]: 'Bookings',
    [VIEWS.CUSTOMERS]: 'Customers',
    [VIEWS.INSIGHTS]: 'Insights',
    [VIEWS.MAINTENANCE]: 'Maintenance',
    [VIEWS.SUPPORT]: 'Support',
    [VIEWS.SETTINGS]: 'Settings and Preferences'
  };

  var viewIcons = {
    [VIEWS.INVENTORY]: 'inventory_2',
    [VIEWS.BOOKINGS]: 'calendar_today',
    [VIEWS.CUSTOMERS]: 'groups',
    [VIEWS.INSIGHTS]: 'analytics',
    [VIEWS.MAINTENANCE]: 'settings_suggest',
    [VIEWS.SUPPORT]: 'help',
    [VIEWS.SETTINGS]: 'settings'
  };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') {
          node.className = attrs[key];
        } else if (key === 'textContent') {
          node.textContent = attrs[key];
        } else if (key === 'innerHTML') {
          node.innerHTML = attrs[key];
        } else if (key.startsWith('data-')) {
          node.setAttribute(key, attrs[key]);
        } else if (key.startsWith('on') && typeof attrs[key] === 'function') {
          var eventName = key.slice(2).toLowerCase();
          node.addEventListener(eventName, attrs[key]);
        } else {
          node[key] = attrs[key];
        }
      });
    }
    if (children) {
      children.forEach(function (child) {
        if (child === null || child === undefined) return;
        if (typeof child === 'string') {
          node.appendChild(document.createTextNode(child));
        } else {
          node.appendChild(child);
        }
      });
    }
    return node;
  }

  function iconSvg(symbol) {
    // Material Symbols are not loaded, so render a text fallback for reliability.
    return el('span', { className: 'icon-fallback', textContent: symbol });
  }

  function formatNumber(n) {
    return typeof n === 'number' ? n : 0;
  }

  function getMetrics() {
    var items = state.get('items') || [];
    var total = items.length;
    var active = items.filter(function (i) { return i.status === 'Rented'; }).length;
    var maintenance = items.filter(function (i) { return i.status === 'Maintenance'; }).length;
    var available = items.filter(function (i) { return i.status === 'Available'; }).length;
    return { total: total, active: active, maintenance: maintenance, available: available };
  }

  function filteredItems() {
    var items = state.get('items') || [];
    var query = (state.get('ui.searchQuery') || '').toLowerCase();
    var category = state.get('ui.selectedCategory') || 'All Items';
    return items.filter(function (item) {
      var matchesCategory = category === 'All Items' || item.category === category;
      var matchesQuery = !query ||
        item.name.toLowerCase().indexOf(query) > -1 ||
        item.sku.toLowerCase().indexOf(query) > -1;
      return matchesCategory && matchesQuery;
    });
  }

  function uniqueCategories() {
    var items = state.get('items') || [];
    var cats = {};
    items.forEach(function (item) { cats[item.category] = true; });
    return ['All Items'].concat(Object.keys(cats).sort());
  }

  function savePreferencesFromForm(form) {
    var density = form.querySelector('input[name="viewDensity"]:checked');
    var category = form.querySelector('select[name="defaultCategory"]');
    var notifications = form.querySelector('input[name="notificationsEnabled"]');
    state.update('preferences', function (prefs) {
      return {
        viewDensity: density ? density.value : prefs.viewDensity,
        defaultCategory: category ? category.value : prefs.defaultCategory,
        notificationsEnabled: notifications ? notifications.checked : prefs.notificationsEnabled,
        searchHistory: prefs.searchHistory
      };
    });
    state.set('ui.selectedCategory', category ? category.value : 'All Items');
  }

  function showConfirmation(message) {
    var container = document.querySelector('[data-testid="main-content"]');
    if (!container) return;
    var banner = el('div', {
      className: 'banner-confirmation',
      textContent: message,
      'data-testid': 'preference-saved-banner'
    });
    container.insertBefore(banner, container.firstChild);
    setTimeout(function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, 3000);
  }

  function renderInventory() {
    var metrics = getMetrics();
    var items = filteredItems();
    var categories = uniqueCategories();

    function metricCard(label, value, tone) {
      return el('div', { className: 'metric-card ' + (tone || '') }, [
        el('span', { className: 'metric-label', textContent: label }),
        el('span', { className: 'metric-value', textContent: value })
      ]);
    }

    var searchInput = el('input', {
      type: 'text',
      className: 'search-input',
      placeholder: 'Search inventory...',
      value: state.get('ui.searchQuery') || '',
      'data-testid': 'search-inventory',
      onInput: function (e) {
        state.set('ui.searchQuery', e.target.value);
      }
    });

    var categorySelect = el('select', {
      className: 'select-input',
      'data-testid': 'category-filter',
      onChange: function (e) {
        state.set('ui.selectedCategory', e.target.value);
      }
    }, categories.map(function (cat) {
      return el('option', { value: cat, textContent: cat, selected: cat === state.get('ui.selectedCategory') });
    }));

    var addButton = el('button', {
      className: 'btn btn-primary',
      textContent: 'Add Gear',
      'data-action-id': 'ACT_CREATE_RECORD',
      onClick: function () {
        // Minimal create flow: append a placeholder item so persistence is exercised.
        state.update('items', function (items) {
          var next = (items || []).slice();
          next.push({
            id: 'item-' + Date.now(),
            name: 'New Gear Item',
            sku: 'TH-NEW-' + Date.now(),
            category: 'Tents',
            status: 'Available',
            dailyPrice: 0,
            stock: 1,
            description: ''
          });
          return next;
        });
      }
    });

    var tableHeader = el('div', { className: 'item-row item-header' }, [
      el('span', { textContent: 'Name' }),
      el('span', { textContent: 'SKU' }),
      el('span', { textContent: 'Category' }),
      el('span', { textContent: 'Status' }),
      el('span', { textContent: 'Price/Day' }),
      el('span', { textContent: 'Stock' }),
      el('span', { textContent: 'Actions' })
    ]);

    var rows = items.map(function (item) {
      var statusClass = 'status-' + item.status.toLowerCase();
      var editButton = el('button', {
        className: 'btn btn-secondary btn-small',
        textContent: 'Edit',
        'data-action-id': 'ACT_SELECT_RECORD',
        onClick: function () {
          var newName = window.prompt('Edit item name:', item.name);
          if (newName === null) return;
          state.update('items', function (items) {
            return items.map(function (i) {
              if (i.id !== item.id) return i;
              return Object.assign({}, i, { name: newName });
            });
          });
        }
      });
      return el('div', { className: 'item-row' }, [
        el('span', { textContent: item.name }),
        el('span', { className: 'sku', textContent: item.sku }),
        el('span', { textContent: item.category }),
        el('span', { className: 'status-badge ' + statusClass, textContent: item.status }),
        el('span', { textContent: '$' + item.dailyPrice }),
        el('span', { textContent: item.stock }),
        editButton
      ]);
    });

    var list = el('div', { className: 'item-list' }, [tableHeader].concat(rows));

    return el('div', { className: 'view view-inventory' }, [
      el('div', { className: 'metrics-grid' }, [
        metricCard('Total Items', metrics.total),
        metricCard('Available', metrics.available, 'good'),
        metricCard('Active Rentals', metrics.active, 'accent'),
        metricCard('Maintenance', metrics.maintenance, 'warn')
      ]),
      el('div', { className: 'toolbar' }, [
        searchInput,
        categorySelect,
        addButton
      ]),
      items.length === 0 ? el('p', { className: 'empty-state', textContent: 'No items match the current filter.' }) : list
    ]);
  }

  function renderInsights() {
    var metrics = getMetrics();
    var activities = (state.get('activities') || []).slice().sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    var filterButton = el('button', {
      className: 'btn btn-secondary',
      textContent: 'Filter',
      'data-action-id': 'ACT_FILTER_INSIGHTS',
      onClick: function () {
        var category = window.prompt('Filter insights by category (All/Tents/Packs/Apparel):', 'All Items');
        if (!category) return;
        state.set('ui.selectedCategory', category);
      }
    });

    var exportButton = el('button', {
      className: 'btn btn-secondary',
      textContent: 'Export Summary',
      'data-action-id': 'ACT_EXPORT_SUMMARY',
      onClick: function () {
        var data = JSON.stringify(state.get('items'), null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'trailhaus-summary.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    return el('div', { className: 'view view-insights' }, [
      el('div', { className: 'toolbar' }, [filterButton, exportButton]),
      el('div', { className: 'metrics-grid' }, [
        el('div', { className: 'metric-card' }, [
          el('span', { className: 'metric-label', textContent: 'Total Items' }),
          el('span', { className: 'metric-value', textContent: metrics.total })
        ]),
        el('div', { className: 'metric-card accent' }, [
          el('span', { className: 'metric-label', textContent: 'Active Rentals' }),
          el('span', { className: 'metric-value', textContent: metrics.active })
        ]),
        el('div', { className: 'metric-card warn' }, [
          el('span', { className: 'metric-label', textContent: 'In Maintenance' }),
          el('span', { className: 'metric-value', textContent: metrics.maintenance })
        ])
      ]),
      el('h3', { className: 'section-title', textContent: 'Recent Activity' }),
      el('div', { className: 'activity-list' }, activities.map(function (act) {
        return el('div', { className: 'activity-row' }, [
          el('span', { className: 'activity-type', textContent: act.type }),
          el('span', { textContent: act.message }),
          el('span', { className: 'activity-time', textContent: new Date(act.timestamp).toLocaleString() })
        ]);
      }))
    ]);
  }

  function renderMaintenance() {
    var items = (state.get('items') || []).filter(function (i) { return i.status === 'Maintenance'; });
    return el('div', { className: 'view view-maintenance' }, [
      el('p', { className: 'summary', textContent: 'Items currently flagged for repair or servicing.' }),
      items.length === 0
        ? el('p', { className: 'empty-state', textContent: 'No items under maintenance.' })
        : el('div', { className: 'item-list' }, items.map(function (item) {
          return el('div', { className: 'item-row' }, [
            el('span', { textContent: item.name }),
            el('span', { className: 'sku', textContent: item.sku }),
            el('span', { className: 'status-badge warn', textContent: item.status })
          ]);
        }))
    ]);
  }

  function renderSettings() {
    var prefs = state.get('preferences');
    var densities = ['Grid', 'Table', 'Balanced', 'Compact'];

    var densityGroup = el('div', { className: 'form-group' }, [
      el('label', { textContent: 'Default view density' })
    ]);

    densities.forEach(function (density) {
      var id = 'density-' + density.toLowerCase();
      var radio = el('input', {
        type: 'radio',
        name: 'viewDensity',
        id: id,
        value: density,
        checked: prefs.viewDensity === density
      });
      densityGroup.appendChild(el('label', { className: 'radio-label', htmlFor: id }, [
        radio,
        el('span', { textContent: density })
      ]));
    });

    var categorySelect = el('select', {
      name: 'defaultCategory',
      className: 'select-input'
    }, uniqueCategories().map(function (cat) {
      return el('option', { value: cat, textContent: cat, selected: cat === prefs.defaultCategory });
    }));

    var notifications = el('input', {
      type: 'checkbox',
      name: 'notificationsEnabled',
      checked: prefs.notificationsEnabled
    });

    var form = el('form', {
      className: 'preferences-form',
      'data-testid': 'settings-form',
      onSubmit: function (e) {
        e.preventDefault();
        savePreferencesFromForm(form);
        showConfirmation('Preferences saved.');
      }
    }, [
      densityGroup,
      el('div', { className: 'form-group' }, [
        el('label', { textContent: 'Default category' }),
        categorySelect
      ]),
      el('div', { className: 'form-group checkbox-group' }, [
        notifications,
        el('label', { textContent: 'Enable notifications' })
      ]),
      el('div', { className: 'form-actions' }, [
        el('button', {
          type: 'button',
          className: 'btn btn-secondary',
          textContent: 'Reset',
          onClick: function () {
            state.update('preferences', function () {
              return {
                viewDensity: 'Balanced',
                defaultCategory: 'All Items',
                notificationsEnabled: true,
                searchHistory: []
              };
            });
            state.set('ui.selectedCategory', 'All Items');
          }
        }),
        el('button', {
          type: 'submit',
          className: 'btn btn-primary',
          textContent: 'Save Preferences',
          'data-action-id': 'ACT_SAVE_PREFERENCES'
        })
      ])
    ]);

    return el('div', { className: 'view view-settings' }, [form]);
  }

  function renderPlaceholder(title) {
    return el('div', { className: 'view view-placeholder' }, [
      el('h3', { className: 'section-title', textContent: title }),
      el('p', { className: 'empty-state', textContent: 'This section is under construction for the current story.' })
    ]);
  }

  function renderView() {
    var view = state.get('currentView');
    var title = viewTitles[view] || view;
    var main = document.querySelector('[data-testid="main-content"]');
    if (!main) return;

    var header = main.querySelector('.content-header');
    if (header) header.textContent = title;

    var body = main.querySelector('.content-body');
    if (!body) return;
    body.innerHTML = '';

    var content;
    switch (view) {
      case VIEWS.INVENTORY:
        content = renderInventory();
        break;
      case VIEWS.INSIGHTS:
        content = renderInsights();
        break;
      case VIEWS.MAINTENANCE:
        content = renderMaintenance();
        break;
      case VIEWS.SETTINGS:
        content = renderSettings();
        break;
      default:
        content = renderPlaceholder(title);
    }

    body.appendChild(content);
    updateActiveNav();
  }

  function updateActiveNav() {
    var view = state.get('currentView');
    document.querySelectorAll('[data-nav-view]').forEach(function (link) {
      var isActive = link.getAttribute('data-nav-view') === view;
      link.classList.toggle('active', isActive);
    });
  }

  function buildNavItem(view, label, atBottom) {
    var symbol = viewIcons[view] || 'circle';
    return el('a', {
      href: '#',
      className: 'nav-link' + (state.get('currentView') === view ? ' active' : ''),
      'data-nav-view': view,
      'data-testid': 'nav-' + view,
      onClick: function (e) {
        e.preventDefault();
        state.set('currentView', view);
      }
    }, [
      iconSvg(symbol),
      el('span', { textContent: label })
    ]);
  }

  function buildShell() {
    var topSearch = el('input', {
      type: 'text',
      className: 'top-search',
      placeholder: 'Search...',
      'data-testid': 'top-search'
    });

    var addGearButton = el('button', {
      className: 'btn btn-primary',
      textContent: 'Add Gear',
      'data-action-id': 'ACT_CREATE_RECORD',
      onClick: function () {
        state.set('currentView', VIEWS.INVENTORY);
        // Trigger add after view switch.
        setTimeout(function () {
          var addBtn = document.querySelector('[data-testid="main-content"] [data-action-id="ACT_CREATE_RECORD"]');
          if (addBtn) addBtn.click();
        }, 0);
      }
    });

    var topBar = el('header', { className: 'top-bar' }, [
      el('div', { className: 'top-bar-left' }, [
        iconSvg('search'),
        topSearch
      ]),
      el('div', { className: 'top-bar-right' }, [
        addGearButton,
        el('button', {
          className: 'icon-btn',
          'data-testid': 'notifications-btn',
          title: 'Notifications',
          onClick: function () {
            state.update('preferences', function (prefs) {
              var currentPrefs = prefs || {};
              return Object.assign({}, currentPrefs, { notificationsEnabled: !currentPrefs.notificationsEnabled });
            });
          }
        }, [iconSvg('notifications')]),
        el('button', {
          className: 'icon-btn',
          'data-testid': 'account-btn',
          title: 'Account',
          onClick: function () { state.set('currentView', VIEWS.SETTINGS); }
        }, [iconSvg('account_circle')]),
        el('button', {
          className: 'icon-btn',
          'data-testid': 'settings-btn',
          title: 'Settings',
          onClick: function () { state.set('currentView', VIEWS.SETTINGS); }
        }, [iconSvg('settings')])
      ])
    ]);

    var navListTop = el('ul', { className: 'nav-list' }, [
      el('li', null, [buildNavItem(VIEWS.INVENTORY, 'Inventory')]),
      el('li', null, [buildNavItem(VIEWS.BOOKINGS, 'Bookings')]),
      el('li', null, [buildNavItem(VIEWS.CUSTOMERS, 'Customers')]),
      el('li', null, [buildNavItem(VIEWS.INSIGHTS, 'Insights')]),
      el('li', null, [buildNavItem(VIEWS.MAINTENANCE, 'Maintenance')])
    ]);

    var navListBottom = el('ul', { className: 'nav-list' }, [
      el('li', null, [buildNavItem(VIEWS.SUPPORT, 'Support')]),
      el('li', null, [buildNavItem(VIEWS.SETTINGS, 'Settings')])
    ]);

    var sideNav = el('nav', { className: 'side-nav' }, [
      el('div', { className: 'brand' }, [
        el('div', { className: 'brand-logo' }, [iconSvg('landscape')]),
        el('div', { className: 'brand-text' }, [
          el('h1', { textContent: 'TrailHaus' }),
          el('p', { textContent: 'Admin Hub' })
        ])
      ]),
      el('button', {
        className: 'btn btn-outline quick-rental',
        'data-action-id': 'ACT_QUICK_RENTAL',
        onClick: function () { state.set('currentView', VIEWS.BOOKINGS); }
      }, [iconSvg('bolt'), el('span', { textContent: 'Quick Rental' })]),
      el('div', { className: 'nav-scroll' }, [navListTop]),
      el('div', { className: 'nav-bottom' }, [navListBottom])
    ]);

    var main = el('main', {
      className: 'main-content',
      'data-testid': 'main-content'
    }, [
      el('h2', { className: 'content-header', textContent: viewTitles[state.get('currentView')] }),
      el('div', { className: 'content-body' })
    ]);

    var root = document.querySelector('[data-setfarm-root="baseline"]');
    if (root) {
      root.innerHTML = '';
      root.appendChild(sideNav);
      root.appendChild(topBar);
      root.appendChild(main);
    }
  }

  function bootstrap() {
    buildShell();

    state.subscribe(function (currentState, path) {
      if (
        path === 'currentView' ||
        path === '*' ||
        path === 'preferences' ||
        path.indexOf('items') === 0 ||
        path.indexOf('ui') === 0
      ) {
        renderView();
      }
      // Persist every meaningful state change.
      storage.save(currentState);
    });

    renderView();
  }

  function init() {
    var saved = storage.load();
    if (saved && saved.items && saved.items.length) {
      state.replace(saved);
      bootstrap();
    } else {
      fetch(seedUrl)
        .then(function (res) {
          if (!res.ok) {
            throw new Error('Failed to fetch seed data: ' + res.statusText);
          }
          return res.json();
        })
        .then(function (data) {
          state.replace(data);
          storage.save(state.getSnapshot());
          bootstrap();
        })
        .catch(function (err) {
          // eslint-disable-next-line no-console
          if (typeof console !== 'undefined' && console.error) {
            console.error('Failed to seed TrailHaus data:', err);
          }
          bootstrap();
        });
    }
  }

  global.TrailHausApp = {
    state: state,
    storage: storage,
    renderView: renderView,
    getMetrics: getMetrics,
    filteredItems: filteredItems
  };

  // Runtime bridge required by acceptance criteria: live state + actions.
  var actions = {
    setView: function (viewName) { state.set('currentView', viewName); },
    setSearchQuery: function (query) { state.set('ui.searchQuery', query); },
    setCategory: function (category) { state.set('ui.selectedCategory', category); },
    updatePreferences: function (prefs) {
      state.update('preferences', function (current) { return Object.assign({}, current, prefs); });
    },
    saveState: function () { return storage.save(state.getSnapshot()); },
    clearState: function () { storage.clear(); state.replace({}); }
  };
  window.app = { state: state, actions: actions };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : globalThis);
