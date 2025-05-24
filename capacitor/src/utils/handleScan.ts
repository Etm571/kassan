import type { Item } from "../types/types";

interface HandleScanDeps {
  showRemoveOverlay: boolean;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setShowRemoveOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  itemCache: React.RefObject<Map<string, { name: string; price?: number }>>;
  addItem: (barcode: string, name: string, price?: number) => void;
  setShowUnknownItemPopup: React.Dispatch<React.SetStateAction<boolean>>;
  getItems: () => Item[];
  token: string;
  userId: string;
}

export const handleScan = ({
  showRemoveOverlay,
  setItems,
  setShowRemoveOverlay,
  itemCache,
  addItem,
  setShowUnknownItemPopup,
  getItems,
  userId,
  token
}: HandleScanDeps) => async (event: any) => {


  const scannedCode = event.data || event.barcode;

  if (scannedCode === "2980000000003") {
    const itemsToSend = getItems();
    console.log("Skickar varor:", itemsToSend);
    try {
    await fetch(`https://${import.meta.env.VITE_WEBAPP}/api/items/postItems?ngrok-skip-browser-warning=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: itemsToSend,
        userId,
        token,
      }),

    });
  } catch (error) {
    console.error("Fel vid sändning av varor:", error);
  }
    return;
  }

  if (showRemoveOverlay) {
    setItems((prev) => {
      const itemIndex = prev.findIndex((item) => item.barcode === scannedCode);
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

  if (itemCache.current.has(scannedCode)) {
    const cached = itemCache.current.get(scannedCode)!;
    addItem(scannedCode, cached.name, cached.price);
    return;
  }

  setShowUnknownItemPopup(true);
};
