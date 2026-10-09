import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "./Navbar.css";


const links = [
  ["Home", "/admin/dashboard", "🏠"],
  ["Students", "/admin/students", "🎓"],
  ["Companies", "/admin/companies", "🏢"],
  ["Attendance", "/admin/attendance", "🗓"],
  ["Progress", "/admin/progress", "📈"],
  ["Internship", "/admin/internship", "⏳"],
  ["Message", "/admin/messages", "💬"],
];

export default function Navbar() {
  const { user } = useAuth();
  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img src="/icon.png" alt="SkillBridge Logo" className="brand-mark" />
          <span><b>Skill</b>Bridge</span>
        </div>
        <div className="topbar-user">
          <div>
            <strong>{user.name}</strong>
            <small>Administrator</small>
          </div>
          <span className="chip chip-solid">Admin</span>
        </div>
      </header>
      <aside className="sidebar">
        {links.map(([label, to, icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) => "side-link" + (isActive ? " active" : "")}>
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </aside>
    </>
  );
}
