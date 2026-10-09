import { useState } from "react";
import { useFetch, api } from "../api.js";
import { PageHead, Stat, Search, Badge, Field, Modal, ModalActions } from "../admincomponents/UI.jsx";
import { fmtDate } from "../studentcomponents/AttendanceCalendar.jsx";

const empty = { name: "", phone: "", email: "", address: "", contact: "", cPhone: "", cEmail: "", interns: "", description: "" };

export default function AdminCompany() {
  const { data: companies, reload } = useFetch("/companies");
  const { data: internships } = useFetch("/internships");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null); // "add" | "view"
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Everything about a company's interns comes from the real internships list.
  const infoFor = (name) => {
    const mine = internships.filter((i) => i.company === name);
    const active = mine.filter((i) => i.status === "Active").length;
    return { mine, active, total: mine.length, status: active ? "Active" : "Pending" };
  };
  const selected = companies.find((c) => c._id === selectedId);
  const sel = selected && infoFor(selected.name);

  const shown = companies.filter((c) => (c.name + c.location + c.email).toLowerCase().includes(q.toLowerCase()));
  const exportList = () => {
    const escapeCell = (value) => {
      const text = String(value ?? "");
      const safeText = /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const headers = ["#", "Company name", "Location", "Contact person", "Email", "Active interns", "Status"];
    const csv = [
      headers.map(escapeCell).join(","),
      ...companies.map((company, index) => {
        const info = infoFor(company.name);
        return [index + 1, company.name, company.location, company.contact, company.email, info.active, info.status]
          .map(escapeCell)
          .join(",");
      }),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "companies.csv";
    link.click();
    URL.revokeObjectURL(url);
  };
  const save = async () => {
    if (!form.name) return;
    const body = {
      name: form.name, location: form.address || "—", email: form.email, phone: form.phone,
      contact: form.contact || "—", contactPhone: form.cPhone, contactEmail: form.cEmail,
      interns: Number(form.interns) || 0, description: form.description,
    };
    try {
      await api("/companies", { method: "POST", body });
      await reload();
      setForm(empty);
      setModal(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <>
      <PageHead icon="🏢" title="Companies" sub="Manage and monitor internship activities" />
      <div className="layout">
        <div>
          <div className="stats three">
            <Stat icon="🏢" value={companies.length} label="Total companies" />
            <Stat icon="🤝" color="var(--green)" value={companies.filter((c) => infoFor(c.name).active > 0).length} label="Active partnerships" />
            <Stat icon="🎓" color="var(--purple)" value={internships.length} label="Total interns" />
          </div>
          <section className="panel">
            <Search placeholder="Search company by name, location or email…" value={q} onChange={setQ} />
            <table className="table">
              <thead><tr><th>#</th><th>Company name</th><th>Location</th><th>Contact person</th><th>Email</th><th>Active interns</th><th>Status</th></tr></thead>
              <tbody>
                {shown.map((c, i) => {
                  const info = infoFor(c.name);
                  return (
                    <tr key={c._id} className="click" onClick={() => setSelectedId(c._id)}>
                      <td>{i + 1}</td><td>{c.name}</td><td>{c.location}</td><td>{c.contact}</td><td>{c.email}</td><td>{info.active}</td>
                      <td><Badge status={info.status} /></td>
                    </tr>
                  );
                })}
                {!shown.length && <tr><td colSpan="7" className="empty">No companies match your search.</td></tr>}
              </tbody>
            </table>
          </section>
        </div>
        <aside className="side-col">
          <section className="panel">
            <h3>Company details</h3>
            {selected ? (
              <>
                <p><b>{selected.name}</b><br /><small>{selected.location}</small></p>
                <div className="mini-stats">
                  <span><b>{sel.active}</b>Active</span><span><b>{sel.total}</b>Total</span><span><b>{selected.interns}</b>Slots</span>
                </div>
                <button className="btn ghost block" onClick={() => setModal("view")}>View full profile</button>
              </>
            ) : <p className="empty">Select a company to see its details.</p>}
          </section>
          <section className="panel">
            <h3>Quick actions</h3>
            <button className="btn block" onClick={() => setModal("add")}>Add new company</button>
            <button className="btn ghost block" onClick={exportList}>Export company list</button>
          </section>
        </aside>
      </div>

      {modal === "add" && (
        <Modal icon="🏢" title="Add Company" sub="Register a new partner company in the internship program." wide onClose={() => setModal(null)}>
          <fieldset><legend>Company information</legend><div className="form-cols">
            <Field label="Company name"><input className="input" value={form.name} onChange={set("name")} /></Field>
            <Field label="Phone number"><input className="input" value={form.phone} onChange={set("phone")} /></Field>
            <Field label="Email address"><input className="input" value={form.email} onChange={set("email")} /></Field>
            <Field label="Company address"><input className="input" value={form.address} onChange={set("address")} /></Field>
          </div></fieldset>
          <fieldset><legend>Contact person</legend><div className="form-cols">
            <Field label="Full name"><input className="input" value={form.contact} onChange={set("contact")} /></Field>
            <Field label="Phone number"><input className="input" value={form.cPhone} onChange={set("cPhone")} /></Field>
            <Field label="Email address"><input className="input" value={form.cEmail} onChange={set("cEmail")} /></Field>
          </div></fieldset>
          <fieldset><legend>Additional information</legend><div className="form-cols">
            <Field label="Intern slots (how many interns they can take)"><input className="input" type="number" min="0" value={form.interns} onChange={set("interns")} /></Field>
            <Field label="Internship program / description"><input className="input" value={form.description} onChange={set("description")} /></Field>
          </div></fieldset>
          <ModalActions onCancel={() => setModal(null)} saveLabel="Save company" onSave={save} />
        </Modal>
      )}

      {modal === "view" && selected && (
        <Modal icon="🏢" title={selected.name} sub={selected.description || "Partner company"} wide onClose={() => setModal(null)}>
          <div className="detail-grid">
            <div className="panel"><h3>Company information</h3><dl>
              <dt>Status</dt><dd><Badge status={sel.status} /></dd>
              <dt>Phone</dt><dd>{selected.phone || "—"}</dd>
              <dt>Email</dt><dd>{selected.email || "—"}</dd>
              <dt>Location</dt><dd>{selected.location}</dd></dl></div>
            <div className="panel"><h3>Company statistics</h3>
              <div className="mini-stats">
                <span><b>{sel.active}</b>Active interns</span><span><b>{sel.total}</b>Total assigned</span><span><b>{selected.interns}</b>Slots</span>
              </div>
              <h3>Contact person</h3><dl>
                <dt>Full name</dt><dd>{selected.contact}</dd>
                <dt>Phone</dt><dd>{selected.contactPhone || "—"}</dd>
                <dt>Email</dt><dd>{selected.contactEmail || "—"}</dd></dl></div>
            <div className="panel"><h3>Recent activity</h3>
              {sel.mine.slice(0, 4).map((i) => (
                <div className="activity" key={i._id}>
                  <span className="avatar" />
                  <div><b>{i.student}</b><small>{i.position} · from {fmtDate(i.start)} · {i.status}</small></div>
                </div>
              ))}
              {!sel.mine.length && <p className="empty">No interns assigned yet.</p>}
            </div>
          </div>
          <div className="modal-actions"><button className="btn" onClick={() => setModal(null)}>Close</button></div>
        </Modal>
      )}
    </>
  );
}