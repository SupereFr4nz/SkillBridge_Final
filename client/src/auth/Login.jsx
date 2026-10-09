import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, home } from "./AuthContext.jsx";
import AuthShell, { AuthField } from "./AuthShell.jsx";

export default function Login() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("admin"); // "admin" | "student"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={home(user)} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const u = role === "admin"
        ? await authenticate("/auth/login", { email, password }, remember)
        : await authenticate("/auth/student-login", { studentId }, remember);
      navigate(home(u), { replace: true });
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <div className="a-tabs" role="tablist">
        {["admin", "student"].map((r) => (
          <button key={r} type="button" role="tab" aria-selected={role === r} className={role === r ? "on" : ""} onClick={() => { setRole(r); setErr(""); }}>
            {r === "admin" ? "Admin" : "Student"}
          </button>
        ))}
      </div>
      <h1>Welcome Back!</h1>
      <p className="a-sub">{role === "admin" ? "Log in to your SkillBridge account" : "Enter your Student ID to continue"}</p>
      <form onSubmit={submit}>
        {role === "admin" ? (
          <>
            <AuthField label="Email Address" icon="✉" type="email" placeholder="Enter your email address" value={email} onChange={setEmail} autoFocus />
            <AuthField label="Password" icon="🔒" type="password" placeholder="Enter your password" value={password} onChange={setPassword} />
          </>
        ) : (
          <AuthField label="Student ID" icon="🪪" placeholder="Enter your student ID" value={studentId} onChange={setStudentId} autoFocus />
        )}
        <div className="a-row">
          <label className="a-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
          {role === "admin" && (
            <button type="button" className="a-link" onClick={() => setNote("Password reset isn't available yet. Ask another admin for help.")}>Forgot password?</button>
          )}
        </div>
        {note && <p className="a-note">{note}</p>}
        {err && <p className="error" role="alert">{err}</p>}
        <button className="a-btn" disabled={busy}>{busy ? "Logging in…" : "Log in →"}</button>
      </form>
      {role === "admin" ? (
        <>
          <div className="a-or">or</div>
          <Link className="a-btn ghost" to="/signup">👤 Create Account</Link>
        </>
      ) : (
        <p className="a-foot">No sign up needed. Your coordinator registers your Student ID.</p>
      )}
    </AuthShell>
  );
}
