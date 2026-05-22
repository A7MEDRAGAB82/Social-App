import { z } from 'zod';

export const signupSchema = {
    body: z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
    })
};

export const loginSchema = {
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required")
    })
};

export const googleSignupSchema = {
    body: z.object({
        idToken: z.string().min(1, "idToken is required")
    })
};

export const forgetPasswordSchema = {
    body: z.object({
        email: z.string().email("Invalid email address")
    })
};

export const resetPasswordSchema = {
    body: z.object({
        resetToken: z.string().min(1, "Reset token is required"),
        newPassword: z.string().min(6, "Password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
    })
};

export const updatePasswordSchema = {
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters long"),
        confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
    })
};
