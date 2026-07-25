import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import { toast } from "../../components/Toast";
import { complaintsAPI } from "../../services/api";

const STATUSES = ["open", "in-progress", "resolved"];
const PRIORITIES = ["urgent", "high", "medium", "low"];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    setLoading(true);
    try {
      const data = await complaintsAPI.getAll();
      setComplaints(data);
    } catch (err) {
      toast.error(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await complaintsAPI.update(id, { status });
      setComplaints((cs) => cs.map((c) => (c._id === id ? updated : c)));
      toast(`Complaint status updated to ${status}`);
    } catch (error) {
      toast.error(error.message || "Failed to update status");
    }
  }

  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status !== "resolved").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      (c.title || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.raisedByName || "").toLowerCase().includes(query.toLowerCase()) ||
      (c.raisedByFlat || "").toLowerCase().includes(query.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      c.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesPriority =
      priorityFilter === "all" ||
      c.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Complaints" subtitle="Loading complaints..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading complaints data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="Complaints" subtitle="Track and resolve resident tickets" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 admin-stat-card">
          <p className="text-xs uppercase tracking-wide text-brown/55 font-bold">Total Raised</p>
          <p className="text-2xl font-black text-brown mt-1.5">{totalCount}</p>
          <p className="text-xs text-gold-dark font-semibold mt-1">All time complaints</p>
        </Card>
        <Card className="p-5 admin-stat-card">
          <p className="text-xs uppercase tracking-wide text-brown/55 font-bold">Pending Complaints</p>
          <p className="text-2xl font-black text-[#A6452F] mt-1.5">{pendingCount}</p>
          <p className="text-xs text-gold-dark font-semibold mt-1">Requires action</p>
        </Card>
        <Card className="p-5 admin-stat-card">
          <p className="text-xs uppercase tracking-wide text-brown/55 font-bold">Resolved</p>
          <p className="text-2xl font-black text-[#3F6E52] mt-1.5">{resolvedCount}</p>
          <p className="text-xs text-gold-dark font-semibold mt-1">Completed tickets</p>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex gap-3 flex-1 min-w-[280px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search complaints..."
            className="admin-input flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-input max-w-[150px]"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="admin-input max-w-[150px]"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-brown/8 flex justify-between items-center bg-surface">
          <h3 className="text-sm font-extrabold text-brown">All Complaints</h3>
          <span className="text-xs font-bold text-gold-dark">{filtered.length} complaints</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Resident</th>
                <th>Flat</th>
                <th>Subject</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c._id}>
                  <td className="text-gold-dark font-bold">
                    {c._id ? c._id.slice(-6) : "—"}
                  </td>
                  <td>{c.raisedByName || "Resident"}</td>
                  <td>{c.raisedByFlat || "—"}</td>
                  <td className="max-w-xs truncate" title={c.description}>
                    <p className="font-semibold text-brown">{c.title}</p>
                    <p className="text-xs text-brown/40 truncate">{c.description}</p>
                  </td>
                  <td>
                    <Badge tone={c.priority}>{c.priority}</Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        c.status === "resolved"
                          ? "ok"
                          : c.status === "in-progress"
                          ? "warn"
                          : "info"
                      }
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <select
                      value={c.status}
                      onChange={(e) => updateStatus(c._id, e.target.value)}
                      className="admin-input py-1 px-2 text-xs w-[120px]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-brown/50">
                    No complaints found.
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
