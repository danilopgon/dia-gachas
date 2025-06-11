import { Test, TestingModule } from '@nestjs/testing';
import { CitiesService } from './cities.service';
import { PrismaService } from '../../../shared/prisma.service';

describe('CitiesService', () => {
  let service: CitiesService;
  let prisma: {
    city: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    province: {
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      city: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      province: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitiesService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<CitiesService>(CitiesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('debería obtener ciudades por nombre', async () => {
    const mockCities = [{ id: '1', name: 'Madrid' }];
    prisma.city.findMany.mockResolvedValue(mockCities);

    const result = await service.getCityByName('Mad');
    expect(result).toEqual(mockCities);
    expect(prisma.city.findMany).toHaveBeenCalledWith({
      include: { province: true },
      where: { name: { contains: 'Mad' } },
    });
  });

  it('debería obtener ciudad por ID', async () => {
    const mockCity = { id: '1', name: 'Toledo' };
    prisma.city.findUnique.mockResolvedValue(mockCity);

    const result = await service.getCityById('1');
    expect(result).toEqual(mockCity);
    expect(prisma.city.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('debería obtener ciudades de una provincia', async () => {
    const mockProvince = [
      { id: '01', name: 'Álava', City: [{ id: '1', name: 'Vitoria' }] },
    ];
    prisma.province.findMany.mockResolvedValue(mockProvince);

    const result = await service.getProvinceCities('01');
    expect(result).toEqual(mockProvince);
    expect(prisma.province.findMany).toHaveBeenCalledWith({
      where: { id: '01' },
      include: { City: true },
    });
  });
});
