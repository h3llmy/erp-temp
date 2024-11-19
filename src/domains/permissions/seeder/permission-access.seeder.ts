import { RolePermissionSeeder, Seeder } from '@libs/database';
import { PermissionAccess } from '../permission.access';

@Seeder()
export class PermissionAccessSeeder extends RolePermissionSeeder {
  constructor() {
    super({
      admin: [
        PermissionAccess.GET_ALL_PERMISSIONS,
        PermissionAccess.GET_PERMISSION_BY_ID,
      ],
    });
  }
}
