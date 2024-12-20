import { UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type extendedUser = DefaultSession["user"] & {
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
};

declare module "next-auth" {
  interface Session {
    user: extendedUser;
  }
}
