import { useState, useEffect } from "react";
import { DataWedge } from "capacitor-datawedge";
import "./App.css";

export default function App() {
  const [items, setItems] = useState<
    Record<string, { name: string; count: number; price?: number }>
  >({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let subscription: any;

    const addScanListener = async () => {
      try {
        subscription = await DataWedge.addListener(
          "scan",
          async (event: any) => {
            if (event?.data) {
              handleBarcode(event.data);
            }
          }
        );
      } catch (error: any) {
        setErrorMessage(
          `Kunde inte lägga till DataWedge-lyssnare: ${error.message}`
        );
      }
    };

    addScanListener();

    return () => {
      if (subscription && typeof subscription.remove === "function") {
        subscription.remove();
      }
    };
  }, []);

  const handleBarcode = async (scannedCode: string) => {
    setErrorMessage("");

    try {
      const response = await fetch(
        `https://255d-94-255-179-130.ngrok-free.app/api/items?barcode=${encodeURIComponent(
          scannedCode
        )}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) throw new Error(`Fel vid hämtning: ${response.status}`);

      const data = await response.json();

      if (data?.name) {
        setItems((prev) => {
          const existing = prev[scannedCode];
          return {
            ...prev,
            [scannedCode]: {
              name: data.name,
              count: existing ? existing.count + 1 : 1,
              price: data.price || 5,
            },
          };
        });
      } else {
        setErrorMessage("Svar saknar namn.");
      }
    } catch (error: any) {
      setErrorMessage(`Fel vid GET-request: ${error.message}`);
    }
  };

  return (
    <div className="container">
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <h2 className="items-title">Skannade artiklar</h2>
      <div className="items-scroll">
        <ul className="items-list">
          {Object.entries(items).map(([barcode, item]) => (
            <li key={barcode} className="item-row">
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-price">
                  {item.count} × {item.price ?? "––"} kr
                </div>
              </div>
              <div className="item-total">
                {item.price ? `${item.count * item.price} kr` : "––"}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {Object.keys(items).length > 0 && (
        <div className="total-summary">
          Totalt:{" "}
          {Object.values(items).reduce(
            (sum, item) => sum + (item.price ?? 0) * item.count,
            0
          )}{" "}
          kr
        </div>
      )}
    </div>
  );
}
