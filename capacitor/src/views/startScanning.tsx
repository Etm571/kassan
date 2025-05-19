import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { DataWedge } from "capacitor-datawedge";

import "../styles/startScanning.css";

interface WelcomeScreenProps {
  message?: string;
}

interface LocationState {
  name: string;
  userId: string;
}

export default function WelcomeScreen({ message }: WelcomeScreenProps) {
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  const userName = state?.name || "Okänd användare";
  const userId = state?.userId || "";

  useEffect(() => {
    const scannerLine = scannerLineRef.current;
    if (!scannerLine) return;

    const animation = scannerLine.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(100px)" }
      ],
      {
        duration: 1500,
        iterations: Infinity,
        easing: "ease-in-out",
        direction: "alternate"
      }
    );

    return () => animation.cancel();
  }, []);

  useEffect(() => {
    let subscription: any;

    const handleScan = async (event: any) => {
      if (!event?.data) return;
      const scannedCode = event.data;

      navigate("/scanning", {
        state: {
          barcode: scannedCode,
          userId,
          userName
        }
      });
    };

    const addListener = async () => {
      try {
        subscription = await DataWedge.addListener("scan", handleScan);
      } catch (error) {
        console.error("DataWedge error:", error);
      }
    };

    addListener();
    return () => subscription?.remove?.();
  }, [navigate, userId, userName]);

  return (
    <div className="welcome-overlay">
      <div className="welcome-content">
        <div className="scanner-direction-arrow">↑</div>

        <div className="barcode-container">
          <div className="barcode">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="barcode-line"
                style={{ 
                  height: `${20 + Math.random() * 60}px`,
                  width: `${2 + Math.random() * 3}px`
                }}
              />
            ))}
          </div>
          <div ref={scannerLineRef} className="scanner-line"></div>
        </div>

        <h2 style={{ textAlign: "center", marginTop: "1rem" }}>
          Hej, {userName}
        </h2>

        <div className="welcome-text">
          <p>{message || "Skanna en vara för att börja"}</p>
        </div>
      </div>
    </div>
  );
}
