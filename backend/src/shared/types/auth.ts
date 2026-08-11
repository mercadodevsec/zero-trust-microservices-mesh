export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export interface DecodedJwtPayload extends JwtPayload {
  iat: number;
  exp: number;
}
