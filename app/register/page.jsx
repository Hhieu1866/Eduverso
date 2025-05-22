import React from "react";
import { SignupForm } from "./_components/signup-form";

const RegisterPage = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="container">
        <SignupForm />
      </div>
    </div>
  );
};

export default RegisterPage;
