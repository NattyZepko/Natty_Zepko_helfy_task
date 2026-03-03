# Helfy Task Manager

- Backend: Express REST API (in-memory)
- Frontend: React + Vite + plain CSS

## Tech stack

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/en)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES202x-F7DF1E?logo=javascript&logoColor=000000)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=0B1F2A)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?logo=eslint&logoColor=white)](https://eslint.org)

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

Validation failures return `400` with `{ "error": "..." }`.

## Carousel (how it works)

The carousel is _actually_ infinite-feeling (not a paginated list and not a simple scroll container). The core design is:

1. Keep one task "focused"

- We track a focused index (`activeIndex`) for the real `tasks` array.

2. Render a small "window" around the focus

- Instead of rendering the whole list in a giant strip, we render just a handful of slides around the focused one.
- Indices wrap with modulo (`(activeIndex + offset + length) % length`), so the window behaves like a ring.
- A small off-screen buffer is rendered so the edges are already there during animation (no visible pop-in).

3. Animate one step, then recenter

- Clicking next/prev sets a temporary `shift` of `+1` or `-1`.
- The track uses `transform: translateX(...)` to slide exactly one card width.
- When the CSS transition ends, we update `activeIndex` to the next/previous real task and reset `shift` back to `0`.
- We briefly disable transitions during that reset so you don't see a snap.

4. Keep focus stable across list changes

- When tasks change (filtering, deleting, reordering), we remember the currently focused task id.
- We then find that id in the new list and update `activeIndex` so the carousel doesn't jump to a random card.

Implementation lives in the hook `frontend/src/services/useTaskCarousel.js` and is consumed by the mostly-presentational `frontend/src/components/TaskList.jsx`.

## Drag-and-drop reorder (how it works)

Reordering is intentionally "hands-on" and visual:

- It's pointer-based (not HTML5 drag events): on `pointerdown` we start a drag and listen on `document` for move/up.
- We keep a `dragState` object with:
  - which task you're dragging,
  - where the pointer is,
  - which slide you're currently closest to.
- While dragging:
  - a fixed-position preview follows the pointer,
  - neighboring slides "scooch" left/right using `transform` so you can see where the card will land.
- On drop we call `onReorderTask(sourceId, targetId)`.

Notes / constraints:

- Reordering is only enabled when the UI is in "Manual" order.
- The backend does not persist ordering (tasks are in-memory); ordering is a frontend concern in this project.

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
