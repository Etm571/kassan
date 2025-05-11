import { useState } from 'react';
import { DataWedge } from 'capacitor-datawedge';
import './App.css';

export default function App() {
  const [barcode, setBarcode] = useState('');



  DataWedge.addListener('scan', (event: any) => {
    if (event?.data) {
      setBarcode(event.data);
    }
  });


  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-400">
      <h1 className="text-white text-2xl font-bold mb-4">Scannad streckkod:</h1>
      <p className="text-white text-xl">{barcode || 'Ingen kod ännu'}</p>
    </div>
    )
}
