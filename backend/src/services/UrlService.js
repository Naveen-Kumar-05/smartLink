import QRCode from 'qrcode';
import UrlRepository from '../repositories/UrlRepository.js';

class UrlService {
  generateRandomCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async generateUniqueShortCode() {
    let code = this.generateRandomCode();
    let exists = await UrlRepository.findByShortCode(code);
    let attempts = 0;
    
    while (exists && attempts < 10) {
      code = this.generateRandomCode();
      exists = await UrlRepository.findByShortCode(code);
      attempts++;
    }
    return code;
  }

  validateUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async generateQRCodeDataUrl(url) {
    try {
      // Returns base64 encoded data URL for PNG
      return await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937', // charcoal
          light: '#FFFFFF',
        },
      });
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
      return '';
    }
  }

  async createUrl({ userId, originalUrl, customAlias, expiryDate }) {
    if (!this.validateUrl(originalUrl)) {
      const error = new Error('Invalid original URL format');
      error.status = 400;
      throw error;
    }

    let shortCode;
    
    if (customAlias) {
      // Clean customAlias: remove spaces and slashes
      const cleanedAlias = customAlias.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
      if (!cleanedAlias) {
        const error = new Error('Custom alias cannot be empty');
        error.status = 400;
        throw error;
      }
      
      const aliasExists = await UrlRepository.findByCustomAlias(cleanedAlias);
      const shortCodeExists = await UrlRepository.findByShortCode(cleanedAlias);
      if (aliasExists || shortCodeExists) {
        const error = new Error('Custom alias is already in use');
        error.status = 400;
        throw error;
      }
      shortCode = cleanedAlias;
    } else {
      shortCode = await this.generateUniqueShortCode();
    }

    const shortUrl = `${process.env.APP_URL || 'http://localhost:5000'}/${shortCode}`;
    const qrCode = await this.generateQRCodeDataUrl(shortUrl);

    return UrlRepository.create({
      userId,
      originalUrl,
      shortCode,
      customAlias: customAlias ? shortCode : null,
      qrCode,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isExpired: false,
    });
  }

  async bulkCreate({ userId, items }) {
    const created = [];
    const errors = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      try {
        const urlRecord = await this.createUrl({
          userId,
          originalUrl: item.originalUrl,
          customAlias: item.customAlias || null,
          expiryDate: item.expiryDate || null,
        });
        created.push(urlRecord);
      } catch (err) {
        errors.push({
          row: index + 1,
          originalUrl: item.originalUrl,
          error: err.message,
        });
      }
    }

    return { created, errors };
  }

  async getUrls(userId, { search, filter, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const take = parseInt(limit);
    return UrlRepository.findAndCountAll({ userId, search, filter, skip, take });
  }

  async getDashboardStats(userId) {
    return UrlRepository.getDashboardStats(userId);
  }

  async getUrlById(id, userId) {
    const url = await UrlRepository.findById(id);
    if (!url) {
      const error = new Error('Short link not found');
      error.status = 404;
      throw error;
    }

    if (userId && url.userId !== userId) {
      const error = new Error('Unauthorized access');
      error.status = 403;
      throw error;
    }

    return url;
  }

  async updateUrl(id, userId, { originalUrl, expiryDate, isExpired }) {
    const url = await this.getUrlById(id, userId);
    
    const updateData = {};
    if (originalUrl) {
      if (!this.validateUrl(originalUrl)) {
        const error = new Error('Invalid original URL format');
        error.status = 400;
        throw error;
      }
      updateData.originalUrl = originalUrl;
    }

    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
      // Recalculate isExpired based on expiryDate
      if (expiryDate) {
        updateData.isExpired = new Date(expiryDate) <= new Date();
      } else {
        updateData.isExpired = false;
      }
    }

    if (isExpired !== undefined) {
      updateData.isExpired = isExpired;
    }

    return UrlRepository.update(id, updateData);
  }

  async deleteUrl(id, userId) {
    await this.getUrlById(id, userId);
    return UrlRepository.delete(id);
  }

  async resolveShortCode(shortCode) {
    const url = await UrlRepository.findByShortCode(shortCode);
    if (!url) {
      return null;
    }

    // Check expiry
    const now = new Date();
    const isDateExpired = url.expiryDate ? new Date(url.expiryDate) <= now : false;
    if (url.isExpired || isDateExpired) {
      if (!url.isExpired) {
        // Update database expired status
        await UrlRepository.update(url.id, { isExpired: true });
      }
      return { isExpired: true };
    }

    return url;
  }
}

export default new UrlService();
