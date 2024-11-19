import { Injectable } from '@nestjs/common';
import {
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class HealthCheckServices {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  /**
   * Runs health checks on the database and memory heap.
   *
   * @returns A promise resolving to a HealthCheckResult object.
   */
  async check(): Promise<HealthCheckResult> {
    const memoryThreshold = 4 * 1024 * 1024 * 1024;

    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memoryHeap', memoryThreshold),
    ]);
  }
}
