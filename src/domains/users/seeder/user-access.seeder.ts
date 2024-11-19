import { RolePermissionSeeder, Seeder } from '@libs/database';
import { UserAccess } from '../user.access';

@Seeder()
export class UserAccessSeeder extends RolePermissionSeeder {
  constructor() {
    super({
      admin: [
        UserAccess.GET_ALL_USERS,
        UserAccess.GET_USER_PROFILE,
        UserAccess.GET_USER_BY_ID,
        UserAccess.UPDATE_PROFILE,
        UserAccess.DELETE_USER,
      ],
      user: [UserAccess.GET_USER_PROFILE, UserAccess.UPDATE_PROFILE],
    });
  }
}
