import Card from "./Card";

export default function StatCard({ label, value, hint, trend, icon: Icon, tone = "forest" }) {
  const toneClasses = {
    forest: "bg-accent/10 text-accent",
    gold: "bg-gold/15 text-gold-dark",
    danger: "bg-[#A6452F]/10 text-[#A6452F]",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className={`w-9 h-9 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
          {Icon && <Icon className="w-4.5 h-4.5" />}
        </span>
      </div>
      <p className="text-2xl font-display text-brown">{value}</p>
      <p className="text-xs text-brown/55 mt-1">{label}</p>
      {trend && <p className="text-[11px] text-brown/40 mt-1.5">{trend}</p>}
      {hint && <p className="text-xs text-brown/40 mt-2">{hint}</p>}
    </Card>
  );
}
