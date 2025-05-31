import ScannerDetailClient from "./client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Scanner {
  id: string;
  status: "free" | "occupied";
  user: { name: string; userId: string } | null;
  startTime: string | null;
}

async function getScanner(id: string): Promise<Scanner | null> {
  try {
    const res = await fetch(`https://${process.env.NEXT_PUBLIC_WEBSOCKET}/scanners`, {
      headers: {
        Authorization: `Bearer ${process.env.WEBSOCKET_SECRET}`,
        "ngrok-skip-browser-warning": "true",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch scanners:", res.statusText);
      return null;
    }

    const data = await res.json();
    const scanner = data.scanners.find((s: Scanner) => s.id === id);
    return scanner || null;
  } catch (error) {
    console.error("Error fetching scanner:", error);
    return null;
  }
}

export default async function ScannerPage({ params }: { params: { id: string } }) {
  const scanner = await getScanner(params.id);

  return <ScannerDetailClient scanner={scanner} id={params.id} />;
}
