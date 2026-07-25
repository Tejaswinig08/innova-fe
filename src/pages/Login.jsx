import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GateMotif from "../components/GateMotif";
import Logo from "../components/Logo";
import Button from "../components/Button";
import ThemeToggle from "../components/ThemeToggle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await login(email, password);
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
          <h1 className="font-display text-2xl text-cream">Welcome back</h1>
          <p className="text-cream/55 text-sm mt-1.5">Sign in with your registered credentials</p>
        </div>

        <div className="bg-surface rounded-[1.75rem_1.75rem_0.25rem_0.25rem] p-8 shadow-2xl shadow-forest-dark/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@civiora.com"
                className="w-full px-3.5 py-3 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium tracking-wide uppercase text-brown/55 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                className="w-full px-3.5 py-3 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent text-brown placeholder:text-brown/30"
              />
            </div>

            {error && <p className="text-xs text-[#A6452F] -mt-1">{error}</p>}

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Sign In
            </Button>
          </form>

          <p className="text-center text-xs text-brown/50 mt-6">
            Don't have an account? <Link to="/signup" className="text-gold-dark font-medium hover:underline">Register workspace</Link>
          </p>
        </div>

        <p className="text-center text-cream/40 text-xs mt-7">
          Civiora · Built for societies that expect more
        </p>
      </div>
    </div>
  );
}
