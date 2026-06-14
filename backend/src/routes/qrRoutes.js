import express from 'express';
import QRController from '../controllers/QRController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(apiLimiter);

router.get('/', QRController.getAll);
router.post('/generate', QRController.generate);
router.get('/link/:urlId', QRController.getByUrlId);
router.delete('/:id', QRController.delete);

export default router;
