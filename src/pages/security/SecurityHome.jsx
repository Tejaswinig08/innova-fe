import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Badge from "../../components/Badge";
import { visitorsAPI } from "../../services/api";
import { IconUserCheck, IconShield, IconClock } from "../../components/icons";

export default function SecurityHome() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    visitorsAPI.getAll()
      .then((data) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const inside = logs.filter(v => v.status === "inside");

  if (loading) return <><PageHeader eyebrow="Security" title="Gate Log" subtitle="Loading..." /><div className="flex items-center justify-center py-20"><p className="text-sm text-brown/50">Loading...</p></div></>;

  return (
    <>
      <PageHeader eyebrow="Security" title="Gate Log" subtitle={`${user?.name || "Security"} · ${user?.title || ""}`} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Currently inside" value={inside.length} icon={IconUserCheck} tone="forest" />
        <StatCard label="Logged today" value={logs.length} icon={IconClock} tone="gold" />
        <StatCard label="Active alerts" value={0} icon={IconShield} tone="forest" hint="All clear" />
      </div>
      <h2 className="font-display text-lg text-brown mb-4">Currently inside</h2>
      <div className="space-y-3">
        {inside.map((v) => (
          <Card key={v._id} className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-brown">{v.name}</p>
              <p className="text-xs text-brown/50 mt-0.5">{v.purpose} · Visiting Flat {v.flat}</p>
            </div>
            <div className="text-right">
              <Badge tone="ok">Inside</Badge>
              <p className="text-xs text-brown/40 mt-1.5">In at {v.inTime}</p>
            </div>
          </Card>
        ))}
        {inside.length === 0 && <Card className="p-12 text-center"><p className="text-sm text-brown/50">No visitors currently inside.</p></Card>}
      </div>
    </>
  );
}
