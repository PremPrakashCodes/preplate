import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken, validateEmail } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, type } = await request.json();

    // Validate input
    if (!email || !password || !type) {
      return NextResponse.json(
        { error: "Email, password, and type are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (type !== "user" && type !== "restaurant") {
      return NextResponse.json(
        { error: 'Type must be either "user" or "restaurant"' },
        { status: 400 }
      );
    }

    let account;

    if (type === "user") {
      account = await prisma.user.findUnique({
        where: { email },
      });
    } else {
      account = await prisma.restaurant.findUnique({
        where: { email },
      });
    }

    if (!account) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, account.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const payload = {
      id: account.id,
      email: account.email,
      role: (type === "user" ? "USER" : "RESTAURANT") as "USER" | "RESTAURANT",
      type,
    };
    
    console.log("Login - Generating token with payload:", payload);
    const token = await generateToken(payload);
    console.log("Login - Generated token:", token.substring(0, 50) + "...");

    // Remove password from response
    const { password: _, ...accountWithoutPassword } = account;

    // Create response with token in cookie
    const response = NextResponse.json({
      message: "Login successful",
      token,
      account: accountWithoutPassword,
      type,
    });

    // Set token in HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
