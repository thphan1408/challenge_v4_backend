import { OwnerRepository } from '@/database/repositories/owner.repository';
import { CacheService } from './cache.service';
import { SmsService } from './sms.service';

export class OwnerService {
  constructor(
    private readonly smsService: SmsService,
    private readonly cacheService: CacheService,
    private readonly ownerRepository: OwnerRepository,
  ) {}

  async validateAccessCode({
    phoneNumber,
    accessCode,
  }: {
    phoneNumber: string;
    accessCode: string;
    type?: 'email' | 'phone';
  }) {
    await this.ownerRepository.validateAndMarkAccessCodeAsUsed(phoneNumber, accessCode);

    await this.cacheService.delete(`access_code:${phoneNumber}`);

    return {
      success: true,
    };
  }

  async createAccessCode({
    phoneNumber,
    type = 'phone',
  }: {
    phoneNumber: string;
    type?: 'email' | 'phone';
  }) {
    try {
      await this.checkRateLimit(phoneNumber, type);
      const accessCode = this.gen6();

      await this.savePhoneCode(phoneNumber, accessCode, type);

      await this.smsService.sendSms(phoneNumber, `Your access code is: ${accessCode}`);

      return {
        success: true,
        accessCode,
      };
    } catch (error) {
      throw error;
    }
  }

  private gen6(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async savePhoneCode(
    phoneNumber: string,
    accessCode: string,
    type: 'email' | 'phone',
  ): Promise<void> {
    const cacheKey = `access_code:${type}:${phoneNumber}`;
    await this.cacheService.set(cacheKey, accessCode, 5 * 60);
    await this.ownerRepository.saveAccessCode(phoneNumber, accessCode, type);
  }

  private async checkRateLimit(phoneNumber: string, type: 'email' | 'phone'): Promise<void> {
    const rateLimitKey = `rate_limit:${type}:${phoneNumber}`;
    const attempts = await this.cacheService.get(rateLimitKey);

    if (attempts && parseInt(attempts) >= 3) {
      throw new Error('Too many requests. Please try again later.');
    }

    const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await this.cacheService.set(rateLimitKey, newAttempts.toString(), 3600);
  }
}
