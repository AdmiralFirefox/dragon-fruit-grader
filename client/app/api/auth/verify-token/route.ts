import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin";

export async function POST(request: Request) {
  const { token } = await request.json();

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check for custom claims
    const isAdmin = !!decodedToken.admin;

    return NextResponse.json({ isValid: true, isAdmin });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json(
      { isValid: false, isAdmin: false },
      { status: 401 }
    );
  }
}
