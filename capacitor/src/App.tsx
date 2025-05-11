import { useState } from 'react';
import { DataWedge } from 'capacitor-datawedge';
import './App.css';

let listenerAdded = false;

export default function App() {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState<{ name: string; barcode: string }[]>([]);

  if (!listenerAdded) {
    DataWedge.addListener('scan', async (event: any) => {
      if (event?.data) {
        const scannedCode = event.data;
        setBarcode(scannedCode);

        try {
          const response = await fetch(`http://192.168.50.53:3000/api/items?barcode=${encodeURIComponent(scannedCode)}`);
          if (!response.ok) throw new Error(`Fel vid hämtning: ${response.status}`);

          const data = await response.json();

          if (data?.name) {
            setItems((prev) => [...prev, { name: data.name, barcode: scannedCode }]);
          }
        } catch (error) {
          console.error('Fel vid GET-request:', error);
        }
      }
    });
    listenerAdded = true;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-green-400 p-4">
      <h1 className="text-white text-2xl font-bold mb-4">Senast scannad streckkod:</h1>
      <p className="text-white text-xl mb-6">{barcode || 'Ingen kod ännu'}</p>

      <div className="bg-white rounded-2xl p-4 shadow w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">Scannade artiklar</h2>
        <ul className="list-disc pl-4 space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <span className="font-medium">{item.name}</span> ({item.barcode})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
