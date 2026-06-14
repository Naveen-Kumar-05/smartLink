import { z } from 'zod';
import AuthService from '../services/AuthService.js';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  plan: z.enum(['FREE', 'PRO', 'ENTERPRISE']).optional().default('FREE'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

class AuthController {
  async register(req, res, next) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await AuthService.register(data);
      res.status(201).json({
        status: 'success',
        message: 'Registration successful',
        data: { user },
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

  async login(req, res, next) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await AuthService.login(data);
      res.status(200).json({
        status: 'success',
        message: 'Login successful',
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

  async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.userId);
      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
