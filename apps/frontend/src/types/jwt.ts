export interface JWTTokenInfo {
    token?: string;
    payload?: JwtPayload;
}

export interface JwtPayload {
    [key: string]: any;
    id?: string;
    email?: string;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
}
