import geoip from 'geoip-lite';
import requestIp from 'request-ip';
import useragent from 'useragent';
import UrlRepository from '../repositories/UrlRepository.js';
import VisitRepository from '../repositories/VisitRepository.js';

class AnalyticsService {
  // Mock list of interesting regions for localhost testing to populate high-fidelity charts
  getRandomLocalGeo() {
    const mockGeos = [
      { country: 'US', city: 'San Francisco' },
      { country: 'GB', city: 'London' },
      { country: 'DE', city: 'Berlin' },
      { country: 'IN', city: 'Mumbai' },
      { country: 'CA', city: 'Toronto' },
      { country: 'JP', city: 'Tokyo' },
      { country: 'SG', city: 'Singapore' },
    ];
    return mockGeos[Math.floor(Math.random() * mockGeos.length)];
  }

  async trackVisit(req, urlId) {
    try {
      const ip = requestIp.getClientIp(req) || '127.0.0.1';
      const userAgentStr = req.headers['user-agent'] || '';
      const referrer = req.headers['referer'] || req.headers['referrer'] || 'Direct';

      // Parse user agent
      const agent = useragent.parse(userAgentStr);
      const browser = agent.family; // e.g. "Chrome"
      const os = agent.os.family; // e.g. "Windows"

      // Device detection
      let device = 'Desktop';
      const uaLower = userAgentStr.toLowerCase();
      if (/ipad|android(?!.*mobi)|tablet|playbook|silk/i.test(uaLower)) {
        device = 'Tablet';
      } else if (/mobile|iphone|ipod|android|blackberry|iemobile|opera mini/i.test(uaLower)) {
        device = 'Mobile';
      }

      // Geo IP
      let country = 'Unknown';
      let city = 'Unknown';

      // Parse IP geo location
      if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        // Local testing mock geo to look amazing on first dashboard load
        const mock = this.getRandomLocalGeo();
        country = mock.country;
        city = mock.city;
      } else {
        const geo = geoip.lookup(ip);
        if (geo) {
          country = geo.country || 'Unknown';
          city = geo.city || 'Unknown';
        }
      }

      // 1. Increment clicks asynchronously
      await UrlRepository.incrementClicks(urlId);

      // 2. Create visit record
      await VisitRepository.create({
        urlId,
        browser,
        device,
        operatingSystem: os,
        referrer,
        country,
        city,
        ipAddress: ip,
      });
    } catch (err) {
      console.error('Failed to track visit:', err);
    }
  }

  async getUrlStats(shortCode, userId) {
    const url = await UrlRepository.findByShortCode(shortCode);
    if (!url) {
      const error = new Error('URL not found');
      error.status = 404;
      throw error;
    }

    if (userId && url.userId !== userId) {
      const error = new Error('Unauthorized');
      error.status = 403;
      throw error;
    }

    const [
      clickTrends,
      browserStats,
      deviceStats,
      osStats,
      referrerStats,
      countryStats,
      recentVisits,
    ] = await Promise.all([
      VisitRepository.getClickTrends(url.id, 7),
      VisitRepository.getBrowserBreakdown(url.id),
      VisitRepository.getDeviceBreakdown(url.id),
      VisitRepository.getOsBreakdown(url.id),
      VisitRepository.getReferrerBreakdown(url.id),
      VisitRepository.getCountryBreakdown(url.id),
      VisitRepository.getRecentVisits(url.id, 10),
    ]);

    return {
      url: {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        customAlias: url.customAlias,
        clicks: url.clicks,
        createdAt: url.createdAt,
        expiryDate: url.expiryDate,
        isExpired: url.isExpired,
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
    };
  }

  async getPublicStats(shortCode) {
    const url = await UrlRepository.findByShortCode(shortCode);
    if (!url) {
      const error = new Error('URL not found');
      error.status = 404;
      throw error;
    }

    const clickTrends = await VisitRepository.getClickTrends(url.id, 7);

    return {
      url: {
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
      stats: {
        clickTrends,
      },
    };
  }
}

export default new AnalyticsService();
