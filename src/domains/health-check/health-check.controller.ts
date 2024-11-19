import { Controller, Get } from '@nestjs/common';
import { HealthCheckServices } from './health-check.service';
import { HealthCheckResult } from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckResponse } from './dto/health-check-respose.dto';

@Controller('health-check')
@ApiTags('HealthCheck')
export class HealthCheckController {
  constructor(private readonly healthCheckService: HealthCheckServices) {}

  @Get('/health')
  @ApiOperation({ summary: 'Health Check' })
  @ApiOkResponse({
    description: 'Health Check',
    type: HealthCheckResponse,
  })
  healthCheck(): Promise<HealthCheckResult> {
    return this.healthCheckService.check();
  }
}
