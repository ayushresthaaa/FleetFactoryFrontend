import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Parts from "./pages/Admin/Parts";
import PurchaseInvoices from "./pages/Admin/PurchaseInvoices";
import Vendors from "./pages/Admin/Vendors";
import Customers from "./pages/Admin/Customers";
import Staff from "./pages/Admin/Staff";
import Reports from "./pages/Admin/Reports";
import LowStock from "./pages/Admin/LowStock";

const ComingSoon = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
    <div className="w-16 h-16 rounded-2xl bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
      <span
        className="material-icons text-[#e91e8c]"
        style={{ fontSize: "30px" }}
      >
        construction
      </span>
    </div>
    <h2 className="text-white text-lg font-semibold m-0">{name}</h2>
    <p className="text-[#555] text-sm m-0">This page is coming soon</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ComingSoon name="Dashboard" />} />
          <Route path="parts" element={<Parts />} />
          <Route path="purchase-invoices" element={<PurchaseInvoices />} />
          <Route
            path="sales-invoices"
            element={<ComingSoon name="Sales Invoices" />}
          />
          <Route path="vendors" element={<Vendors />} />
          <Route path="staff" element={<Staff />} />
          <Route path="customers" element={<Customers />} />
          <Route
            path="search"
            element={<Navigate to="/admin/customers" replace />}
          />
          <Route path="reports" element={<Reports />} />
          <Route path="low-stock" element={<LowStock />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
