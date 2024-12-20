"use client";
import React from "react";
import * as z from "zod";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { RegisterSchema } from "../schemas";
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
import {register} from "../actions/register";

const RegisterForm = () => {
  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: ""
    },
  });
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (values: z.infer<typeof RegisterSchema>) => {
      const data = await register(values);
      return data
    },
  });

  const handleSubmit = async(values: z.infer<typeof RegisterSchema>) => {
    mutate(values);
  };
  return (
    <CardWrapper
      headerLabel="Create an account"
      backButtonLabel="Already have an account?"
      backButtonHref="/auth/login"
      showSocial
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Jhondoe"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={data?.error} />
          <FormSuccess message={data?.success} />
          <Button className="w-full" type="submit"
           disabled={isPending}
           >
            Create an account
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
