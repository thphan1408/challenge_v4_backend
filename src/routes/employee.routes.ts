import { EmployeeController } from '@/controllers/employee.controller';
import { EmployeeRepository } from '@/database/repositories/employee.repository';
import { CreateEmployeeSchema, SendAccessCodeSchema } from '@/dto/employee/employee.dto';
import { validateBody } from '@/middlewares/validate.middleware';
import { CacheService } from '@/services/cache.service';
import { EmailService } from '@/services/email.service';
import { EmployeeService } from '@/services/employee.service';
import { Router } from 'express';

const employeeRoutes = Router();

const employeeRepository = new EmployeeRepository();
const cacheService = new CacheService();
const emailService = new EmailService();
const employeeService = new EmployeeService(employeeRepository, cacheService, emailService);
const employeeController = new EmployeeController(employeeService);

employeeRoutes.post(
  '/create-employee',
  validateBody(CreateEmployeeSchema),
  employeeController.createEmployee,
);
employeeRoutes.post('/delete-employee/:employeeId', employeeController.deleteEmployee);
employeeRoutes.post(
  '/login-email',
  validateBody(SendAccessCodeSchema),
  employeeController.loginEmail,
);
employeeRoutes.post('/validate-access-code', employeeController.validateAccessCode);
employeeRoutes.post('/:employeeId', employeeController.getEmployee);
employeeRoutes.get('/', employeeController.getAll);

export default employeeRoutes;
