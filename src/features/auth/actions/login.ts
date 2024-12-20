"use server";

import * as z from "zod";
import { LoginSchema } from "@/src/features/auth/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import AuthError  from "next-auth";
import { getUserByEmail } from "../data/user";
import { getTwoFactorTokenByEmail } from "../data/two-factor-token";
import {
  generateTwoFactorToken,
  generateVerificationToken,
} from "../lib/tokens";
import { sendTwoFactorEmail, sendVerificationEmail } from "../lib/mail";
import { db } from "@/src/db";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";
export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }
  const { email, password, code } = validatedFields.data;
  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email doesn't exist" };
  }
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    );
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return { success: "Confirmation email sent" };
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
        const token = await getTwoFactorTokenByEmail(existingUser.email)
        if(!token) return {error: "Invalid code"}

        if(token.token !== code) return { error: "Invalid code!"}

        const hasExpired = new Date(token.expires) < new Date()

        if(hasExpired) return { error: "Code Expired"}

        await db.twoFactorToken.delete({ where: { id: token.id  }})

        const existingTwoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)

        if(existingTwoFactorConfirmation) {
            await db.twoFactorConfirmation.delete({ where: { id: existingTwoFactorConfirmation.id}})
        }

        await db.twoFactorConfirmation.create({
            data: {
                userId: existingUser.id,

            }
        })
    } else {
      const twoFactorToken = await generateTwoFactorToken(email);
      await sendTwoFactorEmail(twoFactorToken.token, twoFactorToken.email);
      return { twoFactor: true };
    }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
    return { success: "success" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials" };
          break;
        default:
          return { error: "Something Went Wrong" };
      }
    }
    throw error;
  }
};
