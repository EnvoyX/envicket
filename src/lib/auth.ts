import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { logEvent } from "@/utils/sentry";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const cookieName = "auth-token";

//  Encrypt and sign token
export async function signAuthToken(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "H256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    return token;
  } catch (error) {
    logEvent("Error signing auth token.", "auth", { payload }, "error", error);
    throw new Error("Token signing failed.");
  }
}

// Decrypt and verify token
export async function verifyAuthToken<T>(token: string): Promise<T> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as T;
  } catch (error) {
    logEvent(
      "Token decryption failed",
      "auth",
      { tokenSnippet: token.slice(0, 10) },
      "error",
      error
    );
    throw new Error("Token decryption failed");
  }
}

// Set the auth token in the cookie so that can be sended with every request to get validated or decrypted
export async function setAuthCookie(token: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly: true, // Prevent javascript from accessing the cookie
      sameSite: "lax", // Prevent cross-site request
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    logEvent("Failed to set cookie", "auth", { token }, "error", error);
    throw new Error("Failed to set cookie");
  }
}

// Get auth token from cookie
export async function getAuthCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName);
  return token?.value;
}

// Remove auth token from cookie
export async function removeAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
  } catch (error) {
    logEvent("Failed to remove the auth cookie", "auth", {}, "error", error);
  }
}
