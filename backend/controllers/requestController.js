import db from "../config/db.js";
import crypto from "crypto";
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
    return res
      .status(200)
      .json({ message: "Request verified", request: result.rows[0] });
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
export { createRequest, verifyRequest };
