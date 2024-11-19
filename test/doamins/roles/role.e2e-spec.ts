import { E2eTest } from '../../helper/e2eTest';
import { INestFastifyE2eApplication } from '../../helper/interfaces/nestFastifyApplicationE2eTest.interface';
import { RolesService } from '@domains/roles/roles.service';
import { Role } from '@domains/roles/entities/role.entity';
import { IPaginationResponse } from '@libs/database';
import TestAgent from 'supertest/lib/agent';
import { PermissionsGuard } from '@domains/auth/guard/permissions.guard';
import { MockPermissionsGuard } from '../../helper/mock/permissionsGuard.mock';
import { RoleAccess } from '@domains/roles/role.access';

describe('RolesController', () => {
  let app: INestFastifyE2eApplication;
  let testAgent: TestAgent;

  const mockRole: Role = {
    id: '94f29295-c54d-45b3-ba1d-13c14d965295',
    name: 'mock role',
    updatedAt: '2024-11-14T12:50:50.903Z' as unknown as Date,
    createdAt: '2024-11-14T12:50:50.903Z' as unknown as Date,
    deletedAt: null,
  };

  const mockRolePagination: IPaginationResponse<Role> = {
    data: [mockRole],
    limit: 10,
    page: 1,
    totalData: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    app = await E2eTest.createTestingModule()
      .overrideProvider(RolesService)
      .useValue({
        create: jest.fn().mockResolvedValue(mockRole),
        findAll: jest.fn().mockResolvedValue(mockRolePagination),
        findOne: jest.fn().mockImplementation((roleId) => {
          return roleId !== mockRole.id ? null : mockRole;
        }),
        update: jest.fn().mockImplementation((roleId) => {
          return roleId !== mockRole.id ? null : mockRole;
        }),
        remove: jest.fn().mockImplementation((roleId) => {
          return roleId !== mockRole.id ? null : mockRole;
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

  describe('/roles (POST)', () => {
    const rolesEndpoint = '/api/v1/roles';

    it('should return 201 when creating a new role with valid permissions', async () => {
      const createRoleDto = {
        name: 'Admin',
        description: 'Administrator role',
      };
      const response = await testAgent
        .post(rolesEndpoint)
        .set('Authorization', RoleAccess.CREATE_ROLE)
        .send(createRoleDto)
        .expect(201);

      expect(response.body).toEqual(mockRole);
    });

    it('should return 401 when the user does not have permission to create role', async () => {
      const createRoleDto = {
        name: 'Admin',
        description: 'Administrator role',
      };
      await testAgent
        .post(rolesEndpoint)
        .set('Authorization', 'invalid-permission')
        .send(createRoleDto)
        .expect(401);
    });

    it('should return 422 when validation fails', async () => {
      const invalidCreateRoleDto = { name: '' };
      await testAgent
        .post(rolesEndpoint)
        .set('Authorization', RoleAccess.CREATE_ROLE)
        .send(invalidCreateRoleDto)
        .expect(422);
    });
  });

  describe('/roles (GET)', () => {
    const rolesEndpoint = '/api/v1/roles';

    it('should return 200 when getting all roles with valid permissions', async () => {
      const response = await testAgent
        .get(rolesEndpoint)
        .set('Authorization', RoleAccess.GET_ALL_ROLES)
        .expect(200);

      expect(response.body).toEqual(mockRolePagination);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(rolesEndpoint)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });

  describe('/roles/:id (GET)', () => {
    const endpoint = '/api/v1/roles/';

    it('should return 200 when getting a role by id with valid permissions', async () => {
      const response = await testAgent
        .get(`${endpoint}${mockRole.id}`)
        .set('Authorization', RoleAccess.GET_ROLE_BY_ID)
        .expect(200);

      expect(response.body).toEqual(mockRole);
    });

    it('should return 400 when the role ID format is invalid', async () => {
      await testAgent
        .get(`${endpoint}invalid-uuid`)
        .set('Authorization', RoleAccess.GET_ROLE_BY_ID)
        .expect(400);
    });

    it('should return 404 when the role is not found', async () => {
      const nonExistentRoleId = '00000000-0000-0000-0000-000000000000';

      await testAgent
        .get(`${endpoint}${nonExistentRoleId}`)
        .set('Authorization', RoleAccess.GET_ROLE_BY_ID)
        .expect(404);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(`${endpoint}${mockRole.id}`)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });

  describe('/roles/:id (PATCH)', () => {
    const endpoint = '/api/v1/roles/';

    const updateRoleDto = {
      name: 'Updated Role',
      description: 'Updated description',
    };

    it('should return 200 when updating a role with valid data and permissions', async () => {
      const response = await testAgent
        .patch(`${endpoint}${mockRole.id}`)
        .set('Authorization', RoleAccess.UPDATE_ROLE)
        .send(updateRoleDto)
        .expect(200);

      expect(response.body).toEqual(mockRole);
    });

    it('should return 404 when the role does not exist', async () => {
      const nonExistentRoleId = '00000000-0000-0000-0000-000000000000';

      await testAgent
        .patch(`${endpoint}${nonExistentRoleId}`)
        .set('Authorization', RoleAccess.UPDATE_ROLE)
        .send(updateRoleDto)
        .expect(404);
    });

    it('should return 422 when validation fails for the update', async () => {
      const invalidUpdateRoleDto = { name: '' };
      await testAgent
        .patch(`${endpoint}${mockRole.id}`)
        .set('Authorization', RoleAccess.UPDATE_ROLE)
        .send(invalidUpdateRoleDto)
        .expect(422);
    });

    it('should return 401 when the user does not have permission to update', async () => {
      await testAgent
        .patch(`${endpoint}${mockRole.id}`)
        .set('Authorization', 'invalid-permission')
        .send(updateRoleDto)
        .expect(401);
    });
  });

  describe('/roles/:id (DELETE)', () => {
    const endpoint = '/api/v1/roles/';

    it('should return 200 when deleting a role with valid permissions', async () => {
      const response = await testAgent
        .delete(`${endpoint}${mockRole.id}`)
        .set('Authorization', RoleAccess.DELETE_ROLE)
        .expect(200);

      expect(response.body.message).toEqual(
        `Role with id ${mockRole.id} has been deleted`,
      );
    });

    it('should return 404 when the role does not exist', async () => {
      const nonExistentRoleId = '00000000-0000-0000-0000-000000000000';

      await testAgent
        .delete(`${endpoint}${nonExistentRoleId}`)
        .set('Authorization', RoleAccess.DELETE_ROLE)
        .expect(404);
    });

    it('should return 401 when the user does not have permission to delete', async () => {
      await testAgent
        .delete(`${endpoint}${mockRole.id}`)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });
});
