import { useState, useEffect } from 'react';
import { DataWedge } from 'capacitor-datawedge';
import './App.css';

export default function App() {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState<{ name: string; barcode: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let subscription: any;

    const addScanListener = async () => {
      try {
        subscription = await DataWedge.addListener('scan', async (event: any) => {
          if (event?.data) {
            handleBarcode(event.data);
          }
        });
      } catch (error: any) {
        setErrorMessage(`Kunde inte lägga till DataWedge-lyssnare: ${error.message}`);
      }
    };

    addScanListener();

    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const handleBarcode = async (scannedCode: string) => {
    setBarcode(scannedCode);
    setErrorMessage('');

    try {
      const response = await fetch(
        `https://c502-94-255-179-130.ngrok-free.app/api/items?barcode=${encodeURIComponent(scannedCode)}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      if (!response.ok) throw new Error(`Fel vid hämtning: ${response.status}`);

      const data = await response.json();

      if (data?.name) {
        setItems((prev) => [...prev, { name: data.name, barcode: scannedCode }]);
      } else {
        setErrorMessage('Svar saknar namn.');
      }
    } catch (error: any) {
      setErrorMessage(`Fel vid GET-request: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Senast scannad streckkod:</h1>
      <p className="barcode">{barcode || 'Ingen kod ännu'}</p>
  
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}

  
      <div className="scanned-items">
        <h2 className="items-title">Scannade artiklar</h2>
        <ul className="items-list">
          {items.map((item, index) => (
            <li key={index}>
              <span className="item-name">{item.name}</span> ({item.barcode})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}  