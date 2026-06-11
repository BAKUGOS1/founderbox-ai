"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";

const authSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type AuthValues = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-hero-radial px-6 py-10">
      <Card className="w-full max-w-md p-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold font-black text-background">
            FB
          </div>
          <div>
            <p className="text-sm font-semibold">FounderBox AI</p>
            <p className="text-xs text-muted">Frontend demo mode</p>
          </div>
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-semibold">
            {mode === "login" ? "Welcome back" : "Create your workspace"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {mode === "login"
              ? "Use demo@founderbox.ai with password founderbox, or enter any valid email and password."
              : "Signup is simulated and routes directly into the FounderBox demo workspace."}
          </p>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit(async () => {
            router.push("/app/dashboard");
          })}
        >
          <Field label="Email" error={errors.email?.message}>
            <Input type="email" placeholder="founder@example.com" {...register("email")} />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <Input type="password" placeholder="Minimum 6 characters" {...register("password")} />
          </Field>
          <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
            {mode === "login" ? "Login" : "Start Free"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "login" ? "New to FounderBox?" : "Already have a demo account?"}{" "}
          <Link className="text-gold hover:underline" href={mode === "login" ? "/signup" : "/login"}>
            {mode === "login" ? "Create account" : "Login"}
          </Link>
        </p>
      </Card>
    </main>
  );
}
