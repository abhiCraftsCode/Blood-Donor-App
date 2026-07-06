import express from "express";
import {
  toggleAvailability,
  updateLiveLocation,
  findNearbyDonors,
} from "../controllers/donorController.js";

const router = express.Router();

router.put("/toggle-availability/:user_id", toggleAvailability);
router.patch("/location-sync", updateLiveLocation); // Triggered automatically when frontend fires a successful login/register
router.post("/search", findNearbyDonors);

export default router;
