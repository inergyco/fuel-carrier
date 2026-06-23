import { Module } from '@nestjs/common';
import { ExternalAuthController } from '../auth/external-auth.controller';
import { AuthModule } from '../auth/auth.module';
import { ExternalCarsController } from '../cars/external-cars.controller';
import { CarsModule } from '../cars/cars.module';
import { ExternalCompanyUsersController } from '../company-users/external-company-users.controller';
import { CompanyUsersModule } from '../company-users/company-users.module';
import { ExternalDriversController } from '../drivers/external-drivers.controller';
import { DriversModule } from '../drivers/drivers.module';
import { ExternalHealthController } from './external-health.controller';

@Module({
  imports: [AuthModule, CarsModule, CompanyUsersModule, DriversModule],
  controllers: [
    ExternalHealthController,
    ExternalAuthController,
    ExternalCompanyUsersController,
    ExternalCarsController,
    ExternalDriversController,
  ],
})
export class ExternalModule {}
