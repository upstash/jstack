import { db } from "@/src/db";

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
  try {
    const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
      where: { userId: userId },
    });

    return twoFactorConfirmation
  } catch {
    return null;
  }
};
