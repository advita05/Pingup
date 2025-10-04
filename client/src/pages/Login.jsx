import React from "react";
import { assets } from "../assets/assets";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <img
        src={assets.bgImage}
        alt="background"
        className="absolute top-0 left-0 -z-10 w-full h-full object-cover"
      />
      <img
        src={assets.logo}
        alt="Pingup Logo"
        className="absolute top-6 left-6 h-12 object-contain"
      />
      <SignIn />
    </div>
  );
};

export default Login;


