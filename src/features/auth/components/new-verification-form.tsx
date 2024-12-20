"use client";

import React, { useCallback, useEffect, useState } from "react";
import CardWrapper from "./card-wrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { newVerification } from "../actions/new-verification";
import FormError from "./form-error";
import FormSuccess from "./form-success";
const NewVerificationForm = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {
    if(success && error) return;
    if (!token) {
      setError("Missing token");
      return;
    }
    newVerification(token)
      .then((data) => {
        if (data?.success) {
          setSuccess(data.success);
        }
        if (data?.error) {
          setError(data.error);
        }
      })
      .catch(() => {
        setError("something went wrong");
      });
  }, [token]);

  useEffect(() => {
    onSubmit();
  }, [token, success, error]);
  return (
    <CardWrapper
      headerLabel="Confirming your email..."
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
    >
      <div className="flex w-full justify-center items-center">
        {!success && !error && <BeatLoader />}
        <FormError message={error} />
        <FormSuccess message={success} />
      </div>
    </CardWrapper>
  );
};

export default NewVerificationForm;
