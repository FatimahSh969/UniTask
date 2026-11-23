/* delete.js – Sprint 2, PBI-09 "Delete a task"
 *   Task 9.1  Delete a task after asking the student to confirm (this file)
 *   Task 9.2  Messages and the empty-list screen after deleting
 *
 * Needs: store.js
 */
(function (g) {
  'use strict';

  // Removes one task. Returns { ok, error, task } (task = the removed task).
  function deleteTask(taskId) {
    var tasks = g.UniTaskStore.getTasks();
    var removed = null;
    var rest = tasks.filter(function (t) {
      if (t.id === taskId) { removed = t; return false; }
      return true;
    });
    if (!removed) return { ok: false, error: 'This task no longer exists.', task: null };
    if (!g.UniTaskStore.saveTasks(rest)) {
      return { ok: false, error: 'Could not delete the task. Please try again.', task: null };
    }
    return { ok: true, error: '', task: removed };
  }

  // Asks "Are you sure?" first. Nothing is deleted if the student says no.
  // `ask` is optional (the tests pass their own); the browser's confirm() is the default.
  // Returns { ok, cancelled, error, task }.
  function confirmAndDelete(taskId, ask) {
    var task = g.UniTaskStore.getTask(taskId);
    if (!task) return { ok: false, cancelled: false, error: 'This task no longer exists.', task: null };

    var question = 'Delete "' + task.title + '"? This cannot be undone.';
    var confirmed = typeof ask === 'function' ? ask(question) : g.confirm(question);
    if (!confirmed) return { ok: false, cancelled: true, error: '', task: null };

    var result = deleteTask(taskId);
    return { ok: result.ok, cancelled: false, error: result.error, task: result.task };
  }

  g.UniTaskDelete = {
    deleteTask: deleteTask,
    confirmAndDelete: confirmAndDelete
  };
})(typeof window !== 'undefined' ? window : globalThis);
