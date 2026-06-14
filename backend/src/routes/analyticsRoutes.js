import express from 'express';
import AnalyticsController from '../controllers/AnalyticsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(apiLimiter);

// Public
router.get('/public/:shortCode', AnalyticsController.getPublicStats);

// Protected
router.use(authMiddleware);
router.get('/overview', AnalyticsController.getOverview);
router.get('/links/:id', AnalyticsController.getLinkAnalytics);
router.get('/links/:id/visits', AnalyticsController.getLinkVisits);
router.get('/links/:id/trend', AnalyticsController.getLinkTrend);
router.get('/:shortCode', AnalyticsController.getUrlStats);

export default router;
