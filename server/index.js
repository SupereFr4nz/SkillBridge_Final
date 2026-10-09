import "dotenv/config";
import dns from "node:dns";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import routes from "./routes.js";

const { MONGODB_URI, JWT_SECRET, PORT = 5000, CLIENT_ORIGIN, DNS_SERVERS = "8.8.8.8,1.1.1.1" } = process.env;
if (!MONGODB_URI || !JWT_SECRET) {
  console.error("Missing MONGODB_URI or JWT_SECRET. Copy .env.example to .env (inside the server folder) and fill it in.");
  process.exit(1);
}
dns.setServers(DNS_SERVERS.split(","));

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN ? CLIENT_ORIGIN.split(",") : true }));
app.use(express.json());

app.get("/api/health", (_q, res) => res.json({ ok: true }));
app.use("/api", routes);
app.use("/api", (_q, res) => res.status(404).json({ error: "Not found." }));

app.use((err, _q, res, _next) => {
  const status = err.status || (err.code === 11000 ? 409 : ["ValidationError", "CastError"].includes(err.name) ? 400 : 500);
  if (status === 500) console.error(err);
  res.status(status).json({
    error: status === 500 ? "Something went wrong on the server." : err.code === 11000 ? "That record already exists." : err.message,
  });
});

await mongoose.connect(MONGODB_URI);
console.log("MongoDB connected");
app.listen(PORT, () => console.log(`SkillBridge server running on port ${PORT}`));
