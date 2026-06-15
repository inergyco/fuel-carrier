import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { Company } from '@fuel-carrier/shared-types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Company {
    return {
      id: '1',
      name: 'Fuel Carrier',
    };
  }
}
