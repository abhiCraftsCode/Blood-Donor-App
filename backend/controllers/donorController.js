import db from "../config/db.js";

// 1. TOGGLE DONOR AVAILABILITY (Direct table update)
// PUT /api/donor/toggle-availability/:user_id
export const toggleAvailability = async (req, res) => {
  console.log("Toggle Donor Profile Availability Invoked");
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const query = `
      UPDATE donor_profiles 
      SET is_available = NOT is_available 
      WHERE user_id = $1 
      RETURNING donor_id, user_id, is_available;
    `;
    const result = await db.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Donor profile not found for this user." });
    }

    return res.status(200).json({
      message: "Donor availability updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Toggle Availability Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// 2. PATCH LIVE LOCATION ON LOGIN (Auto-detect Upsert)
// PATCH /api/donor/location-sync
export const updateLiveLocation = async (req, res) => {
  console.log("Update Donor Live Location Invoked via Login Sync");
  const { user_id, latitude, longitude } = req.body;

  if (!user_id || !latitude || !longitude) {
    return res.status(400).json({
      error:
        "User ID, latitude, and longitude are required for synchronization.",
    });
  }

  try {
    // This query checks if a row exists; if yes, updates it. If not, inserts a fresh one!
    // Requires a UNIQUE constraint on user_id in donor_profiles to work perfectly.
    const query = `
      INSERT INTO donor_profiles (user_id, current_location, location_updated_at)
      VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        current_location = ST_SetSRID(ST_MakePoint($2, $3), 4326),
        location_updated_at = CURRENT_TIMESTAMP
      RETURNING donor_id, user_id, location_updated_at, ST_X(current_location::geometry) as longitude, ST_Y(current_location::geometry) as latitude;
    `;

    const result = await db.query(query, [user_id, longitude, latitude]);
    return res.status(200).json({
      message: "Donor spatial positioning synced successfully",
      location: result.rows[0],
    });
  } catch (error) {
    console.error("Update Live Location Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error syncing location metadata." });
  }
};

// 3. SEARCH NEARBY ELIGIBLE DONORS (Joining Users + Donor Profiles)
// POST /api/donor/search
export const findNearbyDonors = async (req, res) => {
  console.log("Find Nearby Donors Multi-Table Search Invoked");
  // Expected via query parameters: ?blood_group=B%2B&latitude=25.5941&longitude=85.0878&radius_km=15
  const { blood_group, latitude, longitude, radius_km } = req.body;

  if (!blood_group || !latitude || !longitude || !radius_km) {
    return res.status(400).json({
      error: "Blood group, coordinates, and search radius are required.",
    });
  }

  try {
    // We select details from users, but handle location geometry and availability flags from donor_profiles
    const query = `
      SELECT 
        u.user_id, u.name, u.phone, u.blood_group,
        dp.donor_id, dp.is_available, dp.last_donation_date,
        (ST_Distance(dp.current_location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000) AS distance_km
      FROM donor_profiles dp
      INNER JOIN users u ON dp.user_id = u.user_id
      WHERE u.blood_group = $3 
        AND dp.is_available = TRUE 
        AND ST_DWithin(dp.current_location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $4 * 1000)
      ORDER BY distance_km ASC;
    `;

    const result = await db.query(query, [
      longitude,
      latitude,
      blood_group,
      radius_km,
    ]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Search Nearby Donors Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error processing spatial query." });
  }
};
