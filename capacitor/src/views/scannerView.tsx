import { useState, useEffect, useRef } from "react";
import { DataWedge } from "capacitor-datawedge";
import "../styles/scannerView.css";
import { useLocation } from "react-router-dom";
import { handleScan as createHandleScan } from "../utils/handleScan";
import { useNavigate } from "react-router-dom";
import usePowerConnectedListener from "../utils/powerConnectedListener";
import EmptyCart from "../components/emptyCart";

export default function ScannerView() {
  const [items, setItems] = useState<
    { barcode: string; name: string; count: number; price?: number }[]
  >([]);
  const [showRemoveOverlay, setShowRemoveOverlay] = useState(false);
  const [showUnknownItemPopup, setShowUnknownItemPopup] = useState(false);
  const itemsContainerRef = useRef<HTMLDivElement>(null);
  const lastScannedRef = useRef<HTMLDivElement>(null);
  const [barcodeInt, setBarcodeInt] = useState(1000);
  const itemCache = useRef<Map<string, { name: string; price?: number }>>(
    new Map()
  );
  const [scanLog, setScanLog] = useState<string[]>([]);
  const clickCountRef = useRef(0);
  const [showLog, setShowLog] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(
    null
  );
  const footerRef = useRef<HTMLDivElement>(null);
  const [bubbleBottom, setBubbleBottom] = useState(140);

  const location = useLocation();
  const state = location.state as {
    userId?: string;
    userName?: string;
    token?: string;
    barcode?: string;
    itemCacheEntries?: [string, { name: string; price?: number }][];
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (footerRef.current) {
      const height = footerRef.current.getBoundingClientRect().height;
      setBubbleBottom(height - 17);
    }
  }, []);

  const formatPrice = (price?: number) => {
    if (typeof price !== "number" || isNaN(price)) return "0";
    return Number.isInteger(price) ? price.toString() : price.toFixed(2);
  };

  const handleSummaryClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 7) {
      setShowLog(true);
      clickCountRef.current = 0;
      setTimeout(() => {
        setShowLog(false);
      }, 10000);
    }
  };

  useEffect(() => {
    const container = itemsContainerRef.current;
    if (!container) return;

    let startY = 0;
    let dragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      dragging = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const y = e.touches[0].clientY;
      const deltaY = y - startY;

      const atTop = container.scrollTop === 0;
      const atBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight;

      const threshold = 10;
      const pullStrength = 0.3;

      if ((atTop && deltaY > threshold) || (atBottom && deltaY < -threshold)) {
        if (e.cancelable) e.preventDefault();
        dragging = true;
        container.style.transform = `translateY(${deltaY * pullStrength}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (!dragging) return;

      container.style.transition = "transform 0.3s ease-out";
      container.style.transform = "translateY(0px)";

      const reset = () => {
        container.style.transition = "";
        container.removeEventListener("transitionend", reset);
      };

      container.addEventListener("transitionend", reset);
      dragging = false;
    };

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  useEffect(() => {
    if (!lastScannedBarcode) return;
    const timeout = setTimeout(() => {
      setLastScannedBarcode(null);
    }, 600);
    return () => clearTimeout(timeout);
  }, [lastScannedBarcode]);

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

      const isAlreadyLastItem =
        existingIndex >= 0 && existingIndex === prev.length - 1;

      if (existingIndex >= 0) {
        const updatedItem = {
          ...prev[existingIndex],
          count: prev[existingIndex].count + 1,
        };
        const newItems = [
          ...prev.filter((item) => item.barcode !== barcode),
          updatedItem,
        ];

        if (!isAlreadyLastItem) {
          setLastScannedBarcode(barcode);
        }
        return newItems;
      }

      setLastScannedBarcode(barcode);
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

  const scanHandler = createHandleScan({
    showRemoveOverlay,
    setItems,
    setShowRemoveOverlay,
    itemCache,
    addItem,
    setShowUnknownItemPopup,
    getItems: () => itemsRef.current,
    userId: state?.userId || "unknown-id",
    token: state?.token || "unknown-token",
    log: (msg: string) => setScanLog((prev) => [...prev, msg]),
    navigate: () => {
      navigate("/");
    },
  });


  const simulateScan = () => {
    let nextBarcode = barcodeInt;

    if (nextBarcode >= 1010) {
      nextBarcode = 1000;
    }

    const barcode = nextBarcode.toString();
    scanHandler({ barcode });
    setBarcodeInt(nextBarcode + 1);
    console.log("Simulated scan for barcode:", barcode);
  };

  const simulateScan2 = () => {
    const barcode = "2980000000003";
    scanHandler({ barcode });
  };

  useEffect(() => {
    let subscription: any;

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

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const handleCancelUnknownItem = () => {
    setShowUnknownItemPopup(false);
  };

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.count * (item.price || 0),
    0
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
      second: undefined,
    });

  usePowerConnectedListener(
    () => itemsRef.current,
    state?.userId || "unknown-id",
    state?.token || "unknown-token",
    (msg: string) => setScanLog((prev) => [...prev, msg]),
    () => {
      navigate("/");
    }
  );

  return (
    <div className="container">
      {showRemoveOverlay && (
        <div className="remove-overlay-slide show">
          <div className="remove-overlay-content">
            <h2>Skanna för att ta bort</h2>
            <button
              className="cancel-btn"
              onClick={() => setShowRemoveOverlay(false)}
            >
              Avbryt
            </button>
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
          {items.length === 0 && <EmptyCart />}
          <div className="items-list">
            {items.map((item, index) => (
              <div
                key={item.barcode}
                className={
                  "item-row" +
                  (item.barcode === lastScannedBarcode && index !== items.length - 1
                    ? " new-item-row-animate"
                    : "")
                }
                ref={index === items.length - 1 ? lastScannedRef : null}
              >
                <div className="item-left">
                  <div
                    className={
                      "item-name" +
                      (item.barcode === lastScannedBarcode
                        ? " new-item-highlight"
                        : "")
                    }
                  >
                    {item.name}
                  </div>
                  <div className="item-details">
                    {item.count} × {formatPrice(Number(item.price))} kr
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


      <div
        className="time-display-bubble"
        style={{
          bottom: `${bubbleBottom}px`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src="/clock.png"
          alt="clock"
          style={{ width: 18, height: 18, marginRight: 8 }}
        />
        <span>{formatTime(currentTime)}</span>
      </div>

      <div className="summary-footer" ref={footerRef}>
        <div className="summary-row summary-total" onClick={handleSummaryClick}>
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

          {showLog && (
            <div>
              <button onClick={simulateScan} style={{ margin: "1em" }}>
                Simulera skanning
              </button>
              <button onClick={simulateScan2} style={{ margin: "1em" }}>
                Simulera skanning2
              </button>
            </div>
          )}
        </div>
        {showLog && (
          <div className="scan-log">
            <h4>Scan Log</h4>
            <div
              style={{
                maxHeight: 120,
                overflowY: "auto",
                background: "#222",
                color: "#fff",
                fontSize: 12,
                padding: 8,
              }}
            >
              {scanLog.slice(-10).map((msg, i) => (
                <div key={i}>{msg}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
