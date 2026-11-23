/* dashboard.js – Sprint 2, PBI-06 "Dashboard summary"
 *   Task 6.1  Count the tasks for the dashboard (this file)
 *   Task 6.2  Dashboard on the screen (dashboard-ui.js uses this)
 *
 * Needs: store.js, dates.js
 */
(function (g) {
  'use strict';

  // Counts the tasks. With no argument it reads the saved tasks.
  // Returns { total, notStarted, inProgress, complete, overdue, percentComplete }.
  // A task is "overdue" when it is past its due date and not complete,
  // so a task is counted once in its status AND (if late) once in overdue.
  function getCounts(tasks, now) {
    tasks = tasks || g.UniTaskStore.getTasks();

    var counts = { total: tasks.length, notStarted: 0, inProgress: 0, complete: 0, overdue: 0, percentComplete: 0 };

    tasks.forEach(function (t) {
      if (t.status === 'Complete') counts.complete++;
      else if (t.status === 'In Progress') counts.inProgress++;
      else counts.notStarted++;

      if (g.UniDates.isOverdue(t.dueDate, t.status, now)) counts.overdue++;
    });

    counts.percentComplete = counts.total === 0 ? 0 : Math.round((counts.complete / counts.total) * 100);
    return counts;
  }

  g.UniDashboard = { getCounts: getCounts };
})(typeof window !== 'undefined' ? window : globalThis);
