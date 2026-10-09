import { useState } from "react";
import Logo from "./Logo.jsx";
import "./Auth.css";

// Two-column layout from the design: logo on the left, form card on the right.
export default function AuthShell({ children }) {
  return (
    <div className="auth">
       <img src="/icon.png" alt="SkillBridge Logo" className="auth-logo" />
      <section className="auth-card">{children}</section>
    </div>
  );
}

export function AuthField({ label, icon, type = "text", value, onChange, placeholder, autoFocus }) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <label className="a-field">
      <span>{label}</span>
      <div className="a-input">
        <i aria-hidden="true">{icon}</i>
        <input type={isPw && show ? "text" : type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} required />
        {isPw && (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>{show ? "🙈" : "👁"}</button>
        )}
      </div>
    </label>
  );
}
