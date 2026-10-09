import { useState } from "react";

const heads = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const pad = (n) => String(n).padStart(2, "0");
export const fmtDate = (s) =>
  new Date(s + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// records: [{ date: "2026-09-03", status: "Present" | "Late" | "Absent" }]
export default function AttendanceCalendar({ records = [], selected, onPick }) {
  const [view, setView] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const marks = Object.fromEntries(records.map((r) => [r.date, r.status.toLowerCase()]));
  const first = new Date(view.y, view.m, 1).getDay();
  const len = new Date(view.y, view.m + 1, 0).getDate();
  const title = new Date(view.y, view.m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const shift = (n) => setView(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const cells = [...Array(first).fill(null), ...Array.from({ length: len }, (_, i) => i + 1)];

  return (
    <>
      <div className="cal-title">
        <button className="icon-btn" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
        {" "}{title}{" "}
        <button className="icon-btn" onClick={() => shift(1)} aria-label="Next month">›</button>
      </div>
      <div className="cal">
        {heads.map((h) => <b key={h}>{h}</b>)}
        {cells.map((d, i) => {
          if (!d) return <span key={i} />;
          const key = `${view.y}-${pad(view.m + 1)}-${pad(d)}`;
          return (
            <button key={i} className={[marks[key], selected === key && "sel"].filter(Boolean).join(" ")} onClick={() => onPick(selected === key ? null : key)}>
              {d}
            </button>
          );
        })}
      </div>
      <ul className="legend inline">
        <li className="g">Present</li><li className="r">Absent</li><li className="o">Late</li><li>No record</li>
      </ul>
    </>
  );
}
