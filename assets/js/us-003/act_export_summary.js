/**
 * US-003 Action: ACT_EXPORT_SUMMARY
 * Exports the current insights summary as a downloadable JSON or CSV payload.
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

  function formatDate(date) {
    if (!date) return '';
    var d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  }

  function buildSummary() {
    var state = getState();
    if (!state) return null;

    var items = state.get('items') || [];
    var activities = (state.get('activities') || []).slice().sort(function (a, b) {
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    var total = items.length;
    var active = items.filter(function (i) { return i.status === 'Rented'; }).length;
    var available = items.filter(function (i) { return i.status === 'Available'; }).length;
    var maintenance = items.filter(function (i) { return i.status === 'Maintenance'; }).length;

    var categories = {};
    items.forEach(function (item) {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
    var topCategory = Object.keys(categories).sort(function (a, b) {
      return categories[b] - categories[a];
    })[0] || '—';

    var avgDailyPrice = total > 0
      ? items.reduce(function (sum, i) { return sum + (Number(i.dailyPrice) || 0); }, 0) / total
      : 0;

    return {
      generatedAt: new Date().toISOString(),
      metrics: {
        totalItems: total,
        activeRentals: active,
        availableItems: available,
        maintenanceItems: maintenance,
        topCategory: topCategory,
        averageDailyPrice: Math.round(avgDailyPrice * 100) / 100
      },
      stateDistribution: {
        rented: active,
        available: available,
        maintenance: maintenance
      },
      recentActivities: activities.slice(0, 10),
      items: items
    };
  }

  function toJson(summary) {
    return JSON.stringify(summary, null, 2);
  }

  function toCsv(summary) {
    var lines = [];
    lines.push(['TrailHaus Insights Summary', '', '', '', '', ''].join(','));
    lines.push(['Generated At', summary.generatedAt, '', '', '', ''].join(','));
    lines.push(['Metric', 'Value', '', '', '', ''].join(','));
    lines.push(['Total Items', summary.metrics.totalItems, '', '', '', ''].join(','));
    lines.push(['Active Rentals', summary.metrics.activeRentals, '', '', '', ''].join(','));
    lines.push(['Available Items', summary.metrics.availableItems, '', '', '', ''].join(','));
    lines.push(['Maintenance Items', summary.metrics.maintenanceItems, '', '', '', ''].join(','));
    lines.push(['Top Category', summary.metrics.topCategory, '', '', '', ''].join(','));
    lines.push(['Average Daily Price', summary.metrics.averageDailyPrice, '', '', '', ''].join(','));
    lines.push(['', '', '', '', '', ''].join(','));
    lines.push(['ID', 'Name', 'SKU', 'Category', 'Status', 'Daily Price', 'Stock'].join(','));

    summary.items.forEach(function (item) {
      lines.push([
        item.id,
        '"' + String(item.name || '').replace(/"/g, '""') + '"',
        item.sku,
        item.category,
        item.status,
        item.dailyPrice,
        item.stock
      ].join(','));
    });

    return lines.join('\n');
  }

  function exportSummary(format) {
    var summary = buildSummary();
    if (!summary) return '';
    if (format === 'csv') return toCsv(summary);
    return toJson(summary);
  }

  function downloadSummary(format) {
    format = format || 'json';
    var summary = buildSummary();
    if (!summary) return false;

    var content = format === 'csv' ? toCsv(summary) : toJson(summary);
    var mimeType = format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json';
    var extension = format === 'csv' ? 'csv' : 'json';
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'trailhaus-insights-summary.' + extension;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return true;
  }

  global.TrailHausActions = global.TrailHausActions || {};
  global.TrailHausActions.ACT_EXPORT_SUMMARY = {
    buildSummary: buildSummary,
    exportSummary: exportSummary,
    downloadSummary: downloadSummary
  };
})(typeof window !== 'undefined' ? window : globalThis);
