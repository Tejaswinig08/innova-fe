import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { paymentsAPI } from "../../services/api";

export default function ResidentPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.getAll()
      .then((data) => setPayments(data))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  const latestPayment = payments[0];
  const isPaid = latestPayment?.status === "paid";

  if (loading) return <><PageHeader eyebrow="Resident" title="Maintenance Payments" subtitle="Loading..." /><div className="flex items-center justify-center py-20"><p className="text-sm text-brown/50">Loading...</p></div></>;

  return (
    <>
      <PageHeader
        eyebrow="Resident"
        title="Maintenance Payments"
        subtitle={`View dues and payment history${user?.flat ? ` for ${user.flat}` : ""}`}
        action={
          <Button
            as={Link}
            to={user?.role === "admin" ? "/admin/personal/pay" : "/resident/payments/pay"}
            variant="primary"
            size="sm"
          >
            Make Direct Payment
          </Button>
        }
      />

      <Card className="p-6 mb-8 bg-forest text-cream flex items-center justify-between">
        <div>
          <p className="text-xs text-cream/55 mb-1">{isPaid ? "This month's maintenance" : latestPayment ? "Current month due" : "No payment records"}</p>
          <p className="font-display text-3xl">₹{isPaid ? 0 : latestPayment?.amount ?? 0}</p>
          <p className="text-xs text-cream/55 mt-1">
            {isPaid ? `Paid in full on ${latestPayment.paidOn ? new Date(latestPayment.paidOn).toLocaleDateString() : ""} — no dues pending` : latestPayment ? "Pending payment" : "No records found"}
          </p>
        </div>
        {latestPayment && !isPaid && (
          <Button
            variant="primary"
            onClick={() => {
              const basePath = user?.role === "admin" ? "/admin/personal/pay" : "/resident/payments/pay";
              navigate(
                `${basePath}?amount=${latestPayment.amount}&description=${encodeURIComponent(
                  `Maintenance: ${latestPayment.month}`
                )}`
              );
            }}
          >
            Pay now
          </Button>
        )}
      </Card>

      <h2 className="font-display text-lg text-brown mb-4">Payment history</h2>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brown/8 text-left text-xs text-brown/45">
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Month</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Paid on</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-brown/8 last:border-0">
                  <td className="px-5 py-3.5 text-brown font-medium">{p.description || "Maintenance Bill"}</td>
                  <td className="px-5 py-3.5 text-brown/70">{p.month}</td>
                  <td className="px-5 py-3.5 text-brown font-bold">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={p.status === "paid" ? "ok" : p.status === "overdue" ? "urgent" : "warn"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-brown/50">
                    {p.paidOn ? new Date(p.paidOn).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-brown/50">
                    No payment records yet.
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
