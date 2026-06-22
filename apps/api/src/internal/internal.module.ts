import { Module } from '@nestjs/common';
import { InternalAuthController } from '../auth/internal-auth.controller';
import { AuthModule } from '../auth/auth.module';
import { InternalCarsController } from '../cars/internal-cars.controller';
import { CarsModule } from '../cars/cars.module';
import { InternalCompaniesController } from '../companies/internal-companies.controller';
import { CompaniesModule } from '../companies/companies.module';
import { InternalDriversController } from '../drivers/internal-drivers.controller';
import { DriversModule } from '../drivers/drivers.module';
import { InternalHealthController } from './internal-health.controller';

@Module({
  imports: [AuthModule, CompaniesModule, CarsModule, DriversModule],
  controllers: [
    InternalHealthController,
    InternalAuthController,
    InternalCompaniesController,
    InternalCarsController,
    InternalDriversController,
  ],
})
export class InternalModule {}
