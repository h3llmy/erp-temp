import { TestBed } from '@automock/jest';
import { HealthCheckController } from './health-check.controller';
import { HealthCheckServices } from './health-check.service';
import { HealthCheckResult } from '@nestjs/terminus';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let healthCheckServices: jest.Mocked<HealthCheckServices>;

  const mockSucessResponse: HealthCheckResult = {
    status: 'ok',
    info: {
      database: { status: 'up' },
      memoryHeap: { status: 'up' },
    },
    error: {},
    details: {
      database: { status: 'up' },
      memoryHeap: { status: 'up' },
    },
  };

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(HealthCheckController).compile();

    controller = unit;
    healthCheckServices = unitRef.get(HealthCheckServices);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(healthCheckServices).toBeDefined();
  });

  describe('healthCheck', () => {
    it('should return a health check result', async () => {
      healthCheckServices.check.mockResolvedValue(mockSucessResponse);
      const result = await controller.healthCheck();

      expect(result).toEqual(mockSucessResponse);
    });
  });
});
