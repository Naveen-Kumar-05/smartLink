import { z } from 'zod';
import QRService from '../services/QRService.js';
import UrlRepository from '../repositories/UrlRepository.js';

const generateSchema = z.object({
  urlId: z.string().uuid('Invalid link ID'),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  size: z.number().int().min(64).max(1024).optional(),
});

class QRController {
  async generate(req, res, next) {
    try {
      const { urlId, foregroundColor, backgroundColor, size } = generateSchema.parse(req.body);

      // Verify ownership of the link
      const url = await UrlRepository.findById(urlId);
      if (!url) return res.status(404).json({ status: 'error', message: 'Link not found' });
      if (url.userId !== req.user.userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });

      const shortUrl = `${process.env.APP_URL || 'http://localhost:5000'}/${url.shortCode}`;
      const qr = await QRService.generateQR(req.user.userId, urlId, shortUrl, {
        foregroundColor,
        backgroundColor,
        size,
      });

      res.status(201).json({ status: 'success', data: qr });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async getByUrlId(req, res, next) {
    try {
      const qr = await QRService.getQRByUrlId(req.params.urlId, req.user.userId);
      res.json({ status: 'success', data: qr });
    } catch (err) { next(err); }
  }

  async getAll(req, res, next) {
    try {
      const qrs = await QRService.getUserQRCodes(req.user.userId);
      res.json({ status: 'success', data: qrs });
    } catch (err) { next(err); }
  }

  async delete(req, res, next) {
    try {
      await QRService.deleteQR(req.params.id, req.user.userId);
      res.json({ status: 'success', message: 'QR code deleted' });
    } catch (err) { next(err); }
  }
}

export default new QRController();
