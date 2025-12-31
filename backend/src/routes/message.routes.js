import express from 'express';
import {protectRoute} from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, connectByChatCode, markAsRead } from '../controllers/message.controller.js';



const router = express.Router();

router.get("/users" , protectRoute , getUsersForSidebar);
router.post("/connect-code", protectRoute, connectByChatCode);
router.put("/read/:id", protectRoute, markAsRead);
router.get("/:id" , protectRoute , getMessages);

router.post("/send/:id" , protectRoute , sendMessage )


export default router;