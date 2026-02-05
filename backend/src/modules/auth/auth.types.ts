
export type LoginInput = {
  email: string;
  password: string;
};

export type JwtPayload = {
  userId: string;
  roles: string[];
  sessionId: string;
};
