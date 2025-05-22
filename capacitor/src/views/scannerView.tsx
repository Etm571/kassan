import { useState, useEffect, useRef } from "react";
import { DataWedge } from "capacitor-datawedge";
import "../styles/scannerView.css";
import { useLocation } from "react-router-dom";
import { handleScan as createHandleScan } from "../utils/handleScan";

export default function ScannerView() {
  const [items, setItems] = useState<
    { barcode: string; name: string; count: number; price?: number }[]
  >([]);
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);
  const [showUnknownItemPopup, setShowUnknownItemPopup] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const lastScannedRef = useRef<HTMLDivElement>(null);
  const itemCache = useRef<Map<string, { name: string; price?: number }>>(
    new Map()
  );
  const location = useLocation();
  const state = location.state as {
    userId?: string;
    userName?: string;
    token?: string;
    barcode?: string;
    itemCacheEntries?: [string, { name: string; price?: number }][];
  };

  const formatPrice = (price?: number) => {
    if (typeof price !== "number" || isNaN(price)) return "0";
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  //const userId = state?.userId || "unknown-id";
  //const userName = state?.userName || "unknown user";

  useEffect(() => {
    if (state?.itemCacheEntries) {
      itemCache.current = new Map(state.itemCacheEntries);
    }
  }, [state?.itemCacheEntries]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!lastScannedRef.current || !itemsContainerRef.current) return;

      const element = lastScannedRef.current;
      const container = itemsContainerRef.current;

      element.classList.add("new-item-highlight");
      container.scrollTop = container.scrollHeight;

      setTimeout(() => {
        element.classList.remove("new-item-highlight");
      }, 3000);
    }, 0);

    return () => clearTimeout(timeout);
  }, [items]);

  const addItem = (barcode: string, name: string, price?: number) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.barcode === barcode);
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
          price: price || 5,
        },
      ];
    });
  };

  useEffect(() => {
    let subscription: any;

    const scanHandler = createHandleScan({
      showRemoveOverlay,
      setItems,
      setShowRemoveOverlay,
      itemCache,
      addItem,
      setShowUnknownItemPopup,
      getItems: () => items,
      userId: state?.userId || "unknown-id",
      token: state?.token || "unknown-token",
    });
    const addListener = async () => {
      try {
        subscription = await DataWedge.addListener("scan", scanHandler);
      } catch (error) {
        console.error("DataWedge error:", error);
      }
    };

    addListener();
    return () => subscription?.remove?.();
  }, [showRemoveOverlay]);

  useEffect(() => {
    if (!state?.barcode) return;
    const scannedCode = state.barcode;

    if (itemCache.current.has(scannedCode)) {
      const cached = itemCache.current.get(scannedCode)!;
      addItem(scannedCode, cached.name, cached.price);
    } else {
      setShowUnknownItemPopup(true);
    }
  }, [state?.barcode]);

  const handleCancelUnknownItem = () => {
    setShowUnknownItemPopup(false);
  };

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.count * (item.price || 0),
    0
  );

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

      {showUnknownItemPopup && (
        <div className="unknown-item-popup">
          <div className="unknown-item-content">
            <h3 className="unknown-item-title">Varan hittades inte</h3>
            <div className="unknown-item-buttons">
              <button
                className="unknown-item-btn unknown-item-cancel"
                onClick={handleCancelUnknownItem}
              >
                Okej
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
                    {item.count} × {formatPrice(item.price ?? 0)} kr
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
          <span>{totalItems === 1 ? "1 vara" : `${totalItems} varor`}</span>
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
