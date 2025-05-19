import { Routes, Route } from "react-router-dom"
import ScannerClient from "./views/scannerClient"
import StartScanning from "./views/startScanning"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ScannerClient />} />
      <Route path="/start-scanning" element={<StartScanning />} />
    </Routes>
  )
}
