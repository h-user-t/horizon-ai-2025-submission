"use client";

import React, { useState } from "react";
import { ArrowRight, Lock, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/utils/firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

interface FirebaseError {
  code: string;
  message: string;
}

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email.toLowerCase());
      setIsSuccess(true);

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err) {
      console.error("Error in password reset:", err);
      const error = err as FirebaseError;

      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Section - Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
        {/* Logo and Back Button */}
        <div className="flex justify-center lg:justify-start w-full">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo/therapyAI-black.png" 
              alt="therapyAI Logo" 
              width={100} 
              height={100} 
              className="max-h-10 w-auto"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#AFD3E2]/20">
                  <Lock className="h-6 w-6 text-[#146C94]" />
                </div>
                <h1 className="text-2xl font-bold text-[#146C94]">Forgot password?</h1>
                <p className="text-balance text-sm text-[#146C94]/70">
                  No worries, we&apos;ll send you reset instructions.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>
                    Reset instructions sent! Check your email. Redirecting to login...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#146C94]">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                    disabled={isSubmitting || isSuccess}
                    className="border-[#AFD3E2] focus:border-[#146C94] text-[#146C94] placeholder:text-[#146C94]/50"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#AFD3E2] text-[#146C94] hover:bg-[#146C94] hover:text-white"
                  disabled={isSubmitting || isSuccess}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Sending instructions..." : "Reset password"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-[#146C94] hover:bg-[#AFD3E2]/20"
                  onClick={() => router.push("/signin")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section - Image with Text Overlay */}
      <div className="relative hidden lg:block bg-gradient-to-br from-[#146C94] to-[#AFD3E2]">
        <div className="absolute inset-0 bg-[#146C94]/50">
          <Image
            src="/images/mockup/2.jpg"
            alt="Background"
            className="w-full h-full object-cover opacity-50"
            width={1920}
            height={1080}
          />
        </div>
        
        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center px-12 lg:px-16">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">
              Reset Password
            </h1>
            <p className="text-[#F6F1F1] text-lg">
              Get back to providing better mental healthcare
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;