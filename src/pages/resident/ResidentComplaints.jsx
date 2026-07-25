import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import { complaintsAPI } from "../../services/api";
import { IconPlus } from "../../components/icons";

const CATEGORIES = ["Maintenance", "Plumbing", "Electrical", "Safety", "Housekeeping", "Other"];

const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

const sortByPriorityHighToLow = (arr) =>
  [...arr].sort((a, b) => {
    const pA = PRIORITY_ORDER[(a.priority || "").toLowerCase()] || 0;
    const pB = PRIORITY_ORDER[(b.priority || "").toLowerCase()] || 0;
    if (pB !== pA) return pB - pA;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

function ComplaintCard({ c }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <h3 className="text-sm font-bold text-brown">{c.title}</h3>
            <Badge tone={c.priority}>{c.priority}</Badge>
          </div>
          <p className="text-xs text-brown/65 leading-relaxed mb-2">{c.description}</p>
          <p className="text-[11px] text-brown/45">
            <span className="font-semibold text-brown/70">
              Raised by: {c.raisedByName || "Resident"} {c.raisedByFlat ? `(Flat ${c.raisedByFlat})` : ""}
            </span>{" "}
            · Category: {c.category} · Reported on{" "}
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
    </Card>
  );
}

export default function ResidentComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    complaintsAPI.getAll()
      .then((data) => setComplaints(data))
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false));
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      const newComplaint = await complaintsAPI.create({
        title,
        description,
        category: category || "Other",
        priority: priority || "low",
      });
      setComplaints([newComplaint, ...complaints]);
      setShowForm(false);
      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("");
    } catch (error) {
      console.error("Failed to create complaint:", error);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Resident" title="Complaints" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading complaints...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Resident"
        title="Complaints"
        subtitle="Community complaints board — public & visible to all residents"
        action={
          <Button onClick={() => setShowForm(!showForm)} variant="primary">
            <IconPlus className="w-4 h-4" /> New complaint
          </Button>
        }
      />

      {showForm && (
        <Card className="p-6 mb-6 ring-2 ring-gold/30">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brown/70 mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Short summary of the issue"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-brown/70 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                placeholder="Describe what's happening, and where"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent"
                >
                  <option value="">Select priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="submit" variant="primary">
                Submit complaint
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-8">
        {/* 1. Open Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-3 border-b border-brown/12 pb-2">
            <h2 className="font-display text-base font-bold text-brown">1. Open</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#A6452F]/15 text-[#A6452F]">
              {complaints.filter((c) => c.status === "open" || !c.status).length}
            </span>
          </div>
          <div className="space-y-3">
            {sortByPriorityHighToLow(complaints.filter((c) => c.status === "open" || !c.status)).map((c) => (
              <ComplaintCard key={c._id} c={c} />
            ))}
            {complaints.filter((c) => c.status === "open" || !c.status).length === 0 && (
              <p className="text-xs text-brown/45 italic py-3 px-1">No open complaints</p>
            )}
          </div>
        </div>

        {/* 2. In-Progress Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-3 border-b border-brown/12 pb-2">
            <h2 className="font-display text-base font-bold text-brown">2. In-Progress</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gold/20 text-gold-dark">
              {complaints.filter((c) => c.status === "in-progress").length}
            </span>
          </div>
          <div className="space-y-3">
            {sortByPriorityHighToLow(complaints.filter((c) => c.status === "in-progress")).map((c) => (
              <ComplaintCard key={c._id} c={c} />
            ))}
            {complaints.filter((c) => c.status === "in-progress").length === 0 && (
              <p className="text-xs text-brown/45 italic py-3 px-1">No in-progress complaints</p>
            )}
          </div>
        </div>

        {/* 3. Resolved Section */}
        <div>
          <div className="flex items-center gap-2.5 mb-3 border-b border-brown/12 pb-2">
            <h2 className="font-display text-base font-bold text-brown">3. Resolved</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-forest/15 text-forest">
              {complaints.filter((c) => c.status === "resolved").length}
            </span>
          </div>
          <div className="space-y-3">
            {sortByPriorityHighToLow(complaints.filter((c) => c.status === "resolved")).map((c) => (
              <ComplaintCard key={c._id} c={c} />
            ))}
            {complaints.filter((c) => c.status === "resolved").length === 0 && (
              <p className="text-xs text-brown/45 italic py-3 px-1">No resolved complaints</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
