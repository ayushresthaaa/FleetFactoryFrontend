import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./pages/Login";

import Parts from "./pages/Admin/Parts/Parts";
import PurchaseInvoices from "./pages/Admin/PurchaseInvoice/PurchaseInvoices";
import PurchaseInvoiceDetail from "./pages/Admin/PurchaseInvoice/PurchaseInvoiceDetail";
import Vendors from "./pages/Admin/Vendors";
import Customers from "./pages/Admin/Customers";
import Staff from "./pages/Admin/Staff/Staff";
import Reports from "./pages/Admin/Reports";
import LowStock from "./pages/Admin/LowStock";
import PartCategories from "./pages/Admin/PartCategory";
import SalesInvoices from "./pages/Admin/SalesInvoice/SalesInvoice";
import CreateSalesInvoice from "./pages/Admin/SalesInvoice/CreateSalesInvoice";
import SalesInvoiceDetail from "./pages/Admin/SalesInvoice/SalesInvoiceDetail";
import Appointments from "./pages/Admin/Appointments/Appointments";
import AppointmentDetail from "./pages/Admin/Appointments/AppointmentDetail";
import PartRequests from "./pages/Admin/PartsRequest/PartsRequests";
import PartRequestDetail from "./pages/Admin/PartsRequest/PartRequestDetail";
import Reviews from "./pages/Admin/Reviews/Reviews";
import CustomerLayout from "./layouts/CustomerLayout";
import CustomerAppointments from "./pages/Customer/Appointment/CustomerAppointments";
import Register from "./pages/Register";
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<ComingSoon name="Dashboard" />} />

          <Route path="parts" element={<Parts />} />
          <Route path="part-categories" element={<PartCategories />} />
          <Route path="low-stock" element={<LowStock />} />

          <Route path="purchase-invoices" element={<PurchaseInvoices />} />
          <Route
            path="purchase-invoices/:id"
            element={<PurchaseInvoiceDetail />}
          />

          <Route path="sales-invoices" element={<SalesInvoices />} />
          <Route
            path="sales-invoices/create"
            element={<CreateSalesInvoice />}
          />
          <Route path="sales-invoices/:id" element={<SalesInvoiceDetail />} />

          <Route path="vendors" element={<Vendors />} />
          <Route path="staff" element={<Staff />} />
          <Route path="customers" element={<Customers />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="appointments/:id" element={<AppointmentDetail />} />
          <Route path="part-requests" element={<PartRequests />} />
          <Route path="part-requests/:id" element={<PartRequestDetail />} />
          <Route path="reviews" element={<Reviews />} />
          <Route
            path="search"
            element={<Navigate to="/admin/customers" replace />}
          />

          <Route path="reports" element={<Reports />} />
        </Route>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<ComingSoon name="Customer Home" />} />
          <Route path="appointments" element={<CustomerAppointments />} />

          <Route
            path="part-requests"
            element={<ComingSoon name="My Part Requests" />}
          />
          <Route path="reviews" element={<ComingSoon name="My Reviews" />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}
