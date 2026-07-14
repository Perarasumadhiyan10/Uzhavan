// ===================================================================
// Grain Connect Pro - API Client
// Talks to the Spring Boot backend (default http://localhost:8080)
// ===================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const TOKEN_KEY = "uzhavan-token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Core request helper. Automatically attaches the JWT (if present) and
 * parses JSON responses. Throws an Error with a human-readable message
 * (from the backend's ApiError body) on non-2xx responses.
 */
async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // No content (e.g. DELETE)
  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  delete: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};

// -------------------------------------------------------------
// Auth
// -------------------------------------------------------------
export const authApi = {
  login: (email, password) =>
    api.post("/api/auth/login", { email, password }, { auth: false }),
  register: (payload) =>
    api.post("/api/auth/register", payload, { auth: false }),
};

// -------------------------------------------------------------
// Users
// -------------------------------------------------------------
export const userApi = {
  getProfile: () => api.get("/api/users/me"),
  updateProfile: (payload) => api.put("/api/users/me", payload),
};

// -------------------------------------------------------------
// Grains
// -------------------------------------------------------------
export const grainApi = {
  getAll: (search) =>
    api.get(`/api/grains${search ? `?search=${encodeURIComponent(search)}` : ""}`, { auth: false }),
  getById: (id) => api.get(`/api/grains/${id}`, { auth: false }),
  getMyListings: () => api.get("/api/grains/my-listings"),
  create: (payload) => api.post("/api/grains", payload),
  update: (id, payload) => api.put(`/api/grains/${id}`, payload),
  delete: (id) => api.delete(`/api/grains/${id}`),
};

// -------------------------------------------------------------
// Reservations
// -------------------------------------------------------------
export const reservationApi = {
  create: (grainId, quantityKg) =>
    api.post("/api/reservations", { grainId, quantityKg }),
  getMine: () => api.get("/api/reservations/my"),
  cancel: (id) => api.post(`/api/reservations/${id}/cancel`, {}),
  markCollected: (id) => api.post(`/api/reservations/${id}/collect`, {}),
};
