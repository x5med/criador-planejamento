import { LogOut } from "lucide-react";

import { logout } from "@/app/auth/actions";

export function AccountBar({ email }: { email: string }) {
  return (
    <aside className="account-bar" aria-label="Conta conectada">
      <span title={email}>{email}</span>
      <form action={logout}>
        <button type="submit" aria-label="Sair da conta">
          <LogOut size={15} aria-hidden="true" />
          Sair
        </button>
      </form>
    </aside>
  );
}
