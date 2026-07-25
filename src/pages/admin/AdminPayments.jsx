import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { toast } from "../../components/Toast";
import { paymentsAPI } from "../../services/api";
import { IconPlus } from "../../components/icons";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [wing, setWing] = useState("");
  const [flat, setFlat] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    try {
      const data = await paymentsAPI.getAll();
      setPayments(data);
    } catch (err) {
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }

  async function handleSetDues(e) {
    e.preventDefault();
    if (!wing.trim() || !flat.trim() || !amount || !month) {
      toast.error("Please fill required fields (Wing, Flat Number, Amount, Month)");
      return;
    }
    try {
      const formattedFlat = `${wing.trim().replace(/[^a-zA-Z]/g, "").toUpperCase()}-${flat.trim().replace(/\D/g, "")}`;
      await paymentsAPI.create({
        flat: formattedFlat,
        amount: Number(amount),
        month: month.trim(),
        description: description.trim() || `Maintenance Dues for ${month}`,
        status: "pending",
      });
      toast("Maintenance dues assigned successfully");
      setShowModal(false);
      setWing("");
      setFlat("");
      setAmount("");
      setMonth("");
      setDescription("");
      fetchPayments();
    } catch (err) {
      toast.error(err.message || "Failed to set maintenance dues");
    }
  }

  const collected = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const transactionsCount = payments.length;

  const filtered = payments.filter((p) => {
    const matchesSearch =
      (p.flat || "").toLowerCase().includes(query.toLowerCase()) ||
      (p.month || "").toLowerCase().includes(query.toLowerCase()) ||
      (p.user?.name || "").toLowerCase().includes(query.toLowerCase());

    return matchesSearch;
  });

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="All Payments & Transactions" subtitle="Loading payments..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading payments data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="All Payments & Transactions"
        subtitle="Maintenance billing and collected dues tracker"
        action={
          <Button onClick={() => setShowModal(true)} variant="primary">
            <IconPlus className="w-4 h-4" /> Set Maintenance Dues
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 admin-stat-card">
          <p className="text-xs uppercase tracking-wide text-brown/55 font-bold">Total Collected</p>
          <p className="text-2xl font-black text-[#2e7d32] mt-1.5">
            ₹{collected.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gold-dark font-semibold mt-1">Paid society dues</p>
        </Card>
        <Card className="p-5 admin-stat-card">
          <p className="text-xs uppercase tracking-wide text-brown/55 font-bold">Transactions</p>
          <p className="text-2xl font-black text-brown mt-1.5">{transactionsCount}</p>
          <p className="text-xs text-gold-dark font-semibold mt-1">Total recorded bills</p>
        </Card>
      </div>

      <div className="mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by resident name, flat, or month..."
          className="admin-input"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-brown/8 flex justify-between items-center bg-surface">
          <h3 className="text-sm font-extrabold text-brown">Transaction Records</h3>
          <span className="text-xs font-bold text-gold-dark">{filtered.length} transactions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resident</th>
                <th>Flat</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td className="text-gold-dark font-bold">
                    {p._id ? p._id.slice(-6) : "—"}
                  </td>
                  <td>{p.user?.name || "Flat Resident"}</td>
                  <td>{p.flat}</td>
                  <td className="font-bold text-brown">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td>{p.paidOn ? new Date(p.paidOn).toLocaleDateString() : "—"}</td>
                  <td>{p.month}</td>
                  <td>
                    <Badge
                      tone={
                        p.status === "paid"
                          ? "ok"
                          : p.status === "overdue"
                          ? "urgent"
                          : "warn"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brown/50">
                    No payments found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <Card className="p-6 max-w-md w-full animate-modal-in">
            <h3 className="font-display text-lg text-brown mb-4">Set Resident Maintenance Dues</h3>
            <form onSubmit={handleSetDues} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-brown/70 mb-1">
                    Wing <span className="text-[#A6452F]">*</span>
                  </label>
                  <input
                    required
                    value={wing}
                    onChange={(e) => setWing(e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, 1).toUpperCase())}
                    placeholder="e.g. A"
                    maxLength={1}
                    pattern="[A-Z]"
                    title="Exactly one capital letter allowed (e.g. A, B)"
                    className="admin-input uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brown/70 mb-1">
                    Flat Number <span className="text-[#A6452F]">*</span>
                  </label>
                  <input
                    required
                    value={flat}
                    onChange={(e) => setFlat(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 101"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    title="Only numbers allowed (e.g. 101)"
                    className="admin-input font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1">
                  Billing Month
                </label>
                <input
                  required
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="e.g. July 2026"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1">
                  Amount (₹)
                </label>
                <input
                  required
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 2500"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Monthly Maintenance"
                  className="admin-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1">
                  Assign Dues
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}
