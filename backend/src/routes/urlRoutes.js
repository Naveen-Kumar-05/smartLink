import express from 'express';
import UrlController from '../controllers/UrlController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(apiLimiter);

router.post('/', UrlController.create);
router.get('/', UrlController.getUrls);
router.get('/stats/summary', UrlController.getDashboardStats);
router.post('/bulk', UrlController.bulkCreate);
router.get('/:id', UrlController.getUrlById);
router.put('/:id', UrlController.update);
router.delete('/:id', UrlController.delete);

export default router;
