// Central API client. Every backend call in the app goes through here —
// this is the single place that knows about URLs, headers, and error shape.
// Swap BASE_URL or the fetch implementation (e.g. for axios) without touching components.

const BASE_URL = "/api";

class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(BASE_URL + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(
      ([k, v]) => v !== undefined && url.searchParams.set(k, v),
    );
  }

  const token = localStorage.getItem("redline_token");

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(
      data?.message || "Something went wrong. Please try again.",
      res.status,
      data,
    );
  }
  return data;
}

export const api = {
  // Auth
  login: (credentials) =>
    request("/auth/login", { method: "POST", body: credentials }),
  register: (payload) =>
    request("/auth/register", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),

  // Donors
  syncLocation: (payLoad) =>
    request("/donor/location-sync", { method: "PATCH", body: payLoad }),
  toggleAvailability: (userId) =>
    request(`/donor/toggle-availability/${userId}`, {
      method: "PUT",
    }),
  getDonorProfile: (userId) => request(`/donor/me/${userId}`),

  // Emergency requests
  getNearbyEmergencies: (coords) =>
    request("/request/nearby", {
      params: { latitude: coords.latitude, longitude: coords.longitude },
    }),
  getMyRequests: () => request("/request/mine"),
  getRequestById: (id) => request(`/request/${id}`),
  createRequest: (payload) =>
    request("/request/create", { method: "POST", body: payload }),
  cancelRequest: (id) => request(`/request/cancel/${id}`, { method: "PATCH" }),
  verifyFulfillment: (secureToken) =>
    request("/request/verify", { method: "POST", body: { secureToken } }),

  // Verification uploads
  uploadVerificationSlip: (requestId, file) => {
    const formData = new FormData();
    formData.append("slip", file);
    const token = localStorage.getItem("redline_token");
    return fetch(`${BASE_URL}/request/${requestId}/verification`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then((r) => r.json());
  },
};

export { ApiError };
