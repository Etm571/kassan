import { useState, useEffect } from "react";
import { DataWedge } from "capacitor-datawedge";
import "./App.css";

export default function App() {
  const [items, setItems] = useState<
    Record<string, { name: string; count: number; price?: number }>
  >({});
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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
    setSelectedItem(null);

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

  const removeItem = () => {
    if (selectedItem) {
      setItems((prev) => {
        const newItems = { ...prev };
        delete newItems[selectedItem];
        return newItems;
      });
      setSelectedItem(null);
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
        <h2 className="items-title">Skannade artiklar</h2>
        <button
          className="remove-btn"
          onClick={removeItem}
          disabled={!selectedItem}
        >
          Ta bort
        </button>
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="scanned-items">
        <div className="items-scroll">
          <ul className="items-list">
            {Object.entries(items).map(([barcode, item]) => (
              <li
                key={barcode}
                className="item-row"
                onClick={() => setSelectedItem(barcode)}
                style={{
                  backgroundColor:
                    selectedItem === barcode ? "#e5e7eb" : "transparent",
                }}
              >
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
       
      </div>
    </div>
  );
}