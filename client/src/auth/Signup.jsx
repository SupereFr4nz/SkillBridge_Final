import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useFetch } from "../api.js";
import { useAuth, home } from "./AuthContext.jsx";
import AuthShell, { AuthField } from "./AuthShell.jsx";

// Admin sign up only. Students never sign up: an admin registers them and they log in with their Student ID.
export default function Signup() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const { data: info } = useFetch("/auth/signup-info", { open: true, codeRequired: false });
  const [f, setF] = useState({ name: "", email: "", password: "", confirm: "", code: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF({ ...f, [k]: v });

  if (user) return <Navigate to={home(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    if (f.password !== f.confirm) return setErr("Passwords don't match.");
    setBusy(true);
    setErr("");
    try {
      const u = await authenticate("/auth/signup", { name: f.name, email: f.email, password: f.password, code: f.code });
      navigate(home(u), { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <h1>Create Account</h1>
      <p className="a-sub">Admin accounts only</p>
      {!info.open ? (
        <>
          <p className="error" role="alert">Admin sign up is closed. Ask an existing admin for access.</p>
          <Link className="a-btn" to="/login">Back to log in</Link>
        </>
      ) : (
        <form onSubmit={submit}>
          <AuthField label="Full Name" icon="👤" placeholder="Enter your full name" value={f.name} onChange={set("name")} autoFocus />
          <AuthField label="Email" icon="✉" type="email" placeholder="Enter your email" value={f.email} onChange={set("email")} />
          <AuthField label="Password" icon="🔒" type="password" placeholder="Create a password (6+ characters)" value={f.password} onChange={set("password")} />
          <AuthField label="Confirm Password" icon="🔒" type="password" placeholder="Confirm your password" value={f.confirm} onChange={set("confirm")} />
          {info.codeRequired && <AuthField label="Admin code" icon="🔑" type="password" placeholder="Enter the admin code" value={f.code} onChange={set("code")} />}
          {err && <p className="error" role="alert">{err}</p>}
          <button className="a-btn" disabled={busy}>{busy ? "Creating…" : "Sign up →"}</button>
          <p className="a-foot">Already have an account? <Link className="a-link" to="/login">Log in</Link></p>
        </form>
      )}
    </AuthShell>
  );
}
