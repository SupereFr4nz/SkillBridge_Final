import { useState } from "react";
import { useFetch, api } from "../api.js";
import { PageHead, Stat, LogoutButton } from "../admincomponents/UI.jsx";

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function AdminAttendance() {
  const { data } = useFetch("/attendance");
  const records = data;
  const [picked, setPicked] = useState(null);
  const [month] = useState({ label: "September 2026", offset: 2, length: 30 }); // Sep 1, 2026 is a Tuesday
  const cells = [...Array(month.offset).fill(null), ...Array.from({ length: month.length }, (_, i) => i + 1)];
  const shown = picked ? records.filter((r) => r.date === `2026-09-${String(picked).padStart(2, "0")}`) : records;

  return (
    <>
      <PageHead icon="🗓" title="Attendance" sub="Track and monitor student attendance" action={<LogoutButton />} />
      <div className="layout wide-left">
        <section className="panel">
          <h3>Attendance calendar</h3>
          <small>Click on a date to view details.</small>
          <div className="cal-title">{month.label}</div>
          <div className="cal">
            {days.map((d) => <b key={d}>{d}</b>)}
            {cells.map((d, i) => d
              ? <button key={i} className={picked === d ? "sel" : ""} onClick={() => setPicked(picked === d ? null : d)}>{d}</button>
              : <span key={i} />)}
          </div>
        </section>
        <div>
          <div className="stats four">
            <Stat icon="✔" color="var(--green)" value={`${records.filter((r) => r.status === "Present").length} days`} label="Present" />
            <Stat icon="✖" color="var(--red)" value={`${records.filter((r) => r.status === "Absent").length} days`} label="Absent" />
            <Stat icon="⏰" color="var(--orange)" value={`${records.filter((r) => r.status === "Late").length} days`} label="Late" />
            <Stat icon="🗓" value={records.length} label="Total records" />
          </div>
          <section className="panel">
            <h3>Attendance records</h3>
            <table className="table">
              <thead><tr><th>Student</th><th>Date</th><th>Status</th><th>Check in</th><th>Check out</th><th>Remarks</th></tr></thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r._id}><td>{r.name}</td><td>{r.date}</td><td><span className={"badge " + r.status.toLowerCase()}>{r.status}</span></td><td>{r.in}</td><td>{r.out}</td><td>{r.remarks}</td></tr>
                ))}
                {!shown.length && <tr><td colSpan="6" className="empty">No record for this date.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </>
  );
}
