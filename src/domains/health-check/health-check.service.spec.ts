import {
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthCheckServices } from './health-check.service';
import { TestBed } from '@automock/jest';
import { HealthCheckResponse } from './dto/health-check-respose.dto';

describe('HealthCheckService', () => {
  let service: HealthCheckServices;

  beforeEach(() => {
    const { unit } = TestBed.create(HealthCheckServices)
      .mock(HealthCheckService)
      .using({
        check: jest.fn().mockImplementation((): HealthCheckResponse => {
          return {
            status: 'ok',
            info: {
              database: {
                status: 'up',
              },
              memoryHeap: {
                status: 'up',
              },
            },
            error: {},
            details: {
              database: {
                status: 'up',
              },
              memoryHeap: {
                status: 'up',
              },
            },
          };
        }),
      })
      .mock(TypeOrmHealthIndicator)
      .using({
        pingCheck: jest.fn().mockImplementation(() => {
          return Promise.resolve({ database: { status: 'ok' } });
        }),
      })
      .mock(MemoryHealthIndicator)
      .using({
        checkHeap: jest.fn(() => {
          return Promise.resolve({ memoryHeap: { status: 'ok' } });
        }),
      })
      .compile();

    service = unit;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('check', () => {
    it('should return a health check result', async () => {
      const result = await service.check();

      expect(result).toEqual({
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
      });
    });
  });
});
