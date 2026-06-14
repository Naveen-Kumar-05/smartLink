import prisma from '../utils/prisma.js';

class VisitRepository {
  async create(visitData) {
    return prisma.visit.create({
      data: visitData,
    });
  }

  async getRecentVisits(urlId, limit = 10) {
    return prisma.visit.findMany({
      where: { urlId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async getBrowserBreakdown(urlId) {
    const data = await prisma.visit.groupBy({
      by: ['browser'],
      where: { urlId },
      _count: {
        id: true,
      },
    });
    return data.map(item => ({
      name: item.browser || 'Unknown',
      value: item._count.id,
    }));
  }

  async getDeviceBreakdown(urlId) {
    const data = await prisma.visit.groupBy({
      by: ['device'],
      where: { urlId },
      _count: {
        id: true,
      },
    });
    return data.map(item => ({
      name: item.device || 'Unknown',
      value: item._count.id,
    }));
  }

  async getOsBreakdown(urlId) {
    const data = await prisma.visit.groupBy({
      by: ['operatingSystem'],
      where: { urlId },
      _count: {
        id: true,
      },
    });
    return data.map(item => ({
      name: item.operatingSystem || 'Unknown',
      value: item._count.id,
    }));
  }

  async getReferrerBreakdown(urlId) {
    const data = await prisma.visit.groupBy({
      by: ['referrer'],
      where: { urlId },
      _count: {
        id: true,
      },
    });
    return data.map(item => ({
      name: item.referrer || 'Direct',
      value: item._count.id,
    }));
  }

  async getCountryBreakdown(urlId) {
    const data = await prisma.visit.groupBy({
      by: ['country'],
      where: { urlId },
      _count: {
        id: true,
      },
    });
    return data.map(item => ({
      name: item.country || 'Unknown',
      value: item._count.id,
    }));
  }

  async getClickTrends(urlId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0, 0, 0, 0);

    const visits = await prisma.visit.findMany({
      where: {
        urlId,
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        timestamp: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Aggregate by day (YYYY-MM-DD)
    const trendsMap = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      trendsMap[dateString] = 0;
    }

    visits.forEach(visit => {
      const dateString = visit.timestamp.toISOString().split('T')[0];
      if (trendsMap[dateString] !== undefined) {
        trendsMap[dateString]++;
      }
    });

    return Object.entries(trendsMap).map(([date, count]) => ({
      date,
      clicks: count,
    }));
  }
}

export default new VisitRepository();
