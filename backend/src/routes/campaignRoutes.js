import express from 'express';
import CampaignController from '../controllers/CampaignController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(apiLimiter);

router.get('/', CampaignController.getAll);
router.post('/', CampaignController.create);
router.get('/:id', CampaignController.getById);
router.put('/:id', CampaignController.update);
router.delete('/:id', CampaignController.delete);
router.get('/:id/stats', CampaignController.getStats);

export default router;
