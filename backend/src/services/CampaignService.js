import CampaignRepository from '../repositories/CampaignRepository.js';

class CampaignService {
  async getCampaigns(userId) {
    return CampaignRepository.findByUserId(userId);
  }

  async getCampaignById(id, userId) {
    const campaign = await CampaignRepository.findById(id);
    if (!campaign) {
      const err = new Error('Campaign not found');
      err.status = 404;
      throw err;
    }
    if (campaign.userId !== userId) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }
    return campaign;
  }

  async createCampaign(userId, data) {
    return CampaignRepository.create({ userId, ...data });
  }

  async updateCampaign(id, userId, data) {
    await this.getCampaignById(id, userId);
    return CampaignRepository.update(id, data);
  }

  async deleteCampaign(id, userId) {
    await this.getCampaignById(id, userId);
    return CampaignRepository.delete(id);
  }

  async getCampaignStats(id, userId) {
    await this.getCampaignById(id, userId);
    return CampaignRepository.getStats(id);
  }
}

export default new CampaignService();
