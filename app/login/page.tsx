import type { Metadata } from "next";
import { LoginPreview } from "@/components/LoginPreview";
import "./login.css";

export const metadata: Metadata = {
  title: "Acesso | X5 Planejamento",
  description: "Conheça o Planejamento X5 e explore a demonstração do produto.",
};

export default function LoginPage() {
  return <LoginPreview />;
}
