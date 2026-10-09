// Optional sample data: npm run seed   (safe to run again, it won't duplicate anything)
// The first admin is created on the Sign up page, not here.
import "dotenv/config";
import dns from "node:dns";
import crypto from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, Student, Company, Internship } from "./models.js";

dns.setServers((process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1").split(","));
await mongoose.connect(process.env.MONGODB_URI);
const once = (Model, filter, data) => Model.updateOne(filter, { $setOnInsert: data }, { upsert: true });

await once(Student, { studentId: "05482" }, { name: "Denmar Daylisan", course: "BSIT", year: "3rd Year", email: "denmar@student.edu", phone: "+63 912 345 6789", company: "TechGlobal Solutions Inc.", status: "Active" });
if (!(await User.exists({ studentId: "05482" })))
  await User.create({ name: "Denmar Daylisan", email: "05482@students.local", password: await bcrypt.hash(crypto.randomUUID(), 10), role: "student", studentId: "05482" });
await once(Company, { name: "TechGlobal Solutions Inc." }, { location: "Cebu City", contact: "Ana Reyes", email: "hr@techglobal.com", interns: 3 });
await once(Internship, { studentId: "05482" }, { student: "Denmar Daylisan", company: "TechGlobal Solutions Inc.", position: "Web Developer Intern", start: "2026-09-01", end: "2026-11-30", status: "Active", progress: 62, task: "UI wireframes", reviewer: "Ana Reyes" });

console.log("Seeded sample student. Log in on the Student tab with Student ID 05482.");
await mongoose.disconnect();