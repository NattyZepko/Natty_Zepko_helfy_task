# Helfy Task Manager

- Backend: Express REST API (in-memory)
- Frontend: React + Vite + plain CSS

(Readme file idea copied from this [readme.md file example](https://github.com/RichardLitt/standard-readme) )

<img width="2410" height="1080" alt="image" src="https://github.com/user-attachments/assets/81a1fa1e-7f21-4659-9719-f39afec0737b" />

## Tech stack

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/en)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES202x-F7DF1E?logo=javascript&logoColor=000000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)

## Notable files

- [backend/routes/tasksRoutes.js](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/backend/routes/tasksRoutes.js)
  - The single place that defines the REST surface area of the tasks API.

- [backend/controllers/tasksController.js](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/backend/controllers/tasksController.js)
  - This is where I do request validation, translate store results into HTTP responses, and raise structured errors.
  - `handleCreateTask` / `handleReplaceTask` - they validate input and use `createHttpError(...)` so failures become predictable 400/404 responses.

- [backend/store/tasksStore.js](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/backend/store/tasksStore.js)
  - This is the in-memory "database" (the source of truth for tasks while the server is running).
  - The `createTask(...)` (assigns "nextId", sets "createdAt") and the id-based helpers like `replaceTaskById(...)` / `toggleTaskCompletionById(...)`.

- [frontend/src/services/useTaskCarousel.js](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/frontend/src/services/useTaskCarousel.js)
  - THIS is the core of the "real" infinite-feeling carousel and the pointer-based drag-reorder!
  - Note that `handleTransitionEnd(...)` - is the "animate one step, then recenter" trick (update "activeIndex", reset "shift" with transitions briefly disabled).

- [frontend/src/components/TaskList.jsx](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/frontend/src/components/TaskList.jsx)
  - This is the mostly-presentational component that turns the carousel state into actual DOM + CSS transforms.
  - It controls the per-slide "scooch away" transform calculation during drag, which makes neighbors slide out of the way in real time.

- [frontend/src/services/tasksApi.js](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/frontend/src/services/tasksApi.js)
  - This unit keeps all fetch calls in one place and normalizes error handling for the UI.

- [frontend/src/styles/index.css](https://github.com/NattyZepko/Natty_Zepko_helfy_task/blob/main/frontend/src/styles/index.css)
  - This is the theme foundation (light/dark variables) used by all component CSS.
  - `--accent-rgb` + `--accent` let me reuse the same accent color everywhere without hard-coding RGBA values everywhere.

## Quick start

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:4000` as requested :)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

In dev, the frontend calls the backend through `/api/...` and Vite proxies that to `http://localhost:4000`.

## API

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/toggle`

Validation failures return 400 with `{ "error": "..." }`.

## Key Features & Design Decisions

### The Carousel:

The carousel is _infinite-feeling_ (not a library). The core design is:

1. Keep one task "focused"

- I track a focused index (`activeIndex`) for the real "tasks" array.

2. Render a small "window" around the focus

- Instead of rendering the whole list in a giant strip, I render just a handful of slides around the focused one.
- Indices wrap with modulo (`(activeIndex + offset + length) % length`), so the window behaves like a ring.
- A small off-screen buffer is rendered so the edges are already there during the movement animation (no visible pop-in of tasks, its offscreen).

3. Animate one step, then recenter

- Clicking next/prev sets a temporary "shift" of +1 or -1.
- The track uses `transform: translateX(...)` to slide exactly one card width.
- When the CSS transition ends, I update "activeIndex" to the next/previous real task and reset shift back to 0.
- I briefly disable transitions during that reset so you don't see a snap.

4. Keep focus stable across list changes

- When tasks change (filtering, deleting, reordering), I remember the currently focused task id.
- I then find that id in the new list and update "activeIndex" so the carousel doesn't jump to a random card.

Implementation lives in the hook `frontend/src/services/useTaskCarousel.js` and is consumed by the mostly-presentational `frontend/src/components/TaskList.jsx`.

### Drag-and-drop reorder

Reordering is intentionally "hands-on" and visual, I Built it using pointer events and "setPointerCapture"

- It's pointer-based (not HTML5 drag events): on "pointerdown" I start a drag and listen on "document" for move/up.
- I keep a "dragState" object with:
  - which task you're dragging,
  - where the pointer is,
  - which slide you're currently closest to.
- While dragging:
  - a fixed-position preview follows the pointer,
  - neighboring slides "scooch" left/right using `transform` so you can see where the card will land.
- On drop I call `onReorderTask(sourceId, targetId)`.

Notes

- The backend does not persist ordering (tasks are in-memory) so ordering is a frontend concern.

## Sources

React hooks (`useState`, `useEffect`, `useMemo`, `useRef`) + custom hooks

- https://legacy.reactjs.org/docs/hooks-reference.html
- https://legacy.reactjs.org/docs/hooks-custom.html
- https://dmitripavlutin.com/react-custom-hooks-best-practices/
- https://medium.com/@ksshravan667/14-days-of-react-day-5-react-hooks-usestate-useref-useeffect-usememo-usecallback-8599a14c4e2b

React setup / learning

- https://react.dev/learn

Vite proxy

- https://vite.dev/config/server-options

Fetch + fetch wrappers

- https://javascript.info/fetch
- https://dev.to/dmitrevnik/fetch-wrapper-for-nextjs-a-deep-dive-into-best-practices-53dh

CSS transitions

- https://www.w3schools.com/css/css3_transitions.asp
- https://css-tricks.com/almanac/properties/t/transition/

Pointer events / drag interactions

- https://www.w3schools.com/cssref/css3_pr_pointer-events.php
- https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

CSS Grid (THIS ONE HELPED A LOT!)

- https://css-tricks.com/complete-guide-css-grid-layout/

Badges

- https://tailwindcss.com/plus/ui-blocks/application-ui/elements/badges

---

# Time Spent (Realistic Breakdown, I didn't ACTUALLY measure)

Total time spent: About 4 hours.
12:05 -> 16:20, with two mandatory pauses caused by country-wide alerts:

- 12:42 – 12:55 (about 13 minutes)
- 14:52 – 15:12 (about 20 minutes)

### Backend API — 45 minutes

It didn't take long to build an Express server, as I do it often on my side projects.
Added routes, controllers, basic error handling, and in-memory storage.
Basic testing with postman.

### Frontend Core Features - A bit over 2 hours (~2:15:00~)

Started with react app setup.
Task fetching, Reading online about the forms, and making the task form.
Building the controlled inputs, initial layout and panels (sort of the design I envisioned after reading the task file)
Started building the carousel logic, and had to scrap it twice.
Rewrote the "window index" logic also twice.
Added the manual reorder, and build the drag logic.

It worked but it looked janky. I added the "scooching over" animation for the neigbors to move.
Debugged pointer events for 20 minutes.
Cleaned up the state management (LOTS OF REDUNDANCY).
Read online on how to do the circling back multiple times, as the logic broke, and then fixed the sizes of the "task card" components because the buttons wrapped out of the cards.

Added the Dark/Light mode after I re-read the document. I found a simple guide for it.

### Styling and polish - About 25 minutes

I realized how to make the light / dark theme look better after reading the guide over.
Priority badges copied from tailwindcss
Final responsive tweaks, and checked colors look good in both modes.

### Testing and debugging - About 20 minutes

Verified UI behavior, Fixed another out-of-bounds carousel reset that I noticed when I had 2/3 items.
