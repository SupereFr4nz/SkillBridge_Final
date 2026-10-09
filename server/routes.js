import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { User, Student, Company, Internship, Attendance, HoursLog, Message } from "./models.js";
import { sign, requireAuth, requireRole } from "./auth.js";

const r = Router();
const admin = [requireAuth, requireRole("admin")];
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const httpErr = (status, message) => Object.assign(new Error(message), { status });
const pub = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, studentId: u.studentId });
const clean = ({ _id, createdAt, updatedAt, __v, ...rest }) => rest;

const TZ = process.env.APP_TIMEZONE || "Asia/Manila";
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD
const clock = () => new Date().toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });
const minutesNow = () => {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).split(":");
  return +h * 60 + +m;
};

// ---- Auth ----
// Admins sign up / log in with email + password. Students log in with their Student ID only,
// and only if an admin has registered that ID first.
const studentUser = async (s) =>
  (await User.findOne({ studentId: s.studentId })) ||
  User.create({ name: s.name, email: `${s.studentId}@students.local`, password: await bcrypt.hash(crypto.randomUUID(), 10), role: "student", studentId: s.studentId });

r.get("/auth/signup-info", wrap(async (_q, res) => {
  const codeRequired = !!process.env.ADMIN_SIGNUP_CODE;
  res.json({ codeRequired, open: codeRequired || !(await User.exists({ role: "admin" })) });
}));
r.post("/auth/signup", wrap(async (q, res) => {
  const { name = "", email = "", password = "", code = "" } = q.body;
  const needCode = process.env.ADMIN_SIGNUP_CODE;
  if (needCode ? code !== needCode : await User.exists({ role: "admin" }))
    throw httpErr(403, needCode ? "Wrong admin code." : "Admin sign up is closed. Ask an existing admin.");
  if (!name.trim() || !email.trim()) throw httpErr(400, "Enter your full name and email.");
  if (password.length < 6) throw httpErr(400, "Password must be at least 6 characters.");
  const user = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 10), role: "admin" });
  res.status(201).json({ token: sign(user), user: pub(user) });
}));
r.post("/auth/login", wrap(async (q, res) => {
  const { email = "", password = "" } = q.body;
  const user = await User.findOne({ email: email.toLowerCase().trim(), role: "admin" });
  if (!user || !(await bcrypt.compare(password, user.password))) throw httpErr(401, "Wrong email or password.");
  res.json({ token: sign(user), user: pub(user) });
}));
r.post("/auth/student-login", wrap(async (q, res) => {
  const student = await Student.findOne({ studentId: String(q.body.studentId || "").trim() });
  if (!student) throw httpErr(401, "Student ID not found. Ask your coordinator to register you.");
  const user = await studentUser(student);
  res.json({ token: sign(user), user: pub(user) });
}));
r.get("/auth/me", requireAuth, (q, res) => res.json(pub(q.user)));

// ---- Admin CRUD ----
function crud(path, Model, onSave) {
  r.get(path, ...admin, wrap(async (_q, res) => res.json(await Model.find().sort("-createdAt"))));
  r.post(path, ...admin, wrap(async (q, res) => {
    const doc = await Model.create(clean(q.body));
    await onSave?.(doc);
    res.status(201).json(doc);
  }));
  r.put(`${path}/:id`, ...admin, wrap(async (q, res) => {
    const doc = await Model.findByIdAndUpdate(q.params.id, clean(q.body), { new: true, runValidators: true });
    if (!doc) throw httpErr(404, "Record not found.");
    await onSave?.(doc);
    res.json(doc);
  }));
  r.delete(`${path}/:id`, ...admin, wrap(async (q, res) => {
    await Model.findByIdAndDelete(q.params.id);
    res.json({ ok: true });
  }));
}

// Registering a student also prepares their login account (they sign in with Student ID only).
crud("/students", Student, studentUser);

// Real internship, attendance and hours numbers for the admin's "View student" popup.
r.get("/students/:id/summary", ...admin, wrap(async (q, res) => {
  const s = await Student.findById(q.params.id);
  if (!s) throw httpErr(404, "Student not found.");
  const user = await User.findOne({ studentId: s.studentId });
  const [records, logs, internships] = await Promise.all([
    user ? Attendance.find({ user: user._id }) : [],
    user ? HoursLog.find({ user: user._id }) : [],
    Internship.find({ studentId: s.studentId }).sort("-createdAt"),
  ]);
  const count = (st) => records.filter((a) => a.status === st).length;
  res.json({
    internship: internships.find((i) => i.status === "Active") || internships[0] || null,
    attendance: { present: count("Present"), absent: count("Absent"), late: count("Late") },
    hours: +logs.reduce((a, l) => a + l.hours, 0).toFixed(2),
  });
}));
crud("/companies", Company);
crud("/internships", Internship, (i) =>
  i.studentId && Student.updateOne({ studentId: i.studentId }, { status: i.status, company: i.company }));

r.get("/stats", ...admin, wrap(async (_q, res) => {
  const [students, companies, active] = await Promise.all([
    Student.countDocuments(), Company.countDocuments(), Internship.countDocuments({ status: "Active" }),
  ]);
  res.json({ students, companies, active });
}));

// ---- Student data ----
r.get("/internships/me", requireAuth, wrap(async (q, res) =>
  res.json(await Internship.find({ studentId: q.user.studentId }).sort("-createdAt"))));

r.get("/attendance", ...admin, wrap(async (_q, res) => res.json(await Attendance.find().sort("-date").limit(500))));
r.get("/attendance/me", requireAuth, wrap(async (q, res) => res.json(await Attendance.find({ user: q.user._id }).sort("date"))));

const checkId = (q) => {
  if (!q.user.studentId || (q.body.studentId || "").trim() !== q.user.studentId) throw httpErr(400, "That student ID doesn't match your account.");
};
r.post("/attendance/time-in", requireAuth, wrap(async (q, res) => {
  checkId(q);
  const date = today();
  if (await Attendance.exists({ user: q.user._id, date })) throw httpErr(409, "You already timed in today.");
  const late = minutesNow() > 8 * 60 + 15; // later than 8:15 AM counts as late
  res.status(201).json(await Attendance.create({
    user: q.user._id, name: q.user.name, date, status: late ? "Late" : "Present",
    in: clock(), inAt: new Date(), remarks: late ? "Arrived late" : "",
  }));
}));
r.post("/attendance/time-out", requireAuth, wrap(async (q, res) => {
  checkId(q);
  const rec = await Attendance.findOne({ user: q.user._id, date: today() });
  if (!rec) throw httpErr(400, "You haven't timed in today.");
  if (rec.out) throw httpErr(409, "You already timed out today.");
  const hours = Math.max(0.01, +((Date.now() - rec.inAt) / 36e5).toFixed(2));
  rec.out = clock();
  await rec.save();
  const log = await HoursLog.create({ user: q.user._id, date: rec.date, hours, task: "Daily attendance", supervisor: "—" });
  res.json({ attendance: rec, log });
}));

r.get("/hours/me", requireAuth, wrap(async (q, res) => res.json(await HoursLog.find({ user: q.user._id }).sort("-date -createdAt"))));
r.get("/hours", ...admin, wrap(async (_q, res) => res.json(await HoursLog.find().sort("-date").limit(500))));
r.put("/hours/:id", ...admin, wrap(async (q, res) =>
  res.json(await HoursLog.findByIdAndUpdate(q.params.id, { status: q.body.status }, { new: true }))));

// ---- Messages (admins <-> students) ----
r.get("/messages/contacts", requireAuth, wrap(async (q, res) => {
  const me = q.user._id;
  const people = await User.find({ role: q.user.role === "admin" ? "student" : "admin" }).select("name role");
  const msgs = await Message.find({ $or: [{ from: me }, { to: me }] }).sort("-createdAt");
  res.json(people.map((p) => {
    const last = msgs.find((m) => String(m.from) === String(p._id) || String(m.to) === String(p._id));
    return { _id: p._id, name: p.name, role: p.role, last: last && { text: last.text, createdAt: last.createdAt } };
  }));
}));
r.get("/messages/:userId", requireAuth, wrap(async (q, res) => {
  const me = q.user._id, other = q.params.userId;
  res.json(await Message.find({ $or: [{ from: me, to: other }, { from: other, to: me }] }).sort("createdAt"));
}));
r.post("/messages", requireAuth, wrap(async (q, res) => {
  const text = (q.body.text || "").trim();
  if (!text || !q.body.to) throw httpErr(400, "Write a message first.");
  res.status(201).json(await Message.create({ from: q.user._id, to: q.body.to, text }));
}));

export default r;