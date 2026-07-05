import express from "express";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getCurrentUser);
router.put("/profile/update", updateProfile);
router.put("/password/change", changePassword);
export default router;
