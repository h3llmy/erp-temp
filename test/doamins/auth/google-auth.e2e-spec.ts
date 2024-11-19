import { E2eTest } from '../../helper/e2eTest';
import { INestFastifyE2eApplication } from '../../helper/interfaces/nestFastifyApplicationE2eTest.interface';
import TestAgent from 'supertest/lib/agent';
import {
  AuthTokenSchema,
  AuthTokenService,
  ILoginTokenPayload,
} from '@libs/auth-token';
import { GoogleAuthService } from '@domains/auth/google-auth/google-auth.service';
import { BasicAuthService } from '@domains/auth/basic-auth/basic-auth.service';
import { mockUser } from '../../helper/mock/userAuth.mock';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthLoginDto } from '@domains/auth/google-auth/dto/google-auth-login.dto';
import { GoogleAuthLoginResponseDto } from '@domains/auth/google-auth/dto/google-auth-login-response.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('GoogleAuthController', () => {
  const tokenService = new JwtService();
  let app: INestFastifyE2eApplication;
  let testAgent: TestAgent;

  const mockVerifyToken: ILoginTokenPayload = {
    email: mockUser.email,
    id: mockUser.id,
    username: mockUser.username,
  };

  const mockJwtToken = tokenService.sign(mockVerifyToken, {
    secret: 'mock-jwt-token',
  });

  const mockAuthToken: AuthTokenSchema = {
    accessToken: mockJwtToken,
    refreshToken: mockJwtToken,
  };

  const mockGoogleAuthProfile: GoogleAuthLoginResponseDto = {
    email: 'test@user.com',
    id: 'google-id',
    username: 'test',
  };

  beforeEach(async () => {
    app = await E2eTest.createTestingModule()
      .overrideProvider(GoogleAuthService)
      .useValue({
        getProfile: jest
          .fn()
          .mockImplementation((googleAuthLoginDto: GoogleAuthLoginDto) => {
            if (googleAuthLoginDto.token !== mockJwtToken) {
              throw new UnauthorizedException();
            }
            return mockGoogleAuthProfile;
          }),
      })
      .overrideProvider(BasicAuthService)
      .useValue({
        validateSocialLogin: jest.fn().mockResolvedValue(mockUser),
      })
      .overrideProvider(AuthTokenService)
      .useValue({
        createLoginToken: jest.fn().mockReturnValue(mockAuthToken),
      })
      .compile();

    testAgent = app.getTestAgent();
  });

  afterEach(async () => {
    await app.shutdown();
  });

  describe('POST /auth/google/login', () => {
    const endpoint = '/api/v1/auth/google/login';

    const mockGoogleAuthLoginDto: GoogleAuthLoginDto = {
      token: mockJwtToken,
    };

    it('should return 201 when login with Google is successful', async () => {
      const response = await testAgent
        .post(endpoint)
        .send(mockGoogleAuthLoginDto)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should return 401 when validation fails (invalid data)', async () => {
      const invalidData: GoogleAuthLoginDto = {
        token: 'invalid-token',
      };

      await testAgent.post(endpoint).send(invalidData).expect(401);
    });
  });
});
