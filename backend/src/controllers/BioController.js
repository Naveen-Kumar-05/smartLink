import { z } from 'zod';
import BioService from '../services/BioService.js';

const blockSchema = z.object({
  type: z.enum(['link', 'header', 'divider', 'text']),
  label: z.string().optional(),
  url: z.string().url().optional(),
  icon: z.string().optional(),
  content: z.string().optional(),
});

const socialSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

const bioSchema = z.object({
  slug: z.string().min(3).max(30),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  theme: z.enum(['default', 'dark', 'gradient', 'minimal']).optional(),
  isPublic: z.boolean().optional(),
  socialLinks: z.array(socialSchema).optional(),
  blocks: z.array(blockSchema).optional(),
});

class BioController {
  async getMyBioPage(req, res, next) {
    try {
      const page = await BioService.getBioPage(req.user.userId);
      res.json({ status: 'success', data: page });
    } catch (err) { next(err); }
  }

  async getPublicBioPage(req, res, next) {
    try {
      const page = await BioService.getPublicBioPage(req.params.slug);
      res.json({ status: 'success', data: page });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = bioSchema.parse(req.body);
      const page = await BioService.createBioPage(req.user.userId, data);
      res.status(201).json({ status: 'success', data: page });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = bioSchema.partial().parse(req.body);
      const page = await BioService.updateBioPage(req.user.userId, data);
      res.json({ status: 'success', data: page });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await BioService.deleteBioPage(req.user.userId);
      res.json({ status: 'success', message: 'Bio page deleted' });
    } catch (err) { next(err); }
  }
}

export default new BioController();
