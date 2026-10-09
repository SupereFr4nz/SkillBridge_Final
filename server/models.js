import mongoose from "mongoose";
const { Schema, model } = mongoose;
const T = { timestamps: true };
const str = (d) => ({ type: String, default: d });
const num = { type: Number, default: 0 };

export const User = model("User", new Schema({
  name: String,
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "student"], default: "student" },
  studentId: String,
}, T));

export const Student = model("Student", new Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  course: String, year: String, email: String, phone: String, gender: String, dob: String, address: String,
  company: str("—"), status: str("Pending"),
}, T));

export const Company = model("Company", new Schema({
  name: { type: String, required: true },
  location: str("—"), contact: str("—"), contactPhone: String, contactEmail: String,
  email: String, phone: String, interns: num, description: String, // interns = intern slots
}, T));

export const Internship = model("Internship", new Schema({
  student: { type: String, required: true }, studentId: String,
  company: { type: String, required: true }, position: str("Intern"),
  start: String, end: String, status: str("Active"), notes: String,
  progress: num, task: str("—"), reviewer: str("—"),
}, T));

const attendance = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, name: String,
  date: String, status: String, in: String, out: String, inAt: Date, remarks: String,
}, T);
attendance.index({ user: 1, date: 1 }, { unique: true });
export const Attendance = model("Attendance", attendance);

export const HoursLog = model("HoursLog", new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: String, hours: Number, task: String, supervisor: String, status: str("Pending"),
}, T));

export const Message = model("Message", new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
}, T));