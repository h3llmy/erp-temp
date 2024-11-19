import { ApiProperty } from '@nestjs/swagger';

export class ServiceStatus {
  @ApiProperty({
    description:
      'The status of the service, which can be either "up" or "down"',
    enum: ['up', 'down'],
    example: 'up',
  })
  status: 'up' | 'down';
}

export class Info {
  @ApiProperty({
    description: 'The status of the database service',
    type: ServiceStatus,
  })
  database: ServiceStatus;

  @ApiProperty({
    description: 'The status of the memory heap service',
    type: ServiceStatus,
  })
  memoryHeap: ServiceStatus;
}

export class Details {
  @ApiProperty({
    description: 'The status of the database service',
    type: ServiceStatus,
  })
  database: ServiceStatus;

  @ApiProperty({
    description: 'The status of the memory heap service',
    type: ServiceStatus,
  })
  memoryHeap: ServiceStatus;
}

export class HealthCheckResponse {
  @ApiProperty({
    description: 'The status of the health check response',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: 'Information about the system services',
    type: Info,
  })
  info: Info;

  @ApiProperty({
    description: 'Error object, if any errors occur during the health check',
    type: Object,
    example: {},
  })
  error: Record<string, unknown>;

  @ApiProperty({
    description: 'Details about the system services',
    type: Details,
  })
  details: Details;
}
