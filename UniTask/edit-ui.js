/* edit-ui.js – Sprint 2, PBI-08 "Edit the details of an existing task"
 *   Task 8.2  Edit form on the screen (this file)
 *
 * The add form is used for editing too: "Edit" fills it with the task's values,
 * the button becomes "Save changes", and a Cancel button appears.
 *
 * Needs: edit.js (Task 8.1), dates.js, course.js, priority.js, status.js
 *
 * `els` is an object with the form parts:
 *   { form, title, desc, due, course, priority, status, heading, submitLabel, cancel, error }
 */
(function (g) {
  'use strict';

  var editingId = null;

  function isEditing() { return editingId !== null; }
  function currentId() { return editingId; }

  // Fills the form with the task and switches it to edit mode. Returns false if the task is gone.
  function start(taskId, els) {
    var v = g.UniTaskEdit.getEditableValues(taskId);
    if (!v) return false;

    editingId = taskId;
    els.title.value = v.title;
    els.desc.value = v.description;
    els.due.min = '';                       // an overdue task may keep its old date
    els.due.value = v.dueDate;
    els.course.value = v.course || g.UniCourse.NO_COURSE;
    els.priority.value = v.priority;
    els.status.value = v.status;

    els.heading.textContent = 'Edit Task';
    els.submitLabel.textContent = 'Save changes';
    els.cancel.hidden = false;
    (els.form.closest('.form-panel') || els.form).classList.add('editing');
    els.error.textContent = '';
    els.title.focus();
    return true;
  }

  // Saves the form values on the task being edited. Returns { ok, error, field, task }.
  function save(els) {
    if (!isEditing()) return { ok: false, error: 'No task is being edited.', field: '', task: null };
    return g.UniTaskEdit.updateTask(editingId, {
      title: els.title.value,
      description: els.desc.value,
      dueDate: els.due.value,
      course: els.course.value,
      priority: els.priority.value,
      status: els.status.value
    });
  }

  // Leaves edit mode and puts the form back to "Add a New Task" with empty fields.
  function reset(els) {
    editingId = null;
    els.title.value = '';
    els.desc.value = '';
    g.UniDates.initDueDatePicker(els.due, { defaultToEndOfDay: true });
    els.course.value = g.UniCourse.NO_COURSE;
    els.priority.value = g.UniPriority.DEFAULT_PRIORITY;
    els.status.value = g.UniStatus.DEFAULT_STATUS;

    els.heading.textContent = 'Add a New Task';
    els.submitLabel.textContent = 'Add task';
    els.cancel.hidden = true;
    (els.form.closest('.form-panel') || els.form).classList.remove('editing');
    els.error.textContent = '';
  }

  g.UniEditUI = { isEditing: isEditing, currentId: currentId, start: start, save: save, reset: reset };
})(typeof window !== 'undefined' ? window : globalThis);
