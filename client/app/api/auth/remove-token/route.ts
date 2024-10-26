import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("idToken");
  return NextResponse.json({ message: "Token removed successfully" });
}
