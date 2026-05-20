import client from "./client";
//auth
export const login = (data) => client.post("/Auth/login", data);
export const register = (data) => client.post("/Auth/register", data);

//parts
export const getParts = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Parts?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getPartById = (id) => client.get(`/Parts/${id}`);

export const createPart = (data) =>
  client.post("/Parts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updatePart = (id, data) =>
  client.put(`/Parts/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
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

//part categories
export const getPartCategories = () => client.get("/PartCategory");

export const getPartCategoryById = (id) => client.get(`/PartCategory/${id}`);

export const createPartCategory = (data) => client.post("/PartCategory", data);

export const updatePartCategory = (id, data) =>
  client.put(`/PartCategory/${id}`, data);

export const deletePartCategory = (id) => client.delete(`/PartCategory/${id}`);

// sales invoices
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

  if (query) params.append("query", query);
  if (status !== null && status !== undefined) params.append("status", status);
  if (mode !== null && mode !== undefined) params.append("mode", mode);

  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);

  return client.get(`/SalesInvoice/search?${params.toString()}`);
};

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
  client.patch(`/PurchaseInvoice/${id}/status`);

export const cancelPurchaseInvoice = (id) =>
  client.patch(`/PurchaseInvoice/${id}/cancel`);

export const getCustomerAppointmentsForInvoice = (customerId) =>
  client.get(`/SalesInvoice/customer/${customerId}/appointments`);
export const searchPurchaseInvoices = ({
  query = "",
  status = null,
  pageNumber = 1,
  pageSize = 10,
} = {}) => {
  const params = new URLSearchParams();

  if (query) params.append("query", query);
  if (status !== null && status !== undefined) params.append("status", status);

  params.append("pageNumber", pageNumber);
  params.append("pageSize", pageSize);

  return client.get(`/PurchaseInvoice/search?${params.toString()}`);
};

// appointments - admin/staff
export const getAppointments = (pageNumber = 1, pageSize = 10) =>
  client.get(`/appointments?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getAppointmentById = (id) => client.get(`/appointments/${id}`);

export const createMyAppointment = (data) =>
  client.post("/appointments/me", data);

export const searchAppointments = ({
  query,
  status,
  pageNumber = 1,
  pageSize = 10,
}) =>
  client.get("/appointments/search", {
    params: {
      query,
      status,
      pageNumber,
      pageSize,
    },
  });

export const confirmAppointment = (id) =>
  client.patch(`/appointments/${id}/confirm`);

export const cancelAppointment = (id, data) =>
  client.patch(`/appointments/${id}/cancel`, data);

// part requests - admin/staff
export const getPartRequests = (pageNumber = 1, pageSize = 10) =>
  client.get(`/part-requests?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getPartRequestById = (id) => client.get(`/part-requests/${id}`);

export const searchPartRequests = ({
  query = "",
  status = null,
  pageNumber = 1,
  pageSize = 10,
} = {}) =>
  client.get("/part-requests/search", {
    params: {
      query,
      status,
      pageNumber,
      pageSize,
    },
  });

export const markPartRequestSourced = (id, data) =>
  client.patch(`/part-requests/${id}/sourced`, data);

export const rejectPartRequest = (id, data) =>
  client.patch(`/part-requests/${id}/reject`, data);

// part requests - customer side
export const createMyPartRequest = (data) =>
  client.post("/part-requests/me", data);

export const getMyPartRequests = () => client.get("/part-requests/me");

export const getMyPartRequestById = (id) =>
  client.get(`/part-requests/me/${id}`);

// reviews - admin/staff
export const getReviews = (pageNumber = 1, pageSize = 10) =>
  client.get(`/reviews?pageNumber=${pageNumber}&pageSize=${pageSize}`);

export const getReviewById = (id) => client.get(`/reviews/${id}`);

export const getReviewsByCustomerId = (customerId) =>
  client.get(`/reviews/customer/${customerId}`);

export const hideReview = (id) => client.patch(`/reviews/${id}/hide`);

export const showReview = (id) => client.patch(`/reviews/${id}/show`);
// reviews - customer side
export const createMyReview = (data) => client.post("/reviews/me", data);

export const getMyReviews = () => client.get("/reviews/me");

export const getMyReviewById = (id) => client.get(`/reviews/me/${id}`);

//staff
export const getStaff = (pageNumber = 1, pageSize = 10) =>
  client.get(`/Staff?pageNumber=${pageNumber}&pageSize=${pageSize}`);
export const getStaffById = (id) => client.get(`/Staff/${id}`);
export const createStaff = (data) => client.post("/Staff", data);
export const updateStaff = (id, data) => client.put(`/Staff/${id}`, data);
export const deactivateStaff = (id) => client.delete(`/Staff/${id}`);

//history - customer side and appointments/purchase - rabison
export const getMyPurchaseHistory = () =>
  client.get("/customer-side/me/purchase-history");

export const getMyUpcomingAppointments = () =>
  client.get("/customer-side/me/upcoming-appointments");

export const getMyAppointmentById = (id) =>
  client.get(`/customer-side/me/appointments/${id}`);

export const getMyAppointmentHistory = () =>
  client.get("/customer-side/me/appointment-history");

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
export const customerLookup = (query, type = 0) =>
  client.get("/CustomerLookup", {
    params: {
      query,
      type,
    },
  });
// customer profile - customer side
export const getMyCustomerProfile = () => client.get("/customer-profile/me");

export const updateMyCustomerProfile = (data) =>
  client.put("/customer-profile/me", data);

export const addMyVehicle = (data) =>
  client.post("/customer-profile/me/vehicles", data);

export const updateMyVehicle = (vehicleId, data) =>
  client.put(`/customer-profile/me/vehicles/${vehicleId}`, data);

export const deleteMyVehicle = (vehicleId) =>
  client.delete(`/customer-profile/me/vehicles/${vehicleId}`);
// account
export const changeEmail = (data) => client.put("/account/change-email", data);

export const changePassword = (data) =>
  client.put("/account/change-password", data);

export const changeName = (data) => client.put("/account/change-name", data);
export const getMyAccount = () => client.get("/account/me");

// dashboard
export const getAdminDashboard = () => client.get("/reports/admin-dashboard");

export const getStaffDashboard = () => client.get("/reports/staff-dashboard");

// reports - financial
export const getFinancialSummary = (from, to) =>
  client.get("/reports/financial-summary", {
    params: { from, to },
  });

export const getRevenueTrend = (from, to, groupBy = "day") =>
  client.get("/reports/revenue-trend", {
    params: { from, to, groupBy },
  });

export const getPaymentMethodsReport = (from, to) =>
  client.get("/reports/payment-methods", {
    params: { from, to },
  });

export const getProfitEstimate = (from, to) =>
  client.get("/reports/profit-estimate", {
    params: { from, to },
  });

// reports - parts/sales
export const getTopSellingPartsReport = (from, to) =>
  client.get("/reports/top-selling-parts", {
    params: { from, to },
  });

// reports - customers
export const getHighSpenders = (from, to) =>
  client.get("/reports/high-spenders", {
    params: { from, to },
  });

export const getRegularCustomers = (from, to) =>
  client.get("/reports/regular-customers", {
    params: { from, to },
  });

export const getPendingCredits = () => client.get("/reports/pending-credits");

export const getFrequentVehicles = (from, to) =>
  client.get("/reports/frequent-vehicles", {
    params: { from, to },
  });

// reports - appointments
export const getAppointmentStats = (from, to) =>
  client.get("/reports/appointment-stats", {
    params: { from, to },
  });

export const getOverdueCredits = () => client.get("/reports/pending-credits");

export const sendOverdueCreditReminder = (customerId) =>
  client.post(`/overdue-credits/${customerId}/send-reminder`);

export const sendAllOverdueCreditReminders = () =>
  client.post("/overdue-credits/send-reminders");

//low stock check
export const checkLowStock = () => client.post("/LowStock/check");
export const getLowStockAlerts = () => client.get("/LowStock/notifications");
