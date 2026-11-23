
(function (g) {
  'use strict';

  var MAX_YEARS = 5;        
  var GRACE_MS = 60 * 1000;   

  function pad(n) { return String(n).padStart(2, '0'); }

  function toInputValue(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
  }


  function initDueDatePicker(input, options) {
    options = options || {};
    input.type = 'datetime-local';
    input.required = options.required !== false;
    input.min = options.allowPast ? '' : toInputValue(new Date());
    if (options.defaultToEndOfDay) {
      var d = new Date();
      d.setHours(23, 59, 0, 0);
      input.value = toInputValue(d);
    }
    return input;
  }


  function validateDueDate(value, options) {
    options = options || {};
    var now = options.now || new Date();

    if (!value) return { valid: false, error: 'Please choose a due date and time.' };

    var d = new Date(value);
    if (isNaN(d.getTime())) return { valid: false, error: 'The date or time is not valid.' };

    if (!options.allowPast && d.getTime() < now.getTime() - GRACE_MS) {
      return { valid: false, error: 'The due date cannot be in the past.' };
    }

    var max = new Date(now.getTime());
    max.setFullYear(max.getFullYear() + MAX_YEARS);
    if (d.getTime() > max.getTime()) {
      return { valid: false, error: 'The due date is too far away (maximum ' + MAX_YEARS + ' years).' };
    }
    return { valid: true, error: '', iso: d.toISOString() };
  }


  function saveDueDate(taskId, value, options) {
    var check = validateDueDate(value, options);
    if (!check.valid) return { ok: false, error: check.error, task: null };
    var task = g.UniTaskStore.updateTask(taskId, { dueDate: check.iso });
    if (!task) return { ok: false, error: 'Could not save the task. Please try again.', task: null };
    return { ok: true, error: '', task: task };
  }

  function formatDueDate(iso) {
    if (!iso) return 'No due date';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return 'No due date';
    return d.toLocaleString('en-GB', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function isoToInputValue(iso) {
    var d = new Date(iso);
    return isNaN(d.getTime()) ? '' : toInputValue(d);
  }

  function isOverdue(iso, status, now) {
    if (!iso || status === 'Complete') return false;
    return new Date(iso).getTime() < (now || new Date()).getTime();
  }

  g.UniDates = {
    initDueDatePicker: initDueDatePicker,
    validateDueDate: validateDueDate,
    saveDueDate: saveDueDate,
    formatDueDate: formatDueDate,
    isoToInputValue: isoToInputValue,
    isOverdue: isOverdue
  };
})(typeof window !== 'undefined' ? window : globalThis);
