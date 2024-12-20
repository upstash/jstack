import { db } from "@/src/db";

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const existingToken = await db.twoFactorToken.findUnique({
      where: { token: token },
    });
    return existingToken
  } catch {
    return null;
  }
};
export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    const existingToken = await db.twoFactorToken.findFirst({
      where: { email },
    });
    return existingToken
  } catch {
    return null;
  }
};
