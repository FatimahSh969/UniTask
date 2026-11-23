
(function (g) {
  'use strict';

  var MAX_TITLE = 80;
  var MAX_DESCRIPTION = 500;

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function validateTitle(title) {
    var t = String(title == null ? '' : title).trim();
    if (!t) return { valid: false, error: 'Please enter a task title.', value: '' };
    if (t.length > MAX_TITLE) {
      return { valid: false, error: 'The title is too long (maximum ' + MAX_TITLE + ' characters).', value: t };
    }
    return { valid: true, error: '', value: t };
  }

  function validateDescription(description) {
    var d = String(description == null ? '' : description).trim();
    if (d.length > MAX_DESCRIPTION) {
      return { valid: false, error: 'The description is too long (maximum ' + MAX_DESCRIPTION + ' characters).', value: d };
    }
    return { valid: true, error: '', value: d };
  }

  function addTask(input) {
    input = input || {};

    var t = validateTitle(input.title);
    if (!t.valid) return { ok: false, error: t.error, field: 'title', task: null };

    var d = validateDescription(input.description);
    if (!d.valid) return { ok: false, error: d.error, field: 'description', task: null };

    var dueIso = '';

    if (!g.UniDates) {
      return {
        ok: false,
        error: 'Date validation is unavailable.',
        field: 'dueDate',
        task: null
      };
    }

    var check = g.UniDates.validateDueDate(input.dueDate);

    if (!check.valid) {
      return {
        ok: false,
        error: check.error,
        field: 'dueDate',
        task: null
      };
    }

    dueIso = check.iso;

    var course = '';
    if (g.UniCourse) {
      var c = g.UniCourse.validateCourse(input.course);
      if (!c.valid) return { ok: false, error: c.error, field: 'course', task: null };
      course = c.value;
    }

    var priority = '';
    if (g.UniPriority) {
      var p = g.UniPriority.validatePriority(input.priority);
      if (!p.valid) return { ok: false, error: p.error, field: 'priority', task: null };
      priority = p.value;
    }

    var status = (g.UniStatus && g.UniStatus.isValidStatus(input.status))
      ? input.status
      : (g.UniStatus ? g.UniStatus.DEFAULT_STATUS : 'Not Started');

    var task = {
      id: newId(),
      title: t.value,
      description: d.value,
      course: course,
      priority: priority,
      status: status,
      dueDate: dueIso,
      createdAt: new Date().toISOString()
    };

    var tasks = g.UniTaskStore.getTasks();
    tasks.push(task);
    if (!g.UniTaskStore.saveTasks(tasks)) {
      return { ok: false, error: 'Could not save the task. Please try again.', field: '', task: null };
    }
    return { ok: true, error: '', field: '', task: task };
  }

  g.UniTaskAdd = {
    MAX_TITLE: MAX_TITLE,
    MAX_DESCRIPTION: MAX_DESCRIPTION,
    validateTitle: validateTitle,
    validateDescription: validateDescription,
    addTask: addTask
  };
})(typeof window !== 'undefined' ? window : globalThis);