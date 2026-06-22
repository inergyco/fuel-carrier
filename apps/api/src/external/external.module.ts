import { Module } from '@nestjs/common';
import { ExternalAuthController } from '../auth/external-auth.controller';
import { AuthModule } from '../auth/auth.module';
import { ExternalCarsController } from '../cars/external-cars.controller';
import { CarsModule } from '../cars/cars.module';
import { ExternalDriversController } from '../drivers/external-drivers.controller';
import { DriversModule } from '../drivers/drivers.module';
import { ExternalHealthController } from './external-health.controller';

@Module({
  imports: [AuthModule, CarsModule, DriversModule],
  controllers: [
    ExternalHealthController,
    ExternalAuthController,
    ExternalCarsController,
    ExternalDriversController,
  ],
})
export class ExternalModule {}
