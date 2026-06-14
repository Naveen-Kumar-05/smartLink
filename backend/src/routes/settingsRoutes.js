import express from 'express';
import SettingsController from '../controllers/SettingsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(apiLimiter);

router.get('/profile', SettingsController.getProfile);
router.put('/profile', SettingsController.updateProfile);
router.put('/password', SettingsController.changePassword);
router.get('/api-key', SettingsController.getApiKey);
router.post('/api-key/regenerate', SettingsController.regenerateApiKey);

export default router;
