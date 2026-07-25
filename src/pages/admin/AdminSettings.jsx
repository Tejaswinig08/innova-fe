import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import { toast } from "../../components/Toast";
import { societyConfigAPI } from "../../services/api";

export default function AdminSettings() {
  const [wingsInput, setWingsInput] = useState("A, B, C");
  const [totalFloors, setTotalFloors] = useState(10);
  const [flatsPerFloor, setFlatsPerFloor] = useState(4);
  const [exceptions, setExceptions] = useState([]);

  // Adding exception state
  const [newExcFloor, setNewExcFloor] = useState(1);
  const [newExcFlats, setNewExcFlats] = useState(2);
  const [showAddExc, setShowAddExc] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    societyConfigAPI
      .get()
      .then((data) => {
        if (data.wings) setWingsInput(data.wings.join(", "));
        if (data.totalFloors) setTotalFloors(data.totalFloors);
        if (data.flatsPerFloor) setFlatsPerFloor(data.flatsPerFloor);
        if (Array.isArray(data.exceptions)) setExceptions(data.exceptions);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute generated flats list for preview
  function getGeneratedFlatsForWing() {
    const excMap = new Map();
    exceptions.forEach((e) => excMap.set(Number(e.floor), Number(e.flatsCount)));

    const flats = [];
    for (let fl = 1; fl <= totalFloors; fl++) {
      const count = excMap.has(fl) ? excMap.get(fl) : flatsPerFloor;
      for (let num = 1; num <= count; num++) {
        const paddedNum = num < 10 ? `0${num}` : `${num}`;
        flats.push(`${fl}${paddedNum}`);
      }
    }
    return flats;
  }

  function handleAddException() {
    if (newExcFloor < 1 || newExcFloor > totalFloors) {
      toast.error(`Floor must be between 1 and ${totalFloors}`);
      return;
    }
    if (newExcFlats <= 0) {
      toast.error("Flats count must be greater than 0");
      return;
    }
    // Update or add exception for that floor
    const filtered = exceptions.filter((e) => Number(e.floor) !== Number(newExcFloor));
    setExceptions([...filtered, { floor: Number(newExcFloor), flatsCount: Number(newExcFlats) }].sort((a, b) => a.floor - b.floor));
    setShowAddExc(false);
    toast(`Added exception for Floor ${newExcFloor}`);
  }

  function handleRemoveException(floorNum) {
    setExceptions(exceptions.filter((e) => Number(e.floor) !== Number(floorNum)));
  }

  async function handleSave(e) {
    e.preventDefault();
    const wings = wingsInput
      .split(",")
      .map((w) => w.trim().toUpperCase())
      .filter(Boolean);

    if (wings.length === 0) {
      toast.error("Please enter at least one wing name");
      return;
    }
    if (totalFloors <= 0) {
      toast.error("Total floors must be greater than 0");
      return;
    }
    if (flatsPerFloor <= 0) {
      toast.error("Flats per floor must be greater than 0");
      return;
    }

    setSaving(true);
    try {
      await societyConfigAPI.update({
        wings,
        totalFloors,
        flatsPerFloor,
        exceptions,
      });
      toast("Society structure & flat numbering updated successfully");
    } catch (err) {
      toast.error(err.message || "Failed to update society settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Admin" title="Society Settings" subtitle="Loading structure..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading settings...</p>
        </div>
      </>
    );
  }

  const generatedFlats = getGeneratedFlatsForWing();
  const wingsList = wingsInput
    .split(",")
    .map((w) => w.trim().toUpperCase())
    .filter(Boolean);
  const totalSocietyFlats = generatedFlats.length * (wingsList.length || 1);

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="Society Settings & Configuration"
        subtitle="Configure wings, floor structure, flat numbering, and custom floor rules"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Society & Flat Structure */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6">
            <h3 className="font-display text-lg text-brown mb-1.5 font-bold">Base Tower Template</h3>
            <p className="text-xs text-brown/60 mb-5 leading-relaxed">
              Define the default floor layout for wings. Most floors follow this standard numbering template.
            </p>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
                  Wings List (Comma separated)
                </label>
                <input
                  type="text"
                  value={wingsInput}
                  onChange={(e) => setWingsInput(e.target.value)}
                  placeholder="e.g. A, B, C, D"
                  className="admin-input"
                />
                <p className="text-[11px] text-brown/45 mt-1">
                  Enter letters or names representing wings/blocks in your society.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
                    Total Floors per Wing
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(Math.max(1, Number(e.target.value)))}
                    className="admin-input"
                  />
                  <p className="text-[11px] text-brown/45 mt-1">e.g., 10 floors (Floors 1 to 10)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">
                    Standard Flats per Floor
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={flatsPerFloor}
                    onChange={(e) => setFlatsPerFloor(Math.max(1, Number(e.target.value)))}
                    className="admin-input"
                  />
                  <p className="text-[11px] text-brown/45 mt-1">e.g., 4 flats (01 to 04 per floor)</p>
                </div>
              </div>

              {/* Custom Floor Exceptions */}
              <div className="pt-3 border-t border-brown/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-brown uppercase tracking-wider">
                      Custom Floor Exceptions
                    </h4>
                    <p className="text-[11px] text-brown/55">
                      Override flats count for non-standard floors (e.g. Ground Floor / Penthouses)
                    </p>
                  </div>
                  {!showAddExc && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowAddExc(true)}
                    >
                      + Add Exception Floor
                    </Button>
                  )}
                </div>

                {showAddExc && (
                  <div className="p-3.5 bg-brown/5 rounded-xl border border-brown/10 mb-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-brown/70 mb-1">
                          Floor Number
                        </label>
                        <input
                          type="number"
                          min="1"
                          max={totalFloors}
                          value={newExcFloor}
                          onChange={(e) => setNewExcFloor(Number(e.target.value))}
                          className="admin-input py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-brown/70 mb-1">
                          Flats on this Floor
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newExcFlats}
                          onChange={(e) => setNewExcFlats(Number(e.target.value))}
                          className="admin-input py-1.5 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddExc(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={handleAddException}
                      >
                        Save Exception
                      </Button>
                    </div>
                  </div>
                )}

                {exceptions.length === 0 ? (
                  <p className="text-xs text-brown/40 italic py-1">
                    No exceptions added. All {totalFloors} floors use standard {flatsPerFloor} flats/floor.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {exceptions.map((ex) => (
                      <div
                        key={ex.floor}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-accent/5 border border-accent/20 text-xs"
                      >
                        <div>
                          <span className="font-bold text-brown">Floor {ex.floor}:</span>{" "}
                          <span className="text-brown/75">
                            {ex.flatsCount} flats ({ex.floor}01 – {ex.floor}{ex.flatsCount < 10 ? `0${ex.flatsCount}` : ex.flatsCount})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveException(ex.floor)}
                          className="text-brown/40 hover:text-red-500 font-bold px-2"
                          title="Remove exception"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Settings"}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Preview: Live Generated Flat Numbers Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-brown">Live Structure Preview</h3>
                <p className="text-xs text-brown/60">Generated flat numbers per wing</p>
              </div>
              <Badge tone="forest">{generatedFlats.length} flats / wing</Badge>
            </div>

            <div className="p-3 rounded-xl bg-brown/5 border border-brown/10 mb-4 flex justify-between items-center text-xs font-semibold text-brown">
              <span>Total Society Flats ({wingsList.length || 1} wings):</span>
              <span className="text-sm font-black text-gold-dark">{totalSocietyFlats} flats</span>
            </div>

            <div className="max-h-72 overflow-y-auto pr-1">
              <div className="flex flex-wrap gap-1.5">
                {generatedFlats.slice(0, 100).map((flatNum) => (
                  <span
                    key={flatNum}
                    className="px-2 py-1 rounded-lg bg-surface border border-brown/10 text-xs font-mono font-bold text-brown/80 shadow-2xs"
                  >
                    {flatNum}
                  </span>
                ))}
                {generatedFlats.length > 100 && (
                  <span className="px-2.5 py-1 rounded-lg bg-brown/10 text-xs font-semibold text-brown/60">
                    +{generatedFlats.length - 100} more...
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
