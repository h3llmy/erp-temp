import { Module } from '@nestjs/common';
import { CommonModule } from '@libs/common';
import { DatabaseModule } from '@libs/database';
import { HealthCheckModule } from './domains/health-check/health-check.module';
import { UsersModule } from '@domains/users/users.module';
import { AuthModule } from '@domains/auth/auth.module';
import { RolesModule } from '@domains/roles/roles.module';
import { PermissionsModule } from '@domains/permissions/permissions.module';
import { JobModule } from './jobs/job.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    HealthCheckModule,
    JobModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
  ],
})
export class AppModule {}
