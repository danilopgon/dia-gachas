import { Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';
import { CitiesController } from './controllers/cities.controller';
import { CitiesService } from './services/cities.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService, PrismaService]
})
export class CitiesModule {}
