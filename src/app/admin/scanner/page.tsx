import ScannerClient from "./client";

export default async function Page() {
  const scanners = await getScanners();

  return <ScannerClient initialScanners={scanners} />;
}

async function getScanners() {
  const res = await fetch("http://websocket:8080/scanners" as string, {
    headers: {
      "x-auth-secret": process.env.NEXT_PUBLIC_WEBSOCKET_SECRET!,
    },
    cache: "no-store",
  });


  if (!res.ok) return [];

  const data = await res.json();
  return data.scanners || [];
}
