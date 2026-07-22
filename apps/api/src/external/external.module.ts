import { Module } from '@nestjs/common';
import { ExternalAuthController } from '../auth/external-auth.controller';
import { ExternalCarsController } from '../cars/external-cars.controller';
import { CarsModule } from '../cars/cars.module';
import { ExternalCarLocationsController } from '../car-locations/external-car-locations.controller';
import { CarLocationsModule } from '../car-locations/car-locations.module';
import { ExternalCompanyUsersController } from '../company-users/external-company-users.controller';
import { CompanyUsersModule } from '../company-users/company-users.module';
import { ExternalAuditLogsController } from '../audit-logs/external-audit-logs.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { DriversModule } from '../drivers/drivers.module';
import { ExternalHealthController } from './external-health.controller';
import { ExternalDriversController } from '../drivers/external-drivers.controller';

@Module({
  imports: [
    AuditLogsModule,
    CarsModule,
    CarLocationsModule,
    CompanyUsersModule,
    DriversModule,
  ],
  controllers: [
    ExternalHealthController,
    ExternalAuthController,
    ExternalCompanyUsersController,
    ExternalCarsController,
    ExternalCarLocationsController,
    ExternalDriversController,
    ExternalAuditLogsController,
  ],
})
export class ExternalModule {}
