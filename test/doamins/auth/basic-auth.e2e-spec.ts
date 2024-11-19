import { E2eTest } from '../../helper/e2eTest';
import { INestFastifyE2eApplication } from '../../helper/interfaces/nestFastifyApplicationE2eTest.interface';
import {
  AuthTokenSchema,
  AuthTokenService,
  ILoginTokenPayload,
} from '@libs/auth-token';
import TestAgent from 'supertest/lib/agent';
import { UsersService } from '@domains/users/users.service';
import { MailService } from '@domains/mail/mail.service';
import { BasicAuthService } from '@domains/auth/basic-auth/basic-auth.service';
import { mockUser } from '../../helper/mock/userAuth.mock';
import { LoginDto } from '@domains/auth/basic-auth/dto/login-user.dto';
import { RefreshTokenDto } from '@domains/auth/basic-auth/dto/refresh-token.dto';
import { ForgetPasswordDto } from '@domains/auth/basic-auth/dto/forget-password.dto';
import { RegisterUserDto } from '@domains/auth/basic-auth/dto/register-user.dto';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from '@domains/auth/basic-auth/dto/reset-password.dto';
import { ResendRegisterEmailDto } from '@domains/auth/basic-auth/dto/resend-register-email.dto';

describe('BasicAuthController', () => {
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

  beforeEach(async () => {
    app = await E2eTest.createTestingModule()
      .overrideProvider(BasicAuthService)
      .useValue({
        register: jest.fn().mockResolvedValue(mockUser),
        login: jest.fn().mockImplementation((loginDto: LoginDto) => {
          if (loginDto.email === mockUser.email) {
            return mockUser;
          }
          throw new NotFoundException();
        }),
        forgetPassword: jest.fn().mockImplementation((forgetPasswordDto) => {
          if (forgetPasswordDto.email === mockUser.email) {
            return mockUser;
          }
          throw new BadRequestException();
        }),
        checkRefreshTokenCredential: jest.fn().mockResolvedValue(mockUser),
        createLoginToken: jest.fn().mockReturnValue(mockAuthToken),
        verifyEmail: jest.fn().mockResolvedValue(mockUser),
        validateResendEmail: jest
          .fn()
          .mockImplementation(
            (resendRegisterEmailDto: ResendRegisterEmailDto) => {
              if (resendRegisterEmailDto.email !== mockUser.email) {
                throw new NotFoundException();
              }
              return mockUser;
            },
          ),
      })
      .overrideProvider(AuthTokenService)
      .useValue({
        generateRegisterToken: jest.fn().mockReturnValue(mockAuthToken),
        generateForgetPasswordToken: jest.fn().mockReturnValue(mockJwtToken),
        createLoginToken: jest.fn().mockReturnValue(mockAuthToken),
        verifyRegisterToken: jest.fn().mockImplementation((token: string) => {
          if (token !== mockJwtToken) {
            throw new UnauthorizedException();
          }
          return mockJwtToken;
        }),
        verifyRefreshToken: jest.fn().mockResolvedValue(mockVerifyToken),
        verifyForgetPasswordToken: jest
          .fn()
          .mockImplementation((token: string) => {
            if (token !== mockJwtToken) {
              throw new UnauthorizedException();
            }
            return mockUser;
          }),
      })
      .overrideProvider(MailService)
      .useValue({
        sendRegisterMail: jest.fn(),
        sendForgetPasswordMail: jest.fn(),
      })
      .overrideProvider(UsersService)
      .useValue({
        register: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
      })
      .compile();

    testAgent = app.getTestAgent();
  });

  afterEach(async () => {
    await app.shutdown();
  });

  describe('POST /auth/register', () => {
    const endpoint = '/api/v1/auth/register';

    const mockRegisterUser: RegisterUserDto = {
      username: mockUser.username,
      confirmPassword: mockUser.password,
      password: mockUser.password,
      email: mockUser.email,
    };

    it('should return 201 when user registers successfully', async () => {
      const response = await testAgent
        .post(endpoint)
        .send(mockRegisterUser)
        .expect(201);

      expect(response.body.message).toBe('Registration Success');
    });

    it('should return 422 when validation fails', async () => {
      await testAgent
        .post(endpoint)
        .send({ ...mockUser, email: 'invalid-email' }) // Invalid data
        .expect(422);
    });
  });

  describe('POST /auth/login', () => {
    const endpoint = '/api/v1/auth/login';

    const mockLoginDto: LoginDto = {
      email: mockUser.email,
      password: mockUser.password,
    };

    it('should return 201 when login is successful', async () => {
      const response = await testAgent
        .post(endpoint)
        .send(mockLoginDto)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it('should return 404 when user not found', async () => {
      await testAgent
        .post(endpoint)
        .send({ email: 'nonexistent@user.com', password: 'wrongpassword' })
        .expect(404); // Not found
    });

    it('should return 422 when validation fails', async () => {
      await testAgent
        .post(endpoint)
        .send({ ...mockLoginDto, email: 'invalid-email' }) // Invalid email
        .expect(422); // Validation error
    });
  });

  describe('POST /auth/refresh-token', () => {
    const endpoint = '/api/v1/auth/refresh-token';

    const mockRefreshTokenDto: RefreshTokenDto = {
      refreshToken: mockJwtToken,
    };

    it('should return 201 when refresh token is valid', async () => {
      const response = await testAgent
        .post(endpoint)
        .send(mockRefreshTokenDto)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
    });

    it('should return 422 when refresh token is invalid', async () => {
      await testAgent
        .post(endpoint)
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(422); // Invalid token
    });

    it('should return 422 when validation fails', async () => {
      await testAgent
        .post(endpoint)
        .send({ refreshToken: 'invalid-format' })
        .expect(422); // Validation error
    });
  });

  describe('POST /auth/forget-password', () => {
    const endpoint = '/api/v1/auth/forget-password';

    const mockForgetPasswordDto: ForgetPasswordDto = {
      email: mockUser.email,
    };

    it('should return 201 when forget password request is successful', async () => {
      const response = await testAgent
        .post(endpoint)
        .send(mockForgetPasswordDto)
        .expect(201);

      expect(response.body.message).toBe('Email sent successfully');
    });

    it('should return 400 when user not found', async () => {
      await testAgent
        .post(endpoint)
        .send({ email: 'nonexistent@user.com' })
        .expect(400); // Not found
    });

    it('should return 422 when validation fails', async () => {
      await testAgent
        .post(endpoint)
        .send({ email: 'invalid-email' }) // Invalid email format
        .expect(422); // Validation error
    });
  });

  describe('PUT /auth/reset-password/:token', () => {
    const endpoint = '/api/v1/auth/reset-password/';

    const mockResetPasswordDto: ResetPasswordDto = {
      confirmPassword: mockUser.password,
      password: mockUser.password,
    };

    it('should return 200 when password is reset successfully', async () => {
      const response = await testAgent
        .put(`${endpoint}${mockJwtToken}`)
        .send(mockResetPasswordDto)
        .expect(200);

      expect(response.body.message).toBe('Password has been updated');
    });

    it('should return 401 when token is invalid', async () => {
      await testAgent
        .put(`${endpoint}invalid-token`)
        .send(mockResetPasswordDto)
        .expect(401); // Invalid token error
    });

    it('should return 422 when validation fails', async () => {
      await testAgent
        .put(endpoint)
        .send({ password: 'short' }) // Invalid password format
        .expect(422); // Validation error
    });
  });

  describe('POST /auth/verify-email/:token', () => {
    const endpoint = '/api/v1/auth/verify-email/';

    it('should return 201 when email is verified successfully', async () => {
      const response = await testAgent
        .post(`${endpoint}${mockJwtToken}`)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
    });

    it('should return 401 when token is invalid', async () => {
      await testAgent.post(`${endpoint}invalid-token`).expect(401); // Invalid token
    });
  });

  describe('POST /auth/resend-email', () => {
    const endpoint = '/api/v1/auth/resend-email';

    it('should return 201 when email is resent successfully', async () => {
      const response = await testAgent
        .post(endpoint)
        .send({ email: mockUser.email })
        .expect(201);

      expect(response.body.message).toBe('Resend email success');
    });

    it('should return 404 when user does not exist', async () => {
      await testAgent
        .post(endpoint)
        .send({ email: 'nonexistent@user.com' })
        .expect(404); // User not found
    });

    it('should return 422 when validation fails', async () => {
      await testAgent
        .post(endpoint)
        .send({ email: 'invalid-email' })
        .expect(422); // Invalid email format
    });
  });
});
