import { Routes, Route } from "react-router-dom"
import ScannerClient from "./views/scannerClient"
import StartScanning from "./views/startScanning"
import ScannerView from "./views/scannerView"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScannerClient />} />
      <Route path="/start-scanning" element={<StartScanning />} />
      <Route path="/scanning" element={<ScannerView />} />
    </Routes>
  )
}
