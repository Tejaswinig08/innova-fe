const TONES = {
  urgent: "bg-[#A6452F]/10 text-[#A6452F] ring-1 ring-[#A6452F]/20",
  high: "bg-[#A6452F]/10 text-[#A6452F] ring-1 ring-[#A6452F]/20",
  warn: "bg-[#B8893E]/10 text-[#93793F] ring-1 ring-[#B8893E]/25",
  medium: "bg-[#B8893E]/10 text-[#93793F] ring-1 ring-[#B8893E]/25",
  ok: "bg-[#3F6E52]/10 text-[#3F6E52] ring-1 ring-[#3F6E52]/20",
  low: "bg-[#3F6E52]/10 text-[#3F6E52] ring-1 ring-[#3F6E52]/20",
  resolved: "bg-[#3F6E52]/10 text-[#3F6E52] ring-1 ring-[#3F6E52]/20",
  paid: "bg-[#3F6E52]/10 text-[#3F6E52] ring-1 ring-[#3F6E52]/20",
  confirmed: "bg-[#3F6E52]/10 text-[#3F6E52] ring-1 ring-[#3F6E52]/20",
  info: "bg-[#3E5C73]/10 text-[#3E5C73] ring-1 ring-[#3E5C73]/20",
  open: "bg-[#3E5C73]/10 text-[#3E5C73] ring-1 ring-[#3E5C73]/20",
  "in-progress": "bg-[#B8893E]/10 text-[#93793F] ring-1 ring-[#B8893E]/25",
  overdue: "bg-[#A6452F]/10 text-[#A6452F] ring-1 ring-[#A6452F]/20",
  neutral: "bg-brown/5 text-brown/70 ring-1 ring-brown/10",
};

export default function Badge({ tone = "neutral", children }) {
  const cls = TONES[tone] || TONES.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide ${cls}`}>
      {children}
    </span>
  );
}
