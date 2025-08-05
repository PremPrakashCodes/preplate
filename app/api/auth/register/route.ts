import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  generateToken,
  validateEmail,
  validatePassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      name,
      type,
      phone,
      address,
      description,
      cuisine,
    } = await request.json();

    // Validate input
    if (!email || !password || !name || !type) {
      return NextResponse.json(
        { error: "Email, password, name, and type are required" },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required for registration" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    if (type !== "user" && type !== "restaurant") {
      return NextResponse.json(
        { error: 'Type must be either "user" or "restaurant"' },
        { status: 400 }
      );
    }

    // Check if email already exists in either table
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { email },
    });

    if (existingUser || existingRestaurant) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    let newAccount;

    if (type === "user") {
      newAccount = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          address: address || null,
        },
      });
    } else {
      newAccount = await prisma.restaurant.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone,
          description: description || null,
          address: address || null,
          cuisine: cuisine || null,
        },
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: newAccount.id,
      email: newAccount.email,
      role: type === "user" ? "USER" : "RESTAURANT",
      type,
    });

    // Remove password from response
    const { password: passwordField, ...accountWithoutPassword } = newAccount;

    return NextResponse.json(
      {
        message: "Registration successful",
        token,
        account: accountWithoutPassword,
        type,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
