import { Module } from '@nestjs/common';
import { HealthCheckServices } from './health-check.service';
import { HealthCheckController } from './health-check.controller';
import { TerminusModule } from '@nestjs/terminus';
import { terminusConfig } from './config/terminus.config';

@Module({
  imports: [TerminusModule.forRoot(terminusConfig)],
  controllers: [HealthCheckController],
  providers: [HealthCheckServices],
})
export class HealthCheckModule {}
