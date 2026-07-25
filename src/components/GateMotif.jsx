// GateMotif: the recurring architectural line-motif for Civiora.
// A minimal society-gate silhouette — two pillars, a lintel, a roofline —
// rendered as hairline strokes so it reads as a mark, not an illustration.
// Used on the login screen, empty states, and as a watermark in headers.

export default function GateMotif({ className = "", stroke = "currentColor", variant = "full" }) {
  if (variant === "mark") {
    // Compact version for small spaces (nav corner, favicon-scale)
    return (
      <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 40V20L24 8L40 20V40" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M16 40V24" stroke={stroke} strokeWidth="1.6" />
        <path d="M32 40V24" stroke={stroke} strokeWidth="1.6" />
        <path d="M24 8V18" stroke={stroke} strokeWidth="1.6" />
        <circle cx="24" cy="20" r="2" fill={stroke} />
      </svg>
    );
  }

  // Full motif: wide gate with roofline, used as hero/watermark
  return (
    <svg viewBox="0 0 400 220" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M40 200V90L200 20L360 90V200" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M70 200V110" stroke={stroke} strokeWidth="1.4" />
      <path d="M330 200V110" stroke={stroke} strokeWidth="1.4" />
      <path d="M105 200V128" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <path d="M295 200V128" stroke={stroke} strokeWidth="1" opacity="0.6" />
      <path d="M200 20V70" stroke={stroke} strokeWidth="1.4" />
      <path d="M40 90H360" stroke={stroke} strokeWidth="1" opacity="0.5" />
      <circle cx="200" cy="92" r="3" fill={stroke} />
      <path d="M160 200V150H240V200" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
