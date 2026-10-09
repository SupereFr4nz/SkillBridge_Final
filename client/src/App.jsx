import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, home } from "./auth/AuthContext.jsx";
import Login from "./auth/Login.jsx";
import Signup from "./auth/Signup.jsx";

import AdminNavbar from "./admincomponents/Navbar.jsx";
import AdminDashboard from "./adminpages/AdminDashboard.jsx";
import AdminStudent from "./adminpages/AdminStudent.jsx";
import AdminCompany from "./adminpages/AdminCompany.jsx";
import AdminAttendance from "./adminpages/AdminAttendance.jsx";
import AdmindProgress from "./adminpages/AdmindProgress.jsx";
import AdminInternship from "./adminpages/AdminInternship.jsx";
import AdminMessage from "./adminpages/AdminMessage.jsx";

import StudentNavbar from "./studentcomponents/StudentNavbar.jsx";
import StudentHome from "./studentpage/StudentHome.jsx";
import StudentAttendance from "./studentpage/StudentAttendance.jsx";
import StudentHours from "./studentpage/StudentHours.jsx";
import StudentMessage from "./studentpage/StudentMessage.jsx";

function LoadingScreen() {
  return (
    <main className="auth-loading" role="status" aria-label="Loading SkillBridge">
      <div className="auth-loading__content">
        <img className="auth-loading__logo" src="/icon.png" alt="SkillBridge" />
        <div className="auth-loading__bar" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}

// Guards a group of routes: must be logged in with the right role, then shows that role's navbar.
function Shell({ role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={home(user)} replace />;
  return (
    <div className="app">
      {role === "admin" ? <AdminNavbar /> : <StudentNavbar />}
      <main className="main"><Outlet /></main>
    </div>
  );
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? home(user) : "/login"} replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<Root />} />

      <Route element={<Shell role="admin" />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudent />} />
        <Route path="/admin/companies" element={<AdminCompany />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/progress" element={<AdmindProgress />} />
        <Route path="/admin/internship" element={<AdminInternship />} />
        <Route path="/admin/messages" element={<AdminMessage />} />
      </Route>

      <Route element={<Shell role="student" />}>
        <Route path="/student/home" element={<StudentHome />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/hours" element={<StudentHours />} />
        <Route path="/student/message" element={<StudentMessage />} />
      </Route>

      <Route path="*" element={<Root />} />
    </Routes>
  );
}
