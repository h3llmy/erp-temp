import { TestBed } from '@automock/jest';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@domains/users/entities/user.entity';
import { Role } from '@domains/roles/entities/role.entity';
import { SentMessageInfo, Transporter } from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let configService: jest.Mocked<ConfigService>;
  let transporter: jest.Mocked<Transporter>;

  const mockRole: Role = {
    id: '1',
    name: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockUser: User = {
    id: '1',
    username: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    emailVerifiedAt: Date.now(),
    password: 'some hashed password',
    role: mockRole,
  };

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(MailService)
      .mock(ConfigService)
      .using({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'WEB_URL') {
            return 'http://localhost:3000';
          }
          if (key === 'WEB_VERIFY_ROUTE') {
            return 'auth/verify';
          }
          if (key === 'WEB_FORGET_PASSWORD_ROUTE') {
            return 'auth/forget-password';
          }
          if (key === 'MAILER_HOST') {
            return 'smtp.mailtrap.io';
          }
          if (key === 'MAILER_SERVICE') {
            return 'smtp';
          }
          if (key === 'MAILER_PORT') {
            return 587;
          }
          if (key === 'MAILER_USERNAME') {
            return 'mailer_user';
          }
          if (key === 'MAILER_PASSWORD') {
            return 'mailer_password';
          }
          if (key === 'EMAIL_USER') {
            return 'no-reply@example.com';
          }
        }),
      })
      .compile();

    service = unit;
    configService = unitRef.get(ConfigService);

    transporter = {
      sendMail: jest.fn(),
    } as unknown as jest.Mocked<Transporter>;

    service['transporter'] = transporter;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('sendRegisterMail', () => {
    it('should be defined', () => {
      expect(service.sendRegisterMail).toBeDefined();
    });

    it('should send a verification email', async () => {
      transporter.sendMail.mockResolvedValue({} as SentMessageInfo);
      const result = await service.sendRegisterMail(mockUser, 'token');
      expect(result).toEqual({});
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: 'no-reply@example.com',
        to: mockUser.email,
        subject: 'Registration Email',
        html: expect.any(String),
      });
    });
  });

  describe('sendForgetPasswordMail', () => {
    it('should be defined', () => {
      expect(service.sendForgetPasswordMail).toBeDefined();
    });

    it('should send a forget password email', async () => {
      transporter.sendMail.mockResolvedValue({} as SentMessageInfo);
      const result = await service.sendForgetPasswordMail(mockUser, 'token');
      expect(result).toEqual({});
      expect(transporter.sendMail).toHaveBeenCalledWith({
        from: 'no-reply@example.com',
        to: mockUser.email,
        subject: 'Forget Password',
        html: expect.any(String),
      });
    });
  });
});
