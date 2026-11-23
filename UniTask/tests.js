/* tests.js – checks for the Sprint 2 logic (Tasks 7.1, 8.1, 9.1, 6.1, 10.2, 9.2, 7.2, 13.1 and 13.2).
 * Open tests.html in the browser to run them (or: node tests.js). */
(function (g) {
  'use strict';
  var results = [];
  function check(name, condition) { results.push({ name: name, pass: !!condition }); }

  // ---------- Task 7.1: countdown ----------
  var C = g.UniCountdown;
  var now = new Date('2026-11-20T10:00:00Z');
  function at(ms) { return new Date(now.getTime() + ms).toISOString(); }
  var MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;

  check('countdown: 2 days 5 hours', C.formatTimeLeft(at(2 * DAY + 5 * HOUR + 30 * MIN), 'Not Started', now) === '2 days 5 hours left');
  check('countdown: 1 day 1 hour (singular)', C.formatTimeLeft(at(DAY + HOUR), 'In Progress', now) === '1 day 1 hour left');
  check('countdown: exactly 3 days', C.formatTimeLeft(at(3 * DAY), 'Not Started', now) === '3 days left');
  check('countdown: 5 hours 30 minutes', C.formatTimeLeft(at(5 * HOUR + 30 * MIN), 'Not Started', now) === '5 hours 30 minutes left');
  check('countdown: 45 minutes', C.formatTimeLeft(at(45 * MIN), 'Not Started', now) === '45 minutes left');
  check('countdown: less than a minute', C.formatTimeLeft(at(30 * 1000), 'Not Started', now) === 'Due in less than a minute');
  check('countdown: overdue by 2 hours 10 minutes', C.formatTimeLeft(at(-(2 * HOUR + 10 * MIN)), 'Not Started', now) === 'Overdue by 2 hours 10 minutes');
  check('countdown: overdue by 3 days 4 hours', C.formatTimeLeft(at(-(3 * DAY + 4 * HOUR)), 'In Progress', now) === 'Overdue by 3 days 4 hours');
  check('countdown: completed task', C.formatTimeLeft(at(-DAY), 'Complete', now) === 'Completed');
  check('countdown: no due date', C.formatTimeLeft('', 'Not Started', now) === '');
  check('countdown: invalid date', C.formatTimeLeft('not a date', 'Not Started', now) === '');
  check('countdown: getTimeLeft numbers', (function () { var t = C.getTimeLeft(at(2 * DAY + 5 * HOUR + 30 * MIN), now); return t && !t.overdue && t.days === 2 && t.hours === 5 && t.minutes === 30; })());
  check('urgency: later / soon / overdue / completed / none',
    C.getUrgency(at(2 * DAY), 'Not Started', now) === 'later' &&
    C.getUrgency(at(3 * HOUR), 'Not Started', now) === 'soon' &&
    C.getUrgency(at(-HOUR), 'Not Started', now) === 'overdue' &&
    C.getUrgency(at(-HOUR), 'Complete', now) === 'completed' &&
    C.getUrgency('', 'Not Started', now) === 'none');

  // ---------- Task 8.1: edit logic ----------
  var S = g.UniTaskStore, E = g.UniTaskEdit;
  var backup = S.getTasks();                       // the tests restore the real tasks at the end
  function local(ms) {                              // date in the picker format, `ms` from now
    var d = new Date(Date.now() + ms); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  S.saveTasks([]);
  var added = g.UniTaskAdd.addTask({ title: 'Report', description: 'Chapter 1', dueDate: local(3 * DAY), course: 'SW332', priority: 'Low', status: 'Not Started' });
  var id = added.task.id;

  var ok = E.updateTask(id, { title: 'Final report', description: 'Chapters 1-3', dueDate: local(5 * DAY), course: 'CS220', priority: 'High', status: 'In Progress' });
  var saved = S.getTask(id);
  check('edit: all fields saved', ok.ok && saved.title === 'Final report' && saved.description === 'Chapters 1-3' && saved.course === 'CS220' && saved.priority === 'High' && saved.status === 'In Progress');
  check('edit: id and createdAt unchanged, updatedAt added', saved.id === id && saved.createdAt === added.task.createdAt && !!saved.updatedAt);
  check('edit: still one task in the list', S.getTasks().length === 1);

  var partial = E.updateTask(id, { title: 'Report v2' });
  check('edit: fields left out keep their old value', partial.ok && S.getTask(id).course === 'CS220' && S.getTask(id).priority === 'High');

  var before = JSON.stringify(S.getTask(id));
  var bad = E.updateTask(id, { title: '   ' });
  check('edit: empty title rejected', !bad.ok && bad.field === 'title');
  check('edit: long title rejected', !E.updateTask(id, { title: new Array(82).join('a') }).ok);
  check('edit: long description rejected', !E.updateTask(id, { description: new Array(502).join('a') }).ok);
  var past = E.updateTask(id, { dueDate: '2020-01-01T10:00' });
  check('edit: new date in the past rejected', !past.ok && past.field === 'dueDate');
  check('edit: unknown course rejected', E.updateTask(id, { course: 'XYZ999' }).field === 'course');
  check('edit: unknown priority rejected', E.updateTask(id, { priority: 'Urgent' }).field === 'priority');
  check('edit: unknown status rejected', E.updateTask(id, { status: 'Done' }).field === 'status');
  check('edit: rejected edits change nothing', JSON.stringify(S.getTask(id)) === before);
  check('edit: unknown task id', !E.updateTask('missing-id', { title: 'x' }).ok);

  // an overdue task can still be edited if its date is left as it is
  S.saveTasks([{ id: 'late', title: 'Late lab', description: '', course: '', priority: 'Low', status: 'Not Started', dueDate: '2026-10-20T10:00:00.000Z' }]);
  var keep = E.getEditableValues('late');
  var lateOk = E.updateTask('late', { title: 'Late lab (fixed)', dueDate: keep.dueDate });
  check('edit: overdue task keeps its date when only the title changes', lateOk.ok && S.getTask('late').dueDate === '2026-10-20T10:00:00.000Z' && S.getTask('late').title === 'Late lab (fixed)');
  check('edit: getEditableValues gives the picker format', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(keep.dueDate) && keep.title === 'Late lab');
  check('edit: getEditableValues for a missing task is null', E.getEditableValues('nope') === null);

  // ---------- Task 9.1: delete with confirmation ----------
  var D = g.UniTaskDelete;
  S.saveTasks([
    { id: 'a1', title: 'Keep me', status: 'Not Started' },
    { id: 'b2', title: 'Delete me', status: 'Not Started' }
  ]);
  var said = D.confirmAndDelete('b2', function () { return false; });
  check('delete: "no" cancels and keeps the task', said.cancelled && !said.ok && S.getTasks().length === 2);
  var asked = '';
  var done = D.confirmAndDelete('b2', function (q) { asked = q; return true; });
  check('delete: the question names the task', asked.indexOf('Delete me') !== -1);
  check('delete: "yes" removes only that task', done.ok && S.getTasks().length === 1 && S.getTasks()[0].id === 'a1');
  check('delete: unknown task id', !D.deleteTask('missing').ok && !D.confirmAndDelete('missing', function () { return true; }).ok);
  check('delete: list is empty after the last task', D.deleteTask('a1').ok && S.getTasks().length === 0);

  // ---------- Task 6.1: dashboard counts ----------
  var K = g.UniDashboard;
  var later = '2099-01-01T10:00:00.000Z', earlier = '2020-01-01T10:00:00.000Z';
  var sample = [
    { status: 'Not Started', dueDate: later },
    { status: 'Not Started', dueDate: earlier },    // overdue
    { status: 'In Progress', dueDate: earlier },    // overdue
    { status: 'In Progress', dueDate: later },
    { status: 'Complete',    dueDate: earlier },    // complete tasks are never overdue
    { status: 'Complete',    dueDate: later }
  ];
  var n = K.getCounts(sample);
  check('dashboard: counts by status', n.total === 6 && n.notStarted === 2 && n.inProgress === 2 && n.complete === 2);
  check('dashboard: overdue = late and not complete', n.overdue === 2);
  check('dashboard: percent complete', n.percentComplete === 33);
  var z = K.getCounts([]);
  check('dashboard: empty list gives zeros', z.total === 0 && z.complete === 0 && z.overdue === 0 && z.percentComplete === 0);
  check('dashboard: task without due date is not overdue', K.getCounts([{ status: 'Not Started' }]).overdue === 0);
  S.saveTasks([{ id: 'x', title: 'x', status: 'Complete', dueDate: later }, { id: 'y', title: 'y', status: 'Not Started', dueDate: later }]);
  check('dashboard: reads the saved tasks when no list is given', K.getCounts().total === 2 && K.getCounts().percentComplete === 50);

  // ---------- Task 10.2: overdue tasks first ----------
  var order = g.UniTaskSort.overdueFirst([
    { id: 'later',   status: 'Not Started', dueDate: '2099-03-01T10:00:00.000Z' },
    { id: 'none',    status: 'Not Started' },
    { id: 'soon',    status: 'In Progress', dueDate: '2099-01-01T10:00:00.000Z' },
    { id: 'late-new',status: 'Not Started', dueDate: '2026-01-02T10:00:00.000Z' },
    { id: 'done-old',status: 'Complete',    dueDate: '2020-01-01T10:00:00.000Z' },
    { id: 'late-old',status: 'In Progress', dueDate: '2025-01-01T10:00:00.000Z' }
  ], new Date('2026-11-20T10:00:00Z')).map(function (t) { return t.id; });
  check('sort: overdue first, the most late at the top', order[0] === 'late-old' && order[1] === 'late-new');
  check('sort: then by nearest due date (a completed old task is not overdue)', order.slice(2).join() === 'done-old,soon,later,none');
  var original = [{ id: 'b', status: 'Not Started', dueDate: '2099-02-01T10:00:00.000Z' }, { id: 'a', status: 'Not Started', dueDate: '2099-01-01T10:00:00.000Z' }];
  g.UniTaskSort.overdueFirst(original);
  check('sort: the saved list is not changed', original[0].id === 'b');

  // ---------- Task 9.2: messages after deleting ----------
  var U = g.UniDeleteUI;
  S.saveTasks([{ id: 'p', title: 'Lab 2', status: 'Not Started' }, { id: 'q', title: 'Quiz', status: 'Not Started' }]);
  var firstDelete = D.deleteTask('p');
  var msg1 = U.messageAfterDelete(firstDelete);
  check('delete message: names the task', msg1 === '"Lab 2" was deleted.');
  check('delete message: normal empty text while tasks remain', U.getEmptyText() === 'No tasks yet. Add your first one above.');
  var msg2 = U.messageAfterDelete(D.deleteTask('q'));
  check('delete message: says the list is empty after the last task', /now empty/.test(msg2));
  check('delete message: empty-list text changes after deleting everything', /All your tasks are deleted/.test(U.getEmptyText()));
  check('delete message: error is passed on', U.messageAfterDelete({ ok: false, error: 'Failed.' }) === 'Failed.');

  // ---------- Task 7.2: countdown label (needs a page, so only in the browser) ----------
  if (typeof document !== 'undefined') {
    var CU = g.UniCountdownUI;
    var future = new Date(Date.now() + 2 * DAY + 5 * HOUR + 30 * MIN).toISOString();
    var label = CU.createLabel({ dueDate: future, status: 'Not Started' });
    check('countdown label: shows days and hours', label && /^2 days 5 hours left$/.test(label.textContent));
    check('countdown label: style follows the urgency', label.className === 'countdown countdown-later');
    var lateLabel = CU.createLabel({ dueDate: new Date(Date.now() - 3 * HOUR - 5 * MIN).toISOString(), status: 'Not Started' });
    check('countdown label: overdue text and style', /^Overdue by 3 hours/.test(lateLabel.textContent) && /countdown-overdue/.test(lateLabel.className));
    check('countdown label: completed task', CU.createLabel({ dueDate: future, status: 'Complete' }).textContent === 'Completed');
    check('countdown label: no due date gives no label', CU.createLabel({ dueDate: '', status: 'Not Started' }) === null);
    var holder = document.createElement('div'); holder.appendChild(label);
    label.setAttribute('data-status', 'Complete'); CU.refresh(holder);
    check('countdown label: refresh updates the text', label.textContent === 'Completed' && /completed/.test(label.className));
  }

  // ---------- Task 13.1: time-management suggestions ----------
  var SG = g.UniSuggestions;
  var sNow = new Date('2026-11-20T10:00:00Z');
  function due(ms) { return new Date(sNow.getTime() + ms).toISOString(); }
  function mk(id, title, priority, ms, status) { return { id: id, title: title, priority: priority, status: status || 'Not Started', dueDate: ms == null ? '' : due(ms) }; }

  check('suggestions: study minutes follow the priority', SG.minutesFor('High') === 90 && SG.minutesFor('Medium') === 60 && SG.minutesFor('Low') === 30 && SG.minutesFor('x') === 60);
  check('suggestions: score = priority weight x urgency', SG.scoreTask(mk('a', 'A', 'High', -HOUR), sNow) === 24 && SG.scoreTask(mk('b', 'B', 'Low', 10 * DAY), sNow) === 1);
  check('suggestions: start-by is earlier for a higher priority',
    SG.startBy(mk('a', 'A', 'High', 10 * DAY)).getTime() === sNow.getTime() + 7 * DAY &&
    SG.startBy(mk('b', 'B', 'Low', 10 * DAY)).getTime() === sNow.getTime() + 9 * DAY &&
    SG.startBy(mk('c', 'C', 'Low', null)) === null);

  var ranked = SG.getSuggestions([
    mk('low', 'Low later', 'Low', 10 * DAY),
    mk('high', 'High soon', 'High', 2 * DAY),
    mk('late', 'Late lab', 'Medium', -2 * HOUR),
    mk('done', 'Finished', 'High', -DAY, 'Complete')
  ], sNow, 10);
  check('suggestions: overdue task first, then high priority', ranked[0].taskId === 'late' && ranked[1].taskId === 'high');
  check('suggestions: completed tasks are never suggested', ranked.every(function (r) { return r.taskId !== 'done'; }) && ranked.length === 3);
  check('suggestions: a high priority beats a low one with the same deadline',
    SG.getSuggestions([mk('l', 'L', 'Low', DAY / 2), mk('h', 'H', 'High', DAY / 2)], sNow)[0].taskId === 'h');
  check('suggestions: same score, nearer deadline first',
    SG.getSuggestions([mk('far', 'Far', 'Medium', 5 * DAY), mk('near', 'Near', 'Medium', 4 * DAY)], sNow)[0].taskId === 'near');
  check('suggestions: only 3 are returned by default', SG.getSuggestions([mk('1', 'a', 'Low', DAY), mk('2', 'b', 'Low', 2 * DAY), mk('3', 'c', 'Low', 3 * DAY), mk('4', 'd', 'Low', 4 * DAY)], sNow).length === 3);
  check('suggestions: the limit can be changed', SG.getSuggestions([mk('1', 'a', 'Low', DAY), mk('2', 'b', 'Low', 2 * DAY)], sNow, 1).length === 1);
  check('suggestions: overdue message', ranked[0].level === 'urgent' && ranked[0].message === '"Late lab" is overdue. Do it first today: set aside 60 minutes.');
  check('suggestions: start-today message (start-by date already reached)', ranked[1].level === 'now' && ranked[1].message === 'Start "High soon" today: plan a 90-minute focus session.');
  var planned = SG.getSuggestions([mk('p', 'Essay', 'Low', 10 * DAY)], sNow)[0];
  check('suggestions: plan-for-later message with the day', planned.level === 'plan' && /^Plan "Essay" for .+: a 30-minute focus session\.$/.test(planned.message));
  var free = SG.getSuggestions([mk('f', 'Read notes', 'Medium', null)], sNow)[0];
  check('suggestions: task without a due date', free.level === 'free' && /has no due date/.test(free.message) && free.minutes === 60);
  check('suggestions: no tasks gives an empty list', SG.getSuggestions([], sNow).length === 0 && SG.getSuggestions(null, sNow).length === 0);
  check('suggestions: the saved list is not changed', (function () { var list = [mk('b', 'B', 'Low', 5 * DAY), mk('a', 'A', 'High', DAY)]; SG.getSuggestions(list, sNow); return list[0].id === 'b' && list[1].id === 'a'; })());
  check('suggestions: workload warning for 2 high-priority tasks within 3 days',
    /^Heavy days ahead: 2 high-priority tasks/.test(SG.getWorkloadTip([mk('1', 'a', 'High', DAY), mk('2', 'b', 'High', 2 * DAY)], sNow)));
  check('suggestions: no warning when the workload is light',
    SG.getWorkloadTip([mk('1', 'a', 'High', DAY), mk('2', 'b', 'Low', DAY), mk('3', 'c', 'High', 9 * DAY), mk('4', 'd', 'High', -DAY, 'Complete')], sNow) === null);
  check('suggestions: empty texts', /Add a task/.test(SG.getEmptyText([])) && /all caught up/.test(SG.getEmptyText([mk('1', 'a', 'High', DAY, 'Complete')])));

  // ---------- Task 13.2: suggestions on the screen (needs a page, so only in the browser) ----------
  if (typeof document !== 'undefined' && g.UniSuggestionsUI) {
    var host = document.createElement('section'); host.id = 'suggestions-test'; document.body.appendChild(host);
    S.saveTasks([]);
    g.UniSuggestionsUI.render('suggestions-test');
    check('suggestions screen: empty list shows the hint', /Add a task/.test(host.textContent) && !host.querySelector('.suggestion'));
    S.saveTasks([
      { id: 'u1', title: 'Report', description: '', course: '', priority: 'High', status: 'Not Started', dueDate: new Date(Date.now() + 12 * HOUR).toISOString() },
      { id: 'u2', title: 'Quiz', description: '', course: '', priority: 'High', status: 'In Progress', dueDate: new Date(Date.now() + 30 * HOUR).toISOString() },
      { id: 'u3', title: 'Reading', description: '', course: '', priority: 'Low', status: 'Not Started', dueDate: new Date(Date.now() + 20 * DAY).toISOString() },
      { id: 'u4', title: 'Old', description: '', course: '', priority: 'Low', status: 'Complete', dueDate: new Date(Date.now() - DAY).toISOString() }
    ]);
    g.UniSuggestionsUI.render('suggestions-test');
    check('suggestions screen: one line per suggestion with a priority badge', host.querySelectorAll('li.suggestion').length === 3 && host.querySelectorAll('.priority-badge').length === 3);
    check('suggestions screen: the first line is the most urgent task', /Report/.test(host.querySelector('li.suggestion').textContent));
    check('suggestions screen: the workload warning is shown', !!host.querySelector('.suggestion-warning'));
    S.saveTasks([{ id: 'u5', title: 'Done', description: '', course: '', priority: 'High', status: 'Complete', dueDate: new Date(Date.now() + DAY).toISOString() }]);
    g.UniSuggestionsUI.render('suggestions-test');
    check('suggestions screen: all tasks complete shows the caught-up text', /all caught up/.test(host.textContent));
    document.body.removeChild(host);
  }

  S.saveTasks(backup);                              // put the real tasks back

  // ---------- show the result ----------
  var failed = results.filter(function (r) { return !r.pass; });
  if (typeof document !== 'undefined') {
    var box = document.getElementById('results');
    document.getElementById('summary').textContent = (results.length - failed.length) + ' of ' + results.length + ' checks passed';
    results.forEach(function (r) {
      var li = document.createElement('li');
      li.className = r.pass ? 'pass' : 'fail';
      li.textContent = (r.pass ? 'PASS  ' : 'FAIL  ') + r.name;
      box.appendChild(li);
    });
  } else {
    results.forEach(function (r) { console.log((r.pass ? 'PASS  ' : 'FAIL  ') + r.name); });
    console.log('\n' + (results.length - failed.length) + ' of ' + results.length + ' checks passed');
    if (failed.length) process.exit(1);
  }
})(typeof window !== 'undefined' ? window : globalThis);
