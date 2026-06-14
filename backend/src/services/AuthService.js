import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';

class AuthService {
  async register({ name, email, password, plan = 'FREE' }) {
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return UserRepository.create({
      name,
      email,
      password: hashedPassword,
      plan,
    });
  }

  async login({ email, password }) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return user;
  }
}

export default new AuthService();
