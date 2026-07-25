import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { toast } from "../../components/Toast";
import { bookingsAPI } from "../../services/api";

function format12hSlot(slotStr) {
  if (!slotStr) return "—";
  return slotStr
    .split(/\s*[-–]\s*/)
    .map((part) => {
      const match = part.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return part.trim();
      let h = Number(match[1]);
      const m = match[2];
      const period = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, "0")}:${m} ${period}`;
    })
    .join(" – ");
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const data = await bookingsAPI.getAll();
      setBookings(data);
    } catch (err) {
      toast.error(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(id) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingsAPI.update(id, { status: "cancelled" });
      toast("Booking cancelled successfully");
      fetchBookings();
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  }

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      (b.facilityName || "").toLowerCase().includes(query.toLowerCase()) ||
      (b.flat || "").toLowerCase().includes(query.toLowerCase()) ||
      (b.user?.name || "").toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Booking Management" subtitle="Loading bookings..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading booking data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Booking Management" subtitle="View and manage facility reservations" />

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex gap-3 flex-1 min-w-[280px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bookings by facility, flat, or resident name..."
            className="admin-input flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input max-w-[180px]"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-brown/8 flex justify-between items-center bg-surface">
          <h3 className="text-sm font-extrabold text-brown">All Bookings</h3>
          <span className="text-xs font-bold text-gold-dark">{filtered.length} bookings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resident</th>
                <th>Flat</th>
                <th>Facility</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td className="text-gold-dark font-bold">
                    {b._id ? b._id.slice(-6) : "—"}
                  </td>
                  <td>{b.user?.name || "Resident"}</td>
                  <td>{b.flat}</td>
                  <td className="font-semibold text-brown">{b.facilityName || "Facility"}</td>
                  <td>{b.date}</td>
                  <td>{format12hSlot(b.slot)}</td>
                  <td>
                    <Badge tone={b.status === "confirmed" ? "ok" : b.status === "cancelled" ? "urgent" : "neutral"}>
                      {b.status}
                    </Badge>
                  </td>
                  <td>
                    {b.status === "confirmed" && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(b._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-brown/50">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
