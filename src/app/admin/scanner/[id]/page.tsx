import ScannerDetailClient from "./client";
import getScanners from "../getScanners";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface Scanner {
  id: string;
  status: "free" | "occupied";
  user: { name: string; userId: string } | null;
  startTime: string | null;
  deviceInfo: {
    model: string;
    osVersion?: string;
    operatingSystem?: string;
    androidSDKVersion?: number;
    manufacturer?: string;
    webViewVersion?: string;
  };
  batteryInfo?: {
    batteryLevel?: number;
    isCharging?: boolean;
  };
}


async function getScanner(id: string): Promise<Scanner | null> {
  try {
    const scanners = await getScanners();

    if (!Array.isArray(scanners)) {
      return null;
    }

    return scanners.find((s: Scanner) => s.id === id) || null;
  } catch (error) {
    console.error("Error fetching scanner:", error);
    return null;
  }
}


export default async function ScannerPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const scanner = await getScanner(params.id);

  return <ScannerDetailClient scanner={scanner} id={params.id} />;
}
