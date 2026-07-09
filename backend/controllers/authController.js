import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";

const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
/**
 * @route   PUT /api/auth/profile/update
 * @desc    Update editable user profile details
 * @access  Private
 */
const updateProfile = async (req, res) => {
  console.log("Update Profile Controller Invoked");
  const { user_id, name, phone, blood_group, city } = req.body;

  if (!user_id || !name || !phone || !blood_group || !city) {
    return res.status(400).json({ error: "All profile fields are required." });
  }

  try {
    // Check if the phone number is already taken by someone else
    const phoneCheck = await db.query(
      "SELECT user_id FROM users WHERE phone = $1 AND user_id != $2",
      [phone, user_id],
    );
    if (phoneCheck.rows.length > 0) {
      return res.status(400).json({
        error: "This phone number is already linked to another account.",
      });
    }

    const query = `UPDATE users SET name = $1, phone = $2, blood_group = $3,city=$5 WHERE user_id = $4 
                   RETURNING user_id, name, phone, blood_group,city;`;
    const result = await db.query(query, [
      name,
      phone,
      blood_group,
      user_id,
      city,
    ]);

    return res
      .status(200)
      .json({ message: "Profile updated successfully!", user: result.rows[0] });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * @route   PUT /api/auth/password/change
 * @desc    Securely change password inside session
 * @access  Private
 */
const changePassword = async (req, res) => {
  console.log("Change Password Controller Invoked");
  const { user_id, current_password, new_password } = req.body;

  if (!user_id || !current_password || !new_password) {
    return res
      .status(400)
      .json({ error: "Current and new passwords are required." });
  }

  try {
    const result = await db.query(
      "SELECT password FROM users WHERE user_id = $1",
      [user_id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found." });

    const isMatch = await bcrypt.compare(
      current_password,
      result.rows[0].password,
    );
    if (!isMatch)
      return res.status(400).json({ error: "Incorrect current password." });

    const salt = await bcrypt.genSalt(saltRounds);
    const hashedNewPassword = await bcrypt.hash(new_password, salt);

    await db.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedNewPassword,
      user_id,
    ]);
    return res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
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
    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      message: "Login successful",
      token: `Bearer ${token}`,
      user: user,
    });
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
  const { name, password, phone, blood_group, city } = req.body;
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
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const query = `INSERT INTO users (name, password, phone, blood_group, city)
      VALUES ($1, $2, $3, $4, $5) RETURNING user_id, name, phone, blood_group, city`;
    const newUser = await db.query(query, [
      name,
      hashedPassword,
      phone,
      blood_group,
      city,
    ]);
    const token = jwt.sign(
      { userId: newUser.user_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    return res.status(201).json({
      message: "User registered successfully",
      token: `Bearer ${token}`,
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Registration Controller Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export { registerUser, loginUser, updateProfile, changePassword };
