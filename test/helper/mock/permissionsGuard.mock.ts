import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { mockUser } from './userAuth.mock';

@Injectable()
export class MockPermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permission',
      [context.getHandler(), context.getClass()],
    );

    // Get the request object
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    request['user'] = mockUser;

    // Check if the user has required permissions in the authorization header
    const hasPermission = requiredPermissions.some((permission) => {
      return request.headers.authorization === permission;
    });

    // If no permission or incorrect permission, throw an UnauthorizedException
    if (!hasPermission) {
      throw new UnauthorizedException('Unauthorized user');
    }

    // Return true if the permission check passes
    return true;
  }
}
