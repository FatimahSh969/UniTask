/* suggestions.js – Sprint 2, PBI-13 "Time-management suggestions based on priority"
 *   Task 13.1  Suggestion logic (this file)
 *   Task 13.2  Suggestions on the screen (suggestions-ui.js)
 *
 * No screen code here. It looks at the tasks that are not complete and says
 * which ones to work on first, how long to study, and when to start.
 * Needs: dates.js (isOverdue), countdown.js (getTimeLeft)
 *
 * How a task is ranked:  score = priority weight x urgency weight
 *   priority weight: High 3, Medium 2, Low 1
 *   urgency weight : overdue 8, under 24 h 5, under 3 days 4, under 7 days 2, later 1, no date 0.5
 *   same score -> higher priority first -> nearer due date first
 * Study time per session: High 90 min, Medium 60 min, Low 30 min.
 * Start-by rule: High 3 days before the deadline, Medium 2 days, Low 1 day.
 */
(function (g) {
  'use strict';

  var HOUR = 60 * 60 * 1000;
  var DAY = 24 * HOUR;

  var PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };
  var MINUTES = { High: 90, Medium: 60, Low: 30 };
  var LEAD_DAYS = { High: 3, Medium: 2, Low: 1 };
  var DEFAULT_LIMIT = 3;

  function weightOf(priority) { return PRIORITY_WEIGHT[priority] || PRIORITY_WEIGHT.Medium; }

  // Minutes of study suggested for one session of a task with this priority.
  function minutesFor(priority) { return MINUTES[priority] || MINUTES.Medium; }

  function urgencyWeight(task, now) {
    var t = g.UniCountdown.getTimeLeft(task.dueDate, now);
    if (!t) return 0.5;
    if (t.overdue) return 8;
    if (t.totalMs < DAY) return 5;
    if (t.totalMs < 3 * DAY) return 4;
    if (t.totalMs < 7 * DAY) return 2;
    return 1;
  }

  // Tasks that still need work (not complete).
  function pending(tasks) {
    return (tasks || []).filter(function (t) { return t && t.status !== 'Complete'; });
  }

  // The number used to rank a task (bigger = do it sooner).
  function scoreTask(task, now) {
    return weightOf(task.priority) * urgencyWeight(task, now);
  }

  // The day to start working: the due date minus the lead time of its priority.
  // Returns a Date, or null when the task has no (valid) due date.
  function startBy(task) {
    if (!task.dueDate) return null;
    var due = new Date(task.dueDate).getTime();
    if (isNaN(due)) return null;
    return new Date(due - (LEAD_DAYS[task.priority] || LEAD_DAYS.Medium) * DAY);
  }

  function dayText(date) {
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  // 'urgent' (overdue) | 'now' (start today) | 'plan' (start on a later day) | 'free' (no due date)
  function levelOf(task, now) {
    if (g.UniDates.isOverdue(task.dueDate, task.status, now)) return 'urgent';
    var start = startBy(task);
    if (!start) return 'free';
    return start.getTime() <= now.getTime() ? 'now' : 'plan';
  }

  function messageFor(task, level, minutes, now) {
    var name = '"' + task.title + '"';
    if (level === 'urgent') return name + ' is overdue. Do it first today: set aside ' + minutes + ' minutes.';
    if (level === 'now') return 'Start ' + name + ' today: plan a ' + minutes + '-minute focus session.';
    if (level === 'plan') return 'Plan ' + name + ' for ' + dayText(startBy(task)) + ': a ' + minutes + '-minute focus session.';
    return name + ' has no due date. Add one, or fit a ' + minutes + '-minute session in when you are free.';
  }

  // The ranked suggestions. Each item:
  // { taskId, title, priority, level, minutes, score, message }
  // `limit` = how many to return (3 by default); the saved tasks are not changed.
  function getSuggestions(tasks, now, limit) {
    var current = now || new Date();
    var max = limit == null ? DEFAULT_LIMIT : limit;

    var ranked = pending(tasks).map(function (task) {
      var level = levelOf(task, current);
      var minutes = minutesFor(task.priority);
      return {
        taskId: task.id,
        title: task.title,
        priority: PRIORITY_WEIGHT[task.priority] ? task.priority : 'Medium',
        level: level,
        minutes: minutes,
        score: scoreTask(task, current),
        message: messageFor(task, level, minutes, current),
        _due: task.dueDate ? new Date(task.dueDate).getTime() : Infinity
      };
    });

    ranked.sort(function (a, b) {
      if (a.score !== b.score) return b.score - a.score;
      if (weightOf(a.priority) !== weightOf(b.priority)) return weightOf(b.priority) - weightOf(a.priority);
      return a._due < b._due ? -1 : (a._due > b._due ? 1 : 0);
    });

    return ranked.slice(0, Math.max(0, max)).map(function (item) {
      delete item._due;
      return item;
    });
  }

  // A warning when several high-priority tasks are due within 3 days (or are overdue).
  // Returns null when the workload is fine.
  function getWorkloadTip(tasks, now) {
    var current = now || new Date();
    var heavy = pending(tasks).filter(function (task) {
      if (task.priority !== 'High') return false;
      var t = g.UniCountdown.getTimeLeft(task.dueDate, current);
      return !!t && t.totalMs < 3 * DAY;
    });
    if (heavy.length < 2) return null;
    return 'Heavy days ahead: ' + heavy.length + ' high-priority tasks are due within 3 days. ' +
           'Split your study time and start with the earliest deadline.';
  }

  // What to show when there is nothing to suggest.
  function getEmptyText(tasks) {
    return (tasks || []).length === 0
      ? 'Add a task and UniTask will suggest how to organize your time.'
      : 'You are all caught up. Every task is complete!';
  }

  g.UniSuggestions = {
    PRIORITY_WEIGHT: PRIORITY_WEIGHT,
    DEFAULT_LIMIT: DEFAULT_LIMIT,
    minutesFor: minutesFor,
    scoreTask: scoreTask,
    startBy: startBy,
    getSuggestions: getSuggestions,
    getWorkloadTip: getWorkloadTip,
    getEmptyText: getEmptyText
  };
})(typeof window !== 'undefined' ? window : globalThis);
