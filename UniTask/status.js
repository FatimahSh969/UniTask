
(function (g) {
  'use strict';

  var STATUSES = ['Not Started', 'In Progress', 'Complete'];
  var DEFAULT_STATUS = STATUSES[0];

  function isValidStatus(s) { return STATUSES.indexOf(s) !== -1; }

  function statusClass(status) {
    return 'status-' + String(status).toLowerCase().replace(/\s+/g, '-');
  }

  function createStatusSelect(current, id) {
    var select = document.createElement('select');
    if (id) select.id = id;
    select.setAttribute('aria-label', 'Task status');
    STATUSES.forEach(function (s) {
      var opt = document.createElement('option');
      opt.value = s;
      opt.textContent = s;
      select.appendChild(opt);
    });
    select.value = isValidStatus(current) ? current : DEFAULT_STATUS;
    return select;
  }

  function createStatusBadge(status) {
    var span = document.createElement('span');
    span.className = 'status-badge ' + statusClass(status);
    span.textContent = status;
    return span;
  }

  function setTaskStatus(taskId, newStatus) {
    if (!isValidStatus(newStatus)) {
      return { ok: false, error: 'Unknown status: ' + newStatus, task: null };
    }
    var task = g.UniTaskStore.updateTask(taskId, { status: newStatus });
    if (!task) return { ok: false, error: 'Could not save the status. Please try again.', task: null };
    return { ok: true, error: '', task: task };
  }

  function wireStatusSelect(select, taskId, onDone) {
    var previous = select.value;
    select.addEventListener('change', function () {
      var result = setTaskStatus(taskId, select.value);
      if (result.ok) previous = select.value; else select.value = previous;
      if (typeof onDone === 'function') onDone(result);
    });
    return select;
  }

  g.UniStatus = {
    STATUSES: STATUSES,
    DEFAULT_STATUS: DEFAULT_STATUS,
    isValidStatus: isValidStatus,
    statusClass: statusClass,
    createStatusSelect: createStatusSelect,
    createStatusBadge: createStatusBadge,
    setTaskStatus: setTaskStatus,
    wireStatusSelect: wireStatusSelect
  };
})(typeof window !== 'undefined' ? window : globalThis);
