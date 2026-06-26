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

  function buildSummary() {
    var state = getState();
    if (!state) return null;

    var items = state.get('items') || [];
    var activities = (state.get('activities') || []).slice().sort(function (a, b) {
      var tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      var tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
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
    // Escape a single CSV cell per RFC 4180: quote values that contain
    // commas, double quotes, or line breaks, and escape quotes by doubling.
    function escapeCell(val) {
      var str = val === null || val === undefined ? '' : String(val);
      if (str.indexOf(',') !== -1 || str.indexOf('"') !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }

    // Apply escaping to every cell in a row so headers, metrics, and item
    // fields (including topCategory, category, sku, etc.) are CSV-safe.
    function row(cells) {
      return cells.map(escapeCell).join(',');
    }

    var lines = [];
    lines.push(row(['TrailHaus Insights Summary', '', '', '', '', '']));
    lines.push(row(['Generated At', summary.generatedAt, '', '', '', '']));
    lines.push(row(['Metric', 'Value', '', '', '', '']));
    lines.push(row(['Total Items', summary.metrics.totalItems, '', '', '', '']));
    lines.push(row(['Active Rentals', summary.metrics.activeRentals, '', '', '', '']));
    lines.push(row(['Available Items', summary.metrics.availableItems, '', '', '', '']));
    lines.push(row(['Maintenance Items', summary.metrics.maintenanceItems, '', '', '', '']));
    lines.push(row(['Top Category', summary.metrics.topCategory, '', '', '', '']));
    lines.push(row(['Average Daily Price', summary.metrics.averageDailyPrice, '', '', '', '']));
    lines.push(row(['', '', '', '', '', '']));
    lines.push(row(['ID', 'Name', 'SKU', 'Category', 'Status', 'Daily Price', 'Stock']));

    summary.items.forEach(function (item) {
      lines.push(row([
        item.id,
        item.name,
        item.sku,
        item.category,
        item.status,
        item.dailyPrice,
        item.stock
      ]));
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
