import { z } from 'zod';
import UrlService from '../services/UrlService.js';

const createUrlSchema = z.object({
  originalUrl: z.string().url('Invalid URL format. Must include http:// or https://'),
  customAlias: z.string().max(30, 'Alias must be less than 30 characters').optional().nullable(),
  expiryDate: z.string().datetime({ precision: 3 }).or(z.string().date()).optional().nullable(),
});

const updateUrlSchema = z.object({
  originalUrl: z.string().url('Invalid URL format. Must include http:// or https://').optional(),
  expiryDate: z.string().datetime({ precision: 3 }).or(z.string().date()).optional().nullable(),
  isExpired: z.boolean().optional(),
});

const bulkUrlsSchema = z.object({
  items: z.array(
    z.object({
      originalUrl: z.string().url('Invalid URL format. Must include http:// or https://'),
      customAlias: z.string().optional().nullable(),
      expiryDate: z.string().optional().nullable(),
    })
  ).min(1, 'At least one URL is required for bulk creation'),
});

class UrlController {
  async create(req, res, next) {
    try {
      const data = createUrlSchema.parse(req.body);
      const urlRecord = await UrlService.createUrl({
        userId: req.user?.userId || null, // Allow anonymous shortening too if needed, but restrict to userId if authenticated
        ...data,
      });

      res.status(201).json({
        status: 'success',
        data: urlRecord,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      next(err);
    }
  }

  async getUrls(req, res, next) {
    try {
      const { search, filter, page, limit } = req.query;
      const userId = req.user.userId;

      const result = await UrlService.getUrls(userId, {
        search: search || '',
        filter: filter || '',
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const userId = req.user.userId;
      const stats = await UrlService.getDashboardStats(userId);
      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  }

  async getUrlById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const url = await UrlService.getUrlById(id, userId);
      res.status(200).json({
        status: 'success',
        data: url,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const data = updateUrlSchema.parse(req.body);

      const updated = await UrlService.updateUrl(id, userId, data);
      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await UrlService.deleteUrl(id, userId);
      res.status(200).json({
        status: 'success',
        message: 'Short URL deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  async bulkCreate(req, res, next) {
    try {
      const data = bulkUrlsSchema.parse(req.body);
      const result = await UrlService.bulkCreate({
        userId: req.user.userId,
        items: data.items,
      });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      next(err);
    }
  }
}

export default new UrlController();
