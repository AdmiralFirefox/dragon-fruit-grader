import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebase/admin";

// Fetch all users
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split("Bearer ")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin claim
    if (decodedToken.admin !== true) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const listUsersResult = await adminAuth.listUsers();
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
    }));

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
