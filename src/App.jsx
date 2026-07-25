import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BookingsProvider } from "./context/BookingsContext";
import AppShell from "./components/AppShell";
import { ToastContainer } from "./components/Toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

import ResidentHome from "./pages/resident/ResidentHome";
import ResidentComplaints from "./pages/resident/ResidentComplaints";
import ResidentBookings from "./pages/resident/ResidentBookings";
import ResidentNotices from "./pages/resident/ResidentNotices";
import ResidentPayments from "./pages/resident/ResidentPayments";
import ResidentPaymentPage from "./pages/resident/ResidentPaymentPage";
import ResidentAnnualAccounts from "./pages/resident/ResidentAnnualAccounts";
import ResidentGuestQR from "./pages/resident/ResidentGuestQR";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminResidents from "./pages/admin/AdminResidents";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminInsights from "./pages/admin/AdminInsights";
import AdminBookings from "./pages/admin/AdminBookings";
import CommunityChat from "./pages/shared/CommunityChat";
import AdminActivity from "./pages/admin/AdminActivity";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPersonalPortal from "./pages/admin/AdminPersonalPortal";
import ContactUs from "./pages/shared/ContactUs";

import SecurityHome from "./pages/security/SecurityHome";
import SecurityVisitors from "./pages/security/SecurityVisitors";
import SecurityAlerts from "./pages/security/SecurityAlerts";

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-beige flex items-center justify-center"><p className="text-brown/50 text-sm">Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <AppShell>{children}</AppShell>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/resident" element={<Protected role="resident"><ResidentHome /></Protected>} />
      <Route path="/resident/complaints" element={<Protected role="resident"><ResidentComplaints /></Protected>} />
      <Route path="/resident/bookings" element={<Protected role="resident"><ResidentBookings /></Protected>} />
      <Route path="/resident/notices" element={<Protected role="resident"><ResidentNotices /></Protected>} />
      <Route path="/resident/payments" element={<Protected role="resident"><ResidentPayments /></Protected>} />
      <Route path="/resident/payments/pay" element={<Protected><ResidentPaymentPage /></Protected>} />
      <Route path="/resident/annual-accounts" element={<Protected role="resident"><ResidentAnnualAccounts /></Protected>} />
      <Route path="/resident/guest-qr" element={<Protected role="resident"><ResidentGuestQR /></Protected>} />
      <Route path="/resident/chat" element={<Protected role="resident"><CommunityChat /></Protected>} />

      <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />
      <Route path="/admin/personal" element={<Protected role="admin"><AdminPersonalPortal /></Protected>} />
      <Route path="/admin/personal/pay" element={<Protected role="admin"><ResidentPaymentPage /></Protected>} />
      <Route path="/admin/complaints" element={<Protected role="admin"><AdminComplaints /></Protected>} />
      <Route path="/admin/residents" element={<Protected role="admin"><AdminResidents /></Protected>} />
      <Route path="/admin/notices" element={<Protected role="admin"><AdminNotices /></Protected>} />
      <Route path="/admin/payments" element={<Protected role="admin"><AdminPayments /></Protected>} />
      <Route path="/admin/insights" element={<Protected role="admin"><AdminInsights /></Protected>} />
      <Route path="/admin/bookings" element={<Protected role="admin"><AdminBookings /></Protected>} />
      <Route path="/admin/chat" element={<Protected role="admin"><CommunityChat /></Protected>} />
      <Route path="/admin/activity" element={<Protected role="admin"><AdminActivity /></Protected>} />
      <Route path="/admin/settings" element={<Protected role="admin"><AdminSettings /></Protected>} />

      <Route path="/security" element={<Protected role="security"><SecurityHome /></Protected>} />
      <Route path="/security/visitors" element={<Protected role="security"><SecurityVisitors /></Protected>} />
      <Route path="/security/alerts" element={<Protected role="security"><SecurityAlerts /></Protected>} />

      <Route path="/contact-us" element={<Protected><ContactUs /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingsProvider>
          <BrowserRouter>
            <AppRoutes />
            <ToastContainer />
          </BrowserRouter>
        </BookingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
