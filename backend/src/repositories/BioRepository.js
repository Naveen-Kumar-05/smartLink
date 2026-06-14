import prisma from '../utils/prisma.js';

class BioRepository {
  async findByUserId(userId) {
    return prisma.bioPage.findUnique({ where: { userId } });
  }

  async findBySlug(slug) {
    return prisma.bioPage.findUnique({ where: { slug } });
  }

  async create(data) {
    return prisma.bioPage.create({ data });
  }

  async update(userId, data) {
    return prisma.bioPage.update({ where: { userId }, data });
  }

  async delete(userId) {
    return prisma.bioPage.delete({ where: { userId } });
  }

  async incrementViewCount(slug) {
    return prisma.bioPage.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });
  }
}

export default new BioRepository();
