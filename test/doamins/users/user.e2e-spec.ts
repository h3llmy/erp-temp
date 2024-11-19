import { E2eTest } from '../../helper/e2eTest';
import { INestFastifyE2eApplication } from '../../helper/interfaces/nestFastifyApplicationE2eTest.interface';
import { UsersService } from '@domains/users/users.service';
import { IPaginationResponse } from '@libs/database';
import { User } from '@domains/users/entities/user.entity';
import TestAgent from 'supertest/lib/agent';
import { PermissionsGuard } from '@domains/auth/guard/permissions.guard';
import { MockPermissionsGuard } from '../../helper/mock/permissionsGuard.mock';
import { UserAccess } from '@domains/users/user.access';
import { mockUser } from '../../helper/mock/userAuth.mock';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let app: INestFastifyE2eApplication;
  let testAgent: TestAgent;

  const mockUserPagination: IPaginationResponse<User> = {
    data: [mockUser],
    limit: 10,
    page: 1,
    totalData: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    app = await E2eTest.createTestingModule()
      .overrideProvider(UsersService)
      .useValue({
        findAllPagination: jest.fn().mockResolvedValue(mockUserPagination),
        findOne: jest.fn().mockImplementation((userId) => {
          return userId !== mockUser.id ? null : mockUser;
        }),
        update: jest.fn().mockImplementation((userId) => {
          return userId !== mockUser.id ? null : mockUser;
        }),
        deleteById: jest.fn().mockImplementation((userId) => {
          if (userId !== mockUser.id) {
            throw new NotFoundException();
          }
          return mockUser;
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

  describe('/users (GET)', () => {
    const usersEndpoint = '/api/v1/users';

    it('should return 200 when getting all users with valid permissions', async () => {
      const response = await testAgent
        .get(usersEndpoint)
        .set('Authorization', UserAccess.GET_ALL_USERS)
        .expect(200);

      expect(response.body).toEqual(mockUserPagination);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(usersEndpoint)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });

    it('should return 400 when pagination query params are invalid', async () => {
      const invalidQuery = { page: 'invalid', limit: 'invalid' };

      await testAgent
        .get(usersEndpoint)
        .set('Authorization', UserAccess.GET_ALL_USERS)
        .query(invalidQuery)
        .expect(422);
    });
  });

  describe('/users/:id (GET)', () => {
    const endpoint = '/api/v1/users/';

    it('should return 200 when fetching a user by id with valid permissions', async () => {
      const response = await testAgent
        .get(`${endpoint}${mockUser.id}`)
        .set('Authorization', UserAccess.GET_USER_BY_ID)
        .expect(200);

      expect(response.body).toEqual(mockUser);
    });

    it('should return 400 when the user ID format is invalid', async () => {
      const invalidUserId = '1';
      await testAgent
        .get(`${endpoint}${invalidUserId}`)
        .set('Authorization', UserAccess.GET_USER_BY_ID)
        .expect(400);
    });

    it('should return 404 when the user is not found by id', async () => {
      const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

      await testAgent
        .get(`${endpoint}${nonExistentUserId}`)
        .set('Authorization', UserAccess.GET_USER_BY_ID)
        .expect(404);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(`${endpoint}${mockUser.id}`)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });

  describe('/users/profile (GET)', () => {
    const profileEndpoint = '/api/v1/users/profile';

    it('should return 200 when fetching the user profile with valid permissions', async () => {
      const response = await testAgent
        .get(profileEndpoint)
        .set('Authorization', UserAccess.GET_USER_PROFILE)
        .expect(200);

      expect(response.body).toEqual(mockUser);
    });

    it('should return 401 when the user does not have permission', async () => {
      await testAgent
        .get(profileEndpoint)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });

  describe('/users/:id (PATCH)', () => {
    const endpoint = '/api/v1/users/update-profile';

    const updateUserDto = {
      username: 'updatedUsername',
      email: 'updatedEmail@domain.com',
    };

    it('should return 200 when updating the user profile with valid data and permission', async () => {
      const response = await testAgent
        .patch(endpoint)
        .set('Authorization', UserAccess.UPDATE_PROFILE)
        .send(updateUserDto)
        .expect(200);

      expect(response.body.message).toEqual('Update profile success');
    });

    it('should return 400 when invalid user data is sent for update', async () => {
      const invalidData = { username: '' };
      await testAgent
        .patch(endpoint)
        .set('Authorization', UserAccess.UPDATE_PROFILE)
        .send(invalidData)
        .expect(422);
    });

    it('should return 401 when the user does not have permission to update profile', async () => {
      await testAgent
        .patch(endpoint)
        .set('Authorization', 'invalid-permission')
        .send(updateUserDto)
        .expect(401);
    });
  });

  describe('/users/:id (DELETE)', () => {
    const endpoint = '/api/v1/users/';

    it('should return 200 when deleting a user with valid permission', async () => {
      const response = await testAgent
        .delete(`${endpoint}${mockUser.id}`)
        .set('Authorization', UserAccess.DELETE_USER)
        .expect(200);

      expect(response.body.message).toEqual(
        `user with id ${mockUser.id} has been deleted`,
      );
    });

    it('should return 404 when the user does not exist', async () => {
      const nonExistentUserId = '00000000-0000-0000-0000-000000000000';

      await testAgent
        .delete(`${endpoint}${nonExistentUserId}`)
        .set('Authorization', UserAccess.DELETE_USER)
        .expect(404);
    });

    it('should return 401 when the user does not have permission to delete', async () => {
      await testAgent
        .delete(`${endpoint}${mockUser.id}`)
        .set('Authorization', 'invalid-permission')
        .expect(401);
    });
  });
});
