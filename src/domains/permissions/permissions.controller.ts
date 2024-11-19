import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaginationPermissionDto } from './dto/pagination-permission.dto';
import {
  BasicErrorSchema,
  paginationSchemaFactory,
  Permission,
} from '@libs/common';
import { PermissionDto } from './dto/permission.dto';
import { PermissionAccess } from './permission.access';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Permission(PermissionAccess.GET_ALL_PERMISSIONS)
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get all permissions',
    type: paginationSchemaFactory(PermissionDto),
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: BasicErrorSchema,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
    type: BasicErrorSchema,
  })
  findAllPagination(@Query() findQuery: PaginationPermissionDto) {
    return this.permissionsService.findAllPagination(findQuery);
  }

  @Get(':id')
  @Permission(PermissionAccess.GET_PERMISSION_BY_ID)
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: 'string', description: 'Permission ID' })
  @ApiOkResponse({
    description: 'Get permission by ID',
    type: PermissionDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
    type: BasicErrorSchema,
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests',
    type: BasicErrorSchema,
  })
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    const permission = await this.permissionsService.findOne(id);
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }
}
