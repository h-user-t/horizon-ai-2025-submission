"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { auth } from "@/app/utils/firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseErrorMessage } from "@/app/utils/firebaseErrors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormData } from "../components/types";
import WelcomeSection from "../components/ImageOverlay";

// Firebase
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/utils/firebase/config";


const SignInPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
  
    try {
      // 1. Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // 2. Get user role from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error("User data not found");
      }
  
      // 3. Create session cookie
      const idToken = await user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });
  
      // 4. Redirect based on role
      switch (userData.role) {
        case "patient":
          router.push("/patient");
          break;
        case "therapist":
          router.push("/therapist");
          break;
        default:
          setError("Invalid user role");
          break;
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      setError(getFirebaseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left Section - Form */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-white">
        {/* Logo container */}
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
              <h1 className="text-2xl font-bold text-[#146C94]">Login to your account</h1>
                <p className="text-balance text-sm text-[#146C94]/70">
                  Enter your email below to login to your account
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full cursor-not-allowed opacity-60" disabled>
                    <Image
                      src="/images/icons/google.png"
                      alt="Google icon"
                      width={20}
                      height={20}
                      className="mr-2 h-5 w-5"
                    />
                    Google
                  </Button>
                  <Button variant="outline" className="w-full cursor-not-allowed opacity-60" disabled>
                    <Image
                      src="/images/icons/apple.png"
                      alt="Apple icon"
                      width={20}
                      height={20}
                      className="mr-2 h-5 w-5"
                    />
                    Apple
                  </Button>
                </div>

                <div className="relative text-center text-sm">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#AFD3E2]"></div>
                  </div>
                  <div className="relative flex justify-center text-[#146C94]/70">
                    <span className="bg-white px-2">Or continue with email</span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#146C94]">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="m@example.com"
                    required
                    className="border-[#AFD3E2] focus:border-[#146C94] text-[#146C94] placeholder:text-[#146C94]/50"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-[#146C94]">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm text-[#146C94]/70 hover:text-[#146C94] underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="border-[#AFD3E2] focus:border-[#146C94] text-[#146C94] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-[#146C94]/70 hover:text-[#146C94]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#AFD3E2] text-[#146C94] hover:bg-[#146C94] hover:text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </div>

              <div className="text-center text-sm text-[#146C94]/70">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/signup-patient" 
                  className="text-[#146C94] underline underline-offset-4 hover:text-[#146C94]/80"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Section - Image with Text Overlay */}
      <WelcomeSection />
    </div>
  );
};

export default SignInPage;