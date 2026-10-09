// Stand-in SB logo drawn in SVG. Replace with your real logo file (e.g. <img src="/logo.svg" />) when you have it.
export default function Logo() {
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label="SkillBridge logo" fill="none" stroke="url(#sb-grad)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="sb-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4cc2ff" />
          <stop offset="1" stopColor="#1f6bff" />
        </linearGradient>
      </defs>
      <path d="M170 58C150 22 62 22 62 72c0 48 88 38 88 94 0 50-86 50-108 10" />
      <path d="M228 28v184M228 28h62c58 0 58 86 0 86h-62M228 114h72c62 0 62 98 0 98h-72" />
    </svg>
  );
}
