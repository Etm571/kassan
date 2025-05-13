import { useState, useEffect } from "react";
import { DataWedge } from "capacitor-datawedge";
import "./App.css";

export default function App() {
  const [items, setItems] = useState<
    Record<string, { name: string; count: number; price?: number }>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);

  useEffect(() => {
    let subscription: any;

    const handleScan = async (event: any) => {
      if (!event?.data) return;

      if (showRemoveOverlay) {
        const scannedCode = event.data;
        setItems((prev) => {
          const existing = prev[scannedCode];
          if (!existing) {
            setErrorMessage("Varan finns inte i listan");
            return prev;
          }

          if (existing.count > 1) {
            return {
              ...prev,
              [scannedCode]: {
                ...existing,
                count: existing.count - 1,
              },
            };
          } else {
            const newItems = { ...prev };
            delete newItems[scannedCode];
            return newItems;
          }
        });
        setShowRemoveOverlay(false);
      } else {
        handleBarcode(event.data);
      }
    };

    const addListener = async () => {
      try {
        subscription = await DataWedge.addListener("scan", handleScan);
      } catch (error: any) {
        setErrorMessage(`Scan error: ${error.message}`);
      }
    };

    addListener();
    return () => subscription?.remove?.();
  }, [showRemoveOverlay]);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', preventDefault);
    return () => {
      document.removeEventListener('gesturestart', preventDefault);
    };
  }, []);
  

  const handleBarcode = async (scannedCode: string) => {
    setErrorMessage("");
    try {
      const response = await fetch(
        `https://255d-94-255-179-130.ngrok-free.app/api/items?barcode=${encodeURIComponent(
          scannedCode
        )}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (!response.ok) throw new Error(`Fetch error: ${response.status}`);

      const data = await response.json();
      if (!data?.name) throw new Error("Invalid item data");

      setItems((prev) => ({
        ...prev,
        [scannedCode]: {
          name: data.name,
          count: prev[scannedCode] ? prev[scannedCode].count + 1 : 1,
          price: data.price || 5,
        },
      }));
    } catch (error: any) {
      setErrorMessage(error.message);
    }
  };

  const totalItems = Object.values(items).reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalPrice = Object.values(items).reduce(
    (sum, item) => sum + item.count * (item.price || 0),
    0
  );

  return (
    <div className="container">
      <div className="header">

      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {showRemoveOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <p>Skanna varan du vill ta bort</p>
            <div className="overlay-buttons">
              <button
                className="cancel-btn"
                onClick={() => setShowRemoveOverlay(false)}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scanned-items">
        <div className="items-scroll">
          <ul className="items-list">
            {Object.entries(items).map(([barcode, item]) => (
              <li key={barcode} className="item-row">
                <div className="item-left">
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    {item.count} × {item.price} kr
                  </div>
                </div>
                <div className="item-total">
                  {item.count * (item.price ?? 0)} kr
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="summary-footer">
        <div className="summary-row summary-total">
          <span>{totalItems} varor</span>
          <span>{totalPrice} kr</span>
        </div>

        <div className="removeDiv">

        <button
          className="remove-btn"
          onClick={() => setShowRemoveOverlay(true)}
          disabled={Object.keys(items).length === 0}
        >
          Ta bort vara
        </button>
      

        </div>
        
      </div>
    </div>
  );
}
