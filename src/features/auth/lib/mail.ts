import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmationLink = `http://localhost:3000/auth/new-verification?token=${token}`;
  console.log("sending email");
  await resend.emails.send({
    from: "authtoolkit@talhaali.xyz",
    to: email,
    subject: "Confirm your email",
    html: `
    <p>Click <a href="${confirmationLink}">here</a> to verify your email.</p>
    `,
  });
};
export const sendPasswordResetToken = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;
  await resend.emails.send({
    from: "authtoolkit@talhaali.xyz",
    to: email,
    subject: "Reset your password.",
    html: `
    <p>Click <a href="${resetLink}">here</a> to reset your password.</p>
    `,
  });
};

export const sendTwoFactorEmail = async (token: string, email: string) => {
  await resend.emails.send({
    from: "authtoolkit@talhaali.xyz",
    to: email,
    subject: "2FA Code ",
    html: `
        <p>2FA Code: ${token}</p>
        `,
  });
};
