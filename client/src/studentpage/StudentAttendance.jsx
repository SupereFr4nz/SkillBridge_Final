import { useState } from "react";
import { PageHead, Stat, LogoutButton } from "../admincomponents/UI.jsx";
import { useFetch } from "../api.js";
import AttendanceCalendar, { fmtDate } from "../studentcomponents/AttendanceCalendar.jsx";

export default function StudentAttendance() {
  const { data: records } = useFetch("/attendance/me");
  const [picked, setPicked] = useState(null);
  const count = (s) => records.filter((r) => r.status === s).length;
  const shown = picked ? records.filter((r) => r.date === picked) : [...records].reverse();

  return (
    <>
      <PageHead icon="🗓" title="Attendance" sub="Your attendance for this internship" action={<LogoutButton />} />
      <div className="layout wide-left">
        <section className="panel">
          <h3>Attendance calendar</h3>
          <small>Click on a date to view details.</small>
          <AttendanceCalendar records={records} selected={picked} onPick={setPicked} />
        </section>
        <div>
          <div className="stats four">
            <Stat icon="✔" color="var(--green)" value={`${count("Present")} days`} label="Present" />
            <Stat icon="✖" color="var(--red)" value={`${count("Absent")} days`} label="Absent" />
            <Stat icon="⏰" color="var(--orange)" value={`${count("Late")} days`} label="Late" />
            <Stat icon="🗓" value={`${records.length} days`} label="Total days" />
          </div>
          <section className="panel">
            <h3>Attendance records</h3>
            <small>Detailed list of your attendance.</small>
            <div className="scroll">
              <table className="table">
                <thead><tr><th>Date</th><th>Status</th><th>Check in</th><th>Check out</th><th>Remarks</th></tr></thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r._id}>
                      <td>{fmtDate(r.date)}</td>
                      <td><span className={"badge " + r.status.toLowerCase()}>{r.status}</span></td>
                      <td>{r.in || "—"}</td><td>{r.out || "—"}</td><td>{r.remarks || "–"}</td>
                    </tr>
                  ))}
                  {!shown.length && <tr><td colSpan="5" className="empty">No record yet. Time in on the Hours page to start.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
