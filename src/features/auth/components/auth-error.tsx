import CardWrapper from "./card-wrapper";
import { BsExclamationTriangle } from "react-icons/bs";

const AuthError = () => {
  return (
    <CardWrapper
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      headerLabel="Oops, Something went wrong!"
    >
        <div className="w-full flex justify-center items-center">
            <BsExclamationTriangle className="text-destructive"/>
        </div>
    </CardWrapper>
  );
};

export default AuthError;
