import { OwnerService } from '@/services/owner.service';
import { Request, Response } from 'express';
import { BaseController } from './base.controller';

export class OwnerController extends BaseController {
  constructor(private readonly ownerService: OwnerService) {
    super();
  }

  createAccessCode = async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body as { phoneNumber: string };
      const result = await this.ownerService.createAccessCode({ phoneNumber });
      res.status(200).json(result.accessCode);
    } catch (error) {
      throw error;
    }
  };

  validateAccessCode = async (req: Request, res: Response) => {
    try {
      const { phoneNumber, accessCode } = req.body;
      const result = await this.ownerService.validateAccessCode({ phoneNumber, accessCode });
      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  };
}
