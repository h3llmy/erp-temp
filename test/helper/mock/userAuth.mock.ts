import { User } from '@domains/users/entities/user.entity';

export const mockUser: User = {
  id: '94f29295-c54d-45b3-ba1d-13c14d965295',
  email: 'email@domain.com',
  username: 'username',
  emailVerifiedAt: Date.now(),
  password: 'some hashed password',
  updatedAt: '2024-11-14T12:50:50.903Z' as unknown as Date,
  createdAt: '2024-11-14T12:50:50.903Z' as unknown as Date,
};
