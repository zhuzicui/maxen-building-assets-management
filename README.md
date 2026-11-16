# Maxen: building assets and maintenance (portfolio demo)

A clickable demo of a building maintenance app for a portfolio of seven buildings. It covers work orders, preventive maintenance schedules, asset records and digital checklists. It started as a single-file HTML prototype of the Maxen V4 design (kept in [`legacy/prototype.html`](legacy/prototype.html)) and is now a typed React app with a shared data store.

All names, companies, buildings and work orders are fictional. There is no backend: your changes are saved in your browser only (use **Account > Reset demo data** to start over).

## What works

| Area | What you can do |
| --- | --- |
| Work orders | Create (with templates and a checklist builder), assign and reassign, change status and due date, add and pin notes. A change on one screen shows up on every other screen and survives a reload. |
| Boards and lists | Status boards, a paginated table and cards, all driven by working filters (search, building, status, priority, assignee, supplier, due dates, recurrence, duration, category). |
| Calendar | Month, week and day views. Drag a work order onto a day, or select it and click a day. Scheduling a planned work order marks it ready. |
| Checklists | Tick tasks, record readings with units, and watch progress follow the work. Completing a work order completes its checklist. |
| Assets | Every asset has its own page: location, identifiers, warranty status, specifications, linked work orders, documents, checklists and sub-assets. Browse by wing, floor and room, filter by brand, model, year, category, type and open work orders, and create new assets. |
| Analytics | Work order counts, top assignees, categories, priority split, completion rate and time against estimate, all computed from the data, for the portfolio or one building. |
| Roles | The logo menu switches between portfolio manager, single building and technician views. |
| Phones | Layouts reflow down to 390 px, and filters collapse behind a button. |

Not built yet (see the gap review in the project thread): energy and BMS data, AI suggestions, usage-meter and condition-triggered maintenance, QR tags, spare parts, safety permits and signed inspection reports. The **Building performance** tabs are placeholders for that work.

## Run it

```sh
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (vitest)
npm run build      # type check and production build into dist/
```

Optional click-through test of the main flows (needs Playwright with Chromium):

```sh
npm run build && npx vite preview --port 4173 &
npm run e2e
```

## How it is put together

```
src/
  data/       seed data: people, buildings, asset catalog, work order templates, and the generator that builds them
  store/      zustand store with a localStorage overlay, plus tests
  lib/        pure helpers: dates, seeded random numbers, filters, analytics
  components/ shared UI: header, filter panel, charts, form fields, menus
  screens/    one file per screen or group of screens
legacy/       the original single-file prototype
scripts/      click-through smoke test
```

- **One source of truth.** The base data (about 4,300 assets and 450 work orders) is generated from a seed on every load, so it is identical each time and takes no storage. Everything you change is kept as a small overlay (`woPatches`, `newWOs`, `assetPatches`, `newAssets`) in localStorage. Selectors merge the two, so every screen reads the same records.
- **Realistic dates.** Due dates are generated relative to today, so the calendar and the overdue list always make sense.
- **Each building is different.** Wings, floor counts and rooms are specific to each building.
- **Routing** uses hash URLs (`#/building/assets`), so the build works on any static host.

## Deploy

The workflow in `.github/workflows/ci.yml` type-checks, tests and builds on every pull request, and publishes `dist/` to GitHub Pages after a merge to `main`. Turn it on once under **Settings > Pages > Source: GitHub Actions**.

## Credits

Design: Maxen V4 Figma file. Photos, avatars and the logo are vector stand-ins or fictional content. The Maison de Radio-Canada photo is a placeholder image used for the demo.
