import * as z from "zod";


export const SettingsSchema = z.object({
    name: z.optional(z.string())
})

export const NewPasswordSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters." }),
});
export const ResetSchema = z.object({
  email: z.string().email(),
});
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
  code: z.optional(z.string())
});
export const RegisterSchema = z.object({
  email: z.string().email({
    message: "Email is required.",
  }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters." }),
  name: z.string().min(1, { message: "Name is required." }),
});
