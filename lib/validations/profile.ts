import { z } from "zod";

// Example: Profile update schemas
export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
      "Invalid phone number format"
    ),
  address: z.string().max(500).optional(),
});

export const updateRestaurantProfileSchema = z.object({
  name: z.string().min(1, "Restaurant name is required").max(100),
  description: z.string().max(1000).optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
      "Invalid phone number format"
    ),
  address: z.string().max(500).optional(),
  cuisine: z.string().max(100).optional(),
});

// Example: Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type exports
export type UpdateUserProfileForm = z.infer<typeof updateUserProfileSchema>;
export type UpdateRestaurantProfileForm = z.infer<
  typeof updateRestaurantProfileSchema
>;
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
