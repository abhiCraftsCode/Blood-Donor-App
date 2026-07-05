import db from "../config/db.js";
import crypto from "crypto";

/**
 * @route   GET /api/request/nearby
 * @desc    Get nearby blood requests based on latitude and longitude
 * @access  Public temporary
 **/
const getNearbyRequests = async (req, res) => {
  console.log("Get Nearby Requests Controller Invoked");
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: "Latitude and longitude are required for physical sorting.",
    });
  }

  try {
    const query = `
      SELECT 
        request_id, patient_name, hospital_name, blood_group, required_component,
        units_required, units_fulfilled, status, created_at,
        ST_X(hospital_location::geometry) as longitude,
        ST_Y(hospital_location::geometry) as latitude,
        (ST_Distance(hospital_location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) / 1000) AS distance_km
      FROM blood_requests
      WHERE status = 'PENDING'
      ORDER BY distance_km ASC;
    `;
    const result = await db.query(query, [longitude, latitude]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get Nearby Requests Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * @route   GET /api/request/my-requests/:user_id
 * @desc    Get all blood requests made by a specific user
 * @access  Public temporary
 **/

const getUserRequests = async (req, res) => {
  console.log("Get User Requests Controller Invoked");
  const { user_id } = req.params;

  try {
    const query = `SELECT *, ST_X(hospital_location::geometry) as longitude, ST_Y(hospital_location::geometry) as latitude 
                   FROM blood_requests WHERE requester_id = $1 ORDER BY created_at DESC;`;
    const result = await db.query(query, [user_id]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get User Requests Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   PATCH /api/request/cancel/:request_id
 * @desc    cancel a specific blood request
 * @access   Public temporary
 **/
const cancelRequest = async (req, res) => {
  console.log("Cancel Request Controller Invoked");
  const { request_id } = req.params;
  const { cancellation_reason } = req.body;

  if (!cancellation_reason || cancellation_reason.trim() === "") {
    return res
      .status(400)
      .json({ error: "A cancellation reason must be provided." });
  }

  try {
    const check = await db.query(
      "SELECT status FROM blood_requests WHERE request_id = $1",
      [request_id],
    );
    if (check.rows.length === 0)
      return res.status(404).json({ error: "Blood request not found." });
    if (check.rows[0].status !== "PENDING")
      return res
        .status(400)
        .json({ error: "Can only cancel pending requests." });

    const query = `UPDATE blood_requests SET status = 'CANCELLED', cancellation_reason = $1 WHERE request_id = $2 RETURNING *`;
    const result = await db.query(query, [cancellation_reason, request_id]);
    return res.status(200).json({
      message: "Emergency blood request cancelled successfully.",
      request: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel Request Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * @route   POST /api/request/verify
 * @desc    Verify a blood request using the secure token
 * @access  Public temporary
 **/
const verifyRequest = async (req, res) => {
  console.log("Donation QR Handshake Invoked -> Verifying Request");
  const { secure_token } = req.body;
  if (!secure_token) {
    return res.status(400).json({ error: "Secure token is required" });
  }
  try {
    const query = `SELECT request_id,units_required,units_fulfilled FROM blood_requests WHERE secure_token = $1`;
    const result = await db.query(query, [secure_token]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    const request = result.rows[0];
    if (request.status === "FULFILLED") {
      return res.status(400).json({
        error:
          "This emergency requirement has already been completely fulfilled.",
      });
    }
    if (request.status === "CANCELLED") {
      return res
        .status(400)
        .json({ error: "This request has been cancelled." });
    }

    const nextFulfillmentCount = request.units_fulfilled + 1;
    const nextStatus =
      nextFulfillmentCount >= request.units_required ? "FULFILLED" : "PENDING";

    const updateQuery = `UPDATE blood_requests SET units_fulfilled = $1, status = $2 WHERE secure_token = $3 RETURNING *`;
    const updatedResult = await db.query(updateQuery, [
      nextFulfillmentCount,
      nextStatus,
      secure_token,
    ]);

    return res.status(200).json({
      message: "Donation verified and request updated successfully!",
      updatedRequest: updatedResult.rows[0],
    });
  } catch (error) {
    console.error("Verify Request Controller Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * @route   POST /api/request/create
 * @desc    Create a new blood request
 * @access  Public temporary
 **/
const createRequest = async (req, res) => {
  console.log("Create Request Controller Invoked");
  const {
    user_id,
    patient_name,
    hospital_name,
    latitude, // We will take lat/long from the request body
    longitude, // and convert it into a PostGIS Point
    blood_group, // Matches your enum
    required_component, // Matches your enum
    units_required,
    verification_slip_url, //compulsory field for authenticity of request
  } = req.body;
  if (
    !user_id ||
    !patient_name ||
    !hospital_name ||
    !latitude ||
    !longitude ||
    !blood_group ||
    !required_component ||
    !units_required ||
    !verification_slip_url
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    // Generate a unique, unpredictable string for secure_token
    const secureToken = crypto.randomBytes(32).toString("hex");
    // Sql query
    const query = `Insert into blood_requests (requester_id, patient_name, hospital_name, 
    hospital_location, blood_group, required_component, units_required,secure_token,verification_slip_url) 
    values ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7, $8, $9, $10) 
    RETURNING *`;
    const newRequest = await db.query(query, [
      user_id,
      patient_name,
      hospital_name,
      longitude,
      latitude,
      blood_group,
      required_component,
      units_required,
      secureToken,
      verification_slip_url,
    ]);
    return res.status(201).json({
      message: "Request created successfully",
      request: newRequest.rows[0],
    });
  } catch (error) {
    console.error("Create Request Controller Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export {
  createRequest,
  verifyRequest,
  getNearbyRequests,
  getUserRequests,
  cancelRequest,
};
