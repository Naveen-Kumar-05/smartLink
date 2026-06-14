import prisma from '../utils/prisma.js';

class UserRepository {
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    });
  }

  async create(userData) {
    return prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
      },
    });
  }
}

export default new UserRepository();
