import { useState, useEffect, useRef } from "react";
import { DataWedge } from "capacitor-datawedge";
import "./App.css";

export default function App() {
  const [items, setItems] = useState<
    { barcode: string; name: string; count: number; price?: number }[]
  >([]);
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const lastScannedRef = useRef<HTMLDivElement>(null);
  const itemCache = useRef<Map<string, { name: string; price?: number }>>(
    new Map()
  );

  useEffect(() => {
    if (lastScannedRef.current) {
      const element = lastScannedRef.current;
      element.classList.add("new-item-highlight");
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });

      setTimeout(() => {
        element.classList.remove("new-item-highlight");
      }, 1000);
    }
  }, [items]);

  useEffect(() => {
    let subscription: any;
    const syncInterval = 10 * 60 * 1000;
    let syncTimer: NodeJS.Timeout;

    const fetchAllItems = async () => {
  try {
    const res = await fetch(
      "https://847d-94-255-179-130.ngrok-free.app/api/items/manage",
      { headers: { "ngrok-skip-browser-warning": "true" } }
    );
    if (!res.ok) throw new Error(`Fel vid hämtning: ${res.status}`);
    const data: { barcode: string; name: string; price?: number }[] =
      await res.json();

    const newCache = new Map<string, { name: string; price?: number }>();
    data.forEach((item) => {
      newCache.set(item.barcode, { name: item.name, price: item.price });
    });
    itemCache.current = newCache;

    setItems(
      data.map((item) => ({
        barcode: item.barcode,
        name: item.name,
        count: 0,
        price: item.price,
      }))
    );

    console.log("Cache och items uppdaterad med", data.length, "artiklar");
  } catch (err) {
    console.error("Misslyckades att synka artiklar:", err);
  }
};


    const updateItemsWithData = (
      barcode: string,
      name: string,
      price?: number
    ) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.barcode === barcode
        );
        if (existingIndex >= 0) {
          const updatedItem = {
            ...prev[existingIndex],
            count: prev[existingIndex].count + 1,
          };
          return [
            ...prev.filter((item) => item.barcode !== barcode),
            updatedItem,
          ];
        }
        return [
          ...prev,
          {
            barcode,
            name,
            count: 1,
            price: price !== undefined ? price : 5,
          },
        ];
      });
    };

    const handleScan = async (event: any) => {
      if (!event?.data) return;

      const scannedCode = event.data;

      if (showRemoveOverlay) {
        setItems((prev) => {
          const itemIndex = prev.findIndex(
            (item) => item.barcode === scannedCode
          );
          if (itemIndex === -1) return prev;

          const newItems = [...prev];
          if (newItems[itemIndex].count > 1) {
            newItems[itemIndex] = {
              ...newItems[itemIndex],
              count: newItems[itemIndex].count - 1,
            };
          } else {
            newItems.splice(itemIndex, 1);
          }
          return newItems;
        });
        setShowRemoveOverlay(false);
        return;
      }

      const cached = itemCache.current.get(scannedCode);
      if (cached) {
        updateItemsWithData(scannedCode, cached.name, cached.price);
      } else {
        console.warn("Artikel ej hittad i cache:", scannedCode);
      }
    };

    const init = async () => {
      await fetchAllItems();
      syncTimer = setInterval(fetchAllItems, syncInterval);
      try {
        subscription = await DataWedge.addListener("scan", handleScan);
      } catch (error) {
        console.error("DataWedge error:", error);
      }
    };

    init();

    return () => {
      subscription?.remove?.();
      clearInterval(syncTimer);
    };
  }, [showRemoveOverlay]);

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.count * (item.price || 0),
    0
  );

  const formatPrice = (price: number) => price.toFixed(2);

  return (
    <div className="container">
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
        <div className="items-scroll" ref={itemsContainerRef}>
          <div className="items-list">
            {items.map((item, index) => (
              <div
                key={item.barcode}
                className="item-row"
                ref={index === items.length - 1 ? lastScannedRef : null}
              >
                <div className="item-left">
                  <div className="item-name">{item.name}</div>
                  <div className="item-details">
                    {item.count} × {item.price !== undefined ? formatPrice(item.price) : "0.00"} kr
                  </div>
                </div>
                <div className="item-total">
                  {formatPrice(item.count * (item.price ?? 0))} kr
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="summary-footer">
        <div className="summary-row summary-total">
          <span>{totalItems} varor</span>
          <span>{formatPrice(totalPrice)} kr</span>
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
