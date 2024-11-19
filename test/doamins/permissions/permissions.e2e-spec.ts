import { E2eTest } from '../../helper/e2eTest';
import { INestFastifyE2eApplication } from '../../helper/interfaces/nestFastifyApplicationE2eTest.interface';
import { PermissionsService } from '@domains/permissions/permissions.service';
import { Permissions } from '@domains/permissions/entities/permission.entity';
import { IPaginationResponse } from '@libs/database';
import TestAgent from 'supertest/lib/agent';
import { PermissionsGuard } from '@domains/auth/guard/permissions.guard';
import { MockPermissionsGuard } from '../../helper/mock/permissionsGuard.mock';
import { PermissionAccess } from '@domains/permissions/permission.access';

describe('PermissionsController', () => {
  let app: INestFastifyE2eApplication;
  let testAgent: TestAgent;

  const mockPermission: Permissions = {
    id: '94f29295-c54d-45b3-ba1d-13c14d965295',
    name: 'mock permission',
  };

  const mockPermissionPagination: IPaginationResponse<Permissions> = {
    data: [mockPermission],
    limit: 10,
    page: 1,
    totalData: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    app = await E2eTest.createTestingModule()
      .overrideProvider(PermissionsService)
      .useValue({
        findAllPagination: jest
          .fn()
          .mockResolvedValue(mockPermissionPagination),
        findOne: jest.fn().mockImplementation((id) => {
          return id !== mockPermission.id ? null : mockPermission;
        }),
      })
      .overrideProvider(PermissionsGuard)
      .useClass(MockPermissionsGuard)
      .compile();

    testAgent = app.getTestAgent();
  });

  afterEach(async () => {
    await app.shutdown();
  });

  describe('/permissions (GET)', () => {
    const permissionsEndpoint = '/api/v1/permissions';

    it('should return 200 when getting all permissions with valid permissions', async () => {
      const response = await testAgent
        .get(permissionsEndpoint)
        .set('Authorization', PermissionAccess.GET_ALL_PERMISSIONS)
        .expect(200);

      expect(response.body).toEqual(mockPermissionPagination);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(permissionsEndpoint)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });

    it('should return 422 when pagination query params are invalid', async () => {
      const invalidQuery = { page: 'invalid', limit: 'invalid' };

      await testAgent
        .get(permissionsEndpoint)
        .set('Authorization', PermissionAccess.GET_ALL_PERMISSIONS)
        .query(invalidQuery)
        .expect(422);
    });
  });

  describe('/permissions/:id (GET)', () => {
    const endpoint = '/api/v1/permissions/';

    it('should return 200 when fetching a permission by id with valid permissions', async () => {
      const response = await testAgent
        .get(`${endpoint}${mockPermission.id}`)
        .set('Authorization', PermissionAccess.GET_PERMISSION_BY_ID)
        .expect(200);

      expect(response.body).toEqual(mockPermission);
    });

    it('should return 400 when the permission ID format is invalid', async () => {
      const invalidPermissionId = '1';

      await testAgent
        .get(`${endpoint}${invalidPermissionId}`)
        .set('Authorization', PermissionAccess.GET_PERMISSION_BY_ID)
        .expect(400);
    });

    it('should return 404 when the permission is not found by id', async () => {
      const nonExistentPermissionId = '00000000-0000-0000-0000-000000000000';

      await testAgent
        .get(`${endpoint}${nonExistentPermissionId}`)
        .set('Authorization', PermissionAccess.GET_PERMISSION_BY_ID)
        .expect(404);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(`${endpoint}${mockPermission.id}`)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });
});
