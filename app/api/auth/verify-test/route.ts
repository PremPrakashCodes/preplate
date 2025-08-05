import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: "No token provided" });
    }
    
    console.log("Verify Test - Testing token:", token.substring(0, 50) + "...");
    
    // Test verification
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ 
        verified: false, 
        error: "Token verification failed" 
      });
    }
    
    // Test generating a new token with the same payload
    const testToken = await generateToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
    });
    
    return NextResponse.json({
      verified: true,
      decoded,
      testToken: testToken.substring(0, 50) + "...",
      tokensMatch: token === testToken
    });
    
  } catch (error) {
    return NextResponse.json({ 
      error: "Verification test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 