import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async getCityByName(name: string) {
    return this.prisma.city.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });
  }

  async getCityById(id: string) {
    return this.prisma.city.findUnique({
      where: {
        id,
      },
    });
  }

  async getProvinceCities(provinceId: string) {
    return this.prisma.province.findMany({
      where: { id: provinceId },
      include: { City: true },
    });
  }
}
