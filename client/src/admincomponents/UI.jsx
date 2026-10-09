import { useAuth } from "../auth/AuthContext.jsx";

// Small shared pieces used by every admin page.
export function PageHead({ icon, title, sub, action }) {
  return (
    <div className="page-head">
      <span className="icon-box">{icon}</span>
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

export function Stat({ icon, color = "var(--accent)", value, label, sub }) {
  return (
    <div className="stat">
      <span className="icon-box" style={{ background: color }}>{icon}</span>
      <div>
        <strong>{value}</strong>
        <small>{label}</small>
        {sub && <em>{sub}</em>}
      </div>
    </div>
  );
}

export function Search({ placeholder, value, onChange }) {
  return (
    <input className="input search" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

export function Badge({ status }) {
  return <span className={"badge " + status.toLowerCase()}>{status}</span>;
}

export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Modal({ title, sub, icon, onClose, children, wide }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className={"modal" + (wide ? " wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="icon-box">{icon}</span>
          <div>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ModalActions({ onCancel, saveLabel, onSave }) {
  return (
    <div className="modal-actions">
      <button className="btn ghost" onClick={onCancel}>Cancel</button>
      <button className="btn" onClick={onSave}>{saveLabel}</button>
    </div>
  );
}

export function Donut({ percent, label, segments }) {
  // Optional segments: [{ value, color }] draw a multi-colour ring; without them the ring fills to `percent`.
  let background;
  const total = segments ? segments.reduce((a, s) => a + s.value, 0) : 0;
  if (total) {
    let at = 0;
    const stops = segments.filter((s) => s.value).map((s) => {
      const from = at;
      at += (s.value / total) * 100;
      return `${s.color} ${from}% ${at}%`;
    });
    background = `conic-gradient(${stops.join(", ")})`;
  }
  return (
    <div className="donut" style={{ "--p": percent, ...(background && { background }) }}>
      <div><strong>{percent}%</strong><small>{label}</small></div>
    </div>
  );
}

export function LogoutButton() {
  const { logout } = useAuth();
  return <button className="btn right" onClick={logout}>Log out</button>;
}