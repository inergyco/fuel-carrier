import { Module } from '@nestjs/common';
import { ExternalAuthController } from '../auth/external-auth.controller';
import { ExternalCarsController } from '../cars/external-cars.controller';
import { CarsModule } from '../cars/cars.module';
import { ExternalCarTelemetryController } from '../car-telemetry/external-car-telemetry.controller';
import { CarTelemetryModule } from '../car-telemetry/car-telemetry.module';
import { ExternalCompanyUsersController } from '../company-users/external-company-users.controller';
import { CompanyUsersModule } from '../company-users/company-users.module';
import { ExternalAuditLogsController } from '../audit-logs/external-audit-logs.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { DriversModule } from '../drivers/drivers.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { ExternalDriversController } from '../drivers/external-drivers.controller';
import { CompaniesModule } from '../companies/companies.module';
import { ExternalCompanyController } from '../companies/external-company.controller';

@Module({
  imports: [
    AuditLogsModule,
    CarsModule,
    CarTelemetryModule,
    CompanyUsersModule,
    DriversModule,
    CompaniesModule,
    MqttModule,
  ],
  controllers: [
    ExternalAuthController,
    ExternalCompanyController,
    ExternalCompanyUsersController,
    ExternalCarsController,
    ExternalCarTelemetryController,
    ExternalDriversController,
    ExternalAuditLogsController,
  ],
})
export class ExternalModule {}
