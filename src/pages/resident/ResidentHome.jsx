import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import StatCard from "../../components/StatCard";
import { complaintsAPI, noticesAPI, paymentsAPI, eventsAPI } from "../../services/api";
import { useBookings } from "../../context/BookingsContext";
import { IconAlert, IconWallet, IconCalendar, IconArrowRight, IconSparkle, IconNotice } from "../../components/icons";

export default function ResidentHome() {
  const { user } = useAuth();
  const { bookings } = useBookings();
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      complaintsAPI.getMy().catch(() => []),
      noticesAPI.getAll().catch(() => []),
      paymentsAPI.getAll().catch(() => []),
      eventsAPI.getAll().catch(() => []),
    ]).then(([c, n, p, e]) => {
      setComplaints(c);
      setNotices(n);
      setPayments(p);
      setEvents(e);
      setLoading(false);
    });
  }, []);

  const myPayment = payments.find((p) => p.flat === user?.flat);
  const openComplaints = complaints.filter((c) => c.status !== "resolved").length;
  const currentMonthName = new Date().toLocaleString("en-US", { month: "long" });

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Resident" title="Welcome" subtitle="Loading your dashboard..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Resident"
        title={`Good evening, ${user?.name?.split(" ")[0] || "Resident"}`}
        subtitle={`${user?.flat ? `Flat ${user.flat} · ` : ""}${user?.society || "Civiora"}`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Open complaints" value={openComplaints} icon={IconAlert} tone="gold" />
        <StatCard label="Upcoming bookings" value={bookings.length} icon={IconCalendar} tone="forest" />
        <StatCard
          label="Maintenance due"
          value={myPayment && myPayment.status !== "paid" ? `₹${myPayment.amount}` : "₹0"}
          tone={myPayment?.status === "overdue" ? "danger" : "forest"}
          icon={IconWallet}
          hint={
            myPayment?.status === "overdue"
              ? "Overdue — pay now"
              : `Paid for ${currentMonthName} — no dues pending`
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-brown">Your recent complaints</h2>
              <Link to="/resident/complaints" className="text-xs text-accent font-medium hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {complaints.slice(0, 4).map((c) => (
                <div key={c._id} className="flex items-start justify-between py-3 border-b border-brown/8 last:border-0 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-brown truncate">{c.title}</p>
                      <Badge tone={c.priority}>{c.priority}</Badge>
                    </div>
                    <p className="text-[11px] text-brown/45">
                      Reported on{" "}
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    tone={
                      c.status === "resolved"
                        ? "resolved"
                        : c.status === "in-progress"
                        ? "in-progress"
                        : "open"
                    }
                  >
                    {c.status}
                  </Badge>
                </div>
              ))}
              {complaints.length === 0 && (
                <p className="text-sm text-brown/50 py-6 text-center">
                  No complaints raised yet. Things are quiet.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Notice Board Count Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg text-brown">Notice Board</h2>
              <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <IconNotice className="w-4 h-4 text-accent" />
              </span>
            </div>
            <p className="text-3xl font-display text-brown mb-1">{notices.length}</p>
            <p className="text-xs text-brown/55 mb-4">
              Total notices published by management
            </p>
            <Link
              to="/resident/notices"
              className="text-xs text-accent font-medium hover:underline inline-flex items-center gap-1"
            >
              Go to notice board <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Card>

          {/* Upcoming Events Card */}
          <Card className="p-6">
            <h2 className="font-display text-lg text-brown mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {events.length > 0 ? (
                events.slice(0, 3).map((ev) => (
                  <div key={ev._id} className="p-3 rounded-xl bg-brown/5 border border-brown/5">
                    <p className="text-sm font-bold text-brown">{ev.title}</p>
                    <p className="text-xs text-brown/60 mt-1">
                      {new Date(ev.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}{" "}
                      {ev.time ? `· ${ev.time}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brown/50 py-4 text-center">
                  No upcoming events scheduled.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
