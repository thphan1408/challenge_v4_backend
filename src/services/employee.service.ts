import { EmployeeEntity } from '@/database/entities/employee.entity';
import { EmployeeRepository } from '@/database/repositories/employee.repository';
import { CacheService } from './cache.service';
import { EmailService } from './email.service';

export class EmployeeService {
  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly cacheService: CacheService,
    private readonly emailService: EmailService,
  ) {}

  private async saveEmailCode(
    email: string,
    accessCode: string,
    type: 'email' | 'phone',
  ): Promise<void> {
    const cacheKey = `access_code:${type}:${email}`;
    await this.cacheService.set(cacheKey, accessCode, 5 * 60);
    await this.employeeRepository.saveAccessCode(email, accessCode, type);
  }

  private async checkRateLimit(email: string, type: 'email' | 'phone'): Promise<void> {
    const rateLimitKey = `rate_limit:${type}:${email}`;
    const attempts = await this.cacheService.get(rateLimitKey);

    if (attempts && parseInt(attempts) >= 3) {
      throw new Error('Too many requests. Please try again later.');
    }

    const newAttempts = attempts ? parseInt(attempts) + 1 : 1;
    await this.cacheService.set(rateLimitKey, newAttempts.toString(), 3600);
  }

  async deleteEmployee(employeeId: string): Promise<{
    success: boolean;
  }> {
    const existingEmployee = await this.employeeRepository.findById(employeeId);
    if (!existingEmployee) {
      throw new Error('Employee not found');
    }

    await this.employeeRepository.delete(employeeId);
    return { success: true };
  }

  async findById(employeeId: string): Promise<EmployeeEntity | null> {
    return this.employeeRepository.findById(employeeId);
  }

  async getAllEmployees(): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findAll();
  }

  async createEmployee({
    name,
    email,
    department,
  }: {
    name: string;
    email: string;
    department: string;
  }): Promise<{ success: boolean; employeeId: string }> {
    const existingEmployee = await this.employeeRepository.findByEmail(email);

    if (existingEmployee) {
      throw new Error('Employee with this email already exists');
    }

    const employee = await this.employeeRepository.create({
      email,
      name,
      department,
    });

    return {
      success: true,
      employeeId: employee.id,
    };
  }

  async generateAccessCode(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendAccessCode({
    email,
    name = null,
    department = null,
  }: {
    email: string;
    name?: string | null;
    department?: string | null;
  }): Promise<{ success: boolean; accessCode: string; isNewEmployee?: boolean }> {
    try {
      await this.checkRateLimit(email, 'email');

      const existingEmployee = await this.employeeRepository.findByEmail(email);

      if (!existingEmployee) {
        await this.employeeRepository.create({
          email,
          name: name || '',
          department: department || 'Unknown',
        });
      }

      const accessCode = await this.generateAccessCode();

      await this.saveEmailCode(email, accessCode, 'email');

      await this.emailService.sendEmail(
        email,
        'Your Access Code',
        `Your access code is ${accessCode}`,
      );

      return {
        success: true,
        accessCode,
      };
    } catch (error) {
      throw error;
    }
  }

  async validateAccessCode({
    email,
    accessCode,
  }: {
    email: string;
    accessCode: string;
  }): Promise<{ success: boolean }> {
    await this.employeeRepository.validateAndMarkAccessCodeAsUsed(email, accessCode);

    await this.cacheService.delete(`access_code:${email}`);

    return { success: true };
  }
}
