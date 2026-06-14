import BioRepository from '../repositories/BioRepository.js';

// Reserved slugs that cannot be used as bio page identifiers
const RESERVED_SLUGS = ['api', 'admin', 'login', 'register', 'dashboard', 'stats', 'qr', 'u', 'settings', 'campaigns'];

class BioService {
  validateSlug(slug) {
    if (RESERVED_SLUGS.includes(slug.toLowerCase())) {
      const err = new Error(`"${slug}" is a reserved slug and cannot be used`);
      err.status = 400;
      throw err;
    }
    if (!/^[a-z0-9_-]{3,30}$/.test(slug)) {
      const err = new Error('Slug must be 3–30 characters: lowercase letters, numbers, hyphens, underscores only');
      err.status = 400;
      throw err;
    }
  }

  async getBioPage(userId) {
    return BioRepository.findByUserId(userId);
  }

  async getPublicBioPage(slug) {
    const page = await BioRepository.findBySlug(slug);
    if (!page || !page.isPublic) {
      const err = new Error('Bio page not found');
      err.status = 404;
      throw err;
    }
    // Fire-and-forget view count increment
    BioRepository.incrementViewCount(slug).catch(() => {});
    return page;
  }

  async createBioPage(userId, data) {
    const existing = await BioRepository.findByUserId(userId);
    if (existing) {
      const err = new Error('You already have a bio page. Please update it instead.');
      err.status = 409;
      throw err;
    }

    this.validateSlug(data.slug);

    const slugTaken = await BioRepository.findBySlug(data.slug);
    if (slugTaken) {
      const err = new Error('This slug is already taken');
      err.status = 409;
      throw err;
    }

    return BioRepository.create({ userId, ...data });
  }

  async updateBioPage(userId, data) {
    const existing = await BioRepository.findByUserId(userId);
    if (!existing) {
      const err = new Error('Bio page not found. Create one first.');
      err.status = 404;
      throw err;
    }

    if (data.slug && data.slug !== existing.slug) {
      this.validateSlug(data.slug);
      const slugTaken = await BioRepository.findBySlug(data.slug);
      if (slugTaken) {
        const err = new Error('This slug is already taken');
        err.status = 409;
        throw err;
      }
    }

    return BioRepository.update(userId, data);
  }

  async deleteBioPage(userId) {
    const existing = await BioRepository.findByUserId(userId);
    if (!existing) {
      const err = new Error('Bio page not found');
      err.status = 404;
      throw err;
    }
    return BioRepository.delete(userId);
  }
}

export default new BioService();
