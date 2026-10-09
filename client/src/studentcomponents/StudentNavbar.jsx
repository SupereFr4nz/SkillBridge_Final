import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "../admincomponents/Navbar.css";

const links = [
  ["Home", "/student/home", "🏠"],
  ["Attendance", "/student/attendance", "🗓"],
  ["Hours", "/student/hours", "🕘"],
  ["Message", "/student/message", "💬"],
];

export default function StudentNavbar() {
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
            <small>Student</small>
          </div>
          <span className="chip chip-solid">Student</span>
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
