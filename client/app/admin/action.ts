"use server";

import { redirect } from "next/navigation";
import { adminAuth } from "@/firebase/admin";
import { adminDB } from "@/firebase/admin";

export async function signOutUser(token: string, uid: string) {
  if (!token) {
    console.log("Unauthorized");
    redirect("/");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin claim
    if (decodedToken.admin !== true) {
      console.log("Access denied");
      redirect("/");
    }

    // Revoke refresh token for the specified user
    await adminAuth.revokeRefreshTokens(uid);
  } catch (error) {
    console.log(error);
  }
}

export async function disableUser(
  token: string,
  uid: string,
  disabled: boolean
) {
  if (!token) {
    console.log("Unauthorized");
    redirect("/");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin claim
    if (decodedToken.admin !== true) {
      console.log("Access denied");
      redirect("/");
    }

    await adminAuth.updateUser(uid, { disabled });

    // Add the user to the "blacklist" collection if disabling them
    if (disabled) {
      await adminDB.collection("blacklist").doc(uid).set({
        uid: uid,
        disabledAt: new Date(),
      });
    } else {
      // Optionally remove the user from the blacklist if enabling them
      await adminDB.collection("blacklist").doc(uid).delete();
    }
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(token: string, uid: string) {
  if (!token) {
    console.log("Unauthorized");
    redirect("/");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Check if user has admin claim
    if (decodedToken.admin !== true) {
      console.log("Access denied");
      redirect("/");
    }

    await adminDB.collection("blacklist").doc(uid).set({
      uid: uid,
      disabledAt: new Date(),
    });

    await adminAuth.deleteUser(uid);
  } catch (error) {
    console.log(error);
  }
}
