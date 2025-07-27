import React, { useState } from "react";
import { useRouter } from "next/navigation";


export default function HelpScreen({ user }: { user: any }) {

      const [tapCount, setTapCount] = useState(0);
      const [lastTapTime, setLastTapTime] = useState(0);

      const router = useRouter();


    const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;

        const topRightZone = x > bounds.width - 100 && y < 100;
        const now = Date.now();

        if (topRightZone && now - lastTapTime < 600) {
            setTapCount((prev) => prev + 1);
        } else {
            setTapCount(1);
        }

        setLastTapTime(now);

        if (tapCount >= 2 && topRightZone) {
            router.push(`/staffCheckout/${user.userId}`);
        }
    };
    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-20">
            <div
                className="w-full h-full bg-red-600 text-white flex flex-col items-center justify-center text-4xl font-bold rounded gap-10"
                onClick={handleScreenTap}
            >
                <h1>Spot Check</h1>
                <p className="text-xl">Please alert staff</p>
            </div>
        </div>
    )
}