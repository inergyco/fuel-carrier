import { Module } from '@nestjs/common';
import { CarDriverAssignmentsService } from './car-driver-assignments.service';
import { CarsReaderModule } from './cars-reader.module';
import { CarsService } from './cars.service';

@Module({
  imports: [CarsReaderModule],
  providers: [CarsService, CarDriverAssignmentsService],
  exports: [CarsService, CarDriverAssignmentsService],
})
export class CarsModule {}
