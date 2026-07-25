import { useEffect, useRef, useState } from "react";

const REGION_ID = "civiora-qr-scan-region";

export default function QRScanner({ onResult, onClose }) {
  const scannerRef = useRef(null);
  const onResultRef = useRef(onResult);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const [manualCode, setManualCode] = useState("");

  // Keep the latest onResult without re-triggering the camera effect below —
  // the camera must start exactly once, not every time the parent re-renders.
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    // Camera access requires a secure context (HTTPS or localhost). On mobile,
    // loading the app over plain http:// will silently fail to get a camera stream.
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setError("Camera access needs a secure (HTTPS) connection. Use the manual code entry below instead.");
      setStarting(false);
      setManualMode(true);
      return;
    }

    let cancelled = false;
    let instance = null;

    // Ensure DOM container is mounted before initializing
    const container = document.getElementById(REGION_ID);
    if (!container) return;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (cancelled) return;

      try {
        instance = new Html5Qrcode(REGION_ID);
        scannerRef.current = instance;

        instance
          .start(
            { facingMode: { ideal: "environment" } },
            { fps: 10, qrbox: { width: 230, height: 230 } },
            (decodedText) => {
              onResultRef.current?.(decodedText);
            },
            () => {
              // per-frame scan miss — expected while no QR is in view, ignore
            }
          )
          .then(() => {
            if (!cancelled) setStarting(false);
          })
          .catch((err) => {
            if (cancelled) return;
            console.warn("Camera access unavailable:", err);
            setError("Couldn't access the camera. You can enter or paste the pass code manually below.");
            setStarting(false);
            setManualMode(true);
          });
      } catch (err) {
        if (!cancelled) {
          console.warn("QR Scanner init error:", err);
          setError("Camera unavailable on this device. Please enter the pass code manually below.");
          setStarting(false);
          setManualMode(true);
        }
      }
    });

    return () => {
      cancelled = true;
      const inst = scannerRef.current;
      if (inst) {
        inst.stop().then(() => inst.clear()).catch(() => {});
      }
    };
  }, []);

  function submitManual(e) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onResultRef.current?.(manualCode.trim());
  }

  return (
    <div className="space-y-3">
      {!manualMode ? (
        <>
          <div
            id={REGION_ID}
            className="w-full max-w-xs mx-auto rounded-2xl overflow-hidden ring-1 ring-brown/15 bg-forest-dark min-h-[260px] flex items-center justify-center"
          >
            {starting && <p className="text-cream/50 text-xs">Starting camera…</p>}
          </div>
          {error && <p className="text-xs text-[#A6452F] text-center">{error}</p>}
          <p className="text-xs text-brown/45 text-center">Point the camera at a guest's QR pass</p>
          <div className="flex items-center justify-center gap-4">
            <button type="button" onClick={onClose} className="text-xs text-brown/55 hover:text-brown underline">
              Cancel
            </button>
            <button type="button" onClick={() => setManualMode(true)} className="text-xs text-accent font-medium hover:underline">
              Enter code manually
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={submitManual} className="max-w-xs mx-auto space-y-3">
          <label className="block text-xs font-medium text-brown/70">Guest pass code</label>
          <input
            autoFocus
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Paste pass data or code"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl ring-1 ring-brown/15 focus:ring-accent/50 outline-none bg-transparent"
          />
          <div className="flex items-center justify-center gap-4">
            <button type="button" onClick={onClose} className="text-xs text-brown/55 hover:text-brown underline">
              Cancel
            </button>
            <button type="button" onClick={() => setManualMode(false)} className="text-xs text-brown/55 hover:text-brown underline">
              Back to camera
            </button>
            <button type="submit" className="text-xs text-accent font-medium hover:underline">
              Verify code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
