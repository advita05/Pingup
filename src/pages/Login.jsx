import React from "react";
import { assets } from "../assets/assets";
import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="absolute top-6 left-6 z-10">
        <img src={assets.logo} alt="Logo" className="h-12 object-contain" />
      </div>

      <div className="flex-1 flex items-center justify-center z-10">
        <div className="p-6 sm:p-10">
          <SignIn />
        </div>
      </div>
    </div>
  );
};

export default Login;
