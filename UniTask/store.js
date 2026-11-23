
(function (g) {
  'use strict';
  if (g.UniTaskStore) return;

  var KEY = 'unitask_tasks';

  function getTasks() {
    try {
      var raw = g.localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveTasks(tasks) {
    try {
      g.localStorage.setItem(KEY, JSON.stringify(tasks));
      return true;
    } catch (e) {
      return false;
    }
  }

  function getTask(id) {
    var list = getTasks();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function updateTask(id, patch) {
    var list = getTasks();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) list[i][k] = patch[k];
        return saveTasks(list) ? list[i] : null;
      }
    }
    return null;
  }

  g.UniTaskStore = { KEY: KEY, getTasks: getTasks, saveTasks: saveTasks, getTask: getTask, updateTask: updateTask };
})(typeof window !== 'undefined' ? window : globalThis);
