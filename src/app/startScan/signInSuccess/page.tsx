import { auth } from "./../../../../auth.config";
import { redirect } from "next/navigation";

export default async function ScanSuccessPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Scanning Session Started</h1>
      <p className="text-lg text-gray-600">
        Welcome {session.user.name}! You're now ready to start scanning.
      </p>
    </div>
  );
}