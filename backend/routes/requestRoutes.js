import express from "express";
import {
  createRequest,
  verifyRequest,
} from "../controllers/requestController.js";

const router = express.Router();
router.post("/create", createRequest);
router.post("/verify", verifyRequest);
export default router;
