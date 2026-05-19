import client from "./client";

// ─── Auth ────────────────────────────────────────────────────────────────────
export const login    = (data) => client.post("/Auth/login", data);
export const register = (data) => client.post("/Auth/register", data);

// ─── Parts ───────────────────────────────────────────────────────────────────
export const getParts = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Parts?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getPartById = (id) => client.get(`/Parts/${id}`);

export const createPart = (data) =>
  client.post("/Parts", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePart = (id, data) =>
  client.put(`/Parts/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePart = (id) => client.delete(`/Parts/${id}`);

export const searchParts = (keyword, pageNumber = 1, pageSize = 10) =>
  client.get(
    `/Parts/search?keyword=${encodeURIComponent(keyword)}&pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );

export const getLowStockParts = (threshold = 10) =>
  client.get(`/Parts/low-stock?threshold=${threshold}`);

export const getAvailableParts = () => client.get("/Parts/available");

export const getPartStockMovements = (id) =>
  client.get(`/Parts/${id}/stock-movements`);

// ─── Part Categories ─────────────────────────────────────────────────────────
export const getPartCategories = () => client.get("/PartCategory");

export const getPartCategoryById = (id) => client.get(`/PartCategory/${id}`);

export const createPartCategory = (data) => client.post("/PartCategory", data);

export const updatePartCategory = (id, data) =>
  client.put(`/PartCategory/${id}`, data);

export const deletePartCategory = (id) => client.delete(`/PartCategory/${id}`);

// ─── Sales Invoices ──────────────────────────────────────────────────────────
export const getSalesInvoices = (pageNumber = 1, pageSize = 10) =>
  client.get(`/SalesInvoice?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getSalesInvoiceById = (id) => client.get(`/SalesInvoice/${id}`);

export const createSalesInvoice = (data) => client.post("/SalesInvoice", data);

export const markSalesInvoicePaid = (id) =>
  client.patch(`/SalesInvoice/${id}/mark-paid`);

export const cancelSalesInvoice = (id) =>
  client.patch(`/SalesInvoice/${id}/cancel`);

export const searchSalesInvoices = ({
  query = "",
  status = null,
  mode = null,
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  const params = new URLSearchParams();
  if (query)                                params.append("query", query);
  if (status !== null && status !== undefined) params.append("status", status);
  if (mode   !== null && mode   !== undefined) params.append("mode", mode);
  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);
  return client.get(`/SalesInvoice/search?${params.toString()}`);
};

export const getCustomerAppointmentsForInvoice = (customerId) =>
  client.get(`/SalesInvoice/customer/${customerId}/appointments`);

// ─── Purchase Invoices ───────────────────────────────────────────────────────
export const getPurchaseInvoices = (pageNumber = 1, pageSize = 10) =>
  client.get(`/PurchaseInvoice?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getPurchaseInvoiceById = (id) =>
  client.get(`/PurchaseInvoice/${id}`);

export const createPurchaseInvoice = (data) =>
  client.post("/PurchaseInvoice", data);

export const receivePurchaseInvoice = (id) =>
  client.patch(`/PurchaseInvoice/${id}/receive`);

export const payPurchaseInvoice = (id) =>
  client.patch(`/PurchaseInvoice/${id}/status`);

export const cancelPurchaseInvoice = (id) =>
  client.patch(`/PurchaseInvoice/${id}/cancel`);

export const searchPurchaseInvoices = ({
  query = "",
  status = null,
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  const params = new URLSearchParams();
  if (query)                                params.append("query", query);
  if (status !== null && status !== undefined) params.append("status", status);
  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);
  return client.get(`/PurchaseInvoice/search?${params.toString()}`);
};

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const getVendors    = (pageNumber = 1, pageSize = 100) =>
  client.get(`/Vendors?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getVendorById = (id)       => client.get(`/Vendors/${id}`);
export const createVendor  = (data)     => client.post("/Vendors", data);
export const updateVendor  = (id, data) => client.put(`/Vendors/${id}`, data);
export const deleteVendor  = (id)       => client.delete(`/Vendors/${id}`);

// ─── Customers ───────────────────────────────────────────────────────────────
export const getCustomers = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Customers?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getCustomerById = (id)       => client.get(`/Customers/${id}`);
export const createCustomer  = (data)     => client.post("/Customers", data);
export const updateCustomer  = (id, data) => client.put(`/Customers/${id}`, data);
export const deleteCustomer  = (id)       => client.delete(`/Customers/${id}`);
export const searchCustomers = (query)    =>
  client.get(`/Customers/search?query=${encodeURIComponent(query)}`);
export const getCustomerHistory = (id)    =>
  client.get(`/Customers/${id}/history`);

// ─── Vehicles ────────────────────────────────────────────────────────────────
export const getVehicles    = (pageNumber = 1, pageSize = 10) =>
  client.get(`/vehicles?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getVehicleById = (id)       => client.get(`/vehicles/${id}`);
export const createVehicle  = (data)     => client.post("/vehicles", data);
export const updateVehicle  = (id, data) => client.put(`/vehicles/${id}`, data);
export const deleteVehicle  = (id)       => client.delete(`/vehicles/${id}`);
export const searchVehicles = (query)    =>
  client.get(`/vehicles/search?query=${encodeURIComponent(query)}`);
export const addVehicle     = (customerId, data) =>
  client.post(`/Customers/${customerId}/vehicles`, data);

// ─── Staff ───────────────────────────────────────────────────────────────────
export const getStaff      = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Staff?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getStaffById  = (id)       => client.get(`/Staff/${id}`);
export const createStaff   = (data)     => client.post("/Staff", data);
export const updateStaff   = (id, data) => client.put(`/Staff/${id}`, data);
export const deactivateStaff = (id)     => client.patch(`/Staff/${id}/deactivate`);

// ─── Reports ─────────────────────────────────────────────────────────────────
export const getFinancialReport = (type = "daily") =>
  client.get(`/reports/financial?type=${type}`);

// ─── Low Stock ───────────────────────────────────────────────────────────────
export const checkLowStock     = () => client.post("/LowStock/check");
export const getLowStockAlerts = () => client.get("/LowStock/notifications");