import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { toast } from "../../components/Toast";
import { paymentsAPI, bookingsAPI, expensesAPI } from "../../services/api";

const fmt = (num) => num.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function AdminInsights() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Financial Year selector
  const now = new Date();
  const defaultFyStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const [fyStart, setFyStart] = useState(defaultFyStart);

  // Add-expense modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [p, b, e] = await Promise.all([
        paymentsAPI.getAll(),
        bookingsAPI.getAll(),
        expensesAPI.getAll(),
      ]);
      setPayments(Array.isArray(p) ? p : []);
      setBookings(Array.isArray(b) ? b : []);
      setExpenses(Array.isArray(e) ? e : []);
    } catch (err) {
      toast.error("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ── Dynamic calculations ── */
  const paidPayments = payments.filter((p) => p.status === "paid");
  
  // Group income dynamically by description / category
  const incomeGroupMap = new Map();
  paidPayments.forEach((p) => {
    const desc = p.description || "General Maintenance & Contributions";
    const current = incomeGroupMap.get(desc) || { count: 0, amount: 0 };
    incomeGroupMap.set(desc, {
      count: current.count + 1,
      amount: current.amount + (Number(p.amount) || 0),
    });
  });

  const dynamicIncomeSources = Array.from(incomeGroupMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    amount: data.amount,
  }));

  const maintenanceIncome = paidPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const maintenanceCount = paidPayments.length;

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const bookingCount = confirmedBookings.length;

  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalIncome = maintenanceIncome;
  const netBalance = totalIncome - totalExpenses;

  const openAddExpense = () => {
    setExpName("");
    setExpAmount("");
    setModalOpen(true);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expName.trim() || !expAmount) return;
    setSubmitting(true);
    try {
      await expensesAPI.create({ name: expName.trim(), amount: Number(expAmount) });
      toast("Expense added");
      setModalOpen(false);
      await fetchData();
    } catch {
      toast.error("Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await expensesAPI.delete(id);
      toast("Expense deleted");
      await fetchData();
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  const cards = [
    { label: "Total Income", value: `₹${fmt(totalIncome)}`, sub: "Collected Society Dues", color: "#2e7d32", delay: "0s" },
    { label: "Total Transactions", value: `${maintenanceCount}`, sub: "Paid receipts recorded", color: "var(--color-gold)", delay: "0.1s" },
    { label: "Facility Bookings", value: `${bookingCount}`, sub: "Confirmed reservations", color: "#6a1b9a", delay: "0.2s" },
    { label: "Total Expenses", value: `₹${fmt(totalExpenses)}`, sub: "All recorded expenses", color: "#c62828", delay: "0.3s" },
  ];

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Annual Accounts" subtitle="Society Financial Overview — Civiora" />
        <p className="text-sm text-brown/50 text-center py-20">Loading financial data…</p>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Annual Accounts" subtitle="Dynamic Society Financial Overview — Civiora" />

      {/* ── Dynamic Fiscal Year Selector ── */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <label className="text-xs font-bold uppercase tracking-wider text-brown/60">Financial Year:</label>
        <select
          value={fyStart}
          onChange={(e) => setFyStart(Number(e.target.value))}
          className="admin-input py-1.5 px-4 text-sm font-bold text-brown rounded-full bg-surface border border-brown/15 shadow-2xs"
        >
          <option value={fyStart - 1}>April {fyStart - 1} – March {fyStart}</option>
          <option value={fyStart}>April {fyStart} – March {fyStart + 1}</option>
          <option value={fyStart + 1}>April {fyStart + 1} – March {fyStart + 2}</option>
        </select>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((c) => (
          <Card key={c.label} className="p-6 text-center admin-stat-card">
            <div className="text-xs uppercase tracking-wide text-brown/50 font-bold">{c.label}</div>
            <div className="text-2xl font-black mt-1" style={{ color: c.color }}>{c.value}</div>
            <div className="text-xs text-brown/40 mt-1">{c.sub}</div>
          </Card>
        ))}
      </div>

      {/* ── Dynamic Income Breakdown ── */}
      <h2 className="text-lg font-extrabold text-brown mb-4 flex items-center gap-2.5">
        Dynamic Income Breakdown (FY {fyStart}–{fyStart + 1})
        <span className="flex-1 h-0.5 bg-gradient-to-r from-gold to-transparent rounded"></span>
      </h2>

      <Card className="overflow-hidden mb-8">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Income Source / Description</th>
              <th>Transactions</th>
              <th>Type</th>
              <th className="text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {dynamicIncomeSources.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-brown/40 py-6">
                  No income transactions recorded for this financial year yet
                </td>
              </tr>
            )}
            {dynamicIncomeSources.map((src, idx) => (
              <tr key={idx}>
                <td className="font-medium text-brown">{src.name}</td>
                <td className="text-brown/70">{src.count} payment{src.count !== 1 ? "s" : ""}</td>
                <td><Badge tone="ok">Income</Badge></td>
                <td className="text-right font-bold text-brown">₹{fmt(src.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total Collected Revenue</td>
              <td className="text-right font-black" style={{ color: "var(--color-gold-dark)" }}>₹{fmt(totalIncome)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* ── Dynamic Expense Breakdown ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <h2 className="text-lg font-extrabold text-brown flex items-center gap-2.5">
          Expense Breakdown (FY {fyStart}–{fyStart + 1})
          <span className="flex-1 h-0.5 bg-gradient-to-r from-gold to-transparent rounded"></span>
        </h2>
        <Button variant="primary" size="sm" onClick={openAddExpense}>+ Add Expense</Button>
      </div>

      <Card className="overflow-hidden mb-8">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Expense Head</th>
              <th>Type</th>
              <th className="text-right">Amount (₹)</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-brown/40 py-6">No expenses recorded yet</td>
              </tr>
            )}
            {expenses.map((exp) => (
              <tr key={exp._id}>
                <td className="font-medium">{exp.name}</td>
                <td><Badge tone="urgent">Expense</Badge></td>
                <td className="text-right font-bold">₹{fmt(Number(exp.amount) || 0)}</td>
                <td className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => deleteExpense(exp._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>Total Expenses</td>
              <td className="text-right font-black" style={{ color: "#c62828" }}>₹{fmt(totalExpenses)}</td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {/* ── Net Balance ── */}
      <h2 className="text-lg font-extrabold text-brown mb-4 flex items-center gap-2.5">
        Net Financial Position
        <span className="flex-1 h-0.5 bg-gradient-to-r from-gold to-transparent rounded"></span>
      </h2>

      <Card className="p-7 flex justify-between items-center flex-wrap gap-4 net-balance-bar">
        <div className="text-sm font-semibold text-brown/70">
          {netBalance >= 0 ? "Surplus — Society finances are healthy" : "Deficit — Expenses exceed income"}
        </div>
        <div className="text-2xl font-black" style={{ color: netBalance >= 0 ? "#2e7d32" : "#c62828" }}>
          ₹{fmt(netBalance)}
        </div>
      </Card>

      {/* Add Expense Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record New Expense">
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
              Expense Head / Purpose
            </label>
            <input
              type="text"
              required
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              placeholder="e.g., Lift Maintenance, Security Guard Salary"
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              placeholder="e.g., 25000"
              className="admin-input"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
