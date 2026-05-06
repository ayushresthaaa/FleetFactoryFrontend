import client from "./client";
//auth
export const login = (data) => client.post("/Auth/login", data);
export const register = (data) => client.post("/Auth/register", data);

//parts
export const getParts = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Parts?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getPartById = (id) => client.get(`/Parts/${id}`);
export const createPart = (data) => client.post("/Parts", data);
export const updatePart = (id, data) => client.put(`/Parts/${id}`, data);
export const deletePart = (id) => client.delete(`/Parts/${id}`);

//vendors
export const getVendors = (pageNumber = 1, pageSize = 100) =>
  client.get(`/Vendors?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getVendorById = (id) => client.get(`/Vendors/${id}`);
export const createVendor = (data) => client.post("/Vendors", data);
export const updateVendor = (id, data) => client.put(`/Vendors/${id}`, data);
export const deleteVendor = (id) => client.delete(`/Vendors/${id}`);

//customers
export const getCustomers = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Customers?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getCustomerById = (id) => client.get(`/Customers/${id}`);
export const createCustomer = (data) => client.post("/Customers", data);
export const addVehicle = (id, data) =>
  client.post(`/Customers/${id}/vehicles`, data);
export const getCustomerHistory = (id) =>
  client.get(`/Customers/${id}/history`);
export const searchCustomers = (query) =>
  client.get(`/Customers/search?query=${encodeURIComponent(query)}`);

//staff
export const getStaff = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Staff?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getStaffById = (id) => client.get(`/Staff/${id}`);
export const createStaff = (data) => client.post("/Staff", data);
export const updateStaff = (id, data) => client.put(`/Staff/${id}`, data);
export const deactivateStaff = (id) => client.patch(`/Staff/${id}/deactivate`);

//purchase invoices
export const getPurchaseInvoices = (pageNumber = 1, pageSize = 10) =>
  client.get(`/PurchaseInvoice?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getPurchaseInvoiceById = (id) =>
  client.get(`/PurchaseInvoice/${id}`);
export const createPurchaseInvoice = (data) =>
  client.post("/PurchaseInvoice", data);
export const receivePurchaseInvoice = (id) =>
  client.patch(`/PurchaseInvoice/${id}/receive`);
export const payPurchaseInvoice = (id) =>
  client.patch(`/PurchaseInvoice/${id}/pay`);

//sales invoice
export const getSalesInvoices = (pageNumber = 1, pageSize = 10) =>
  client.get(
    `/CustomerStaffSide?pageNumber=${pageNumber}&pageSize=${pageSize}`,
  );
export const getSalesInvoiceById = (id) =>
  client.get(`/CustomerStaffSide/${id}`);
export const createSalesInvoice = (data) =>
  client.post("/CustomerStaffSide", data);
export const sendInvoiceEmail = (id) =>
  client.post(`/CustomerStaffSide/${id}/send-email`);

//reports
export const getFinancialReport = (type = "daily") =>
  client.get(`/reports/financial?type=${type}`);


//low stock check 
export const checkLowStock = () => client.post("/LowStock/check");
export const getLowStockAlerts = () => client.get("/LowStock/notifications");
