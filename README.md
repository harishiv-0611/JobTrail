# JobTrail

JobTrail is a job application tracker for organizing a job search in one place. Track application progress, manage interviews, and keep your professional profile details together.

## Features

- Dashboard with application statistics, recent applications, and upcoming interviews
- Application list with search, status filters, sorting, and pagination
- Create, view, update, and delete job applications
- Kanban board for moving applications through job-search statuses
- Profile page for managing resume and professional information
- JWT-based registration, sign-in, and protected API routes
- Memory and MongoDB repository options

## Tech stack

**Frontend:** React, Vite, React Router, Redux Toolkit, Tailwind CSS, Axios  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB for persistent storage

## Run locally

Open two terminals from the project directory.

### 1. Start the API

```powershell
cd server
npm ci
```

By default, the server uses an in-memory repository. This is suitable for trying the app, but user and application data is lost when the server restarts.

To use MongoDB, create `server/.env` with:

```env
PORT=5000
DB_TYPE=mongodb
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=replace-with-a-long-random-secret
```

Keep the connection string and secret private; do not commit `.env` files.
Then start the API:

```powershell
npm run dev
```

The API listens on `http://localhost:5000`. You can check it at
[`http://localhost:5000/health`](http://localhost:5000/health).

### 2. Start the frontend

In another terminal:

```powershell
cd client
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`).
The frontend currently sends API requests to `http://localhost:5000`.

The development server seeds a demo account:

- **Email:** `jane@gmail.com`
- **Password:** `Password@123`

Use the demo account only for local development. Do not use it for a public or production deployment.
The profile API uses the MongoDB repository; use `DB_TYPE=mongodb` to try the
complete profile editor. The in-memory option is intended for a basic local demo.

## Useful commands

Run these commands from their respective folders.

| Folder | Command | Description |
| --- | --- | --- |
| `client` | `npm run dev` | Start the Vite development server |
| `client` | `npm run build` | Create the production frontend build in `client/dist` |
| `client` | `npm run preview` | Preview the production frontend build locally |
| `client` | `npm run lint` | Run Oxlint |
| `server` | `npm run dev` | Start the API in watch mode |
| `server` | `npm start` | Start the API |
| `server` | `npm run seed` | Seed the MongoDB demo data (destructive; see note below) |

> **Warning:** `npm run seed` deletes existing users and applications before
> inserting demo data. Only run it against a disposable database.

## Application statuses

Applications can be organized as **Wishlist**, **Applied**, **Screening**, **Interview**, **Offer**, **Accepted**, **Rejected**, or **Withdrawn**.

## Project structure

```text
client/
  src/
    api/          Frontend API clients
    components/   Shared and dashboard components
    pages/        Dashboard, applications, board, and profile pages
    store/        Redux store and application state
server/
  config/         Environment and MongoDB configuration
  controllers/    HTTP request handlers
  middleware/     Authentication and request validation
  repositories/   Memory and MongoDB data access
  routes/         API routes
  schemas/        Mongoose schemas
  services/       Application and authentication logic
```

## API overview

All API routes are under `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register an account |
| `POST` | `/auth/login` | Sign in and receive a JWT |
| `GET` | `/auth/me` | Get the authenticated user |
| `GET`, `POST` | `/applications` | List or create applications |
| `GET`, `PATCH`, `DELETE` | `/applications/:id` | View, update, or delete an application |
| `PATCH` | `/applications/:id/status` | Change an application's status |
| `GET` | `/applications/stats` | Get application statistics |
| `GET`, `PATCH` | `/auth/profile` | Read or update the authenticated profile |

Protected endpoints require an `Authorization: Bearer <token>` header.


