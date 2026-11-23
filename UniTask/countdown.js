/* countdown.js – Sprint 2, PBI-07 "Countdown to deadlines"
 *   Task 7.1  Countdown helper functions (this file)
 *   Task 7.2  Show the countdown on each task card (uses these functions)
 *
 * No screen code here: it only turns a due date into a number of days,
 * hours and minutes, and into a short text such as "2 days 5 hours left".
 */
(function (g) {
  'use strict';

  var MINUTE = 60 * 1000;
  var HOUR = 60 * MINUTE;
  var DAY = 24 * HOUR;

  function plural(n, word) {
    return n + ' ' + word + (n === 1 ? '' : 's');
  }

  // Time between now and the due date.
  // Returns null when there is no (valid) due date, otherwise:
  // { overdue, totalMs, days, hours, minutes }  (days/hours/minutes are always >= 0)
  function getTimeLeft(iso, now) {
    if (!iso) return null;
    var due = new Date(iso).getTime();
    if (isNaN(due)) return null;

    var current = (now || new Date()).getTime();
    var diff = due - current;

    var rest = Math.abs(diff);
    var days = Math.floor(rest / DAY);
    rest -= days * DAY;
    var hours = Math.floor(rest / HOUR);
    rest -= hours * HOUR;
    var minutes = Math.floor(rest / MINUTE);

    return { overdue: diff < 0, totalMs: diff, days: days, hours: hours, minutes: minutes };
  }

  // The two biggest units only: "2 days 5 hours", "5 hours 30 minutes", "45 minutes"
  function describe(t) {
    if (t.days > 0) {
      return t.hours > 0 ? plural(t.days, 'day') + ' ' + plural(t.hours, 'hour') : plural(t.days, 'day');
    }
    if (t.hours > 0) {
      return t.minutes > 0 ? plural(t.hours, 'hour') + ' ' + plural(t.minutes, 'minute') : plural(t.hours, 'hour');
    }
    return plural(t.minutes, 'minute');
  }

  // Text for a task card. Completed tasks show "Completed"; no due date shows ''.
  function formatTimeLeft(iso, status, now) {
    if (status === 'Complete') return 'Completed';

    var t = getTimeLeft(iso, now);
    if (!t) return '';

    var lessThanMinute = t.days === 0 && t.hours === 0 && t.minutes === 0;
    if (t.overdue) {
      return lessThanMinute ? 'Overdue by less than a minute' : 'Overdue by ' + describe(t);
    }
    return lessThanMinute ? 'Due in less than a minute' : describe(t) + ' left';
  }

  // 'completed' | 'overdue' | 'soon' (less than 24 hours left) | 'later' | 'none'
  function getUrgency(iso, status, now) {
    if (status === 'Complete') return 'completed';
    var t = getTimeLeft(iso, now);
    if (!t) return 'none';
    if (t.overdue) return 'overdue';
    return t.totalMs < DAY ? 'soon' : 'later';
  }

  g.UniCountdown = {
    getTimeLeft: getTimeLeft,
    formatTimeLeft: formatTimeLeft,
    getUrgency: getUrgency
  };
})(typeof window !== 'undefined' ? window : globalThis);
