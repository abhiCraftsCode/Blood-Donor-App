import express from "express";
import {
  toggleAvailability,
  updateLiveLocation,
  findNearbyDonors,
  getUserProfile,
} from "../controllers/donorController.js";

const router = express.Router();

router.put("/toggle-availability/:user_id", toggleAvailability);
router.patch("/location-sync", updateLiveLocation); // Triggered automatically when frontend fires a successful login/register
router.post("/search", findNearbyDonors);
router.get("/me/:userId", getUserProfile); // Fetch donor profile for the mentioned user

export default router;
