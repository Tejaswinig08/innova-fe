import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import {
  complaintsAPI,
  paymentsAPI,
  visitorsAPI,
  noticesAPI,
  bookingsAPI,
  authAPI,
  eventsAPI,
} from "../../services/api";
import { toast } from "../../components/Toast";
import { IconPlus } from "../../components/icons";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [residents, setResidents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  useEffect(() => {
    Promise.all([
      complaintsAPI.getAll().catch(() => []),
      authAPI.getUsers().catch(() => []),
      paymentsAPI.getAll().catch(() => []),
      noticesAPI.getAll().catch(() => []),
      bookingsAPI.getAll().catch(() => []),
      eventsAPI.getAll().catch(() => []),
    ]).then(([c, r, p, n, b, e]) => {
      setComplaints(c);
      setResidents(r);
      setPayments(p);
      setNotices(n);
      setBookings(b);
      setEvents(e);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const residentCount = residents.filter((r) => r.role === "resident").length;
  const totalBalance = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const activeNotices = notices.length;
  const bookingsToday = bookings.filter((b) => {
    if (!b.date) return false;
    return b.date.split("T")[0] === today;
  }).length;

  async function handleCreateEvent(e) {
    e.preventDefault();
    try {
      const newEv = await eventsAPI.create({
        title: eventTitle,
        date: eventDate,
        time: eventTime,
      });
      setEvents([...events, newEv].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setShowEventModal(false);
      setEventTitle("");
      setEventDate("");
      setEventTime("");
      toast("Event created successfully");
    } catch (err) {
      toast.error(err.message || "Failed to create event");
    }
  }

  async function handleDeleteEvent(id) {
    try {
      await eventsAPI.delete(id);
      setEvents(events.filter((ev) => ev._id !== id));
      toast("Event deleted");
    } catch (err) {
      toast.error(err.message || "Failed to delete event");
    }
  }

  const recentActivity = [
    ...complaints.map((c) => ({
      id: `c-${c._id}`,
      type: "complaint",
      description: `Complaint "${c.title}" — ${c.status}`,
      dot:
        c.status === "resolved"
          ? "bg-green-600"
          : c.priority === "urgent" || c.priority === "high"
          ? "bg-red-500"
          : "bg-gold",
      time: c.createdAt,
    })),
    ...payments.map((p) => ({
      id: `p-${p._id}`,
      type: "payment",
      description: `Payment ₹${p.amount.toLocaleString("en-IN")} from Flat ${
        p.flat
      } — ${p.status}`,
      dot:
        p.status === "paid"
          ? "bg-green-600"
          : p.status === "overdue"
          ? "bg-red-500"
          : "bg-gold",
      time: p.createdAt || p.dueDate,
    })),
  ]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 10);

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Overview" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading dashboard data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Overview"
        subtitle={`${residents.length} registered users across your society`}
      />

      {/* ── Stat Cards with Trends ──────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 admin-stat-card">
          <p className="stat-label text-xs uppercase tracking-wide text-brown/55 font-bold">
            Total Residents
          </p>
          <p className="stat-value text-2xl font-black text-brown mt-1.5">
            {residentCount}
          </p>
          <p className="stat-sub text-xs text-gold-dark font-semibold mt-1">
            {residents.length} total users registered
          </p>
          <p className="text-[11px] text-brown/40 mt-1.5">Active across wings</p>
        </Card>

        <Card className="p-5 admin-stat-card">
          <p className="stat-label text-xs uppercase tracking-wide text-brown/55 font-bold">
            Total Balance
          </p>
          <p className="stat-value text-2xl font-black text-brown mt-1.5">
            ₹{totalBalance.toLocaleString("en-IN")}
          </p>
          <p className="stat-sub text-xs text-gold-dark font-semibold mt-1">
            from {payments.filter((p) => p.status === "paid").length} payments
          </p>
          <p className="text-[11px] text-brown/40 mt-1.5">Updated real-time</p>
        </Card>

        <Card className="p-5 admin-stat-card">
          <p className="stat-label text-xs uppercase tracking-wide text-brown/55 font-bold">
            Active Notices
          </p>
          <p className="stat-value text-2xl font-black text-brown mt-1.5">
            {activeNotices}
          </p>
          <p className="stat-sub text-xs text-gold-dark font-semibold mt-1">
            published notices
          </p>
          <p className="text-[11px] text-brown/40 mt-1.5">Visible to residents</p>
        </Card>

        <Card className="p-5 admin-stat-card">
          <p className="stat-label text-xs uppercase tracking-wide text-brown/55 font-bold">
            Bookings Today
          </p>
          <p className="stat-value text-2xl font-black text-brown mt-1.5">
            {bookingsToday}
          </p>
          <p className="stat-sub text-xs text-gold-dark font-semibold mt-1">
            scheduled for{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-[11px] text-brown/40 mt-1.5">Facility reservations</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ── Recent Activity ─────────────────────────────── */}
          <Card className="overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-brown/8">
              <h3 className="text-sm font-extrabold text-brown">Recent Activity</h3>
              <Link
                to="/admin/complaints"
                className="text-xs text-accent font-medium hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="px-5">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3.5 py-3 border-b border-brown/5"
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${item.dot} mt-1.5 shrink-0`}
                    ></span>
                    <div>
                      <p className="text-sm text-brown/80">{item.description}</p>
                      <p className="text-xs text-brown/40 mt-0.5">
                        {formatTime(item.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brown/50 py-6 text-center">
                  No recent activity to show.
                </p>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* ── Upcoming Events Management ───────────────────── */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-brown">Upcoming Events</h3>
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setShowEventModal(true)}
              >
                <IconPlus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-3">
              {events.length > 0 ? (
                events.map((ev) => (
                  <div
                    key={ev._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-brown/5 border border-brown/5"
                  >
                    <div>
                      <p className="text-sm font-bold text-brown">{ev.title}</p>
                      <p className="text-xs text-brown/60 mt-0.5">
                        {ev.date} {ev.time ? `· ${ev.time}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(ev._id)}
                      className="text-xs text-red-600 font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brown/50 py-6 text-center">
                  No upcoming events scheduled yet.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full animate-modal-in">
            <h3 className="font-display text-lg text-brown mb-4">Schedule New Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1">
                  Event Title
                </label>
                <input
                  required
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Society AGM or Independence Day Celebration"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1">
                  Date
                </label>
                <input
                  required
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1">
                  Time (Optional)
                </label>
                <input
                  type="text"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="e.g. 6:00 PM"
                  className="admin-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Save Event
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
