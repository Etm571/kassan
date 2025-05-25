import { auth } from "./../../../auth.config";
import { redirect } from "next/navigation";
import StopScan from "./client";

export default async function ScanSuccessPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <StopScan user={session.user} />;
}
