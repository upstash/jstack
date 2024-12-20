import { db } from "@/src/db";

export const getPasswordRestTokenByToken = async (token: string) => {
  try {
    const passwordToken = await db.passwordResetToken.findFirst({
      where: { token: token },
    });
    return passwordToken;
  } catch {
    return null;
  }
};
export const getPasswordRestTokenByEmail = async (email: string) => {
  try {
    const passwordToken = await db.passwordResetToken.findFirst({
      where: { email: email },
    });
    return passwordToken;
  } catch {
    return null;
  }
};
