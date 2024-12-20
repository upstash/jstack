import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/src/db";
import { getUserById } from "@/src/features/auth/data/user";
import { UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "@/src/features/auth/data/two-factor-confirmation";
import { getAccountByUserId } from "@/src/features/auth/data/account";

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    // verifyRequest: "/auth/verify-request"
  },
  adapter: PrismaAdapter(db),
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      const existingUser = await getUserById(user.id!);
      if (!existingUser || !existingUser.emailVerified) {
        return false;
      }
      // todo: add 2fa check

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );
        if (!twoFactorConfirmation) return false;

        // TODO: Delete two factor confirmation for next signin
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email ?? '';
        session.user.isOAuth = token.isOAuth as boolean;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await getUserById(token.sub);

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      token.isOAuth = !! existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;

      return token;
    },
  },
  session: { strategy: "jwt" },
  ...authConfig,
});
