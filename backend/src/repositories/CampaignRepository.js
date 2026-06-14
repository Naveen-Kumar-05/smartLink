import prisma from '../utils/prisma.js';

class CampaignRepository {
  async findById(id) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        urls: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByUserId(userId) {
    return prisma.campaign.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { urls: true } },
      },
    });
  }

  async create(data) {
    return prisma.campaign.create({ data });
  }

  async update(id, data) {
    return prisma.campaign.update({ where: { id }, data });
  }

  async delete(id) {
    return prisma.campaign.delete({ where: { id } });
  }

  async getStats(id) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        urls: {
          select: {
            id: true,
            shortCode: true,
            originalUrl: true,
            clicks: true,
            createdAt: true,
          },
        },
      },
    });
    if (!campaign) return null;

    const totalClicks = campaign.urls.reduce((sum, u) => sum + u.clicks, 0);
    return { ...campaign, totalClicks };
  }
}

export default new CampaignRepository();
