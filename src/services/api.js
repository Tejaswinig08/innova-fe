// Centralized API service for all backend calls

const API_BASE = "/api";

// Get stored auth token
function getToken() {
  return localStorage.getItem("civiora-token");
}

// Generic fetch wrapper with auth header
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── Auth API ───────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getMe: () => request("/auth/me"),

  getUsers: () => request("/auth/users"),

  deleteUser: (id) =>
    request(`/auth/users/${id}`, { method: "DELETE" }),
};

// ─── Complaints API ─────────────────────────────────────
export const complaintsAPI = {
  getAll: () => request("/complaints"),
  getMy: () => request("/complaints/my"),
  create: (data) =>
    request("/complaints", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/complaints/${id}`, { method: "DELETE" }),
};

// ─── Notices API ────────────────────────────────────────
export const noticesAPI = {
  getAll: () => request("/notices"),
  create: (data) =>
    request("/notices", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/notices/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/notices/${id}`, { method: "DELETE" }),
};

// ─── Facilities API ─────────────────────────────────────
export const facilitiesAPI = {
  getAll: () => request("/facilities"),
  create: (data) =>
    request("/facilities", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/facilities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─── Bookings API ───────────────────────────────────────
export const bookingsAPI = {
  getAll: () => request("/bookings"),
  getAllSociety: () => request("/bookings/society"),
  create: (data) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/bookings/${id}`, { method: "DELETE" }),
  getAvailability: (facilityId, date, time) =>
    request(`/bookings/availability?facility=${facilityId}&date=${date}&time=${encodeURIComponent(time)}`),
  checkConflict: (facilityId, date, startTime, endTime) =>
    request(`/bookings/conflict-check?facility=${facilityId}&date=${date}&startTime=${startTime}&endTime=${endTime}`),
  getLockedSlots: (facilityId, date) =>
    request(`/bookings/locked-slots?facility=${facilityId}&date=${date}`),
};

// ─── Payments API ───────────────────────────────────────
export const paymentsAPI = {
  getAll: () => request("/payments"),
  getAllSociety: () => request("/payments/society"),
  create: (data) =>
    request("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─── Visitors API ───────────────────────────────────────
export const visitorsAPI = {
  getAll: () => request("/visitors"),
  checkIn: (data) =>
    request("/visitors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  checkOut: (id) =>
    request(`/visitors/${id}/checkout`, { method: "PUT" }),
};

// ─── Expenses API ───────────────────────────────────────
export const expensesAPI = {
  getAll: () => request("/expenses"),
  create: (data) =>
    request("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/expenses/${id}`, { method: "DELETE" }),
};

// ─── Chat API ───────────────────────────────────────────
export const chatAPI = {
  getUsers: () => request("/messages/users"),
  getSocietyMessages: () => request("/messages/channels/society"),
  getWingMessages: () => request("/messages/channels/wing"),
  getPrivateMessages: (userId) => request(`/messages/private/${userId}`),
  sendMessage: (data) =>
    request("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Events API ─────────────────────────────────────────
export const eventsAPI = {
  getAll: () => request("/events"),
  create: (data) =>
    request("/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/events/${id}`, { method: "DELETE" }),
};

// ─── Society Config API ─────────────────────────────────
export const societyConfigAPI = {
  get: () => request("/society-config"),
  update: (data) =>
    request("/society-config", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ─── Contact Us API ─────────────────────────────────────
export const contactAPI = {
  sendFeedback: (data) =>
    request("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const civioraAIAPI = {
  chat: (messages) =>
    request("/civiora-ai/chat", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),
};
