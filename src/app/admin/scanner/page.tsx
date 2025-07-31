import ScannerClient from "./client";
import getScanners from "./getScanners";

export default async function Page() {
  const scanners = await getScanners();

  return <ScannerClient initialScanners={scanners} />;
}