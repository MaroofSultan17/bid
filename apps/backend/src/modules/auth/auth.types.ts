import { z } from 'zod';

export const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export type LoginRequestDTO = z.infer<typeof LoginRequestSchema>;

export interface JwtPayloadDTO {
    id: string;
    email: string;
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
}
