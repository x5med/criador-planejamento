import { redirect } from "next/navigation";

import { AccountBar } from "@/components/AccountBar";
import { StrategicPlanner } from "@/components/StrategicPlanner";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function PlanningPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <AccountBar email={user.email ?? "Conta X5"} />
      <StrategicPlanner storageScope={user.id} />
    </>
  );
}
