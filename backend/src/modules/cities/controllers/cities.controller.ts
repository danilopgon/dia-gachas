import { Controller, Get, Query } from '@nestjs/common';
import { City } from '@prisma/client';
import { CitiesService } from '../services/cities.service';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async getCityBySearch(@Query() query: { name: string }) {
    try {
      const { name } = query;
      const cities: City[] = await this.citiesService.getCityByName(name);

      if (cities.length === 0) {
        return {
          status: 'error',
          message: 'No cities found with that name',
          statusCode: 404,
        };
      }

      return { status: 'ok', data: cities, statusCode: 200 };
    } catch (error) {
      return { status: 'error', message: error.message, statusCode: 500 };
    }
  }
}
