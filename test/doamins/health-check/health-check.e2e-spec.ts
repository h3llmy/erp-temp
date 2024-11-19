import { E2eTest } from '../../helper/e2eTest';
import { INestFastifyE2eApplication } from '../../helper/interfaces/nestFastifyApplicationE2eTest.interface';
import TestAgent from 'supertest/lib/agent';

describe('HealthCheckController (e2e)', () => {
  let app: INestFastifyE2eApplication;
  let testAgent: TestAgent;

  beforeEach(async () => {
    app = await E2eTest.createTestingModule().compile();
    testAgent = app.getTestAgent();
  });

  afterEach(async () => {
    await app.shutdown();
  });

  describe('/health (GET)', () => {
    const healthEndpoint = '/api/v1/health-check/health';

    it('should be return 200 when health check is good', async () => {
      await testAgent.get(healthEndpoint).expect(200);
    });
  });
});
