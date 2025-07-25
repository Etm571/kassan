import { auth } from "@/../auth.config";
import { redirect } from "next/navigation";
import ScanSuccessClient from "./client";
import { prisma } from "@/app/lib/prisma";
import ExistingSession from "../views/existingSession";

export default async function ScanSuccessPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { userId: BigInt(session.user.userId) },
  });

  if (!user) {
    redirect("/");
  }

  if (user.active) {
    return <ExistingSession />;
  }

  let assignError: string | null = null;

  const assignUser = async () => {
    const user = session?.user;
    try {
      const res = await fetch(
        `https://${process.env.NEXT_PUBLIC_WEBSOCKET_URL}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            "x-auth-secret": process.env.NEXT_PUBLIC_WEBSOCKET_SECRET!,
          },
          body: JSON.stringify({ user }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        assignError = error.error || "Technical issues.";
        return
      }
    } catch (err) {
      assignError = "Nätverksfel vid tilldelning av skanner.";
      return
    }


    await prisma.user.update({
      where: { userId: BigInt(user.userId) },
      data: {
        active: true,
      },
    });
  };

  await assignUser();

  return <ScanSuccessClient user={session.user} assignError={assignError} />;
}
