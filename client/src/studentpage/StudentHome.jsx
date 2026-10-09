import { useState } from "react";
import { Stat, Badge, LogoutButton } from "../admincomponents/UI.jsx";
import { useFetch } from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import AttendanceCalendar, { fmtDate } from "../studentcomponents/AttendanceCalendar.jsx";

export default function StudentHome() {
  const { user } = useAuth();
  const { data: internships } = useFetch("/internships/me");
  const { data: records } = useFetch("/attendance/me");
  const [picked, setPicked] = useState(null);

  const current = internships.find((i) => i.status === "Active") || internships[0];
  const daysLeft = current ? Math.max(0, Math.ceil((new Date(current.end) - new Date()) / 864e5)) : 0;
  const count = (s) => internships.filter((i) => i.status === s).length;
  const pickedRec = picked && records.find((r) => r.date === picked);

  return (
    <>
      <div className="page-head">
        <h1>Welcome back, {user.name.split(" ")[0]}</h1>
        <LogoutButton />
      </div>
      <div className="stats four">
        <Stat icon="👥" value={internships.length} label="Total application" />
        <Stat icon="◎" color="var(--green)" value={count("Active")} label="Active internship" />
        <Stat icon="✔" color="var(--purple)" value={count("Completed")} label="Completed" />
        <Stat icon="📅" color="var(--orange)" value={`${daysLeft} days`} label="End date" />
      </div>
      <div className="layout wide-left">
        <section className="panel">
          <h3>Attendance calendar</h3>
          <small>Click on a date to view details.</small>
          <AttendanceCalendar records={records} selected={picked} onPick={setPicked} />
          {picked && <p style={{ marginTop: 10 }}>{fmtDate(picked)}: <b>{pickedRec ? pickedRec.status : "No record"}</b></p>}
        </section>
        <div>
          <section className="panel">
            <h3>My internship</h3>
            <small>Track your internship details and progress</small>
            {current ? (
              <div className="internship-card">
                <span className="avatar big" />
                <div>
                  <b>{current.company}</b>
                  <small>{current.position}<br />{fmtDate(current.start)} – {fmtDate(current.end)}</small>
                </div>
                <Badge status={current.status} />
              </div>
            ) : (
              <p className="empty">No internship assigned yet. Your coordinator will add it soon.</p>
            )}
          </section>
          <section className="panel">
            <h3>Recent internship activity</h3>
            <small>Latest updates and activities</small>
            <table className="table">
              <thead><tr><th>Date</th><th>Company</th><th>Position</th><th>Status</th></tr></thead>
              <tbody>
                {internships.map((a) => (
                  <tr key={a._id}><td>{fmtDate(a.start)}</td><td>{a.company}</td><td>{a.position}</td><td><Badge status={a.status} /></td></tr>
                ))}
                {!internships.length && <tr><td colSpan="4" className="empty">No activity yet.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
