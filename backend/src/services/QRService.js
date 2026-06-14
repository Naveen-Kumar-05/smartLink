import QRCode from 'qrcode';
import QRRepository from '../repositories/QRRepository.js';

class QRService {
  async generateQR(userId, urlId, shortUrl, options = {}) {
    const {
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      size = 256,
    } = options;

    const dataUrl = await QRCode.toDataURL(shortUrl, {
      width: size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
    });

    // Upsert: delete old one and create fresh
    const existing = await QRRepository.findByUrlId(urlId);
    if (existing) {
      await QRRepository.delete(existing.id);
    }

    return QRRepository.create({
      userId,
      urlId,
      dataUrl,
      foregroundColor,
      backgroundColor,
      size,
      format: 'png',
    });
  }

  async getQRByUrlId(urlId, userId) {
    const asset = await QRRepository.findByUrlId(urlId);
    if (!asset) {
      const err = new Error('QR code not found for this link');
      err.status = 404;
      throw err;
    }
    if (asset.userId !== userId) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    return asset;
  }

  async getUserQRCodes(userId) {
    return QRRepository.findByUserId(userId);
  }

  async deleteQR(id, userId) {
    const asset = await QRRepository.findById(id);
    if (!asset) {
      const err = new Error('QR code not found');
      err.status = 404;
      throw err;
    }
    if (asset.userId !== userId) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    return QRRepository.delete(id);
  }
}

export default new QRService();
