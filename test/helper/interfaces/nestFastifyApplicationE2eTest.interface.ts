import { NestFastifyApplication } from '@nestjs/platform-fastify';
import TestAgent from 'supertest/lib/agent';

export interface INestFastifyE2eApplication extends NestFastifyApplication {
  /**
   * close the application
   */
  shutdown: () => Promise<void>;

  /**
   * create a test agent instance using supertest
   * @returns A `TestAgent` instance for making HTTP requests to the application
   */
  getTestAgent: () => TestAgent;
}
