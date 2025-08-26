import { OwnerController } from '@/controllers/owner.controller';
import { OwnerRepository } from '@/database/repositories/owner.repository';
import { createAccessCodeSchema, validateAccessCodeSchema } from '@/dto/owner/owner.dto';
import { validateBody } from '@/middlewares/validate.middleware';
import { CacheService } from '@/services/cache.service';
import { OwnerService } from '@/services/owner.service';
import { SmsService } from '@/services/sms.service';
import { Router } from 'express';

const ownerRoutes = Router();

const cacheService = new CacheService();
const smsService = new SmsService();
const ownerRepository = new OwnerRepository();

const ownerService = new OwnerService(smsService, cacheService, ownerRepository);
const ownerController = new OwnerController(ownerService);

ownerRoutes.post(
  '/create-access-code',
  validateBody(createAccessCodeSchema),
  ownerController.createAccessCode,
);
ownerRoutes.post(
  '/validate-access-code',
  validateBody(validateAccessCodeSchema),
  ownerController.validateAccessCode,
);

export default ownerRoutes;
