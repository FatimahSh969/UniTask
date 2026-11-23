(function (g) {
  'use strict';

  var COURSES = ['SW332', 'SW312', 'SW321', 'CS220', 'MATH201'];
  var NO_COURSE = '';   // linking to a course is optional

  function isValidCourse(c) { return c === NO_COURSE || COURSES.indexOf(c) !== -1; }

  function validateCourse(course) {
    var c = String(course == null ? '' : course).trim();
    if (!isValidCourse(c)) return { valid: false, error: 'Please choose a course from the list.', value: c };
    return { valid: true, error: '', value: c };
  }

  function createCourseSelect(current, id) {
    var select = document.createElement('select');
    if (id) select.id = id;
    select.setAttribute('aria-label', 'Course');
    var none = document.createElement('option');
    none.value = NO_COURSE;
    none.textContent = 'No course';
    select.appendChild(none);
    COURSES.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      select.appendChild(opt);
    });
    select.value = isValidCourse(current) ? current : NO_COURSE;
    return select;
  }

  function setTaskCourse(taskId, course) {
    var check = validateCourse(course);
    if (!check.valid) return { ok: false, error: check.error, task: null };
    var task = g.UniTaskStore.updateTask(taskId, { course: check.value });
    if (!task) return { ok: false, error: 'Could not save the course. Please try again.', task: null };
    return { ok: true, error: '', task: task };
  }

  function createCourseBadge(course) {
    if (!course) return null;
    var span = document.createElement('span');
    span.className = 'course-badge';
    span.textContent = course;
    return span;
  }

  g.UniCourse = {
    COURSES: COURSES,
    NO_COURSE: NO_COURSE,
    isValidCourse: isValidCourse,
    validateCourse: validateCourse,
    createCourseSelect: createCourseSelect,
    setTaskCourse: setTaskCourse,
    createCourseBadge: createCourseBadge
  };
})(typeof window !== 'undefined' ? window : globalThis);
