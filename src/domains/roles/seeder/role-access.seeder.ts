import { RolePermissionSeeder, Seeder } from '@libs/database';
import { RoleAccess } from '../role.access';

@Seeder()
export class RoleAccessSeeder extends RolePermissionSeeder {
  constructor() {
    super({
      admin: [
        RoleAccess.CREATE_ROLE,
        RoleAccess.GET_ALL_ROLES,
        RoleAccess.GET_ROLE_BY_ID,
        RoleAccess.UPDATE_ROLE,
        RoleAccess.DELETE_ROLE,
      ],
    });
  }
}
