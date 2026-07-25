import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import QRScanner from "../../components/QRScanner";
import { visitorsAPI } from "../../services/api";
import { IconPlus, IconScan, IconCheck } from "../../components/icons";

export default function SecurityVisitors() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("Guest");
  const [flat, setFlat] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    visitorsAPI.getAll()
      .then((data) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  async function checkIn(e) {
    e.preventDefault();
    try {
      const newLog = await visitorsAPI.checkIn({ name, purpose, flat });
      setLogs([newLog, ...logs]);
      setShowForm(false); setName(""); setFlat(""); setPurpose("Guest");
    } catch (err) {
      console.error("Check-in failed:", err);
    }
  }

  async function checkOut(id) {
    try {
      const updated = await visitorsAPI.checkOut(id);
      setLogs((ls) => ls.map((v) => v._id === id ? updated : v));
    } catch (err) {
      console.error("Check-out failed:", err);
    }
  }

  function handleScan(decodedText) {
    if (scanResult) return;
    let parsed;
    try { parsed = JSON.parse(decodedText); } catch { setScanError("That QR code isn't a recognized Civiora guest pass."); return; }
    if (parsed?.type !== "civiora-guest-pass") { setScanError("That QR code isn't a recognized Civiora guest pass."); return; }
    setScanError(""); setScanResult(parsed);
  }

  async function confirmScannedCheckIn() {
    try {
      const newLog = await visitorsAPI.checkIn({ name: scanResult.name, purpose: scanResult.purpose, flat: scanResult.flat });
      setLogs([newLog, ...logs]);
      closeScanner();
    } catch (err) {
      console.error("Scanned check-in failed:", err);
    }
  }

  function closeScanner() { setShowScanner(false); setScanResult(null); setScanError(""); }

  if (loading) return <><PageHeader eyebrow="Security" title="Visitors" subtitle="Loading..." /><div className="flex items-center justify-center py-20"><p className="text-sm text-brown/50">Loading...</p></div></>;

  return (
    <>
      <PageHeader eyebrow="Security" title="Visitors" subtitle="Log entries and exits at the main gate"
        action={<div className="flex gap-2.5">
          <Button onClick={() => { setShowScanner(true); setShowForm(false); }} variant="ghost"><IconScan className="w-4 h-4" /> Scan QR</Button>
          <Button onClick={() => { setShowForm(!showForm); setShowScanner(false); }} variant="primary"><IconPlus className="w-4 h-4" /> Check in visitor</Button>
        </div>}
      />

      {showScanner && (
        <Card className="p-6 mb-6 ring-2 ring-gold/30">
          {!scanResult ? (
            <QRScanner onResult={handleScan} onClose={closeScanner} />
          ) : (
            <div className="text-center space-y-3 py-2">
              <span className="w-10 h-10 rounded-full bg-[#3F6E52]/10 flex items-center justify-center mx-auto"><IconCheck className="w-5 h-5 text-[#3F6E52]" /></span>
              <h3 className="font-display text-lg text-brown">Guest pass verified</h3>
              <p className="text-sm text-brown">{scanResult.name} · {scanResult.purpose}</p>
              <p className="text-xs text-brown/50">Visiting Flat {scanResult.flat} · Valid {scanResult.validDate} · Code {scanResult.code}</p>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="primary" onClick={confirmScannedCheckIn}>Check in now</Button>
                <Button variant="ghost" onClick={closeScanner}>Dismiss</Button>
              </div>
            </div>
          )}
          {scanError && <p className="text-xs text-[#A6452F] text-center mt-3">{scanError}</p>}
        </Card>
      )}

      {showForm && (
        <Card className="p-6 mb-6 ring-2 ring-gold/30">
          <form onSubmit={checkIn} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-brown/70 mb-1.5">Visitor name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-brown/70 mb-1.5">Purpose</label>
              <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent">
                <option>Guest</option><option>Delivery</option><option>Service</option><option>Cab/Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-brown/70 mb-1.5">Visiting flat</label>
              <input value={flat} onChange={(e) => setFlat(e.target.value)} required placeholder="e.g. A-302" className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent" />
            </div>
            <div className="sm:col-span-3 flex gap-3 pt-1">
              <Button type="submit" variant="primary">Check in</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brown/8 text-left text-xs text-brown/45">
              <th className="px-5 py-3 font-medium">Visitor</th><th className="px-5 py-3 font-medium">Purpose</th>
              <th className="px-5 py-3 font-medium">Flat</th><th className="px-5 py-3 font-medium">In</th>
              <th className="px-5 py-3 font-medium">Out</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((v) => (
              <tr key={v._id} className="border-b border-brown/8 last:border-0">
                <td className="px-5 py-3.5 text-brown font-medium">{v.name}</td>
                <td className="px-5 py-3.5 text-brown/70">{v.purpose}</td>
                <td className="px-5 py-3.5 text-brown/70">{v.flat}</td>
                <td className="px-5 py-3.5 text-brown/50 text-xs">{v.inTime}</td>
                <td className="px-5 py-3.5 text-brown/50 text-xs">{v.outTime || "—"}</td>
                <td className="px-5 py-3.5"><Badge tone={v.status === "inside" ? "ok" : "neutral"}>{v.status}</Badge></td>
                <td className="px-5 py-3.5">
                  {v.status === "inside" && <button onClick={() => checkOut(v._id)} className="text-xs text-accent font-medium hover:underline">Check out</button>}
                </td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-brown/50">No visitor logs yet.</td></tr>}
          </tbody>
        </table>
        </div>
      </Card>
    </>
  );
}
