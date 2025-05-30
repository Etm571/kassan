// app/page.tsx (or pages/index.tsx for Pages Router)
import ScannerClient from "./client";

export default async function Page() {
  const scanners = await getScannersSecurely();

  return <ScannerClient initialScanners={scanners} />;
}

async function getScannersSecurely() {
  const res = await fetch("http://localhost:8080/scanners", {
    headers: {
      "x-auth-secret": process.env.WEBSOCKET_SECRET!,
    },
    cache: "no-store",
  });

  console.log(res.status, res.statusText);
  console.log(process.env.WEBSOCKET_SECRET);

  if (!res.ok) return [];

  const data = await res.json();
  return data.scanners || [];
}
