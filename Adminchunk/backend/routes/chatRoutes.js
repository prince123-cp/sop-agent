import express from 'express';
const router = express.Router();
import { askQuestion } from '../controllers/chatController.js';

// POST /api/chat/ask
router.post('/ask', askQuestion);

export default router;
