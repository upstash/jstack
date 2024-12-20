"use server";

import { z } from "zod";
import { ResetSchema } from "@/src/features/auth/schemas";
import { getUserByEmail } from "../data/user";
import { generatePasswordResetToken } from "../lib/tokens";
import { sendPasswordResetToken, sendVerificationEmail } from "../lib/mail";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validatedFields = ResetSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid Email!" };
  }

  const { email } = validatedFields.data;
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email not found." };
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  await sendPasswordResetToken(
    passwordResetToken.email,
    passwordResetToken.token
  );

  return { success: "Reset email sent." };
};
