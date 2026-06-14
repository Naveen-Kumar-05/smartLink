import AnalyticsService from '../services/AnalyticsService.js';
import VisitRepository from '../repositories/VisitRepository.js';
import UrlRepository from '../repositories/UrlRepository.js';
import prisma from '../utils/prisma.js';

class AnalyticsController {
  // Full stats for a single link (by shortCode)
  async getUrlStats(req, res, next) {
    try {
      const { shortCode } = req.params;
      const userId = req.user.userId;
      const stats = await AnalyticsService.getUrlStats(shortCode, userId);
      res.status(200).json({ status: 'success', data: stats });
    } catch (err) { next(err); }
  }

  // Public stats page
  async getPublicStats(req, res, next) {
    try {
      const { shortCode } = req.params;
      const stats = await AnalyticsService.getPublicStats(shortCode);
      res.status(200).json({ status: 'success', data: stats });
    } catch (err) { next(err); }
  }

  // Dashboard overview: total links, total clicks, campaigns, QR codes
  async getOverview(req, res, next) {
    try {
      const userId = req.user.userId;
      const [totalLinks, totalClicksResult, totalCampaigns, totalBioViews] = await Promise.all([
        prisma.url.count({ where: { userId } }),
        prisma.url.aggregate({ where: { userId }, _sum: { clicks: true } }),
        prisma.campaign.count({ where: { userId } }),
        prisma.bioPage.findUnique({ where: { userId }, select: { viewCount: true } }),
      ]);

      res.json({
        status: 'success',
        data: {
          totalLinks,
          totalClicks: totalClicksResult._sum.clicks || 0,
          totalCampaigns,
          bioPageViews: totalBioViews?.viewCount || 0,
        },
      });
    } catch (err) { next(err); }
  }

  // Click trend for a specific link by ID
  async getLinkTrend(req, res, next) {
    try {
      const { id } = req.params;
      const days = parseInt(req.query.days) || 7;
      const url = await UrlRepository.findById(id);
      if (!url) return res.status(404).json({ status: 'error', message: 'Link not found' });
      if (url.userId !== req.user.userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });

      const trend = await VisitRepository.getClickTrends(id, days);
      res.json({ status: 'success', data: trend });
    } catch (err) { next(err); }
  }

  // Full analytics for a link by ID
  async getLinkAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const url = await UrlRepository.findById(id);
      if (!url) return res.status(404).json({ status: 'error', message: 'Link not found' });
      if (url.userId !== req.user.userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });

      const [clickTrends, browserStats, deviceStats, osStats, referrerStats, countryStats, recentVisits] =
        await Promise.all([
          VisitRepository.getClickTrends(id, 7),
          VisitRepository.getBrowserBreakdown(id),
          VisitRepository.getDeviceBreakdown(id),
          VisitRepository.getOsBreakdown(id),
          VisitRepository.getReferrerBreakdown(id),
          VisitRepository.getCountryBreakdown(id),
          VisitRepository.getRecentVisits(id, 20),
        ]);

      res.json({
        status: 'success',
        data: {
          url: {
            id: url.id,
            originalUrl: url.originalUrl,
            shortCode: url.shortCode,
            clicks: url.clicks,
            createdAt: url.createdAt,
          },
          stats: {
            clickTrends,
            browsers: browserStats,
            devices: deviceStats,
            operatingSystems: osStats,
            referrers: referrerStats,
            countries: countryStats,
            recentVisits,
          },
        },
      });
    } catch (err) { next(err); }
  }

  // Paginated visits for a link
  async getLinkVisits(req, res, next) {
    try {
      const { id } = req.params;
      const url = await UrlRepository.findById(id);
      if (!url) return res.status(404).json({ status: 'error', message: 'Link not found' });
      if (url.userId !== req.user.userId) return res.status(403).json({ status: 'error', message: 'Unauthorized' });

      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const skip = (page - 1) * limit;

      const [visits, total] = await Promise.all([
        prisma.visit.findMany({
          where: { urlId: id },
          orderBy: { timestamp: 'desc' },
          skip,
          take: limit,
        }),
        prisma.visit.count({ where: { urlId: id } }),
      ]);

      res.json({
        status: 'success',
        data: visits,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (err) { next(err); }
  }
}

export default new AnalyticsController();
