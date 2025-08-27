import { EmployeeService } from '@/services/employee.service';
import { BaseController } from './base.controller';
import { EmployeeEntity } from '@/database/entities/employee.entity';
import { Request, Response } from 'express';
import { SendAccessCodeSchema } from '@/dto/employee/employee.dto';
export class EmployeeController extends BaseController {
  constructor(private readonly employeeService: EmployeeService) {
    super();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const employees = await this.employeeService.getAllEmployees();
      res.status(200).json(employees);
    } catch (error) {
      throw error;
    }
  };

  getEmployee = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const employee = await this.employeeService.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
      }
      res.status(200).json(employee);
    } catch (error) {
      throw error;
    }
  };

  createEmployee = async (req: Request, res: Response) => {
    try {
      const { email, name, department } = req.body;
      const result = await this.employeeService.createEmployee({ email, name, department });
      res.status(201).json(result);
    } catch (error) {
      throw error;
    }
  };

  deleteEmployee = async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const result = await this.employeeService.deleteEmployee(employeeId);
      res.status(200).send(result);
    } catch (error) {
      throw error;
    }
  };

  loginEmail = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const result = await this.employeeService.sendAccessCode({ email });
      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  };

  validateAccessCode = async (req: Request, res: Response) => {
    try {
      const { accessCode, email } = req.body;

      if (!accessCode || !email) {
        return res.status(400).json({
          success: false,
          message: 'Access code and email are required',
        });
      }

      const result = await this.employeeService.validateAccessCode({ email, accessCode });

      res.status(200).json(result);
    } catch (error) {
      throw error;
    }
  };
}
