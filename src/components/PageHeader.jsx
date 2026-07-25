export default function PageHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-6 mb-8 flex-wrap">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-gold-dark mb-2">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-3xl text-brown">{title}</h1>
        {subtitle && <p className="text-brown/55 text-sm mt-1.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
