import express from 'express';
import RedirectController from '../controllers/RedirectController.js';
import { apiLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

router.get('/:shortCode', apiLimiter, RedirectController.handleRedirect);

export default router;
