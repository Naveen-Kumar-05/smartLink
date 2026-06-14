import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import urlRoutes from './routes/urlRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import redirectRoutes from './routes/redirectRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import bioRoutes from './routes/bioRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '5mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/bio', bioRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/settings', settingsRoutes);

// Redirect Engine — must come AFTER all /api routes
app.use('/', redirectRoutes);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Resource not found' });
});

// Global Error Handler
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 LinkSphere API running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
});

export default app;
