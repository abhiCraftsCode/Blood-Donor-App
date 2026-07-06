import API from "./client";
const donorService = {
  syncLocation: async (user_id, latitude, longitude) => {
    const response = await API.patch(`/donor/location-sync`, {
      user_id,
      latitude,
      longitude,
    });
    return response.data;
  },
  toggleAvailability: async (user_id) => {
    const response = await API.put(`/donor/toggle-availability/${user_id}`);
    return response.data;
  },
  searchDonors: async (filters) => {
    const response = await API.post("/donor/search", { ...filters });
    console.log("Search Donors Response:", response.data);
    return response.data;
  },
  searchRequests: async (filters) => {
    const response = await API.post("/request/nearby", filters);
    console.log("Search Nearby Requests:", response.data);
    return response.data;
  },
};
export { donorService };
