/* countdown-ui.js – Sprint 2, PBI-07 "Countdown to deadlines"
 *   Task 7.2  Show the countdown on each task card (this file)
 *
 * Needs: countdown.js
 * The label keeps the due date in data-attributes, so refresh() can update the
 * text every minute without drawing the whole list again.
 */
(function (g) {
  'use strict';

  var timer = null;

  function apply(el) {
    var iso = el.getAttribute('data-due');
    var status = el.getAttribute('data-status');
    var text = g.UniCountdown.formatTimeLeft(iso, status);
    el.textContent = text;
    el.className = 'countdown countdown-' + g.UniCountdown.getUrgency(iso, status);
  }

  // A small line for the task card, e.g. "2 days 5 hours left". Returns null when there is nothing to show.
  function createLabel(task) {
    if (!g.UniCountdown.formatTimeLeft(task.dueDate, task.status)) return null;
    var el = document.createElement('div');
    el.setAttribute('data-due', task.dueDate || '');
    el.setAttribute('data-status', task.status || '');
    apply(el);
    return el;
  }

  // Updates every countdown label inside `root` (the whole page by default).
  function refresh(root) {
    var labels = (root || document).querySelectorAll('.countdown');
    for (var i = 0; i < labels.length; i++) apply(labels[i]);
  }

  // Keeps the countdowns up to date while the page stays open (every minute by default).
  function startAutoRefresh(root, everyMs) {
    stopAutoRefresh();
    timer = setInterval(function () { refresh(root); }, everyMs || 60000);
  }

  function stopAutoRefresh() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  g.UniCountdownUI = {
    createLabel: createLabel,
    refresh: refresh,
    startAutoRefresh: startAutoRefresh,
    stopAutoRefresh: stopAutoRefresh
  };
})(typeof window !== 'undefined' ? window : globalThis);
