import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string()
        .min(3, "Username must be between 3 and 20 characters ")
        .max(20, "Username must be between 3 and 20 characters"),
    email: z.email(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
});

export const loginSchema = z.object({
    username: z.string()
        .min(1, "Username is required"),
    password: z.string()
        .min(1, "Password is required")
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
