"use client";
import React, { useState } from "react";
import * as z from "zod";
import CardWrapper from "./card-wrapper";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginSchema } from "../schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import FormError from "./form-error";
import FormSuccess from "./form-success";
import { useMutation } from "@tanstack/react-query";
import { login } from "../actions/login";
import Link from "next/link";

const LoginForm = () => {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email Already in use with different provider."
      : "";
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (values: z.infer<typeof LoginSchema>) => {
      const data = await login(values);
      if (data?.error) {
        form.reset();
      }
      if (data?.success) {
        form.reset();
      }
      if (data?.twoFactor) {
        setShowTwoFactor(true);
      }
      return data;
    },
  });

  const handleSubmit = async (values: z.infer<typeof LoginSchema>) => {
    mutate(values);
    if (data?.error) {
      form.reset();
    }
    if (data?.success) {
      form.reset();
    }
    if (data?.twoFactor) {
      setShowTwoFactor(true);
    }
  };
  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="123456"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Jhondoe@example.com"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="*********"
                          disabled={isPending}
                        />
                      </FormControl>
                      <Button
                        asChild
                        variant={"link"}
                        size={"sm"}
                        className="px-0 font-normal"
                      >
                        <Link href={"/auth/reset"}>Forgot password?</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={data?.error || urlError} />
          <FormSuccess message={data?.success} />
          <Button className="w-full" type="submit" disabled={isPending}>

            {showTwoFactor ? "Confirm": "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
