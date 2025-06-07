import ScannerClient from "./client";

export default async function Page() {
  const scanners = await getScannersSecurely();

  return <ScannerClient initialScanners={scanners} />;
}

async function getScannersSecurely() {
  const res = await fetch("https://" + process.env.NEXT_PUBLIC_WEBSOCKET + "/scanners" as string, {
    headers: {
      "x-auth-secret": process.env.WEBSOCKET_SECRET!,
    },
    cache: "no-store",
  });


  if (!res.ok) return [];

  const data = await res.json();
  return data.scanners || [];
}
