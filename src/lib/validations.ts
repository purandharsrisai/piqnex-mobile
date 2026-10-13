import { z } from "zod";
import { CONDITION_OPTIONS } from "./types";

/**
 * Shared validation schemas (Zod). We reuse the SAME schema on the client
 * (for instant form feedback) and on the server/route handler (because
 * client-side validation can always be bypassed - never trust the browser).
 */

export const needRequestSchema = z.object({
  category: z.string().min(1, "Please choose a category"),
  brand: z.string().trim().min(1, "Brand is required").max(80),
  product: z.string().trim().min(1, "Product is required").max(120),
  model: z.string().trim().max(120).optional().or(z.literal("")),
  part: z.string().trim().min(1, "Tell us which part is missing").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
});
export type NeedRequestInput = z.infer<typeof needRequestSchema>;

export const listingSchema = z.object({
  category: z.string().min(1, "Please choose a category"),
  brand: z.string().trim().min(1, "Brand is required").max(80),
  product: z.string().trim().min(1, "Product is required").max(120),
  model: z.string().trim().max(120).optional().or(z.literal("")),
  part: z.string().trim().min(1, "Part/component name is required").max(120),
  condition: z.enum(CONDITION_OPTIONS as [string, ...string[]]),
  price: z.coerce
    .number({ invalid_type_error: "Enter a valid price" })
    .min(0, "Price can't be negative")
    .max(10_000_000, "That price looks too high"),
  description: z
    .string()
    .trim()
    .min(10, "Add a few words describing the part's condition and history")
    .max(1500),
  location: z.string().trim().max(120).optional().or(z.literal("")),
});
export type ListingInput = z.infer<typeof listingSchema>;

export const contactRequestSchema = z.object({
  message: z.string().trim().min(5, "Write a short message to the seller").max(1000),
  contact_info: z.string().trim().max(200).optional().or(z.literal("")),
});
export type ContactRequestInput = z.infer<typeof contactRequestSchema>;

export const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type AuthInput = z.infer<typeof authSchema>;

export const signupSchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required").max(80),
    email: z.string().trim().email("Enter a valid email address"),
    // 10 digits, no country code - the form only lets digits through.
    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required")
      .regex(/^[0-9]{10}$/, "Enter a 10-digit phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Re-enter your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type SignupInput = z.infer<typeof signupSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing reset token"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
