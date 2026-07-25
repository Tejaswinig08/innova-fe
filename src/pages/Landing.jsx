import { Link } from "react-router-dom";
import GateMotif from "../components/GateMotif";
import Logo from "../components/Logo";
import Button from "../components/Button";
import ThemeToggle from "../components/ThemeToggle";
import { IconHome, IconShield, IconUsers, IconArrowRight, IconCalendar, IconWallet, IconChat } from "../components/icons";

const FEATURES = [
  { icon: IconShield, title: "Friction-less visitor routing", desc: "QR-based guest passes residents share in a tap, scanned at the gate in seconds." },
  { icon: IconWallet, title: "Automated ledgers", desc: "Maintenance dues, collections, and overdue tracking — always reconciled." },
  { icon: IconCalendar, title: "Smart facility booking", desc: "Reserve shared spaces with built-in protection against booking the past." },
  { icon: IconChat, title: "SocietyGPT", desc: "Instant, accurate answers about your society — for every resident." },
];

const ROLES = [
  { id: "resident", label: "Resident", desc: "Raise complaints, book facilities, pay dues, share guest QR passes", icon: IconHome },
  { id: "admin", label: "Admin / Committee", desc: "Manage society operations end to end", icon: IconUsers },
  { id: "security", label: "Security", desc: "Log visitors and scan guest QR passes at the gate", icon: IconShield },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-forest dark:bg-beige-dark text-cream">
      {/* Nav */}
      <header className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Logo tone="light" size="md" />
        <nav className="hidden md:flex items-center gap-8 text-sm text-cream/70">
          <a href="#home" className="hover:text-cream transition-colors">Home</a>
          <a href="#overview" className="hover:text-cream transition-colors">Overview</a>
          <a href="#workflows" className="hover:text-cream transition-colors">Workflows</a>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className="text-sm text-cream/80 hover:text-cream transition-colors">Sign In</Link>
          <Button as={Link} to="/signup" variant="primary" size="sm">Get Started</Button>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <GateMotif
          stroke="#EFE6D8"
          className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[1200px] opacity-[0.05] pointer-events-none"
        />
        <div className="relative max-w-4xl mx-auto px-6 pt-10 pb-24 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ring-1 ring-gold/30 bg-gold/10 text-gold-light text-xs tracking-[0.1em] uppercase mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" /> The Ultimate Society Command Center
          </span>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.08] mb-6">
            Manage societies with{" "}
            <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">absolute precision.</span>
          </h1>
          <p className="text-cream/65 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Civiora replaces chaos with clarity. Experience friction-less visitor routing, automated ledgers, and a premium portal designed exclusively for modern residential living.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button as={Link} to="/signup" variant="primary" size="lg">
              Create Workspace <IconArrowRight className="w-4 h-4" />
            </Button>
            <Button as="a" href="#overview" variant="ghost" size="lg" className="!text-cream !ring-cream/25 hover:!bg-cream/8">
              Discover Features
            </Button>
          </div>
        </div>
      </section>

      {/* Overview / Features */}
      <section id="overview" className="bg-beige dark:bg-beige text-brown">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-gold-dark mb-2 text-center">Overview</p>
          <h2 className="font-display text-3xl text-brown text-center mb-12">Everything a society needs, in one workspace</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-surface rounded-2xl ring-1 ring-brown/8 p-6 flex gap-4">
                <span className="w-11 h-11 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-accent" />
                </span>
                <div>
                  <h3 className="font-medium text-brown mb-1">{f.title}</h3>
                  <p className="text-sm text-brown/55 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflows / role select */}
      <section id="workflows" className="bg-forest-dark">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="text-xs font-medium tracking-[0.12em] uppercase text-gold-light mb-2 text-center">Workflows</p>
          <h2 className="font-display text-3xl text-cream text-center mb-12">Built for every role at the gate and beyond</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES.map((r) => (
              <div key={r.id} className="rounded-2xl ring-1 ring-cream/10 bg-cream/5 p-6">
                <span className="w-11 h-11 rounded-full bg-gold/15 flex items-center justify-center mb-4">
                  <r.icon className="w-5 h-5 text-gold-light" />
                </span>
                <h3 className="font-medium text-cream mb-1.5">{r.label}</h3>
                <p className="text-sm text-cream/55 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button as={Link} to="/login" variant="primary" size="lg">
              Sign in to your workspace <IconArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-forest-dark border-t border-cream/10">
        <p className="text-center text-cream/40 text-xs py-8">
          Civiora · Built for societies that expect more
        </p>
      </footer>
    </div>
  );
}
