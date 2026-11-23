/* suggestions-ui.js – Sprint 2, PBI-13 "Time-management suggestions based on priority"
 *   Task 13.2  Suggestions on the screen (this file)
 *
 * Draws the suggestions from suggestions.js inside <section id="suggestions">.
 * Call UniSuggestionsUI.render() whenever the tasks change (like the dashboard).
 * Needs: suggestions.js, store.js
 */
(function (g) {
  'use strict';

  function render(containerId) {
    var box = document.getElementById(containerId || 'suggestions');
    if (!box) return;

    var tasks = g.UniTaskStore.getTasks();
    var items = g.UniSuggestions.getSuggestions(tasks);
    var tip = g.UniSuggestions.getWorkloadTip(tasks);
    box.innerHTML = '';

    var heading = document.createElement('h2');
    heading.textContent = 'Smart time suggestions';
    box.appendChild(heading);

    if (tip) {
      var warn = document.createElement('p');
      warn.className = 'suggestion-warning';
      warn.setAttribute('role', 'status');
      warn.textContent = tip;
      box.appendChild(warn);
    }

    if (!items.length) {
      var empty = document.createElement('p');
      empty.className = 'suggestion-empty';
      empty.textContent = g.UniSuggestions.getEmptyText(tasks);
      box.appendChild(empty);
      return;
    }

    var list = document.createElement('ol');
    list.className = 'suggestion-list';
    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'suggestion suggestion-' + item.level;

      var badge = g.UniPriority.createPriorityBadge(item.priority);
      if (badge) li.appendChild(badge);

      var text = document.createElement('span');
      text.className = 'suggestion-text';
      text.textContent = item.message;
      li.appendChild(text);

      list.appendChild(li);
    });
    box.appendChild(list);
  }

  g.UniSuggestionsUI = { render: render };
})(typeof window !== 'undefined' ? window : globalThis);
