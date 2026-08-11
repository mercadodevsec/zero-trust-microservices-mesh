# Basic Microservices App

A full-stack app with a React + TypeScript frontend and an Express + TypeScript backend (organized as User/Order/Payment services sharing common infrastructure), backed by PostgreSQL, with JWT-based authentication end to end.

```
project-root/
├── frontend/     # React + TypeScript + Vite website
├── backend/      # Express + TypeScript API (user/order/payment services + shared infra)
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Architecture note

The milestone spec asked for `backend/services/{user,order,payment}-service`. We organized the code that way — each service has its own `types/repository/service/controller/routes` files — but they still run inside **one Express process** (`backend/src/app.ts`) rather than as three independently-deployed network services. Splitting them into separately deployable services would mean separate databases-or-connection-pools, inter-service HTTP calls replacing the current direct repository calls (e.g. `OrderService` reads `UserRepository` directly today), and three more containers/ports — a much larger, riskier rewrite than this milestone's acceptance criteria call for. This keeps the code organized exactly as requested and easy to split later, without breaking anything that currently works.

---

## Backend — `backend/`

```
backend/
  src/
    app.ts, server.ts
    config/env.ts
    db/{pool.ts, migrate.ts, migrations/*.sql}
    shared/
      errors.ts
      types/{auth.ts, express.d.ts}
      middleware/{errorHandler.ts, notFound.ts, authMiddleware.ts}
      utils/{asyncHandler.ts, jwt.ts}
    services/
      auth-service/     # POST /auth/login
      user-service/      # registration, GET /me, GET /:id, GET /
      order-service/
      payment-service/
  package.json, tsconfig.json, vitest.config.ts, .env.example, Dockerfile
```

### Setup

```bash
cd backend
npm install
cp .env.example .env   # set a real JWT_SECRET
docker compose up -d postgres   # from project root, or run your own Postgres
npm run migrate
npm run dev             # http://localhost:3000
npm test
```

### API routes

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/login` | Public | `{ email, password }` |
| POST | `/api/users` | Public | `{ name, email, password }` (registration) |
| GET | `/api/users/me` | Bearer JWT | — |
| GET | `/api/users` | Bearer JWT | — |
| GET | `/api/users/:id` | Bearer JWT | — |
| POST/GET | `/api/orders`, `/api/orders/:id` | Bearer JWT | see backend README history |
| POST/GET | `/api/payments`, `/api/payments/:id` | Bearer JWT | — |
| GET | `/health` | Public | — |

Login response:

```json
{
  "message": "Login successful",
  "token": "<JWT>",
  "user": { "id": 1, "email": "ada@example.com", "role": "user" }
}
```

Passwords are bcrypt-hashed; the hash and JWT secret are never returned or logged.

---

## Frontend — `frontend/`

```
frontend/
  src/
    App.tsx, main.tsx
    pages/{Login,Dashboard,Orders,Payments,Profile}.tsx
    components/ProtectedRoute.tsx
    context/AuthContext.tsx
    hooks/useAuth.ts
    services/{api.ts, authService.ts}
    types/auth.ts
  package.json, vite.config.ts, tsconfig.json, .env.example, Dockerfile
```

### Setup

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm run dev             # http://localhost:5173
npm test
```

### Routes

| Path | Access |
|---|---|
| `/login` | Public |
| `/dashboard` | Protected |
| `/orders` | Protected |
| `/payments` | Protected |
| `/profile` | Protected |
| `/`, `*` | Redirects to `/dashboard` (which redirects to `/login` if unauthenticated) |

`ProtectedRoute` wraps all authenticated pages with React Router's `<Outlet>` pattern — visiting a protected URL directly while logged out redirects to `/login` and back to the original destination after a successful login.

### Auth state

`AuthContext`/`useAuth` centralize everything: JWT + user are stored in `localStorage` (`auth_token`, `auth_user`) so a page reload restores the session; `login()` calls `POST /auth/login` via `authService`; `logout()` clears storage and state. `services/api.ts` is the single fetch wrapper — it reads the stored token and attaches `Authorization: Bearer <token>` automatically, so components never touch the token directly.

---

## Full auth flow

```
Browser → React Login page → POST /auth/login → AuthService
  → UserRepository.findByEmail → bcrypt.compare → JWT signed
  → { token, user } returned → frontend stores token + user
  → subsequent requests: Authorization: Bearer <token>
  → authMiddleware verifies JWT → req.user attached → controller responds
```

---

## Environment variables

**backend/.env**
```
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/basic_app
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=1h
```

**frontend/.env**
```
VITE_API_URL=http://localhost:3000
```

---

## Docker

```bash
docker compose build
docker compose up
```

- `postgres` — database, with a healthcheck the backend waits on.
- `backend` — builds `backend/Dockerfile`, reads secrets from `backend/.env` via `env_file` (never hardcoded in compose), connects to Postgres by service name inside the Docker network.
- `frontend` — multi-stage build (`npm run build` → served as static files via `serve`) on port 5173. `VITE_API_URL` is passed as a **build arg** (Vite inlines `VITE_*` vars at build time, not runtime) pointing at `http://localhost:3000` so the browser — not the container — can reach the backend.

---

## Tests added this milestone

**Backend** (`npm test` in `backend/`): `auth.service.test.ts` (login success/failure/unknown user/missing fields), `authMiddleware.test.ts` (valid/missing/malformed/garbage/wrong-secret/expired tokens), plus the pre-existing user/order/payment service tests (user tests updated for the password field).

**Frontend** (`npm test` in `frontend/`): `Login.test.tsx` (renders fields, loading state, calls `login()`, shows error on 401, redirects on success), `ProtectedRoute.test.tsx` (redirects when unauthenticated, renders when authenticated, waits during loading), `AuthContext.test.tsx` (starts anonymous, login updates state + storage, restores session from storage on reload, logout clears everything).

---

## Verify locally

```bash
# Backend
cd backend && npm install && npm run build && npm test

# Frontend
cd frontend && npm install && npm run build && npm test

# Full stack
docker compose up -d postgres
cd backend && npm run migrate && cd ..
docker compose up --build
```

> **Note:** This was built in a sandboxed environment with no network access, so none of the above commands could actually be run here — no `node_modules` could be installed and no compiler/test runner could execute. The code is internally consistent (imports, types, and test mocks all line up), but please run the commands above before merging.
