import { useState } from "react";
import { useFetch, api } from "../api.js";
import { PageHead, Stat, Search, Badge, Field, Modal, ModalActions } from "../admincomponents/UI.jsx";
import { fmtDate } from "../studentcomponents/AttendanceCalendar.jsx";

const empty = { name: "", studentId: "", course: "", year: "", email: "", phone: "", gender: "", dob: "", address: "" };

export default function AdminStudent() {
  const { data: students, reload } = useFetch("/students");
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null); // "add" | student object
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const shown = students.filter((s) => (s.name + s.studentId + s.course).toLowerCase().includes(q.toLowerCase()));
  const exportList = () => {
    const escapeCell = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const headers = ["#", "Student name", "Student ID", "Course", "Year level", "Status"];
    const csv = [
      headers.map(escapeCell).join(","),
      ...students.map((student, index) => [
        index + 1, student.name, student.studentId, student.course, student.year, student.status,
      ].map(escapeCell).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "students.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const save = async () => {
    if (!form.name || !form.studentId) return;
    try {
      await api("/students", { method: "POST", body: form });
      await reload();
      setForm(empty);
      setModal(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <PageHead icon="🎓" title="Student" sub="Manage student internship activities" />
      <div className="layout">
        <div>
          <div className="stats three">
            <Stat icon="🎓" value={students.length} label="Total students" />
            <Stat icon="✔" color="var(--green)" value={students.filter((s) => s.status === "Active").length} label="Active interns" />
            <Stat icon="⏳" color="var(--orange)" value={students.filter((s) => s.status === "Pending").length} label="Pending" />
          </div>
          <section className="panel">
            <Search placeholder="Search student by name, student ID or course…" value={q} onChange={setQ} />
            <table className="table">
              <thead><tr><th>#</th><th>Student name</th><th>Student ID</th><th>Course</th><th>Year level</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {shown.map((s, i) => (
                  <tr key={s.studentId}>
                    <td>{i + 1}</td><td>{s.name}</td><td>{s.studentId}</td><td>{s.course}</td><td>{s.year}</td>
                    <td><Badge status={s.status} /></td>
                    <td><button className="icon-btn" onClick={() => setModal(s)} aria-label={`View ${s.name}`}>👁</button></td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan="7" className="empty">No students match your search.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>
        <aside className="side-col">
          <section className="panel">
            <h3>Recent activity</h3>
            {students.slice(0, 3).map((s) => (
              <div className="activity" key={s.studentId}><span className="avatar" /><div><b>New student registered</b><small>{s.name}</small></div></div>
            ))}
          </section>
          <section className="panel">
            <h3>Quick actions</h3>
            <button className="btn block" onClick={() => setModal("add")}>Add new student</button>
            <button className="btn ghost block" onClick={exportList}>Export student list</button>
          </section>
        </aside>
      </div>

      {modal === "add" && (
        <Modal icon="👤" title="Add Student" sub="Fill in the details below to register a new student in the internship program." onClose={() => setModal(null)}>
          <div className="form-cols">
            <div>
              <Field label="Full name"><input className="input" value={form.name} onChange={set("name")} /></Field>
              <Field label="Student ID"><input className="input" value={form.studentId} onChange={set("studentId")} /></Field>
              <Field label="Course"><input className="input" value={form.course} onChange={set("course")} /></Field>
              <Field label="Year level"><input className="input" value={form.year} onChange={set("year")} /></Field>
              <Field label="Email address"><input className="input" type="email" value={form.email} onChange={set("email")} /></Field>
            </div>
            <div>
              <Field label="Phone number"><input className="input" value={form.phone} onChange={set("phone")} /></Field>
              <Field label="Gender"><input className="input" value={form.gender} onChange={set("gender")} /></Field>
              <Field label="Date of birth"><input className="input" type="date" value={form.dob} onChange={set("dob")} /></Field>
              <Field label="Address"><textarea className="input" rows="4" value={form.address} onChange={set("address")} /></Field>
            </div>
          </div>
          <ModalActions onCancel={() => setModal(null)} saveLabel="Save student" onSave={save} />
        </Modal>
      )}

      {modal && modal !== "add" && <StudentView student={modal} onClose={() => setModal(null)} />}
    </>
  );
}

const REQUIRED_HOURS = 500;

// Same numbers the student sees on their own pages.
function StudentView({ student, onClose }) {
  const { data: sum } = useFetch(`/students/${student._id}/summary`, null);
  const loaded = sum !== null;
  const { internship, attendance = {}, hours = 0 } = sum || {};
  const pct = Math.min(100, Math.round((hours / REQUIRED_HOURS) * 100));

  return (
    <Modal icon="👤" title={student.name} sub={student.course ? `Course: ${student.course}` : "Course not set"} wide onClose={onClose}>
      <div className="detail-grid">
        <div className="panel"><h3>Student profile</h3><dl>
          <dt>Student ID</dt><dd>{student.studentId}</dd>
          <dt>Year level</dt><dd>{student.year || "—"}</dd>
          <dt>Email address</dt><dd>{student.email || "—"}</dd>
          <dt>Phone number</dt><dd>{student.phone || "—"}</dd></dl></div>
        <div className="panel"><h3>Internship program</h3>
          {!loaded ? <small>Loading…</small> : internship ? (
            <>
              <dl>
                <dt>Assigned company</dt><dd>{internship.company}</dd>
                <dt>Position</dt><dd>{internship.position}</dd>
                <dt>Duration</dt><dd>{fmtDate(internship.start)} – {fmtDate(internship.end)}</dd>
                <dt>Mandatory hours</dt><dd>{hours} / {REQUIRED_HOURS} ({pct}%)</dd></dl>
              <div className="bar"><i style={{ width: pct + "%" }} /></div>
            </>
          ) : <p className="empty">No internship assigned yet.</p>}
        </div>
        <div className="panel"><h3>Attendance metrics</h3>
          {loaded ? (
            <dl>
              <dt className="ok">Days present</dt><dd>{attendance.present}</dd>
              <dt className="bad">Days absent</dt><dd>{attendance.absent}</dd>
              <dt className="warn">Days late</dt><dd>{attendance.late}</dd></dl>
          ) : <small>Loading…</small>}
        </div>
      </div>
      <div className="modal-actions"><button className="btn" onClick={onClose}>Close</button></div>
    </Modal>
  );
}