# EdgeCase Engine: MVP

Quick start (backend + frontend locally)

1. Backend

- Install dependencies and set MongoDB URI (Atlas or local):

```bash
cd backend
npm install
# set environment variable MONGO_URI, e.g. in .env or your shell
# MONGO_URI=mongodb+srv://<user>:<pw>@cluster0.mongodb.net/edgecase_engine
npm run dev
```

- To seed demo problems from the CLI:

```bash
npm run seed
```

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and click "View Library" → "Load Sample Problems".

Notes

- The app supports guest mode; a `edgecase_guest` id is stored in `localStorage`.
- Configure `VITE_API_BASE` in the frontend environment to point at your backend (default `http://localhost:4000/api`).
- Export and generation are deterministic with a seed; generator is template-driven (arrays, graphs, strings, binary-search templates supported).

Next steps (TODO)

- UI polish: toasts, saved-vs-preview indicators
- Add more generation templates (DP, two-pointers, binary-search edge patterns)
- Optional: auth/log-in, shareable public links
