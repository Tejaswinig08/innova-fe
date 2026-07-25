import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { toast } from "../../components/Toast";
import { noticesAPI } from "../../services/api";

export default function AdminNotices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("low");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    setLoading(true);
    try {
      const data = await noticesAPI.getAll();
      setNotices(data);
    } catch (err) {
      toast.error(err.message || "Failed to load notices");
    } finally {
      setLoading(false);
    }
  }

  async function handlePostNotice(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await noticesAPI.create({
        title,
        body,
        category,
        priority,
        pinned: priority === "high",
      });
      toast("Notice posted successfully!");
      setShowAddModal(false);
      setTitle("");
      setCategory("general");
      setPriority("low");
      setBody("");
      fetchNotices();
    } catch (err) {
      toast.error(err.message || "Failed to post notice");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteNotice(id) {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await noticesAPI.delete(id);
      toast("Notice deleted successfully");
      fetchNotices();
    } catch (err) {
      toast.error(err.message || "Failed to delete notice");
    }
  }

  const filtered = notices.filter((n) => {
    const matchesSearch =
      (n.title || "").toLowerCase().includes(query.toLowerCase()) ||
      (n.body || "").toLowerCase().includes(query.toLowerCase());

    const matchesCategory = catFilter === "all" || n.category === catFilter;

    return matchesSearch && matchesCategory;
  });

  const getPriorityTone = (p) => {
    switch (p) {
      case "high":
        return "urgent";
      case "medium":
        return "warn";
      default:
        return "ok";
    }
  };

  const getCategoryTone = (c) => {
    switch (c) {
      case "emergency":
        return "urgent";
      case "maintenance":
        return "warn";
      case "event":
        return "info";
      default:
        return "neutral";
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="E-Notice Management" subtitle="Loading notices..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading notices data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="E-Notice Management" subtitle="Announce events, rules, and emergencies to residents" />

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex gap-3 flex-1 min-w-[280px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notices..."
            className="admin-input flex-1"
          />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="admin-input max-w-[180px]"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="maintenance">Maintenance</option>
            <option value="event">Event</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Post Notice
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-brown/8 flex justify-between items-center bg-surface">
          <h3 className="text-sm font-extrabold text-brown">All Notices</h3>
          <span className="text-xs font-bold text-gold-dark">{filtered.length} notices</span>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((n) => (
                <tr key={n._id}>
                  <td className="text-gold-dark font-bold">
                    {n._id ? n._id.slice(-6) : "—"}
                  </td>
                  <td className="max-w-xs truncate font-medium text-brown">{n.title}</td>
                  <td>
                    <Badge tone={getCategoryTone(n.category)}>{n.category}</Badge>
                  </td>
                  <td>
                    <Badge tone={getPriorityTone(n.priority)}>{n.priority}</Badge>
                  </td>
                  <td>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "—"}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteNotice(n._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-brown/50">
                    No notices found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Post Notice Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Post E-Notice"
      >
        <form onSubmit={handlePostNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
              Notice Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Annual General Meeting (AGM) 2026"
              className="admin-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-input"
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="admin-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Pinned)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
              Notice Content
            </label>
            <textarea
              required
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type the detailed announcement here..."
              className="admin-input resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Posting..." : "Publish Notice"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
