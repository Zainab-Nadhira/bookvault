# 📚 BookVault — Personal Reading Tracker

A full-stack MERN reading tracker with a cozy, premium UI (glassmorphism, floating particles,
Framer Motion animations, light/dark/system theming).

This is the **core, fully working slice** of the original BookVault spec: authentication, complete
book management, dashboard analytics, reading goals, search/filters, and statistics — built end to
end and wired together. See **"What's included vs. not yet built"** at the bottom for the parts of
the original wishlist (achievements, PWA, command palette, CSV/PDF export, drag-and-drop shelves)
that aren't implemented yet, and how to extend toward them.

---

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router, Framer Motion, Axios, Recharts, react-hot-toast, lucide-react
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt

---

## Project Structure

```
bookvault/
├── backend/
│   ├── config/db.js
│   ├── controllers/       # auth, books, stats, goals
│   ├── models/            # User, Book, Goal, ReadingSession
│   ├── routes/
│   ├── middleware/        # JWT auth, error handling, multer upload
│   ├── utils/              # token generator, seed script
│   └── server.js
└── frontend/
    └── src/
        ├── components/     # BookCard, StatCard, ProgressRing, StarRating, etc.
        ├── contexts/       # AuthContext, ThemeContext
        ├── layouts/        # DashboardLayout (sidebar/nav)
        ├── pages/          # Login, Register, Dashboard, Books, BookDetail, BookForm, Statistics, Settings
        ├── routes/         # ProtectedRoute
        └── services/api.js # Axios instance
```

---

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/bookvault?retryWrites=true&w=majority
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed sample data (creates a demo user + 5 sample books):

```bash
npm run seed
```

Demo login after seeding: **demo@bookvault.app** / **password123**

Run the API:

```bash
npm run dev
```

API will be live at `http://localhost:5000/api` (health check: `GET /api/health`).

---

## 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

`.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run the dev server:

```bash
npm run dev
```

App runs at `http://localhost:5173`. The Vite dev server proxies `/api` and `/uploads` to
`http://localhost:5000` automatically (see `vite.config.js`), so the `.env` value is mainly used
in production builds.

---

## 3. Deployment

**Backend → Render**
1. Push `backend/` to a repo (or connect the monorepo, root directory `backend`).
2. Create a new Web Service, build command `npm install`, start command `npm start`.
3. Add the same environment variables from `.env` in Render's dashboard. Set `CLIENT_URL` to your deployed Vercel URL.

**Frontend → Vercel**
1. Import the repo, root directory `frontend`.
2. Set `VITE_API_URL` to your Render backend URL + `/api` (e.g. `https://bookvault-api.onrender.com/api`).
3. `vercel.json` is already included for SPA route rewrites.

---

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |
| GET/PUT/DELETE | `/api/auth/me` | Profile (protected) |
| POST | `/api/auth/forgot-password` | Request reset token |
| POST | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/books` | List books (search, filter, sort, paginate) |
| POST | `/api/books` | Create book |
| GET/PUT/DELETE | `/api/books/:id` | Single book |
| POST | `/api/books/:id/cover` | Upload cover image |
| GET | `/api/books/meta/genres` | Distinct genres (for filter dropdown) |
| GET | `/api/stats/dashboard` | Dashboard summary stats |
| GET | `/api/stats/monthly` | Books/pages per month |
| GET | `/api/stats/genres` | Genre breakdown |
| GET | `/api/stats/heatmap` | Daily reading heatmap data |
| GET/PUT | `/api/goals` | Yearly reading goal |

All `/books`, `/stats`, and `/goals` routes require `Authorization: Bearer <token>`.

---

## What's included

- JWT auth (register/login/logout), forgot/reset password UI, protected routes
- Full book model: title, author, publisher, ISBN, genre, language, pages, status, dates, rating,
  review, favorite quote, notes, tags, purchase link, price, format, series, wishlist, favorite
- Cover image upload
- Dashboard: welcome message, today's date, goal progress ring, 8 animated stat cards, monthly bar
  chart, genre pie chart, recent activity
- Instant search + filters (status, genre, sort) + grid/list views
- Book detail page with review, quote, notes, related books, progress bar
- Statistics page: monthly bar/line charts, genre pie chart, 26-week reading heatmap
- Reading goals with predicted completion date
- Settings: profile edit, password change, theme (light/dark/system, persisted), yearly goal, JSON
  library export, delete account
- Glassmorphism cards, floating particles, Framer Motion transitions everywhere, responsive/mobile
  sidebar drawer

## What's not yet built (from the original wishlist)

These weren't built in this pass to keep the delivered slice real and working rather than 100+ stub
files. The data models (`Book`, `ReadingSession`, `Goal`) already support most of these — they're
additive frontend/backend work on top of the existing API:

- Achievements/badges system (gamification)
- Command palette, keyboard shortcuts, infinite scroll
- CSV/PDF export (JSON export is included)
- Drag-and-drop shelf reordering, bookshelf/compact card views
- Reading timer widget, daily reminder UI, quotes widget, custom collections
- PWA/offline support
- Separate Reviews/Notes collections (currently stored as fields on the Book document, which
  covers the same functionality with a simpler schema)

## Sample/Seed Data

Run `npm run seed` in `backend/` — creates one demo user and 5 books across different statuses
(finished, currently-reading, want-to-read, wishlist) so the dashboard and stats aren't empty on
first login.
