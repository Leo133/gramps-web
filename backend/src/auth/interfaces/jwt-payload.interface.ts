export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  permissions: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
    canUseChat: boolean;
  };
  iat?: number;
  exp?: number;
}

export interface UserFromJwt {
  id: string;
  username: string;
  role: string;
  permissions: JwtPayload['permissions'];
}
