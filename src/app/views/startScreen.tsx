"use client"
import { QrCodeIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function SelfScanHome() {
  const router = useRouter();

  const handleStartScan = () => {
    router.push("/login?callbackUrl=/scan-success");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-center text-gray-700 mb-12">
        Välkommen till Självscanning
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button 
          onClick={handleStartScan}
          className="flex flex-col items-center justify-center p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl transition duration-200 h-full"
        >
          <QrCodeIcon className="h-16 w-16 mb-4" />
          <span className="font-bold text-2xl">Starta scanna</span>
        </button>

        <button className="flex flex-col items-center justify-center p-8 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-xl transition duration-200 h-full">
          <CheckCircleIcon className="h-16 w-16 mb-4" />
          <span className="font-bold text-2xl">Avsluta scanning</span>
        </button>
      </div>
    </div>
  );
}