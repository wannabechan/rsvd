"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useLoginBoot } from "@/components/auth/login-boot-context";

export default function LoginPage() {
  const { boot } = useLoginBoot();
  return <LoginForm key={boot} />;
}
