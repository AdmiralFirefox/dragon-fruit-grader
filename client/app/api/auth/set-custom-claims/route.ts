import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin";

export async function POST(request: Request) {
  const reqBody = (await request.json()) as { idToken: string };
  const idToken = reqBody.idToken;

  try {
    // Decode the idToken to get the user's UID
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if the user already has custom claims
    const user = await adminAuth.getUser(uid);
    const existingClaims = user.customClaims;

    // Assign default custom claims if none exist
    if (!existingClaims || Object.keys(existingClaims).length === 0) {
      await adminAuth.setCustomUserClaims(uid, { admin: false });
    }

    return NextResponse.json({ message: "Custom claim has been set" });
  } catch (error) {
    console.error("Error setting custom claims:", error);
    return NextResponse.json(
      { error: "Failed to set custom claims" },
      { status: 500 }
    );
  }
}
