/* dashboard-ui.js – Sprint 2, PBI-06 "Dashboard summary"
 *   Task 6.2  Dashboard on the screen (this file)
 *
 * Shows the numbers from dashboard.js inside <section id="dashboard">.
 * Call UniDashboardUI.render() whenever the tasks change (Task 6.3).
 */
(function (g) {
  'use strict';

  var TILES = [
    { key: 'total',      label: 'Total tasks',  css: 'tile-total' },
    { key: 'notStarted', label: 'Not Started',  css: 'tile-todo' },
    { key: 'inProgress', label: 'In Progress',  css: 'tile-doing' },
    { key: 'complete',   label: 'Complete',     css: 'tile-done' },
    { key: 'overdue',    label: 'Overdue',      css: 'tile-overdue' }
  ];

  function render(containerId) {
    var box = document.getElementById(containerId || 'dashboard');
    if (!box) return;

    var counts = g.UniDashboard.getCounts();
    box.innerHTML = '';

    var heading = document.createElement('h2');
    heading.textContent = 'Dashboard';
    box.appendChild(heading);

    var grid = document.createElement('div');
    grid.className = 'tiles';
    TILES.forEach(function (tile) {
      var item = document.createElement('div');
      item.className = 'tile ' + tile.css;

      var number = document.createElement('strong');
      number.textContent = counts[tile.key];

      var label = document.createElement('span');
      label.textContent = tile.label;

      item.appendChild(number);
      item.appendChild(label);
      grid.appendChild(item);
    });
    box.appendChild(grid);

    var text = document.createElement('p');
    text.className = 'progress-text';
    text.textContent = counts.total === 0
      ? 'No tasks yet.'
      : counts.complete + ' of ' + counts.total + ' tasks complete (' + counts.percentComplete + '%)';
    box.appendChild(text);
  }

  g.UniDashboardUI = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
