import React from "react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

type Props = {
  href: string;
  label: string;
};

const BackButton = ({ label, href }: Props) => {
  return (
    <Button variant="link" size={"sm"} asChild className="font-normal w-full">
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export default BackButton;
