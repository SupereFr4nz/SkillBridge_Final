import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHead, Stat, Badge, Field, Modal, ModalActions, LogoutButton } from "../admincomponents/UI.jsx";
import { api, useFetch } from "../api.js";
import { fmtDate } from "../studentcomponents/AttendanceCalendar.jsx";

const REQUIRED = 500;
const PAGE_SIZE = 5;
const sum = (list) => +list.reduce((a, r) => a + r.hours, 0).toFixed(2);

export default function StudentHours() {
  const navigate = useNavigate();
  const { data: logs, reload: reloadLogs } = useFetch("/hours/me");
  const { data: att, reload: reloadAtt } = useFetch("/attendance/me");
  const { data: internships } = useFetch("/internships/me");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // "in" | "out"
  const [studentId, setStudentId] = useState("");
  const [err, setErr] = useState("");

  const current = internships.find((i) => i.status === "Active") || internships[0];
  const todayStr = new Date().toLocaleDateString("en-CA");
  const todayRec = att.find((r) => r.date === todayStr);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

  const total = sum(logs);
  const month = sum(logs.filter((r) => r.date.slice(0, 7) === todayStr.slice(0, 7)));
  const week = sum(logs.filter((r) => new Date(r.date) > weekAgo));
  const pages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const rows = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const close = () => { setModal(null); setStudentId(""); setErr(""); };
  const submit = async () => {
    if (!studentId.trim()) return setErr("Enter your student ID.");
    try {
      await api(modal === "in" ? "/attendance/time-in" : "/attendance/time-out", { method: "POST", body: { studentId: studentId.trim() } });
      await Promise.all([reloadLogs(), reloadAtt()]);
      setPage(1);
      close();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <>
      <PageHead icon="🕘" title="Internship Hours" sub="Track your logged hours and stay on schedule" action={<LogoutButton />} />
      <div className="stats four">
        <Stat icon="⏱" value={`${total} / ${REQUIRED}`} label="Total hours" />
        <Stat icon="📅" color="var(--green)" value={`${month} hours`} label="This month" />
        <Stat icon="🗓" color="var(--purple)" value={`${week} hours`} label="This week" />
        <Stat icon="⏳" color="var(--orange)" value={`${Math.max(0, +(REQUIRED - total).toFixed(2))} hours`} label="Remaining" />
      </div>
      <div className="layout">
        <section className="panel">
          <h3>Internship hours log</h3>
          <small>Detailed list of each logged day and its approval status.</small>
          <table className="table">
            <thead><tr><th>#</th><th>Date</th><th>Hours</th><th>Activity / task</th><th>Supervisor</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r._id}>
                  <td>{(page - 1) * PAGE_SIZE + i + 1}</td><td>{fmtDate(r.date)}</td><td>{r.hours}</td><td>{r.task}</td><td>{r.supervisor}</td>
                  <td><Badge status={r.status} /></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="6" className="empty">No hours logged yet. Time in, then time out when you finish.</td></tr>}
            </tbody>
          </table>
          <div className="pager">
            <small>Page {page} of {pages}</small>
            <button className="btn ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="btn ghost" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </section>
        <aside className="side-col">
          <section className="panel">
            <h3>Current internship details</h3>
            {current ? (
              <dl>
                <dt>Company</dt><dd>{current.company}</dd>
                <dt>Position</dt><dd>{current.position}</dd>
                <dt>Start date</dt><dd>{fmtDate(current.start)}</dd>
                <dt>End date</dt><dd>{fmtDate(current.end)}</dd>
              </dl>
            ) : <p className="empty">No internship assigned yet.</p>}
          </section>
          <section className="panel">
            <h3>Quick actions</h3>
            {todayRec && !todayRec.out && <small>Timed in at {todayRec.in}</small>}
            <button className="btn ghost block" onClick={() => setModal("in")}>Time in</button>
            <button className="btn ghost block" onClick={() => setModal("out")}>Time out</button>
            <button className="btn ghost block" onClick={() => navigate("/student/message")}>Contact supervisor</button>
          </section>
        </aside>
      </div>

      {modal && (
        <Modal icon="🕘" title={modal === "in" ? "Time in" : "Time out"} onClose={close}>
          <Field label="Student ID">
            <input className="input" value={studentId} onChange={(e) => { setStudentId(e.target.value); setErr(""); }} autoFocus />
          </Field>
          {err && <p className="error" role="alert">{err}</p>}
          <ModalActions onCancel={close} saveLabel="Submit" onSave={submit} />
        </Modal>
      )}
    </>
  );
}
