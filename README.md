# Real Estate Listings Platform (MVP)

A full-stack web application where real estate agents publish and manage property listings, and buyers/renters browse, filter, save favorites, and send inquiries.

**Team 06:**
- **Member A (Authentication & Roles):** Ani Loladze (`@ezekiel-444`)
- **Member B (Database & CRUD):** Salim Ben Ali Al Qassim (`@salimqassim`)
- **Member C (Figma Design & UI):** Dachi Chachia (`@ninjapaper`)

**Figma Design:** [Paste Figma View-Access Link Here]

---

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express.js (REST API)
- **Database:** Relational SQL (PostgreSQL / MySQL / SQLite)
- **Authentication:** JWT (HTTP-only cookies) & `bcrypt` password hashing

---

## Project Structure
```text
├── backend/
│   ├── db/
│   │   ├── schema.sql        # Database tables, primary & foreign keys
│   │   └── seed.sql          # Initial sample data and test accounts
│   ├── middleware/
│   │   └── auth.js           # JWT verification & role guards
│   ├── routes/
│   │   └── auth.js           # Register, login, logout, current user
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   └── package.json
├── .gitignore
└── README.md
```

---

## Local Setup & Installation

### 1. Clone the repository
```bash
git clone [https://github.com/ezekiel-444/real-estate-listings-mvp.git](https://github.com/ezekiel-444/real-estate-listings-mvp.git)
cd real-estate-listings-mvp
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```
Open `backend/.env` and update `DATABASE_URL` (or DB credentials) and `JWT_SECRET` for your local machine.

### 3. Database Setup
Create a local SQL database (e.g., `real_estate_mvp`) and run the schema and seed scripts:
```bash
# Example for PostgreSQL (adjust if using MySQL or SQLite):
psql -U postgres -d real_estate_mvp -f db/schema.sql
psql -U postgres -d real_estate_mvp -f db/seed.sql
```

### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

### 5. Run the Application
Start the backend and frontend in two separate terminals:
```bash
# Terminal 1 (Backend - http://localhost:5000)
cd backend
npm run dev

# Terminal 2 (Frontend - http://localhost:5173)
cd frontend
npm run dev
```

---

## Test Accounts (Seed Data)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@estate.com` | `Password123!` | Full platform management |
| **Agent** | `agent@estate.com` | `Password123!` | Create/edit/delete own listings, reply to inquiries |
| **User** | `user@estate.com` | `Password123!` | Browse/filter properties, save favorites, send inquiries |

---

## Git Workflow for Teammates
1. Pull the latest `main`: `git pull origin main`
2. Create your feature branch:
   - Member A: `git checkout -b feat/auth-and-roles`
   - Member B: `git checkout -b feat/database-and-crud`
   - Member C: `git checkout -b feat/ui-and-figma`
3. Commit your changes regularly from your own GitHub account.
4. Open a **Pull Request** into `main` when ready.



---

## API & Role Protection Contract (Member A → Member B)

To protect CRUD routes and enforce server-side role permissions, import the auth middleware from `backend/middleware/auth.js`:

```javascript
const { authenticateToken, requireRole } = require('../middleware/auth');