/* edit.js – Sprint 2, PBI-08 "Edit the details of an existing task"
 *   Task 8.1  Edit logic: validate the new values and save them (this file)
 *   Task 8.2  Edit form on the screen (uses these functions)
 *
 * Needs: store.js, dates.js, status.js, course.js, priority.js, tasks.js
 */
(function (g) {
  'use strict';

  // The values to put in the edit form for a task (the date is in the picker format).
  // Returns null when the task does not exist.
  function getEditableValues(taskId) {
    var task = g.UniTaskStore.getTask(taskId);
    if (!task) return null;
    return {
      title: task.title || '',
      description: task.description || '',
      dueDate: g.UniDates.isoToInputValue(task.dueDate),
      course: task.course || '',
      priority: task.priority || g.UniPriority.DEFAULT_PRIORITY,
      status: task.status
    };
  }

  // Saves new values on an existing task.
  // `input` has the same fields as the add form; a field that is left out keeps its old value.
  // Returns { ok, error, field, task }.
  function updateTask(taskId, input) {
    input = input || {};

    var old = g.UniTaskStore.getTask(taskId);
    if (!old) return { ok: false, error: 'This task no longer exists.', field: '', task: null };

    var t = g.UniTaskAdd.validateTitle(input.title === undefined ? old.title : input.title);
    if (!t.valid) return { ok: false, error: t.error, field: 'title', task: null };

    var d = g.UniTaskAdd.validateDescription(input.description === undefined ? old.description : input.description);
    if (!d.valid) return { ok: false, error: d.error, field: 'description', task: null };

    // Due date: if the student did not change it, keep it (even when it is already in the past).
    // A changed date must pass the same checks as a new task.
    var dueIso = old.dueDate;
    if (input.dueDate !== undefined && input.dueDate !== g.UniDates.isoToInputValue(old.dueDate)) {
      var check = g.UniDates.validateDueDate(input.dueDate);
      if (!check.valid) return { ok: false, error: check.error, field: 'dueDate', task: null };
      dueIso = check.iso;
    }

    var c = g.UniCourse.validateCourse(input.course === undefined ? old.course : input.course);
    if (!c.valid) return { ok: false, error: c.error, field: 'course', task: null };

    var p = g.UniPriority.validatePriority(input.priority === undefined ? old.priority : input.priority);
    if (!p.valid) return { ok: false, error: p.error, field: 'priority', task: null };

    var status = input.status === undefined ? old.status : input.status;
    if (!g.UniStatus.isValidStatus(status)) {
      return { ok: false, error: 'Please choose a valid status.', field: 'status', task: null };
    }

    var saved = g.UniTaskStore.updateTask(taskId, {
      title: t.value,
      description: d.value,
      dueDate: dueIso,
      course: c.value,
      priority: p.value,
      status: status,
      updatedAt: new Date().toISOString()
    });
    if (!saved) return { ok: false, error: 'Could not save the changes. Please try again.', field: '', task: null };

    return { ok: true, error: '', field: '', task: saved };
  }

  g.UniTaskEdit = {
    getEditableValues: getEditableValues,
    updateTask: updateTask
  };
})(typeof window !== 'undefined' ? window : globalThis);
