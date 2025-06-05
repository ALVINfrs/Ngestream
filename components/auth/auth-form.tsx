"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail } from "lucide-react";

export default function AuthForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      const { error } = await signUp(email, password, fullName);

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google",
        variant: "destructive",
      });
    }

    setGoogleLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-black to-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">NgeStream</h1>
          <p className="text-gray-400 text-sm">Created by alvnfrs</p>
        </div>

        <Card className="bg-black/50 border-gray-800">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-red-600"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-red-600"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <CardHeader>
                <CardTitle className="text-white">Welcome back</CardTitle>
                <CardDescription>
                  Sign in to your NgeStream account
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Mail className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <CardHeader>
                <CardTitle className="text-white">Create account</CardTitle>
                <CardDescription>Join NgeStream today</CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      required
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign Up
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                  >
                    {googleLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Mail className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
