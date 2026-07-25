// A small set of hairline-stroke icons, drawn to match the GateMotif's line weight (1.5–1.6px)
// rather than pulling in a generic icon library with a different stroke language.

const base = { fill: "none", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };

export const IconHome = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>
);
export const IconAlert = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M12 4l9 16H3z" /><path d="M12 10v4" /><circle cx="12" cy="17" r="0.6" fill="currentColor" /></svg>
);
export const IconCalendar = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 10h17" /><path d="M8 3v4" /><path d="M16 3v4" /></svg>
);
export const IconNotice = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></svg>
);
export const IconWallet = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16" cy="14.5" r="1" fill="currentColor" stroke="none" /></svg>
);
export const IconUsers = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.2a3 3 0 010 5.8" /><path d="M21 20a6 6 0 00-3.5-5.4" /></svg>
);
export const IconShield = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M12 3l8 3v6c0 5-3.5 7.7-8 9-4.5-1.3-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>
);
export const IconChart = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M4 20V10" /><path d="M11 20V4" /><path d="M18 20v-7" /><path d="M3 20h18" /></svg>
);
export const IconChat = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M4 5h16v11H8l-4 4z" /><circle cx="9" cy="10.5" r="0.6" fill="currentColor" stroke="none" /><circle cx="12" cy="10.5" r="0.6" fill="currentColor" stroke="none" /><circle cx="15" cy="10.5" r="0.6" fill="currentColor" stroke="none" /></svg>
);
export const IconSparkle = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></svg>
);
export const IconBell = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M6 9a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9z" /><path d="M9.5 17a2.5 2.5 0 005 0" /></svg>
);
export const IconLogout = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M9 4H5a1 1 0 00-1 1v14a1 1 0 001 1h4" /><path d="M16 16l4-4-4-4" /><path d="M20 12H9" /></svg>
);
export const IconPlus = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M12 5v14" /><path d="M5 12h14" /></svg>
);
export const IconSearch = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.5-4.5" /></svg>
);
export const IconClock = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
);
export const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M4 12l5 5L20 6" /></svg>
);
export const IconArrowRight = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>
);
export const IconUserCheck = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="10" cy="8" r="3.2" /><path d="M3.5 20c0-3.6 2.9-6.4 6.5-6.4s6.5 2.8 6.5 6.4" /><path d="M16 11l1.5 1.5L21 9" /></svg>
);
export const IconPhone = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M5 4h3l1.5 4.5L7.5 10A12 12 0 0014 16.5l1.5-2L20 16v3a1.5 1.5 0 01-1.6 1.5C11.2 19.8 4.2 12.8 3.5 5.6A1.5 1.5 0 015 4z" /></svg>
);
export const IconGlobe = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 4 6 4 9s-1.5 6.4-4 9c-2.5-2.6-4-6-4-9s1.5-6.4 4-9z" /></svg>
);
export const IconQrCode = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="14" y="3.5" width="6.5" height="6.5" rx="1" /><rect x="3.5" y="14" width="6.5" height="6.5" rx="1" /><path d="M14 14h3v3" /><path d="M20.5 14v3" /><path d="M14 20.5h3" /><path d="M20.5 20.5v.01" /></svg>
);
export const IconScan = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><path d="M4 8V5a1 1 0 011-1h3" /><path d="M20 8V5a1 1 0 00-1-1h-3" /><path d="M4 16v3a1 1 0 001 1h3" /><path d="M20 16v3a1 1 0 01-1 1h-3" /><path d="M3 12h18" /></svg>
);
export const IconMenu = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />
  </svg>
);

export const IconClose = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d="M5 5l14 14M19 5L5 19" />
  </svg>
);

export const IconShare = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="18" cy="5" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="19" r="2.4" /><path d="M8.1 10.8l7.8-4.2" /><path d="M8.1 13.2l7.8 4.2" /></svg>
);

export const IconHistory = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /><path d="M3.5 12H2" /><path d="M22 12h-1.5" /></svg>
);

export const IconUser = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><circle cx="12" cy="8" r="3.5" /><path d="M4 20c0-3.8 3.6-7 8-7s8 3.2 8 7" /></svg>
);

export const IconMail = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
);

export const IconAIStars = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
    <path d="M10 2l2.2 4.8L17 9l-4.8 2.2L10 16l-2.2-4.8L3 9l4.8-2.2L10 2z" />
    <path d="M18 2l1.1 2.4L21.5 5.5l-2.4 1.1L18 9l-1.1-2.4L14.5 5.5l2.4-1.1L18 2z" />
    <path d="M18 13l0.9 1.9L20.8 15.8l-1.9 0.9L18 18.6l-0.9-1.9L15.2 15.8l1.9-0.9L18 13z" />
  </svg>
);

export const IconMic = (p) => (
  <svg viewBox="0 0 24 24" {...base} stroke="currentColor" {...p}>
    <rect x="8.5" y="3" width="7" height="11" rx="3.5" />
    <path d="M5 10v2a7 7 0 0014 0v-2" />
    <path d="M12 19v3" />
    <path d="M8.5 22h7" />
  </svg>
);

