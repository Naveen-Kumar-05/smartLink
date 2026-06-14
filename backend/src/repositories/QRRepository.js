import prisma from '../utils/prisma.js';

class QRRepository {
  async findByUrlId(urlId) {
    return prisma.qRCodeAsset.findFirst({
      where: { urlId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id) {
    return prisma.qRCodeAsset.findUnique({ where: { id } });
  }

  async findByUserId(userId) {
    return prisma.qRCodeAsset.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        url: { select: { shortCode: true, originalUrl: true, title: true } },
      },
    });
  }

  async create(data) {
    return prisma.qRCodeAsset.create({ data });
  }

  async delete(id) {
    return prisma.qRCodeAsset.delete({ where: { id } });
  }
}

export default new QRRepository();
