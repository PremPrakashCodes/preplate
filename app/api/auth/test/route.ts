import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  
  console.log("Test API - Token from cookie:", token ? "exists" : "none");
  console.log("Test API - All cookies:", request.cookies.getAll());
  
  if (!token) {
    return NextResponse.json({ 
      authenticated: false, 
      error: "No token found",
      cookies: request.cookies.getAll().map(c => ({ name: c.name, value: c.value ? "exists" : "none" }))
    });
  }
  
  try {
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: "Invalid token",
        tokenPreview: token.substring(0, 20) + "..."
      });
    }
    
    return NextResponse.json({ 
      authenticated: true, 
      user: { id: user.id, email: user.email, type: user.type },
      tokenPreview: token.substring(0, 20) + "..."
    });
  } catch (error) {
    return NextResponse.json({ 
      authenticated: false, 
      error: "Token verification failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 