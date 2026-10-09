import { useState } from "react";
import { useFetch, api } from "../api.js";
import { PageHead, Stat, Search, Badge, Field, Modal, ModalActions, Donut } from "../admincomponents/UI.jsx";

const blank = { student: "", studentId: "", company: "", start: "", end: "", status: "Active", notes: "" };

export default function AdminInternship() {
  const { data: rows, reload } = useFetch("/internships");
  const { data: students } = useFetch("/students");
  const { data: companyList } = useFetch("/companies");
  const companies = companyList.map((c) => c.name);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null); // "add" | row being edited
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const shown = rows.filter((r) => (r.student + r.company).toLowerCase().includes(q.toLowerCase()));
  const active = rows.filter((r) => r.status === "Active").length;
  const percent = rows.length ? Math.round((active / rows.length) * 100) : 0;

  const openAdd = () => { setForm(blank); setModal("add"); };
  const openEdit = (r) => { setForm(r); setModal(r); };
  const exportList = () => {
    const escapeCell = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const headers = ["Student name", "Company", "Start", "End", "Status"];
    const csv = [
      headers.map(escapeCell).join(","),
      ...rows.map((r) => [r.student, r.company, r.start, r.end, r.status].map(escapeCell).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "internships.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const save = async () => {
    if (!form.student || !form.company) return;
    try {
      const { _id, ...body } = form;
      await api(modal === "add" ? "/internships" : `/internships/${_id}`, { method: modal === "add" ? "POST" : "PUT", body });
      await reload();
      setModal(null);
    } catch (e) {
      alert(e.message);
    }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this internship?")) return;
    try {
      await api(`/internships/${id}`, { method: "DELETE" });
      await reload();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <PageHead icon="⏳" title="Internship" sub="Manage student internship activities" />
      <div className="layout">
        <div>
          <div className="stats three">
            <Stat icon="🎓" value={rows.length} label="Total internships" />
            <Stat icon="✔" color="var(--purple)" value={active} label="Active interns" />
            <Stat icon="⏳" color="var(--orange)" value={rows.length - active} label="Pending" />
          </div>
          <section className="panel">
            <Search placeholder="Search by student name, student ID or course…" value={q} onChange={setQ} />
            <table className="table">
              <thead><tr><th>#</th><th>Student name</th><th>Company</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {shown.map((r, i) => (
                  <tr key={r._id}>
                    <td>{i + 1}</td><td>{r.student}</td><td>{r.company}</td><td>{r.start}</td><td>{r.end}</td>
                    <td><Badge status={r.status} /></td>
                    <td className="actions">
                      <button className="icon-btn" onClick={() => openEdit(r)} aria-label="Edit">✏️</button>
                      <button className="icon-btn" onClick={() => remove(r._id)} aria-label="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
                {!shown.length && <tr><td colSpan="7" className="empty">No internships found. Add one to get started.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>
        <aside className="side-col">
          <section className="panel">
            <h3>Status overview</h3>
            <Donut percent={percent} label="Active" />
            <ul className="legend"><li className="g">Active</li><li className="o">Pending</li><li className="p">Completed</li></ul>
          </section>
          <section className="panel">
            <h3>Quick actions</h3>
            <button className="btn block" onClick={openAdd}>Add internship</button>
            <button className="btn ghost block" onClick={exportList}>Export list</button>
          </section>
        </aside>
      </div>

      {modal === "add" && (
        <Modal icon="⏳" title="Add Internship" sub="Fill in the details below to register a new student in the internship program." wide onClose={() => setModal(null)}>
          <div className="form-cols">
            <section className="panel"><h3>Select student</h3>
              {students.map((s) => (
                <label key={s._id} className="pick"><input type="radio" name="student" checked={form.studentId === s.studentId} onChange={() => setForm({ ...form, student: s.name, studentId: s.studentId })} /> {s.name}</label>
              ))}</section>
            <section className="panel"><h3>Select company</h3>
              {companies.map((c) => (
                <label key={c} className="pick"><input type="radio" name="company" checked={form.company === c} onChange={() => setForm({ ...form, company: c })} /> {c}</label>
              ))}</section>
          </div>
          <div className="form-cols">
            <div>
              <Field label="Start date"><input className="input" type="date" value={form.start} onChange={set("start")} /></Field>
              <Field label="End date"><input className="input" type="date" value={form.end} onChange={set("end")} /></Field>
              <Field label="Notes (optional)"><textarea className="input" rows="2" value={form.notes} onChange={set("notes")} /></Field>
            </div>
            <section className="panel"><h3>Assignment summary</h3><dl>
              <dt>Student</dt><dd>{form.student || "—"}</dd><dt>Company</dt><dd>{form.company || "—"}</dd><dt>Status</dt><dd>{form.status}</dd></dl>
              <button className="btn block" onClick={save}>Assign internship</button></section>
          </div>
          <ModalActions onCancel={() => setModal(null)} saveLabel="Save" onSave={save} />
        </Modal>
      )}

      {modal && modal !== "add" && (
        <Modal icon="✏️" title="Edit Internship" onClose={() => setModal(null)}>
          <Field label="Student name"><input className="input" value={form.student} onChange={set("student")} /></Field>
          <Field label="Company"><input className="input" value={form.company} onChange={set("company")} /></Field>
          <div className="form-cols">
            <Field label="Start date"><input className="input" type="date" value={form.start} onChange={set("start")} /></Field>
            <Field label="End date"><input className="input" type="date" value={form.end} onChange={set("end")} /></Field>
          </div>
          <Field label="Status">
            <select className="input" value={form.status} onChange={set("status")}>
              <option>Active</option><option>Pending</option><option>Completed</option>
            </select>
          </Field>
          <Field label="Progress (%)">
            <input className="input" type="number" min="0" max="100" value={form.progress ?? 0}
              onChange={(e) => setForm({ ...form, progress: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} />
          </Field>
          <ModalActions onCancel={() => setModal(null)} saveLabel="Save changes" onSave={save} />
        </Modal>
      )}
    </>
  );
}