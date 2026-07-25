import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import ResidentBookings from "../resident/ResidentBookings";
import ResidentPayments from "../resident/ResidentPayments";
import ResidentComplaints from "../resident/ResidentComplaints";
import ContactUs from "../shared/ContactUs";
import { IconCalendar, IconWallet, IconAlert, IconMail, IconUser } from "../../components/icons";

export default function AdminPersonalPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("bookings");

  const tabs = [
    { id: "bookings", label: "Facility Booking", icon: IconCalendar },
    { id: "payments", label: "My Payments", icon: IconWallet },
    { id: "complaints", label: "My Complaints", icon: IconAlert },
    { id: "contact", label: "Contact Developer", icon: IconMail },
  ];

  return (
    <>
      {/* Top Identity Banner */}
      <div className="mb-6 bg-gradient-to-r from-forest to-forest-dark text-cream rounded-2xl p-6 ring-1 ring-brown/10 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold">
            <IconUser className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-gold/20 text-gold px-2.5 py-0.5 rounded-full">
                Admin Resident Portal
              </span>
            </div>
            <h2 className="text-xl font-display font-bold mt-1 text-cream">
              {user?.name || "Administrator"}
            </h2>
            <p className="text-xs text-cream/70 mt-0.5">
              Personal Resident Facilities — Flat: <span className="font-bold text-gold">{user?.flat || "Society Admin"}</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center bg-forest-dark/80 p-1.5 rounded-xl border border-cream/10 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-gold text-forest-dark shadow-sm"
                    : "text-cream/70 hover:text-cream hover:bg-cream/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-200">
        {activeTab === "bookings" && <ResidentBookings />}
        {activeTab === "payments" && <ResidentPayments />}
        {activeTab === "complaints" && <ResidentComplaints />}
        {activeTab === "contact" && <ContactUs />}
      </div>
    </>
  );
}
