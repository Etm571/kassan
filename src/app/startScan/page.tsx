import { auth } from "./../../../auth.config";
import { redirect } from "next/navigation";
import ScanSuccessClient from "./client";

export default async function ScanSuccessPage() {
  const session = await auth();

  const assignUser = async () => {
    const user = session?.user;
    try {
      const res = await fetch(
        `https://${process.env.NEXT_PUBLIC_WEBSOCKET}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ user }),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        return (error.fel || "Misslyckades med att tilldela skanner.");
      } else {
        const data = await res.json();
      }
    } catch (err) {
      return ("Nätverksfel vid tilldelning av skanner.");
    }
  };

  assignUser();

  if (!session?.user) {
    redirect("/");
  }

  return <ScanSuccessClient user={session.user} />;
}
