import UrlService from '../services/UrlService.js';
import AnalyticsService from '../services/AnalyticsService.js';

class RedirectController {
  async handleRedirect(req, res, next) {
    try {
      const { shortCode } = req.params;
      
      // Clean shortCode if it ends with query params or slashes
      const cleanCode = shortCode.split('?')[0].replace(/\/+$/, '').toLowerCase();
      
      const result = await UrlService.resolveShortCode(cleanCode);

      const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

      if (!result) {
        return res.redirect(`${frontendUrl}/not-found`);
      }

      if (result.isExpired) {
        return res.redirect(`${frontendUrl}/expired`);
      }

      // Track visitor analytics asynchronously
      AnalyticsService.trackVisit(req, result.id).catch(err => {
        console.error('Redirection analytics error:', err);
      });

      // Perform server-side redirect
      return res.redirect(result.originalUrl);
    } catch (err) {
      next(err);
    }
  }
}

export default new RedirectController();
