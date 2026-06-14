import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma.js';

class SettingsService {
  async getProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, plan: true, avatarUrl: true, apiKey: true, createdAt: true },
    });
  }

  async updateProfile(userId, { name, avatarUrl }) {
    return prisma.user.update({
      where: { id: userId },
      data: { name, avatarUrl },
      select: { id: true, name: true, email: true, plan: true, avatarUrl: true, createdAt: true },
    });
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const err = new Error('Current password is incorrect');
      err.status = 400;
      throw err;
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashedNew } });
    return { message: 'Password changed successfully' };
  }

  async getApiKey(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { apiKey: true },
    });
    return { apiKey: user?.apiKey };
  }

  async regenerateApiKey(userId) {
    const newKey = `lsk_${uuidv4().replace(/-/g, '')}`;
    await prisma.user.update({ where: { id: userId }, data: { apiKey: newKey } });
    return { apiKey: newKey };
  }
}

export default new SettingsService();
