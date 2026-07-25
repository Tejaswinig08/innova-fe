import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { toast } from "../../components/Toast";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminResidents() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [flat, setFlat] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("resident");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await authAPI.getUsers();
      setUsers(data);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddResident(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authAPI.register({
        name,
        email,
        password,
        role,
        flat,
        phone,
        society: user?.society || "Civiora",
      });
      toast("Resident added successfully!");
      setShowAddModal(false);
      // Reset form
      setName("");
      setEmail("");
      setFlat("");
      setPhone("");
      setRole("resident");
      setPassword("");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to add resident");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this resident?")) return;
    try {
      await authAPI.deleteUser(id);
      toast("Resident deleted successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.message || "Failed to delete resident");
    }
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(query.toLowerCase()) ||
      (u.flat || "").toLowerCase().includes(query.toLowerCase());

    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleTone = (r) => {
    switch (r) {
      case "owner":
        return "warn";
      case "secretary":
        return "info";
      case "treasurer":
        return "medium";
      case "chairman":
        return "ok";
      default:
        return "neutral";
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="User Management" subtitle="Loading users..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading residents data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Admin" title="User Management" subtitle="Manage society residents and roles" />

      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div className="flex gap-3 flex-1 min-w-[280px]">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name / email / flat..."
            className="admin-input flex-1"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="admin-input max-w-[180px]"
          >
            <option value="all">All Roles</option>
            <option value="resident">Resident</option>
            <option value="owner">Owner</option>
            <option value="secretary">Secretary</option>
            <option value="treasurer">Treasurer</option>
            <option value="chairman">Chairman</option>
          </select>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Add Resident
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Wing / Flat</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td className="text-gold-dark font-bold">
                    {u._id ? u._id.slice(-6) : "—"}
                  </td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.flat || "—"}</td>
                  <td>
                    <Badge tone={getRoleTone(u.role)}>{u.role}</Badge>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteUser(u._id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-brown/50">
                    No residents found matching the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Resident Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Resident"
      >
        <form onSubmit={handleAddResident} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
              Full Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="admin-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. john@example.com"
              className="admin-input"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
                Wing / Flat
              </label>
              <input
                required
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                placeholder="e.g. A-402"
                className="admin-input"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="admin-input"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="admin-input"
              >
                <option value="resident">Resident</option>
                <option value="owner">Owner</option>
                <option value="secretary">Secretary</option>
                <option value="treasurer">Treasurer</option>
                <option value="chairman">Chairman</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-brown/70 mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="admin-input"
              />
            </div>
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
              {submitting ? "Adding..." : "Add Resident"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
