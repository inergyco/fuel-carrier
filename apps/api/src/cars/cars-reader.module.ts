import { Module } from '@nestjs/common';
import { CarsReader } from './cars-reader.service';

@Module({
  providers: [CarsReader],
  exports: [CarsReader],
})
export class CarsReaderModule {}
