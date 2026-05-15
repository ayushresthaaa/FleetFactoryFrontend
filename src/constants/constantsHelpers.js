export const UserRole = {
  Admin: 0,
  Staff: 1,
  Customer: 2,
};

export const AppointmentStatus = {
  Pending: 0,
  Confirmed: 1,
  Completed: 2,
  Cancelled: 3,
};

export const InvoiceStatus = {
  Draft: 0,
  Pending: 1,
  Received: 2,
  Paid: 3,
  Cancelled: 4,
  Overdue: 5,
};

export const PaymentMethod = {
  Cash: 0,
  Card: 1,
  Credit: 2,
  BankTransfer: 3,
};

export const SalesInvoiceMode = {
  Direct: 0,
  Appointment: 1,
};

export const PartRequestStatus = {
  Pending: 0,
  Sourced: 1,
  Rejected: 2,
};

export const StockMovementType = {
  Purchase: 0,
  Sale: 1,
  Adjustment: 2,
  Return: 3,
};

export const paymentMethodOptions = [
  { label: "Cash", value: PaymentMethod.Cash },
  { label: "Card", value: PaymentMethod.Card },
  { label: "Credit", value: PaymentMethod.Credit },
  { label: "Bank Transfer", value: PaymentMethod.BankTransfer },
];

export const invoiceStatusOptions = [
  { label: "Pending", value: InvoiceStatus.Pending },
  { label: "Paid", value: InvoiceStatus.Paid },
  { label: "Cancelled", value: InvoiceStatus.Cancelled },
  { label: "Overdue", value: InvoiceStatus.Overdue },
];

export const salesInvoiceModeOptions = [
  { label: "Direct", value: SalesInvoiceMode.Direct },
  { label: "Appointment", value: SalesInvoiceMode.Appointment },
];
