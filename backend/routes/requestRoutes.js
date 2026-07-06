import express from "express";
import {
  createRequest,
  verifyRequest,
  getNearbyRequests,
  getUserRequests,
  cancelRequest,
} from "../controllers/requestController.js";

const router = express.Router();
router.post("/create", createRequest);
router.post("/verify", verifyRequest);
router.post("/nearby", getNearbyRequests);
router.get("/my-requests/:user_id", getUserRequests);
router.patch("/cancel/:request_id", cancelRequest);

export default router;
