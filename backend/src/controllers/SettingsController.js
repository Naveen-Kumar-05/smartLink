import { z } from 'zod';
import SettingsService from '../services/SettingsService.js';

const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

class SettingsController {
  async getProfile(req, res, next) {
    try {
      const profile = await SettingsService.getProfile(req.user.userId);
      res.json({ status: 'success', data: profile });
    } catch (err) { next(err); }
  }

  async updateProfile(req, res, next) {
    try {
      const data = profileSchema.parse(req.body);
      const profile = await SettingsService.updateProfile(req.user.userId, data);
      res.json({ status: 'success', data: profile });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const data = passwordSchema.parse(req.body);
      const result = await SettingsService.changePassword(req.user.userId, data);
      res.json({ status: 'success', ...result });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ status: 'error', message: err.errors[0].message });
      next(err);
    }
  }

  async getApiKey(req, res, next) {
    try {
      const result = await SettingsService.getApiKey(req.user.userId);
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }

  async regenerateApiKey(req, res, next) {
    try {
      const result = await SettingsService.regenerateApiKey(req.user.userId);
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  }
}

export default new SettingsController();
