/* delete-ui.js – Sprint 2, PBI-09 "Delete a task"
 *   Task 9.2  Messages and the empty-list screen after deleting (this file)
 *
 * Needs: store.js, delete.js (Task 9.1)
 */
(function (g) {
  'use strict';

  var emptiedByDelete = false;

  // The message to show after UniTaskDelete.confirmAndDelete() said yes.
  function messageAfterDelete(result) {
    if (!result.ok) return result.error || 'The task could not be deleted.';
    var left = g.UniTaskStore.getTasks().length;
    emptiedByDelete = left === 0;
    var text = '"' + result.task.title + '" was deleted.';
    return left === 0 ? text + ' Your task list is now empty.' : text;
  }

  // The text of the empty-list card. After deleting the last task it says so.
  function getEmptyText() {
    return emptiedByDelete
      ? 'All your tasks are deleted. Add a new task above to start again.'
      : 'No tasks yet. Add your first one above.';
  }

  g.UniDeleteUI = { messageAfterDelete: messageAfterDelete, getEmptyText: getEmptyText };
})(typeof window !== 'undefined' ? window : globalThis);
