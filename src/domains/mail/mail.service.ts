import { createTransport, Transporter, SentMessageInfo} from 'nodemailer';
import ejs from 'ejs';
import { User } from '@domains/users/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import path from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly baseTemplatePath: string = './views/basic-auth';

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: configService.get<string>('MAILER_HOST'),
      service: configService.get<string>('MAILER_SERVICE'),
      port: configService.get<number>('MAILER_PORT'),
      secure: true,
      requireTLS: true,
      from: '"No Reply" <no-reply@gmail.com>',
      auth: {
        user: this.configService.get<string>('MAILER_USERNAME'),
        pass: this.configService.get<string>('MAILER_PASSWORD'),
      },
    });
  }

  /**
   * Sends a registration email to the user.
   *
   * @param {User} user - The user to send the registration email to.
   * @param {string} token - The token to include in the registration email.
   * @return {Promise<SentMessageInfo>} - The result of sending the email.
   */
  async sendRegisterMail(user: User, token: string): Promise<SentMessageInfo> {
    const webUrl = this.configService.get<string>('WEB_URL');
    const webVerifyRoute = this.configService.get<string>('WEB_VERIFY_ROUTE');
    const confirmationLink = `${webUrl}/${webVerifyRoute}/${token}`;

    const templatePath = path.join(
      this.baseTemplatePath,
      '/basic-auth/register.ejs',
    );
    const template = await fs.readFile(templatePath, 'utf-8');

    const html = ejs.render(template, {
      confirmationLink,
      user,
    });

    return this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_USER'),
      to: user.email,
      subject: 'Registration Email',
      html,
    });
  }

  /**
   * Sends a forget password email to the user.
   *
   * @param {User} user - The user to send the forget password email to.
   * @param {string} token - The token to include in the forget password email.
   * @return {Promise<SentMessageInfo>} - The result of sending the email.
   */
  async sendForgetPasswordMail(
    user: User,
    token: string,
  ): Promise<SentMessageInfo> {
    const webUrl = this.configService.get<string>('WEB_URL');
    const webForgetPasswordRoute = this.configService.get<string>(
      'WEB_FORGET_PASSWORD_ROUTE',
    );
    const redirectLink = `${webUrl}/${webForgetPasswordRoute}/${token}`;

    const templatePath = path.join(
      this.baseTemplatePath,
      '/basic-auth/forget-password.ejs',
    );
    const template = await fs.readFile(templatePath, 'utf-8');

    const html = ejs.render(template, {
      redirectLink,
      user,
    });

    return this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_USER'),
      to: user.email,
      subject: 'Forget Password',
      html,
    });
  }
}
