import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return a secure JWT token
 * @access  Public
 */
const loginUser = async (req, res) => {
  console.log("Login User Controller Invoked");
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ error: "Phone and password are required" });
  }
  try {
    const result = await db.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid login credentials." });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid login credentials." });
    }
    const token = jwt.sign({ name: user.name }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res
      .status(200)
      .json({ message: "Login successful", token: `Bearer ${token}` });
  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user & return a json response with user details
 * @access  Public
 */
const registerUser = async (req, res) => {
  console.log("Register User Controller Invoked");
  const { name, password, phone, blood_group } = req.body;
  if (!name || !password || !phone || !blood_group) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const userExists = await db.query("SELECT * FROM users WHERE phone = $1", [
      phone,
    ]);
    if (userExists.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this phone number already exists" });
    }
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS, 10));
    const hashedPassword = await bcrypt.hash(password, salt);
    const query = `INSERT INTO users (name, password, phone, blood_group)
      VALUES ($1, $2, $3, $4) RETURNING user_id, name, phone, blood_group`;
    const newUser = await db.query(query, [
      name,
      hashedPassword,
      phone,
      blood_group,
    ]);
    return res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (error) {
    console.error("Registration Controller Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export { registerUser, loginUser };
