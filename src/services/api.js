import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://backend-083k.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("agms_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("agms_token");
      localStorage.removeItem("agms_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

// ─── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  createGroup: (data) => API.post("/auth/create-group", data),
  groupLogin: (data) => API.post("/auth/group-login", data),
  memberLogin: (data) => API.post("/auth/member-login", data),
  getMe: () => API.get("/auth/me"),
  changePassword: (data) => API.put("/auth/change-password", data),
};

// ─── Members ────────────────────────────────────────────────────
export const memberAPI = {
  getAll: (params) => API.get("/members", { params }),
  getOne: (id) => API.get(`/members/${id}`),
  add: (data) => API.post("/members", data),
  update: (id, data) => API.put(`/members/${id}`, data),
  approve: (id) => API.patch(`/members/${id}/approve`),
  toggleStatus: (id) => API.patch(`/members/${id}/toggle-status`),
  delete: (id) => API.delete(`/members/${id}`),
  birthdayWish: (id, data) => API.post(`/members/${id}/birthday-wish`, data),
};

// ─── Elections ──────────────────────────────────────────────────
export const electionAPI = {
  create: (data) => API.post("/elections", data),
  getAll: () => API.get("/elections"),
  vote: (id, data) => API.post(`/elections/${id}/vote`, data),
  getResults: (id) => API.get(`/elections/${id}/results`),
  close: (id) => API.patch(`/elections/${id}/close`),
};

// ─── Finance ────────────────────────────────────────────────────
export const financeAPI = {
  create: (data) => API.post("/finances", data),
  getAll: (params) => API.get("/finances", { params }),
  getSummary: () => API.get("/finances/summary"),
  getMyRecords: () => API.get("/finances/my-records"),
  update: (id, data) => API.put(`/finances/${id}`, data),
  sendReminder: (data) => API.post("/finances/reminder", data),

  // NEW: Add payment to existing record
  addPayment: (id, data) => API.post(`/finances/${id}/add-payment`, data),
};

// ─── Notices ────────────────────────────────────────────────────
export const noticeAPI = {
  create: (data) => API.post("/notices", data),
  getAll: (params) => API.get("/notices", { params }),
  update: (id, data) => API.put(`/notices/${id}`, data),
  delete: (id) => API.delete(`/notices/${id}`),
};

// ─── Notifications ──────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => API.get("/notifications"),
  markRead: (id) => API.patch(`/notifications/${id}/read`),
  markAllRead: () => API.patch("/notifications/read-all"),
};

// ─── Dashboard ──────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => API.get("/dashboard"),
};

// ─── Expenditures ───────────────────────────────────────────────
export const expenditureAPI = {
  getAll: () => API.get("/expenditures"),
  getSummary: () => API.get("/expenditures/summary"),
  create: (data) => API.post("/expenditures", data),
  update: (id, data) => API.put(`/expenditures/${id}`, data),
  approve: (id) => API.patch(`/expenditures/${id}/approve`),
  delete: (id) => API.delete(`/expenditures/${id}`),
};

export default API;
