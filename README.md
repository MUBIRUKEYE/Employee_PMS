# Employee Payroll Management System (EPMS)
### PayMaster Ltd — Rubavu District, Rwanda

A full-stack web application for managing employee payroll, built with React.js, Node.js, Express.js, and MongoDB.

---

## 📁 Project Structure

```
EPMS/
├── backend-project/       # Node.js + Express.js API
│   ├── src/
│   │   ├── models/        # Mongoose models (User, Employee, Department, Salary)
│   │   ├── routes/        # Express routes (auth, employees, departments, salaries, reports)
│   │   └── middleware/    # JWT auth middleware
│   ├── .env               # Environment variables
│   └── server.js          # Entry point
│
└── frontend-project/      # React.js + Vite + TailwindCSS
    └── src/
        ├── components/    # Layout, Sidebar, Navbar
        ├── pages/         # Dashboard, Employees, Departments, Salaries, Reports
        ├── context/       # AuthContext, ThemeContext (dark mode)
        └── utils/         # Axios API instance
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

---

### 1. Backend Setup

```bash
cd backend-project
npm install
```

Edit `.env` file:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/EPMS
JWT_SECRET=paymaster_epms_secret_key_2026
JWT_EXPIRE=7d
```

> If using MongoDB Atlas, replace MONGO_URI with your connection string.

Start the backend:
```bash
npm run dev      # Development (nodemon)
npm start        # Production
```

The API will run at: **http://localhost:5000**

---

### 2. Frontend Setup

```bash
cd frontend-project
npm install
npm run dev
```

The frontend will run at: **http://localhost:5173**

---

## 🗃️ Database

- **Database name:** `EPMS`
- **Collections:** `users`, `employees`, `departments`, `salaries`
- MongoDB is used (no SQL required)

### Entity Relationships
- `Employee` → belongs to one `Department` (Many-to-One)
- `Salary` → belongs to one `Employee` (Many-to-One)
- `User` → system user for authentication

---

## 🔐 Authentication

The system includes full JWT-based auth:
- **Register:** Create an account (HR Officer or Admin)
- **Login:** Email + password
- All API routes are protected with JWT middleware

---

## 📋 Features

### Employees
- Add new employees (INSERT)
- View all employees with department info
- Edit/Update employee details
- Delete employees

### Departments
- Add departments (INSERT)
- View, edit, delete departments

### Salary Management (Full CRUD)
- **Insert** new salary records
- **Retrieve** all salary records
- **Update** salary records
- **Delete** salary records
- Auto-calculates Net Salary (Gross - Deductions)

### Reports
- **Daily Report** — Records created today
- **Weekly Report** — Last 7 days
- **Monthly Report** — Filter by month & year
- Print / Export via browser print dialog

### UI Features
- 🌗 **Dark Mode** toggle (persisted in localStorage)
- 📱 **Responsive** design (mobile-first)
- 🎨 **TailwindCSS** with Vite
- 🔔 Toast notifications
- Real-time net salary preview in salary form

---

## 🛣️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/employees` | Get all employees |
| POST | `/api/employees` | Add employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |
| GET | `/api/departments` | Get all departments |
| POST | `/api/departments` | Add department |
| PUT | `/api/departments/:id` | Update department |
| DELETE | `/api/departments/:id` | Delete department |
| GET | `/api/salaries` | Get all salaries |
| POST | `/api/salaries` | Add salary |
| PUT | `/api/salaries/:id` | Update salary |
| DELETE | `/api/salaries/:id` | Delete salary |
| GET | `/api/reports/summary` | Dashboard stats |
| GET | `/api/reports/daily` | Daily report |
| GET | `/api/reports/weekly` | Weekly report |
| GET | `/api/reports/monthly?month=1&year=2026` | Monthly report |

---

## 🧪 Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6 |
| Styling | TailwindCSS 3, Vite |
| HTTP Client | Axios |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken), bcryptjs |

---

## 👤 Default Usage

1. Open **http://localhost:5173/register**
2. Create your account (choose Admin or HR role)
3. Login and start managing payroll!

---

*PayMaster Ltd — EPMS 2026 | National Practical Exam Project*
