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
  token: string;
}

export default function WelcomeScreen({ message }: WelcomeScreenProps) {
  const scannerLineRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const itemCache = useRef<Map<string, { name: string; price?: number }>>(new Map());

  const user = {
    id: state?.userId || "",
    token: state?.token || "",
    name: state?.name || "Okänd användare"

  }

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
    const fetchAllItems = async () => {
      try {
        const backendUrl = localStorage.getItem("backendUrl") || import.meta.env.VITE_WEBAPP;

        const response = await fetch(
          
          `https://${backendUrl}/api/public/items?ngrok-skip-browser-warning=true`,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (!response.ok) throw new Error(`Fetch error: ${response.status}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          itemCache.current.clear();
          data.forEach((item) => {
            if (item.barcode) {
              itemCache.current.set(item.barcode, {
                name: item.name || "Unknown Item",
                price: item.price || 5,
              });
            }
          });
        }
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchAllItems();
  }, []);

  useEffect(() => {
  let subscription: any;

  const handleScan = async (event: any) => {
    if (!event?.data) return;
    const scannedCode = event.data;


    navigate("/scanning", {
      state: {
        barcode: scannedCode,
        username: user.name,
        userId: user.id,
        token: user.token,
        itemCacheEntries: Array.from(itemCache.current.entries())
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
}, []);

 const debugScan = async () => {
    const scannedCode = "1000";


    navigate("/scanning", {
      state: {
        barcode: scannedCode,
        username: user.name,
        userId: user.id,
        token: user.token,
        itemCacheEntries: Array.from(itemCache.current.entries())
      }
    });
  };

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
          Hej, {user.name}!
        </h2>

        <div className="welcome-text">
          <p>{message || "Skanna en vara för att börja"}</p>
        </div>

        <button
          className="start-button"
          onClick={debugScan}
        >
          Debug Scan
        </button>
      

      </div>
    </div>
  );
}