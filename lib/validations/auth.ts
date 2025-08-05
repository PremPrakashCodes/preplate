import { z } from "zod";

// Base schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(100, "Password must be less than 100 characters");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .refine(
    (val) => /^[\+]?[1-9][\d]{0,15}$/.test(val),
    "Invalid phone number format"
  );

export const optionalPhoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val),
    "Invalid phone number format"
  );

export const addressSchema = z
  .string()
  .max(500, "Address must be less than 500 characters")
  .optional();

// User schemas
export const userLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  type: z.literal("user"),
});

export const userRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  type: z.literal("user"),
  phone: phoneSchema,
  address: addressSchema,
});

// Restaurant schemas
export const restaurantLoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  type: z.literal("restaurant"),
});

export const restaurantRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  type: z.literal("restaurant"),
  phone: phoneSchema,
  address: addressSchema,
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  cuisine: z
    .string()
    .max(100, "Cuisine type must be less than 100 characters")
    .optional(),
});

// Union schemas for login and register
export const loginSchema = z.discriminatedUnion("type", [
  userLoginSchema,
  restaurantLoginSchema,
]);

export const registerSchema = z.discriminatedUnion("type", [
  userRegisterSchema,
  restaurantRegisterSchema,
]);

// Type exports
export type UserLoginForm = z.infer<typeof userLoginSchema>;
export type UserRegisterForm = z.infer<typeof userRegisterSchema>;
export type RestaurantLoginForm = z.infer<typeof restaurantLoginSchema>;
export type RestaurantRegisterForm = z.infer<typeof restaurantRegisterSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
