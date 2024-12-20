"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { RegisterSchema } from "@/src/features/auth/schemas";
import { db } from "@/src/db";
import { getUserByEmail } from "../data/user";
import { generateVerificationToken } from "../lib/tokens";
import { sendVerificationEmail } from "../lib/mail";
export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: "Email already taken." };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  //   TODO: Send verification token email
  const verificationtoken = await generateVerificationToken(email);
  await sendVerificationEmail(
    verificationtoken.email,
    verificationtoken.token,
  );
  return { success: "Confirmation email sent!" };
};
