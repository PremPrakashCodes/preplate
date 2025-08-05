import { NextResponse } from "next/server";

export async function GET() {
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  
  return NextResponse.json({
    secretExists: !!process.env.JWT_SECRET,
    secretLength: JWT_SECRET.length,
    secretPreview: JWT_SECRET.substring(0, 10) + "...",
    envVars: {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_SET: !!process.env.JWT_SECRET
    }
  });
} 