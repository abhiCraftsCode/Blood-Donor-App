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
    const response = await API.get("/donor/search", { data: filters });
    return response.data;
  },
};
export { donorService };
