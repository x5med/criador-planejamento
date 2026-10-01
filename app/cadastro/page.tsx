import type { Metadata } from "next";
import { LoginPreview } from "@/components/LoginPreview";
import "../login/login.css";

export const metadata: Metadata = {
  title: "Criar conta | X5 Planejamento",
  description: "Conheça o X5 Planejamento e explore a demonstração enquanto o cadastro está em preparação.",
};

export default function SignupPage() {
  return <LoginPreview mode="signup" />;
}
