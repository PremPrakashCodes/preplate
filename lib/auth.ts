import CryptoJS from "crypto-js";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-for-preplate-app-2025";

export interface AuthPayload {
  id: string;
  email: string;
  role: "USER" | "RESTAURANT";
  type: "user" | "restaurant";
}

export async function hashPassword(password: string): Promise<string> {
  return CryptoJS.SHA256(password).toString();
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const hashedInput = CryptoJS.SHA256(password).toString();
  return hashedInput === hashedPassword;
}

export async function generateToken(payload: AuthPayload): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    console.log("Verifying token with secret:", JWT_SECRET);
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    console.log("Token verification successful:", payload);
    return payload as AuthPayload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters long",
    };
  }
  return { valid: true, message: "" };
}
