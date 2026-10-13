# Smart Campus Management - Frontend (SmartEduConnect)

Modern, responsive College & Campus Management Web Application built with **React 18, Vite, React Router 6, Axios, and Tailwind / Modern CSS**.

---

## 🚀 Features

- **Role-Based Authentication**: Secure JWT login with distinct portals for **Campus Administrator** and **Student**.
- **Admin Dashboard**: Real-time campus KPI counters, department stats, and attendance alerts.
- **Student Management**: Student directory with filters, registration, and profile editing.
- **Academic Subjects & Departments**: Subject allocation and faculty assignments.
- **Attendance Tracker**: Daily attendance logging with automatic threshold warnings (<75%).
- **Marks & Examination Portal**: Internal and semester marks entry with automatic grade calculation.
- **Student Portal**:
  - Personal profile & enrolled courses.
  - Subject-wise attendance visualizer with low-attendance warnings.
  - Semester grades breakdown and GPA calculator.
  - Printable official academic transcript export.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Set your backend API URL (default is `http://localhost:8080/api`):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. In [Vercel Dashboard](https://vercel.com/), click **Add New...** -> **Project** and import this repository.
3. Vercel automatically detects the **Vite** framework preset.
4. Add the Environment Variable:
   - `VITE_API_BASE_URL`: `https://<your-render-backend-name>.onrender.com/api`
5. Click **Deploy**.
