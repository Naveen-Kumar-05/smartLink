import express from 'express';
import AuthController from '../controllers/AuthController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
