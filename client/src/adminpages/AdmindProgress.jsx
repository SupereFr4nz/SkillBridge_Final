import { useState } from "react";
import { useFetch } from "../api.js";
import { PageHead, Stat, Search, Badge, Donut, LogoutButton } from "../admincomponents/UI.jsx";

export default function AdmindProgress() {
  const { data: rows } = useFetch("/internships");
  const [q, setQ] = useState("");
  const shown = rows.filter((r) => (r.student + r.company + r.status).toLowerCase().includes(q.toLowerCase()));

  // Groups: 50%+ = on track, 1-49% = in progress, 0% = delayed (not started / behind).
  const onTrack = rows.filter((r) => r.progress >= 50).length;
  const inProgress = rows.filter((r) => r.progress > 0 && r.progress < 50).length;
  const delayed = rows.filter((r) => r.progress === 0).length;
  const overall = rows.length ? Math.round(rows.reduce((a, r) => a + r.progress, 0) / rows.length) : 0;

  return (
    <>
      <PageHead icon="📈" title="Progress" sub="Track and review the progress of your internship activities" action={<LogoutButton />} />
      <div className="stats five">
        <Stat icon="🎓" value={rows.length} label="Total students" sub="Active interns" />
        <Stat icon="🏢" color="var(--purple)" value={new Set(rows.map((r) => r.company)).size} label="Total companies" sub="Partner companies" />
        <Stat icon="✔" color="var(--green)" value={onTrack} label="On track" sub="Interns meeting progress" />
        <Stat icon="⏳" color="var(--orange)" value={inProgress} label="In progress" sub="Interns with ongoing tasks" />
        <Stat icon="⚠" color="var(--red)" value={delayed} label="Delayed" sub="Behind schedule" />
      </div>
      <div className="layout progress">
        <section className="panel highlight">
          <h3>Progress overview</h3>
          <small>Summary of overall progress across all students</small>
          <Donut
            percent={overall}
            label="Overall progress"
            segments={[
              { value: onTrack, color: "var(--green)" },
              { value: inProgress, color: "var(--orange)" },
              { value: delayed, color: "var(--red)" },
            ]}
          />
          <ul className="legend">
            <li className="g">On track ({onTrack})</li>
            <li className="o">In progress ({inProgress})</li>
            <li className="r">Delayed ({delayed})</li>
          </ul>
        </section>
        <section className="panel">
          <h3>Internship progress list</h3>
          <Search placeholder="Search by name, company or group…" value={q} onChange={setQ} />
          <table className="table">
            <thead><tr><th>Student</th><th>Company</th><th>Status</th><th>Progress</th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r._id}>
                  <td>{r.student}</td><td>{r.company}</td><td><Badge status={r.status} /></td>
                  <td>
                    <div className="bar"><i style={{ width: r.progress + "%" }} /></div>
                    <small>{r.progress}%</small>
                  </td>
                </tr>
              ))}
              {!shown.length && <tr><td colSpan="4" className="empty">No progress records found.</td></tr>}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}