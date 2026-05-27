import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import AdminEditor, { SchemeManager } from "./pages/AdminEditor.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<App />} />
        <Route path="/admin"  element={<AdminEditor />} />
        <Route path="/manage" element={<SchemeManager />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);