import { useState, useEffect, useRef } from "react";
import { DataWedge } from "capacitor-datawedge";
import "./App.css";

export default function App() {
  const [items, setItems] = useState<
    { barcode: string; name: string; count: number; price?: number }[]
  >([]);
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (itemsContainerRef.current) {
      itemsContainerRef.current.scrollTop = itemsContainerRef.current.scrollHeight;
    }
  }, [items]);

  useEffect(() => {
    let subscription: any;

    const handleScan = async (event: any) => {
      if (!event?.data) return;

      if (showRemoveOverlay) {
        const scannedCode = event.data;
        setItems(prev => {
          const itemIndex = prev.findIndex(item => item.barcode === scannedCode);
          if (itemIndex === -1) return prev;

          const newItems = [...prev];
          if (newItems[itemIndex].count > 1) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              count: newItems[itemIndex].count - 1
            };
          } else {
            newItems.splice(itemIndex, 1);
          }
          return newItems;
        });
        setShowRemoveOverlay(false);
      } else {
        handleBarcode(event.data);
      }
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
  }, [showRemoveOverlay]);

  const handleBarcode = async (scannedCode: string) => {
    try {
      const response = await fetch(
        `https://9396-94-255-179-130.ngrok-free.app/api/items?barcode=${encodeURIComponent(scannedCode)}`,
        { headers: { "ngrok-skip-browser-warning": "true" } }
      );
      if (!response.ok) throw new Error(`Fetch error: ${response.status}`);

      const data = await response.json();
      if (!data?.name) throw new Error("Invalid item data");

      setItems(prev => {
        const existingIndex = prev.findIndex(item => item.barcode === scannedCode);
        
        if (existingIndex >= 0) {
          const newItems = [...prev];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            count: newItems[existingIndex].count + 1
          };
          return newItems;
        } else {
          return [
            ...prev,
            {
              barcode: scannedCode,
              name: data.name,
              count: 1,
              price: data.price || 5
            }
          ];
        }
      });
    } catch (error) {
      console.error("Scanning error:", error);
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.count * (item.price || 0), 0);

  return (
    <div className="container">
      {showRemoveOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <p>Skanna varan du vill ta nege</p>
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
        <div className="items-scroll" ref={itemsContainerRef}>
          <div className="items-list">
            {items.map((item) => (
              <div key={item.barcode} className="item-row">
                <div className="item-left">
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    {item.count} × {item.price} kr
                  </div>
                </div>
                <div className="item-total">
                  {item.count * (item.price ?? 0)} kr
                </div>
              </div>
            ))}
          </div>
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
            disabled={items.length === 0}
          >
            Ta bort vara
          </button>
        </div>
      </div>
    </div>
  );
}