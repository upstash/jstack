"use client";
import React from "react";
import { Button } from "@/src/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const Social = () => {
  const onClick = (provider: "google" | "github") => {
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };
  return (
    <div className="flex gap-x-2 items-center w-full">
      <Button
        className="w-full"
        variant={"outline"}
        onClick={() => onClick("google")}
        size={"lg"}
      >
        <FcGoogle className="size-5" />
      </Button>
      <Button
        className="w-full"
        variant={"outline"}
        onClick={() => onClick("github")}
        size={"lg"}
      >
        <FaGithub className="size-5" />
      </Button>
    </div>
  );
};

export default Social;
