import { createContext, useContext, useState, useEffect } from "react";
import { bookingsAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch bookings when user is available
  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    setLoading(true);
    bookingsAPI
      .getAll()
      .then((data) => setBookings(data))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, [user]);

  async function addBooking(bookingData) {
    try {
      const newBooking = await bookingsAPI.create(bookingData);
      setBookings((prev) => [newBooking, ...prev]);
      return newBooking;
    } catch (error) {
      throw error;
    }
  }

  function refreshBookings() {
    if (!user) return;
    bookingsAPI
      .getAll()
      .then((data) => setBookings(data))
      .catch(() => {});
  }

  return (
    <BookingsContext.Provider value={{ bookings, loading, addBooking, refreshBookings }}>
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used inside BookingsProvider");
  return ctx;
}
