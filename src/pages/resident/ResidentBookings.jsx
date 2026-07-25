import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Badge from "../../components/Badge";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import { toast } from "../../components/Toast";
import { facilitiesAPI, bookingsAPI } from "../../services/api";
import { useBookings } from "../../context/BookingsContext";
import { useAuth } from "../../context/AuthContext";
import { IconCalendar } from "../../components/icons";

const FACILITY_METADATA = {
  "party hall": {
    image: "/party_hall.png",
    description: "Elegant banquet hall perfect for birthdays, anniversaries, and festive gatherings. Equipped with stage, lighting, and AC. Ideal for group events with family and friends.",
    capacityLabel: "50 People",
    isGroup: true
  },
  "games club": {
    image: "/games_club.png",
    description: "Indoor games room with table tennis, carrom, chess, and foosball. Great for unwinding and socializing with fellow residents.",
    capacityLabel: "20 People",
    isGroup: false
  },
  "swimming pool": {
    image: "/swimming_pool.png",
    description: "Crystal-clear outdoor pool with sun loungers. Open daily with lifeguard on duty. Perfect for a refreshing swim!",
    capacityLabel: "20 People",
    isGroup: false
  },
  "gym & fitness center": {
    image: "/gym.png",
    description: "Fully equipped gym with treadmills, weights, and cardio machines. Stay fit with world-class equipment and a motivating environment.",
    capacityLabel: "20 People",
    isGroup: false
  },
  "sports court": {
    image: "/sports_court.png",
    description: "Multi-sport court for badminton, basketball, and tennis. Floodlit for evening sessions. Great for friendly matches!",
    capacityLabel: "20 People",
    isGroup: true
  }
};

const TIME_SLOTS = [
  "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
];

const LEAVING_TIME_SLOTS = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM"
];

function toMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) {
    const parts = timeStr.trim().split(":");
    if (parts.length === 2) {
      return Number(parts[0]) * 60 + Number(parts[1]);
    }
    return 0;
  }
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function parseSlot(slotStr) {
  if (!slotStr) return null;
  const parts = slotStr.split(/–|-/);
  if (parts.length !== 2) return null;
  const startMin = toMinutes(parts[0]);
  const endMin = toMinutes(parts[1]);
  return { startMin, endMin };
}

function to24h(timeStr) {
  if (!timeStr) return "";
  const [timePart, period] = timeStr.trim().split(/\s+/);
  let [hours, minutes] = timePart.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
}

function to12h(time24) {
  if (!time24) return "";
  let [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
}

function addOneHour(time24) {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const total = h * 60 + m + 60;
  return String(Math.floor(total / 60) % 24).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
}

function format12hSlot(slotStr) {
  if (!slotStr) return "—";
  return slotStr
    .split(/\s*[-–]\s*/)
    .map((part) => {
      const match = part.trim().match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return part.trim();
      let h = Number(match[1]);
      const m = match[2];
      const period = h >= 12 ? "PM" : "AM";
      if (h > 12) h -= 12;
      if (h === 0) h = 12;
      return `${String(h).padStart(2, "0")}:${m} ${period}`;
    })
    .join(" – ");
}

export default function ResidentBookings() {
  const { user } = useAuth();
  const { bookings, refreshBookings } = useBookings();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true);

  async function handleCancelMyBooking(id) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingsAPI.update(id, { status: "cancelled" });
      toast("Booking cancelled successfully");
      refreshBookings();
      if (selected && date) {
        bookingsAPI.getLockedSlots(selected._id, date)
          .then((data) => {
            if (Array.isArray(data)) {
              setLockedSlots(data);
              setFacilityCapacity(getMetadata(selected.name).isGroup ? 1 : 20);
            } else if (data && typeof data === "object") {
              setLockedSlots(Array.isArray(data.lockedSlots) ? data.lockedSlots : []);
              setFacilityCapacity(data.capacity || (getMetadata(selected.name).isGroup ? 1 : 20));
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel booking");
    }
  }

  // Selected Booking Form State
  const [selected, setSelected] = useState(null);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [leavingTime, setLeavingTime] = useState("");
  
  // Slots that are locked/booked on selected date
  const [lockedSlots, setLockedSlots] = useState([]);
  const [facilityCapacity, setFacilityCapacity] = useState(1);
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [canBook, setCanBook] = useState(false);

  // Modal State
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  async function fetchFacilities() {
    setFacilitiesLoading(true);
    try {
      const data = await facilitiesAPI.getAll();
      setFacilities(data);
    } catch {
      toast.error("Failed to load facilities");
    } finally {
      setFacilitiesLoading(false);
    }
  }

  // Fetch locked slots when selected facility or date changes
  useEffect(() => {
    if (!selected || !date) {
      setLockedSlots([]);
      setFacilityCapacity(1);
      return;
    }
    bookingsAPI.getLockedSlots(selected._id, date)
      .then((data) => {
        if (Array.isArray(data)) {
          setLockedSlots(data);
          setFacilityCapacity(getMetadata(selected.name).isGroup ? 1 : 20);
        } else if (data && typeof data === "object") {
          setLockedSlots(Array.isArray(data.lockedSlots) ? data.lockedSlots : []);
          setFacilityCapacity(data.capacity || (getMetadata(selected.name).isGroup ? 1 : 20));
        } else {
          setLockedSlots([]);
          setFacilityCapacity(1);
        }
      })
      .catch(() => {
        setLockedSlots([]);
        setFacilityCapacity(1);
      });
  }, [selected, date]);

  const getMetadata = (name) => {
    return (
      FACILITY_METADATA[name.toLowerCase()] || {
        image: "/party_hall.png",
        description: "Shared community facility space.",
        capacityLabel: "Variable",
        isGroup: false
      }
    );
  };

  const getMinDate = () => {
    const now = new Date();
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0")
    );
  };

  // Run availability check on form change
  useEffect(() => {
    if (!selected || !date || !startTime || (getMetadata(selected.name).isGroup && !leavingTime)) {
      setAvailability(null);
      setCanBook(false);
      return;
    }

    const meta = getMetadata(selected.name);

    if (meta.isGroup && leavingTime) {
      if (LEAVING_TIME_SLOTS.indexOf(leavingTime) <= TIME_SLOTS.indexOf(startTime)) {
        toast.error("Leaving time must be after start time");
        setCanBook(false);
        return;
      }
    }

    runCheck(meta.isGroup);
  }, [selected, date, startTime, leavingTime]);

  async function runCheck(isGroup) {
    setChecking(true);
    try {
      // 1. Capacity check
      const availData = await bookingsAPI.getAvailability(selected._id, date, startTime);
      setAvailability(availData);

      if (availData.isFull) {
        setCanBook(false);
        return;
      }

      // 2. Conflict range check
      const start24 = to24h(startTime);
      const end24 = isGroup ? to24h(leavingTime) : addOneHour(start24);

      const conflictData = await bookingsAPI.checkConflict(selected._id, date, start24, end24);
      if (conflictData.conflict) {
        toast.error("This slot is already booked. Try some other slot.");
        setCanBook(false);
      } else {
        setCanBook(true);
      }
    } catch {
      toast.error("Error checking slot availability");
      setCanBook(false);
    } finally {
      setChecking(false);
    }
  }

  // Helper to determine if a start time option is locked/disabled
  const isStartTimeDisabled = (t) => {
    if (!date || !selected || !Array.isArray(lockedSlots)) return false;
    const optionStart = toMinutes(t);
    const optionEnd = optionStart + 60;

    let overlapCount = 0;
    for (const slot of lockedSlots) {
      const bSlot = parseSlot(slot);
      if (bSlot) {
        const overlap =
          facilityCapacity === 1
            ? optionStart < bSlot.endMin + 60 && bSlot.startMin < optionEnd + 60
            : optionStart < bSlot.endMin && bSlot.startMin < optionEnd;
        if (overlap) overlapCount++;
      }
    }
    return overlapCount >= facilityCapacity;
  };

  // Helper to determine if a leaving time option is locked/disabled
  const isLeavingTimeDisabled = (l) => {
    if (!startTime || !selected || !Array.isArray(lockedSlots)) return true;
    const optionStart = toMinutes(startTime);
    const optionEnd = toMinutes(l);
    if (optionEnd <= optionStart) return true;

    if (facilityCapacity === 1) {
      return lockedSlots.some((slot) => {
        const bSlot = parseSlot(slot);
        return bSlot && optionStart < bSlot.endMin + 60 && bSlot.startMin < optionEnd + 60;
      });
    }
    return false;
  };

  function handleOpenConfirmModal() {
    setConfirmModalOpen(true);
  }

  function handleRedirectToPayment() {
    const meta = getMetadata(selected.name);
    const timeDisplay = meta.isGroup
      ? `${startTime} - ${leavingTime}`
      : `${startTime} - ${startTime && to12h(addOneHour(to24h(startTime)))}`;
    const description = `Booking: ${selected.name} on ${date} (${timeDisplay})`;
    
    const basePath = user?.role === "admin" ? "/admin/personal/pay" : "/resident/payments/pay";
    navigate(
      `${basePath}?amount=${selected.hourlyRate}&description=${encodeURIComponent(
        description
      )}&facilityId=${selected._id}&date=${date}&slot=${encodeURIComponent(timeDisplay)}`
    );
  }

  if (facilitiesLoading) {
    return (
      <>
        <PageHeader eyebrow="Resident" title="Facility Booking" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-brown/50">Loading shared facilities...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Resident" title="Facility Booking" subtitle="Reserve shared spaces for your flat" />

      {/* Facilities Grid View */}
      {!selected ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {facilities.map((f) => {
            const meta = getMetadata(f.name);
            return (
              <Card key={f._id} className="overflow-hidden flex flex-col justify-between border border-brown/5 shadow-md">
                <img src={meta.image} alt={f.name} className="w-full h-44 object-cover border-b border-brown/10" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-brown mb-1.5">{f.name}</h3>
                    <p className="text-xs text-brown/60 leading-relaxed mb-4">{meta.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[11px] text-brown/50 font-bold uppercase tracking-wider">Hourly Rate</p>
                      <p className="text-sm font-black text-brown">₹{f.hourlyRate}/hr</p>
                    </div>
                    {f.available ? (
                      <Button size="sm" variant="ghost" onClick={() => setSelected(f)}>
                        Book
                      </Button>
                    ) : (
                      <Badge tone="overdue">Unavailable</Badge>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
          {facilities.length === 0 && (
            <Card className="p-12 text-center col-span-2">
              <p className="text-sm text-brown/50">No facilities available yet.</p>
            </Card>
          )}
        </div>
      ) : (
        /* Selected Facility Detail Booking Form */
        <div className="max-w-3xl mx-auto mb-8">
          <Card className="overflow-hidden shadow-xl border border-brown/5">
            <img src={getMetadata(selected.name).image} alt={selected.name} className="w-full h-64 object-cover border-b-2 border-gold" />
            <div className="p-6">
              <h2 className="font-display text-2xl text-brown mb-2 font-bold">{selected.name}</h2>
              <p className="text-sm text-brown/70 leading-relaxed mb-6">
                {getMetadata(selected.name).description}
              </p>

              {/* Info grid - Styled with theme-aware borders & bg for dark mode support */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-gold/10 dark:bg-gold/5 border border-gold/30 rounded-xl p-3.5 text-center">
                  <p className="text-[10px] text-brown/55 font-bold uppercase tracking-wider">Capacity</p>
                  <p className="text-base font-extrabold text-brown mt-1">
                    {getMetadata(selected.name).capacityLabel}
                  </p>
                </div>
                <div className="bg-gold/10 dark:bg-gold/5 border border-gold/30 rounded-xl p-3.5 text-center">
                  <p className="text-[10px] text-brown/55 font-bold uppercase tracking-wider">Price</p>
                  <p className="text-base font-extrabold text-brown mt-1">₹{selected.hourlyRate}/hr</p>
                </div>
                <div className="bg-gold/10 dark:bg-gold/5 border border-gold/30 rounded-xl p-3.5 text-center">
                  <p className="text-[10px] text-brown/55 font-bold uppercase tracking-wider">Booked</p>
                  <p className="text-base font-extrabold text-brown mt-1">
                    {availability ? availability.booked : "--"}
                  </p>
                </div>
                <div className="bg-gold/10 dark:bg-gold/5 border border-gold/30 rounded-xl p-3.5 text-center">
                  <p className="text-[10px] text-brown/55 font-bold uppercase tracking-wider">Available Slots</p>
                  <p className={`text-base font-extrabold mt-1 ${availability?.isFull ? "text-[#A6452F]" : "text-[#3F6E52]"}`}>
                    {availability ? (availability.isFull ? "FULL" : availability.available) : "--"}
                  </p>
                </div>
              </div>

              {/* Form elements */}
              <div className="border-t border-brown/10 pt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">Select Date</label>
                  <input
                    type="date"
                    min={getMinDate()}
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setStartTime("");
                      setLeavingTime("");
                    }}
                    className="admin-input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">Select Start Time</label>
                    <select
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(e.target.value);
                        setLeavingTime("");
                      }}
                      disabled={!date}
                      className="admin-input disabled:opacity-50"
                    >
                      <option value="">-- Choose a slot --</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t} disabled={isStartTimeDisabled(t)}>
                          {t} {isStartTimeDisabled(t) ? "(Locked)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {getMetadata(selected.name).isGroup && (
                    <div>
                      <label className="block text-xs font-bold text-brown/75 uppercase tracking-wide mb-1.5">Select Leaving Time</label>
                      <select
                        value={leavingTime}
                        onChange={(e) => setLeavingTime(e.target.value)}
                        disabled={!startTime}
                        className="admin-input disabled:opacity-50"
                      >
                        <option value="">-- Choose leaving time --</option>
                        {LEAVING_TIME_SLOTS.map((t) => (
                          <option key={t} value={t} disabled={isLeavingTimeDisabled(t)}>
                            {t} {isLeavingTimeDisabled(t) ? "(Locked/Invalid)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Cancel & Confirm Row */}
                <div className="flex gap-4 pt-4">
                  <Button variant="ghost" onClick={() => { setSelected(null); setAvailability(null); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!canBook || checking}
                    onClick={handleOpenConfirmModal}
                    className="flex-1"
                  >
                    {checking ? "Checking..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>

              {/* Note bar - Styled for both light and dark mode */}
              <div className="mt-5 p-3.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 text-xs font-bold text-center rounded-xl border border-red-200 dark:border-red-900/30">
                The booking cannot be cancelled and is Non-refundable.
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Booking confirmation Modal */}
      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Your Booking"
      >
        <div className="text-center p-4">
          <p className="text-sm text-brown/80 mb-3">
            Please confirm your booking details:
          </p>
          <div className="bg-brown/5 rounded-2xl p-4 mb-4 text-sm font-semibold text-brown inline-block text-left w-full max-w-sm space-y-1">
            <p>Facility: {selected?.name}</p>
            <p>Date: {date ? new Date(date).toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ""}</p>
            <p>
              Time: {selected && getMetadata(selected.name).isGroup ? `${startTime} - ${leavingTime}` : `${startTime} - ${startTime && to12h(addOneHour(to24h(startTime)))}`}
            </p>
          </div>
          <div className="text-2xl font-black text-gold-dark mb-4">
            ₹{selected?.hourlyRate}
          </div>
          <p className="text-xs font-bold text-red-600 mb-6">
            This amount will be billed to your flat. Non-refundable.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => setConfirmModalOpen(false)} className="flex-1">
              No
            </Button>
            <Button variant="primary" onClick={handleRedirectToPayment} className="flex-1">
              Yes, Pay Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Your Bookings List */}
      <h2 className="font-display text-lg text-brown mb-4">Your bookings</h2>
      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b._id} className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <IconCalendar className="w-4.5 h-4.5 text-accent" />
              </span>
              <div>
                <p className="text-sm font-medium text-brown">{b.facilityName || "Facility"}</p>
                <p className="text-xs text-brown/50 mt-0.5">{b.date} · {format12hSlot(b.slot)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={b.status === "confirmed" ? "confirmed" : b.status === "cancelled" ? "urgent" : "neutral"}>
                {b.status}
              </Badge>
              {b.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCancelMyBooking(b._id)}
                  className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  Cancel
                </Button>
              )}
            </div>
          </Card>
        ))}
        {bookings.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-sm text-brown/50">No bookings yet. Book a facility above to get started.</p>
          </Card>
        )}
      </div>
    </>
  );
}
