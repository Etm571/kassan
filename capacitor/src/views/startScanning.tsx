import { useEffect, useRef } from "react";
import "../styles/startScanning.css";

interface WelcomeScreenProps {
  message?: string;
}

export default function WelcomeScreen({ message }: WelcomeScreenProps) {
  const scannerLineRef = useRef<HTMLDivElement>(null);

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
        
        <div className="welcome-text">
          <p>{message || "Skanna en vara för att börja"}</p>
        </div>
      </div>
    </div>
  );
}