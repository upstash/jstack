"use client";

import { signOut } from "next-auth/react";
import { PropsWithChildren } from "react";

const LogoutButton = ({ children }: PropsWithChildren) => {
  const onClick = async () => {
    await signOut();
  };
  return <span  onClick={onClick} className="cursor-pointer">
    {children}
  </span>;
};

export default LogoutButton;
