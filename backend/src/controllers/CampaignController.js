import { z } from 'zod';
import CampaignService from '../services/CampaignService.js';

const createSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  description: z.string().max(500).optional(),
  utmSource: z.string().max(100).optional(),
  utmMedium: z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

class CampaignController {
  async getAll(req, res, next) {
    try {
      const campaigns = await CampaignService.getCampaigns(req.user.userId);
      res.json({ status: 'success', data: campaigns });
    } catch (err) { next(err); }
  }

  async getById(req, res, next) {
    try {
      const campaign = await CampaignService.getCampaignById(req.params.id, req.user.userId);
      res.json({ status: 'success', data: campaign });
    } catch (err) { next(err); }
  }

  async create(req, res, next) {
    try {
      const data = createSchema.parse(req.body);
      const campaign = await CampaignService.createCampaign(req.user.userId, data);
      res.status(201).json({ status: 'success', data: campaign });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const data = createSchema.partial().parse(req.body);
      const campaign = await CampaignService.updateCampaign(req.params.id, req.user.userId, data);
      res.json({ status: 'success', data: campaign });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await CampaignService.deleteCampaign(req.params.id, req.user.userId);
      res.json({ status: 'success', message: 'Campaign deleted successfully' });
    } catch (err) { next(err); }
  }

  async getStats(req, res, next) {
    try {
      const stats = await CampaignService.getCampaignStats(req.params.id, req.user.userId);
      res.json({ status: 'success', data: stats });
    } catch (err) { next(err); }
  }
}

export default new CampaignController();
