"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { userSchema } from "../lib/schema";
import { useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

interface Input {
  email: string;
  password: string;
}

export default function AuthForm({ type }: { type: "signin" | "signup" }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>({ resolver: zodResolver(userSchema) });

  const onSubmit: SubmitHandler<Input> = async (data) => {
    setLoading(true);
    if (type === "signin") {
      const loadingToast = toast.loading("Signing in...");
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      setLoading(false);
      toast.dismiss(loadingToast);
      if (res?.ok) {
        toast.success("Signed in successfully");
        router.push("/");
      } else {
        toast.error(res?.error || "Invalid username or password");
      }
    } else {
      const loadingToast = toast.loading("Signing up...");
      try {
        const res = await axios.post("/api/auth/register", {
          data: {
            email: data.email,
            password: data.password,
          },
        });
        setLoading(false);
        toast.dismiss(loadingToast);
        if (res.status === 200) {
          toast.success("User signed up successfully");
          router.push("/signin");
        }
      } catch (error) {
        setLoading(false);
        toast.dismiss(loadingToast);
        toast.error("Sign up failed");
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-full shadow-lg mb-4">
              <span className="text-3xl text-white">♔</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{type === "signin" ? "Welcome Back" : "Welcome Aboard"}</h1>
          <p className="text-slate-300">
            {type === "signin" ? "Sign in to continue your chess journey" : "Sign up to begin your chess journey"}
          </p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-slate-700">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  {...register("email")}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Username"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Password"
                  disabled={loading}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className={
                  "w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg shadow-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-[1.02] transition-all duration-200" +
                  (loading ? " opacity-50 cursor-not-allowed" : "")
                }
              >
                {type === "signin" ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>
        <div className="text-center mt-6">
          <p className="text-slate-400">
            {type === "signin" ? (
              <>
                Don&apos;t have an account? <Link href="/signup" className="text-amber-400 underline">Sign Up</Link>
              </>
            ) : (
              <>
                Already have an account? <Link href="/signin" className="text-amber-400 underline">Sign In</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}