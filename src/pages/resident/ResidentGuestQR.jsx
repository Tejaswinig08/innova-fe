import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useAuth } from "../../context/AuthContext";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { IconQrCode, IconShare, IconCheck } from "../../components/icons";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function ResidentGuestQR() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("Guest");
  const [validDate, setValidDate] = useState(todayISO());
  const [pass, setPass] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!pass) return;
    QRCode.toDataURL(JSON.stringify(pass), {
      width: 280,
      margin: 1,
      color: { dark: "#1E3932", light: "#FAF7F2" },
    }).then(setQrDataUrl);
  }, [pass]);

  function generate(e) {
    e.preventDefault();
    setCopied(false);
    setPass({
      type: "civiora-guest-pass",
      code: `GP-${Math.floor(100000 + Math.random() * 900000)}`,
      name,
      purpose,
      flat: user?.flat || "A-302",
      validDate,
      issuedBy: user?.name || "Resident",
      issuedAt: new Date().toISOString(),
    });
  }

  async function share() {
    const text = `Civiora Guest Pass\nGuest: ${pass.name}\nVisiting: Flat ${pass.flat}\nPurpose: ${pass.purpose}\nValid: ${pass.validDate}\nCode: ${pass.code}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Civiora Guest Pass", text });
        return;
      } catch {
        // user cancelled share — fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setPass(null);
    setQrDataUrl("");
    setName("");
    setPurpose("Guest");
    setValidDate(todayISO());
  }

  return (
    <>
      <PageHeader eyebrow="Resident" title="Guest QR Pass" subtitle="Generate a QR code your guest can show security at the gate" />

      {!pass ? (
        <Card className="p-6 max-w-lg">
          <form onSubmit={generate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-brown/70 mb-1.5">Guest name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Rohit Sharma"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1.5">Purpose</label>
                <select value={purpose} onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent">
                  <option>Guest</option><option>Delivery</option><option>Service</option><option>Cab/Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-brown/70 mb-1.5">Valid on</label>
                <input type="date" min={todayISO()} required value={validDate} onChange={(e) => setValidDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent" />
              </div>
            </div>
            <Button type="submit" variant="primary" className="w-full">
              <IconQrCode className="w-4 h-4" /> Generate QR pass
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="p-8 max-w-lg text-center">
          <p className="text-xs font-medium tracking-[0.1em] uppercase text-gold-dark mb-4">Guest pass ready</p>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="Guest QR pass" className="mx-auto rounded-xl ring-1 ring-brown/10 mb-5" width={220} height={220} />
          )}
          <h2 className="font-display text-xl text-brown mb-1">{pass.name}</h2>
          <p className="text-sm text-brown/55 mb-1">{pass.purpose} · Visiting Flat {pass.flat}</p>
          <p className="text-xs text-brown/40 mb-6">Valid on {pass.validDate} · Code {pass.code}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={share} variant="primary">
              {copied ? <><IconCheck className="w-4 h-4" /> Copied</> : <><IconShare className="w-4 h-4" /> Share with guest</>}
            </Button>
            <Button variant="ghost" onClick={reset}>New pass</Button>
          </div>
          <p className="text-xs text-brown/40 mt-6">
            Ask your guest to show this QR code to security at the gate — it scans straight into the visitor log.
          </p>
        </Card>
      )}
    </>
  );
}
