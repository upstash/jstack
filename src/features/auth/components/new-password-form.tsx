"use client";
import React from "react";
import * as z from "zod";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {  NewPasswordSchema } from "../schemas";
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
import { newPassword } from "../actions/new-password";
import { useSearchParams } from "next/navigation";

const NewPasswordForm = () => {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
    },
  });
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (values: z.infer<typeof NewPasswordSchema>) => {
      const data = await newPassword(values, token)
      return data;
    },
  });

  const handleSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
    mutate(values);
  };
  return (
    <CardWrapper
      headerLabel="Create a new password"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="******"
                      disabled={isPending}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={data?.error} />
          <FormSuccess message={data?.success} />
          <Button className="w-full" type="submit" disabled={isPending}>
            Reset Password
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default NewPasswordForm;
