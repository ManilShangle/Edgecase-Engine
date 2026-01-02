# EdgeCase Engine - Backend

This is the backend for the EdgeCase Engine MVP.

Quick start:

- Copy `.env.example` to `.env` and set `MONGO_URI` (MongoDB Atlas or local).

- Install dependencies and run server:

```bash
cd backend
npm install
npm run dev
```

- To seed demo problems (creates a guest and 3 sample problems with testcases):

```bash
npm run seed
```

API highlights:
- `POST /api/guest` -> creates a guest id
- `POST /api/problems` -> create problem
- `GET /api/problems` -> list problems
- `POST /api/problems/:id/generate` -> generate previews
- `POST /api/problems/:id/testcases/bulk` -> save generated cases
- `GET /api/problems/:id/export` -> export combined text

