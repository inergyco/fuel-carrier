import { Module } from '@nestjs/common';
import { InternalAuthController } from '../auth/internal-auth.controller';
import { InternalCarsController } from '../cars/internal-cars.controller';
import { CarsModule } from '../cars/cars.module';
import { InternalCarTelemetryController } from '../car-telemetry/internal-car-telemetry.controller';
import { CarTelemetryModule } from '../car-telemetry/car-telemetry.module';
import { InternalCompanyUsersController } from '../company-users/internal-company-users.controller';
import { CompanyUsersModule } from '../company-users/company-users.module';
import { InternalCompaniesController } from '../companies/internal-companies.controller';
import { CompaniesModule } from '../companies/companies.module';
import { InternalDriversController } from '../drivers/internal-drivers.controller';
import { DriversModule } from '../drivers/drivers.module';
import { MqttModule } from '../mqtt/mqtt.module';
import { InternalNotificationsController } from '../notifications/internal-notifications.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    CompaniesModule,
    CarsModule,
    CarTelemetryModule,
    DriversModule,
    CompanyUsersModule,
    MqttModule,
    NotificationsModule,
  ],
  controllers: [
    InternalAuthController,
    InternalCompaniesController,
    InternalCompanyUsersController,
    InternalCarsController,
    InternalCarTelemetryController,
    InternalDriversController,
    InternalNotificationsController,
  ],
})
export class InternalModule {}
