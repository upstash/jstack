"use client";
import React from "react";
import * as z from "zod";
import CardWrapper from "./card-wrapper";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ResetSchema } from "../schemas";
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
import { reset } from "../actions/reset";

const ResetForm = () => {
  const form = useForm<z.infer<typeof ResetSchema>>({
    resolver: zodResolver(ResetSchema),
    defaultValues: {
      email: "",
    },
  });
  const { mutate, isPending, data } = useMutation({
    mutationFn: async (values: z.infer<typeof ResetSchema>) => {
      const data = await reset(values)
      return data;
    },
  });

  const handleSubmit = async (values: z.infer<typeof ResetSchema>) => {
    mutate(values);
  };
  return (
    <CardWrapper
      headerLabel="Forget your password?"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
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
          </div>
          <FormError message={data?.error} />
          <FormSuccess message={data?.success} />
          <Button className="w-full" type="submit" disabled={isPending}>
            Send Email
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetForm;
