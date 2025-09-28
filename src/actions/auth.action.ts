"use server";

import { prisma } from "../app/db/prisma";
import bycrypt from "bcryptjs";
import { logEvent } from "@/utils/sentry";
import { signAuthToken, setAuthCookie } from "@/lib/auth";

type ResponseResult = {
  success: boolean;
  message: string;
};

// Register new user
export async function registerUser(
  prevState: ResponseResult,
  formData: FormData
): Promise<ResponseResult> {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      logEvent(
        "Validation Error: Missing register fields",
        "auth",
        {
          name,
          email,
        },
        "warning"
      );
      return {
        success: false,
        message: "All fields are required",
      };
    }

    // Check if user exist
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      logEvent(
        `Registration failed: User already exist - ${email}`,
        "auth",
        {
          email,
        },
        "warning"
      );
      return {
        success: false,
        message: "User already exists",
      };
    }
    // Hash Password
    const hashedPassword = await bycrypt.hash(password, 10);
    // Create User
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    const token = await signAuthToken({ userId: user.id });
    await setAuthCookie(token);

    logEvent(
      "User registered sucessfully",
      "auth",
      { userId: user.id, email },
      "info"
    );
    return {
      success: true,
      message: "User registered successfully",
    };
  } catch (error) {
    logEvent(
      "Unexpected error during registration",
      "auth",
      {},
      "error",
      error
    );
    return {
      success: false,
      message: "Something went wrong, please try again",
    };
  }
}
