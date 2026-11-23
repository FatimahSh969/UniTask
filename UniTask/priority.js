
(function (g) {
  'use strict';

  var PRIORITIES = ['Low', 'Medium', 'High'];
  var DEFAULT_PRIORITY = 'Medium';

  function isValidPriority(p) { return PRIORITIES.indexOf(p) !== -1; }

  function priorityClass(priority) {
    return 'priority-' + String(priority).toLowerCase();
  }

  function validatePriority(priority) {
    var p = String(priority == null ? '' : priority).trim();
    if (!p) return { valid: true, error: '', value: DEFAULT_PRIORITY };   // empty -> default
    if (!isValidPriority(p)) return { valid: false, error: 'Please choose Low, Medium or High.', value: p };
    return { valid: true, error: '', value: p };
  }

  function createPrioritySelect(current, id) {
    var select = document.createElement('select');
    if (id) select.id = id;
    select.setAttribute('aria-label', 'Task priority');
    PRIORITIES.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p;
      opt.textContent = p;
      select.appendChild(opt);
    });
    select.value = isValidPriority(current) ? current : DEFAULT_PRIORITY;
    return select;
  }

  function setTaskPriority(taskId, newPriority) {
    var check = validatePriority(newPriority);
    if (!check.valid) return { ok: false, error: check.error, task: null };
    var task = g.UniTaskStore.updateTask(taskId, { priority: check.value });
    if (!task) return { ok: false, error: 'Could not save the priority. Please try again.', task: null };
    return { ok: true, error: '', task: task };
  }

  function createPriorityBadge(priority) {
    if (!isValidPriority(priority))
      return null;
    var span = document.createElement('span');
    span.className = 'priority-badge ' + priorityClass(priority);
    span.textContent = priority + ' priority';
    return span;
  }

  g.UniPriority = {
    PRIORITIES: PRIORITIES,
    DEFAULT_PRIORITY: DEFAULT_PRIORITY,
    isValidPriority: isValidPriority,
    priorityClass: priorityClass,
    validatePriority: validatePriority,
    createPrioritySelect: createPrioritySelect,
    setTaskPriority: setTaskPriority,
    createPriorityBadge: createPriorityBadge
  };
})(typeof window !== 'undefined' ? window : globalThis);
