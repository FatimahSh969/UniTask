/* sort.js – Sprint 2, PBI-10 "Overdue tasks in a distinct color"
 *   Task 10.2  Show overdue tasks first in the list (this file)
 *
 * Needs: dates.js
 */
(function (g) {
  'use strict';

  function time(task) {
    return task.dueDate ? new Date(task.dueDate).getTime() : Infinity;
  }

  // Order of the list:
  //   1. overdue tasks (not complete, past the due date) - the most late first
  //   2. all other tasks - the nearest due date first
  //   3. tasks without a due date go last
  // The saved list is not changed; a new sorted list is returned.
  function overdueFirst(tasks, now) {
    return tasks.slice().sort(function (a, b) {
      var lateA = g.UniDates.isOverdue(a.dueDate, a.status, now);
      var lateB = g.UniDates.isOverdue(b.dueDate, b.status, now);
      if (lateA !== lateB) return lateA ? -1 : 1;

      var x = time(a), y = time(b);
      return x < y ? -1 : (x > y ? 1 : 0);
    });
  }

  g.UniTaskSort = { overdueFirst: overdueFirst };
})(typeof window !== 'undefined' ? window : globalThis);
