import prisma from '../utils/prisma.js';

class UrlRepository {
  async findByShortCode(shortCode) {
    return prisma.url.findUnique({
      where: { shortCode },
    });
  }

  async findByCustomAlias(customAlias) {
    return prisma.url.findUnique({
      where: { customAlias },
    });
  }

  async findById(id) {
    return prisma.url.findUnique({
      where: { id },
    });
  }

  async create(urlData) {
    return prisma.url.create({
      data: urlData,
    });
  }

  async createMany(urlsData) {
    return prisma.url.createMany({
      data: urlsData,
      skipDuplicates: true,
    });
  }

  async update(id, urlData) {
    return prisma.url.update({
      where: { id },
      data: urlData,
    });
  }

  async delete(id) {
    return prisma.url.delete({
      where: { id },
    });
  }

  async incrementClicks(id) {
    return prisma.url.update({
      where: { id },
      data: {
        clicks: {
          increment: 1,
        },
      },
    });
  }

  async findAndCountAll({ userId, search, filter, skip = 0, take = 10 }) {
    const where = {};
    
    // User isolation
    if (userId) {
      where.userId = userId;
    }

    // Search query
    if (search) {
      where.OR = [
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
        { customAlias: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    const now = new Date();
    if (filter === 'active') {
      where.isExpired = false;
      where.OR = [
        { expiryDate: null },
        { expiryDate: { gt: now } },
      ];
    } else if (filter === 'expired') {
      where.OR = [
        { isExpired: true },
        { expiryDate: { lte: now } },
      ];
    }

    // Sorting order
    let orderBy = { createdAt: 'desc' };
    if (filter === 'most_clicked') {
      orderBy = { clicks: 'desc' };
    } else if (filter === 'recently_created') {
      orderBy = { createdAt: 'desc' };
    }

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        where,
        orderBy,
        skip,
        take,
      }),
      prisma.url.count({ where }),
    ]);

    // Check expiry dynamically
    const processedUrls = urls.map(url => {
      const isDateExpired = url.expiryDate ? new Date(url.expiryDate) <= now : false;
      const finalExpired = url.isExpired || isDateExpired;
      return {
        ...url,
        isExpired: finalExpired,
      };
    });

    return { urls: processedUrls, total };
  }

  async getDashboardStats(userId) {
    const now = new Date();
    
    const [totalUrls, totalClicks, activeCount, expiredCount] = await Promise.all([
      prisma.url.count({
        where: { userId },
      }),
      prisma.url.aggregate({
        where: { userId },
        _sum: { clicks: true },
      }),
      prisma.url.count({
        where: {
          userId,
          isExpired: false,
          OR: [
            { expiryDate: null },
            { expiryDate: { gt: now } },
          ],
        },
      }),
      prisma.url.count({
        where: {
          userId,
          OR: [
            { isExpired: true },
            { expiryDate: { lte: now } },
          ],
        },
      }),
    ]);

    return {
      totalUrls,
      totalClicks: totalClicks._sum.clicks || 0,
      activeUrls: activeCount,
      expiredUrls: expiredCount,
    };
  }
}

export default new UrlRepository();
