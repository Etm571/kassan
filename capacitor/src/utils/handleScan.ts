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
  log?: (msg: string) => void;
  navigate: () => void;
}

export const submitScan = async (
  getItems: () => Item[],
  userId: string,
  token: string,
  log?: (msg: string) => void,
  navigate?: () => void
) => {
  const itemsToSend = getItems();
  log?.(`Skicka varor: ${JSON.stringify(itemsToSend)}`);
  try {
    const backendUrl =
      localStorage.getItem("backendUrl") || import.meta.env.VITE_WEBAPP;

    await fetch(
      `https://${backendUrl}/api/userItems?ngrok-skip-browser-warning=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: itemsToSend,
          userId,
          token,
        }),
      }
    );
    log?.("Varor skickade!");
    if (navigate) {
      navigate();
    }
  } catch (error) {
    log?.(`Fel: ${error}`);
  }
}


export const handleScan =
  ({
    showRemoveOverlay,
    setItems,
    setShowRemoveOverlay,
    itemCache,
    addItem,
    setShowUnknownItemPopup,
    getItems,
    userId,
    token,
    log,
    navigate,
  }: HandleScanDeps) =>

    

  async (event: any) => {
    log?.(`Scan event: ${JSON.stringify(event)}`);
    const scannedCode = event.data || event.barcode;

    if (scannedCode === "2980000000003") {
      submitScan(getItems, userId, token, log, navigate);
    }

    if (showRemoveOverlay) {
      setItems((prev) => {
        const itemIndex = prev.findIndex(
          (item) => item.barcode === scannedCode
        );
        if (itemIndex === -1) {
          log?.(`Ingen vara med streckkod ${scannedCode} att ta bort.`);
          return prev;
        }

        const newItems = [...prev];
        if (newItems[itemIndex].count > 1) {
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            count: newItems[itemIndex].count - 1,
          };
          log?.(
            `Minskade antal för ${newItems[itemIndex].name} (${scannedCode})`
          );
        } else {
          log?.(`Tog bort ${newItems[itemIndex].name} (${scannedCode})`);
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
      log?.(`Lade till: ${cached.name} (${scannedCode})`);
      return;
    }

    log?.(`Okänd vara: ${scannedCode}`);
    setShowUnknownItemPopup(true);
  };