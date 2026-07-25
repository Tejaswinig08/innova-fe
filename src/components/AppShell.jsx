import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import CivioraAIModal from "./CivioraAIModal";
import {
  IconHome, IconAlert, IconCalendar, IconNotice, IconWallet,
  IconUsers, IconShield, IconChart, IconChat, IconLogout, IconUserCheck, IconQrCode,
  IconMenu, IconClose, IconHistory, IconUser, IconMail,
} from "./icons";
const NAV = {
  resident: [
    { to: "/resident", label: "Home", icon: IconHome, end: true },
    { to: "/resident/complaints", label: "Complaints", icon: IconAlert },
    { to: "/resident/bookings", label: "Facility Booking", icon: IconCalendar },
    { to: "/resident/notices", label: "Notice Board", icon: IconNotice },
    { to: "/resident/payments", label: "Maintenance", icon: IconWallet },
    { to: "/resident/annual-accounts", label: "Annual Accounts", icon: IconChart },
    { to: "/resident/guest-qr", label: "Guest QR", icon: IconQrCode },
    { to: "/resident/chat", label: "Community Chat", icon: IconChat },
    { type: "divider" },
    { to: "/contact-us", label: "Contact Us", icon: IconMail },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: IconHome, end: true },
    { to: "/admin/personal", label: "My Resident Portal", icon: IconUser },
    { to: "/admin/residents", label: "Users", icon: IconUsers },
    { type: "divider" },
    { to: "/admin/notices", label: "E-Notices", icon: IconNotice },
    { to: "/admin/payments", label: "Payments", icon: IconWallet },
    { to: "/admin/insights", label: "Annual Accounts", icon: IconChart },
    { to: "/admin/bookings", label: "Bookings", icon: IconCalendar },
    { type: "divider" },
    { to: "/admin/complaints", label: "Complaints", icon: IconAlert },
    { type: "divider" },
    { to: "/admin/chat", label: "Chat", icon: IconChat },
    { to: "/admin/activity", label: "Activity Log", icon: IconHistory },
    { to: "/admin/settings", label: "Society Settings", icon: IconShield },
    { type: "divider" },
    { to: "/contact-us", label: "Contact Us", icon: IconMail },
  ],
  security: [
    { to: "/security", label: "Gate Log", icon: IconShield, end: true },
    { to: "/security/visitors", label: "Visitors", icon: IconUserCheck },
    { to: "/security/alerts", label: "Alerts", icon: IconAlert },
    { type: "divider" },
    { to: "/contact-us", label: "Contact Us", icon: IconMail },
  ],
};

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV[user?.role] || [];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const navItems = items.filter((i) => !i.type);
  const currentLabel = navItems.find((i) => (i.end ? location.pathname === i.to : location.pathname.startsWith(i.to)))?.label;

  const sidebarContent = (
    <>
      <div className="px-6 py-7 flex items-center justify-between">
        <Logo tone="light" size="md" />
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
          className="lg:hidden -mr-1 p-1.5 rounded-lg text-cream/70 hover:text-cream hover:bg-cream/10"
        >
          <IconClose className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {items.map((item, idx) => {
          if (item.type === "divider") {
            return <div key={`divider-${idx}`} className="h-px bg-cream/10 my-2 mx-2" />;
          }
          const { to, label, icon: Icon, end } = item;
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-gold text-forest-dark font-medium"
                    : "text-cream/75 hover:bg-cream/8 hover:text-cream"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-5 mt-auto border-t border-cream/10 pt-4">
        <div className="px-3.5 mb-4 flex items-center justify-between">
          <span className="text-xs text-cream/55">Theme</span>
          <ThemeToggle />
        </div>
        <div className="px-3.5 mb-3">
          <p className="text-sm font-medium text-cream">{user?.name}</p>
          <p className="text-xs text-cream/60">
            {user?.flat ? `Flat ${user.flat}` : user?.title}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-cream/70 hover:bg-cream/8 hover:text-cream w-full transition-colors"
        >
          <IconLogout className="w-[18px] h-[18px]" />
          Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-beige flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-forest text-cream flex items-center justify-between px-4 z-30">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-1.5 -ml-1.5 rounded-lg hover:bg-cream/10"
        >
          <IconMenu className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium truncate">{currentLabel || "Civiora"}</span>
        <Logo tone="light" size="sm" iconOnly />
      </div>

      {/* Backdrop for mobile drawer */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close menu backdrop"
          onClick={() => setDrawerOpen(false)}
          className="lg:hidden fixed inset-0 bg-forest-dark/60 z-40"
        />
      )}

      {/* Sidebar: static on desktop, sliding drawer on mobile */}
      <aside
        className={`w-64 shrink-0 bg-forest text-cream flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {sidebarContent}
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
      </main>

      {/* Floating Civiora AI Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-forest text-cream shadow-2xl ring-2 ring-gold/30 hover:bg-forest-dark hover:scale-105 active:scale-95 transition-all duration-200 font-display text-sm font-semibold"
        >
          Civiora AI
        </button>
      </div>

      <CivioraAIModal open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
