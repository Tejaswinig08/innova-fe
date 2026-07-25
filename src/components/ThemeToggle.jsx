import { useTheme } from "../context/ThemeContext";

const IconSun = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
  </svg>
);

const IconMoon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" {...p}>
    <path d="M20 14.5A8.5 8.5 0 119.5 4a6.8 6.8 0 0010.5 10.5z" />
  </svg>
);

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative inline-flex items-center w-[52px] h-7 rounded-full shrink-0 transition-colors duration-200 ring-1 ring-inset ${
        isDark ? "bg-forest-dark ring-gold/30" : "bg-brown/10 ring-brown/15"
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-gold shadow flex items-center justify-center transition-transform duration-200 ${
          isDark ? "translate-x-[24px]" : "translate-x-0"
        }`}
      >
        {isDark ? <IconMoon className="w-3.5 h-3.5 text-forest-dark" /> : <IconSun className="w-3.5 h-3.5 text-forest-dark" />}
      </span>
    </button>
  );
}
