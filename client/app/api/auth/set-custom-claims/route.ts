import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];

  try {
    // Verify the user's ID token
    const decodedToken = await adminAuth.verifyIdToken(token as string);

    const uid = decodedToken.uid;
    const customClaims = decodedToken.claims;

    // Check if 'admin' is already set in custom claims
    if (customClaims && customClaims.admin !== undefined) {
      return NextResponse.json({
        message: "Custom claim 'admin' already set.",
      });
    }

    // Set custom claim 'admin' to false if not already set
    await adminAuth.setCustomUserClaims(uid, { admin: false });

    return NextResponse.json({ message: "Custom claim 'admin' set to false." });
  } catch (error) {
    console.error("Error setting custom claims:", error);
    return NextResponse.json(
      { error: "Failed to set custom claims" },
      { status: 500 }
    );
  }
}
