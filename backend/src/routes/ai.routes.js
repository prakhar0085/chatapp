import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getAIResponse, getSmartSuggestions } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/chat", protectRoute, getAIResponse);
router.post("/suggestions", protectRoute, getSmartSuggestions);

export default router;
