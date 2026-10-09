import { PageHead, Stat, LogoutButton } from "../admincomponents/UI.jsx";
import { useFetch } from "../api.js";

export default function AdminDashboard() {
  const { data: s } = useFetch("/stats", { students: 0, companies: 0, active: 0 });
  return (
    <>
      <PageHead icon="👤" title="Admin Dashboard" sub="Overview of the SkillBridge internship program" action={<LogoutButton />} />
      <div className="stats three">
        <Stat icon="🎓" value={s.students} label="Total students" />
        <Stat icon="🏢" color="var(--purple)" value={s.companies} label="Company partners" />
        <Stat icon="✔" color="var(--green)" value={s.active} label="Active internships" />
      </div>
    </>
  );
}
