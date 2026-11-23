# UniTask

UniTask is a task organizer web app for university students (SW332 project).

## Features
- Redesigned responsive interface with a welcoming overview and clear navigation between Overview, My Tasks and Add a Task
- Updated color palette, typography, cards, buttons and mobile layout
- Add a task with title, description, due date, course, priority and status
- Edit and delete tasks (delete asks for confirmation)
- Countdown to each deadline ("2 days 5 hours left", "Overdue by ...", "Completed")
- Overdue tasks are shown first, in a distinct color
- Dashboard with the number of tasks by status, the overdue tasks and the percentage completed
- Smart time suggestions (PBI-13): the three tasks to work on next, ranked by priority and deadline, with the study time (High 90, Medium 60, Low 30 minutes) and the day to start, plus a warning when two or more high-priority tasks are due within 3 days (overdue high-priority tasks count too)
- Filter the task list by course (PBI-12): choose a course, "All courses" or "No course" in the My Tasks list
- Tasks are saved in the browser (localStorage)

## How to run
Open `demo.html` in a web browser. No installation is needed.
Open `tests.html` to run the logic checks (77 checks, all should pass).

## Files
| File | What it does |
|---|---|
| `demo.html`, `style.css` | The page (including the course filter, PBI-12) and its style |
| `store.js` | Saves and loads the tasks |
| `tasks.js` | Adds a task and checks its fields |
| `dates.js`, `status.js`, `course.js`, `priority.js` | Due date, status, course and priority |
| `countdown.js`, `countdown-ui.js` | Time left and the countdown on each card |
| `edit.js`, `edit-ui.js` | Edit a task |
| `delete.js`, `delete-ui.js` | Delete a task and the messages |
| `sort.js` | Overdue tasks first |
| `dashboard.js`, `dashboard-ui.js` | Dashboard counts and screen |
| `suggestions.js`, `suggestions-ui.js` | Time-management suggestions by priority and the suggestions panel |
| `tests.html`, `tests.js` | Logic checks |

## Team
Fatimah ALMshal, Zainab Al Senan, Fatimah ALShamlan, Asayel Alqahtani
