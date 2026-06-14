import express from 'express';
import BioController from '../controllers/BioController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.use(apiLimiter);

// Public route - must be before the auth middleware group
router.get('/public/:slug', BioController.getPublicBioPage);

// Protected routes
router.use(authMiddleware);
router.get('/', BioController.getMyBioPage);
router.post('/', BioController.create);
router.put('/', BioController.update);
router.delete('/', BioController.delete);

export default router;
