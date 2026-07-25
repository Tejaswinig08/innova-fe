import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { toast } from "../../components/Toast";
import { complaintsAPI, paymentsAPI, bookingsAPI, noticesAPI } from "../../services/api";

export default function AdminActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    setLoading(true);
    try {
      const [complaints, payments, bookings, notices] = await Promise.all([
        complaintsAPI.getAll().catch(() => []),
        paymentsAPI.getAll().catch(() => []),
        bookingsAPI.getAll().catch(() => []),
        noticesAPI.getAll().catch(() => []),
      ]);

      const items = [];

      // Add complaints
      complaints.forEach((c) => {
        items.push({
          type: "complaint",
          color: "bg-gold",
          text: `Complaint raised by Flat ${c.raisedByFlat || "Resident"}: "${c.title}" (Priority: ${c.priority})`,
          date: new Date(c.createdAt),
        });
      });

      // Add payments
      payments.forEach((p) => {
        items.push({
          type: "payment",
          color: "bg-green-600",
          text: `Payment of ₹${p.amount.toLocaleString("en-IN")} received from Flat ${p.flat} for ${p.month || "Billing Period"} (${p.status})`,
          date: new Date(p.paidOn || p.createdAt),
        });
      });

      // Add bookings
      bookings.forEach((b) => {
        items.push({
          type: "booking",
          color: "bg-blue-600",
          text: `Booking confirmed: ${b.facilityName || "Facility"} booked by Flat ${b.flat} on ${b.date} (${b.slot})`,
          date: new Date(b.createdAt),
        });
      });

      // Add notices
      notices.forEach((n) => {
        items.push({
          type: "notice",
          color: "bg-red-600",
          text: `E-Notice published: "${n.title}" (${n.category || "General"})`,
          date: new Date(n.createdAt),
        });
      });

      // Sort descending
      items.sort((a, b) => b.date - a.date);

      setActivities(items);
    } catch (err) {
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Activity Log" subtitle="Loading log feed..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading activity feed...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Activity Log" subtitle="Real-time system events log" />

      <Card className="p-6">
        <div className="space-y-6">
          {activities.map((item, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-brown/5 last:border-0 last:pb-0">
              <span className={`w-3 h-3 rounded-full ${item.color} mt-1.5 shrink-0`} />
              <div>
                <p className="text-sm text-brown font-medium">{item.text}</p>
                <p className="text-xs text-brown/40 mt-1">
                  {item.date.toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="text-center py-10 text-brown/50">No activity recorded yet.</p>
          )}
        </div>
      </Card>
    </>
  );
}
