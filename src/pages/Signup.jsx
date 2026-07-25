import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GateMotif from "../components/GateMotif";
import Logo from "../components/Logo";
import Button from "../components/Button";
import ThemeToggle from "../components/ThemeToggle";

const ROLES = [
  { id: "admin", label: "Admin" },
  { id: "security", label: "Security" },
  { id: "resident", label: "Resident" },
];

export default function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [society, setSociety] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("resident");
  const [wing, setWing] = useState("");
  const [flat, setFlat] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (role === "resident" || role === "admin") {
      const cleanWing = wing.trim().replace(/[^a-zA-Z]/g, "").toUpperCase();
      const cleanFlat = flat.trim().replace(/\D/g, "");

      if (!cleanWing || !cleanFlat) {
        setError("Please enter both your Wing (letters only, e.g., A) and Flat Number (digits only, e.g., 101).");
        return;
      }
      if (!/^[A-Z]$/.test(cleanWing)) {
        setError("Wing must be exactly one English capital letter (e.g., A, B, C).");
        return;
      }
      if (!/^\d+$/.test(cleanFlat)) {
        setError("Flat number must contain only numbers (e.g., 101).");
        return;
      }
    }

    const formattedFlat =
      role === "resident" || role === "admin"
        ? `${wing.trim().replace(/[^a-zA-Z]/g, "").toUpperCase()}-${flat.trim().replace(/\D/g, "")}`
        : flat.trim();

    const result = await register({
      firstName,
      lastName,
      society,
      email,
      password,
      role,
      flat: formattedFlat,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate(`/${result.role}`);
  }

  return (
    <div className="min-h-screen bg-forest dark:bg-beige-dark relative overflow-hidden flex items-center justify-center px-6 py-12">
      <GateMotif
        stroke="#EFE6D8"
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[1100px] opacity-[0.06] pointer-events-none"
      />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex justify-center mb-6">
            <Logo tone="light" size="lg" />
          </Link>
          <h1 className="font-display text-2xl text-cream">Join Civiora</h1>
          <p className="text-cream/55 text-sm mt-1.5">New workspace initialization</p>
        </div>

        <div className="bg-surface rounded-[1.75rem_1.75rem_0.25rem_0.25rem] p-8 shadow-2xl shadow-forest-dark/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">First name</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30" />
              </div>
              <div>
                <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Last name</label>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Society name</label>
              <input required value={society} onChange={(e) => setSociety(e.target.value)} placeholder="e.g. Meadowcrest Residency"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30" />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Email address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30" />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30" />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Your role</label>
              <div className="grid grid-cols-3 gap-2.5">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`py-2.5 rounded-xl text-xs font-medium ring-1 transition-colors ${
                      role === r.id
                        ? "bg-gold/15 ring-gold text-gold-dark"
                        : "ring-brown/12 text-brown/70 hover:ring-brown/25"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {(role === "resident" || role === "admin") && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold tracking-wide uppercase text-brown/75 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30 font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold tracking-wide uppercase text-brown/75 mb-1.5">
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
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30 font-bold"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-xs text-[#A6452F]">{error}</p>}

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-brown/50 mt-6">
            Already have an account? <Link to="/login" className="text-gold-dark font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
