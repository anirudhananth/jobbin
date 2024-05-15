import { BrowserRouter, Routes, Route } from "react-router-dom";
import Popup from './pages/Popup/popup';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Popup />} />
        <Route path="/popup" element={<Popup />} />
      </Routes>
    </BrowserRouter>
  );
}
