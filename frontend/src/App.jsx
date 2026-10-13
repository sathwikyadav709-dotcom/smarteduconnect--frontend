import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import AttendanceManagement from './pages/admin/AttendanceManagement';
import MarksManagement from './pages/admin/MarksManagement';
import Reports from './pages/admin/Reports';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentSubjects from './pages/student/StudentSubjects';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMarks from './pages/student/StudentMarks';
import AcademicTranscript from './pages/student/AcademicTranscript';

// Layout wrapper for authenticated pages
const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-wrapper">
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Root index redirect based on user authentication state
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<StudentManagement />} />
              <Route path="/admin/subjects" element={<SubjectManagement />} />
              <Route path="/admin/attendance" element={<AttendanceManagement />} />
              <Route path="/admin/marks" element={<MarksManagement />} />
              <Route path="/admin/reports" element={<Reports />} />
            </Route>
          </Route>

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']} />}>
            <Route element={<AppLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/subjects" element={<StudentSubjects />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/marks" element={<StudentMarks />} />
              <Route path="/student/transcript" element={<AcademicTranscript />} />
            </Route>
          </Route>

          {/* Wildcard 404 redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
