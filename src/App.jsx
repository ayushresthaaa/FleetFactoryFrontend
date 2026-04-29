import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Vendors from "./pages/Vendors";
import Items from "./pages/Items";
import Login from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard shell */}
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="items" element={<Items />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
