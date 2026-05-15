import { useEffect, useMemo, useState } from "react";
import {
  searchCustomers,
  //   getCustomerById,
  getAvailableParts,
  createSalesInvoice,
} from "../../../api/api";

const paymentMethods = [
  { label: "Cash", value: 0 },
  { label: "Card", value: 1 },
  { label: "Credit", value: 2 },
  { label: "Bank Transfer", value: 3 },
];

const emptyItem = {
  partId: "",
  quantity: 1,
};

const money = (v) => `Rs. ${Number(v || 0).toLocaleString()}`;

export default function SalesInvoiceModal({ open, onClose, onSuccess }) {
  const [invoiceNo, setInvoiceNo] = useState(() => `SINV-${Date.now()}`);
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [parts, setParts] = useState([]);
  const [items, setItems] = useState([emptyItem]);
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [serviceCharge, setServiceCharge] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadParts = async () => {
      try {
        const r = await getAvailableParts();
        if (cancelled) return;
        setParts(r.data?.data ?? []);
      } catch {
        if (!cancelled) setParts([]);
      }
    };

    loadParts();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const selectedVehicleOptions = selectedCustomer?.vehicles ?? [];

  const partsTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const part = parts.find((p) => p.id === item.partId);
      const qty = Number(item.quantity || 0);
      return sum + (part?.unitPrice || 0) * qty;
    }, 0);
  }, [items, parts]);

  const subTotal = partsTotal + Number(serviceCharge || 0);
  const discount = subTotal > 5000 ? subTotal * 0.1 : 0;
  const grandTotal = subTotal - discount;

  if (!open) return null;

  const handleSearchCustomer = async () => {
    if (!customerQuery.trim()) return;

    setSearchLoading(true);
    setError("");

    try {
      const r = await searchCustomers(customerQuery.trim());
      setCustomerResults(r.data?.data ?? []);
    } catch {
      setCustomerResults([]);
      setError("Customer search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer({
      id: customer.customerId,
      userId: customer.userId,
      fullName: customer.fullName,
      phone: customer.phone,
      address: customer.address,
      vehicles: customer.vehicles ?? [],
    });

    setSelectedVehicleId(customer.vehicles?.[0]?.id ?? "");
    setCustomerResults([]);
    setCustomerQuery("");
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCustomer?.id) {
      setError("Please select a customer.");
      return;
    }

    const validItems = items
      .filter((i) => i.partId && Number(i.quantity) > 0)
      .map((i) => ({
        partId: i.partId,
        quantity: Number(i.quantity),
      }));

    if (validItems.length === 0 && Number(serviceCharge || 0) <= 0) {
      setError("Add at least one part or service charge.");
      return;
    }

    setLoading(true);

    try {
      await createSalesInvoice({
        invoiceNo: invoiceNo.trim(),
        customerId: selectedCustomer.id,
        vehicleId: selectedVehicleId || null,
        appointmentId: null,
        paymentMethod: Number(paymentMethod),
        serviceCharge: Number(serviceCharge || 0),
        serviceDescription: serviceDescription.trim() || null,
        dueDate: Number(paymentMethod) === 2 && dueDate ? dueDate : null,
        items: validItems,
      });

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(
        err.response?.data?.message ?? "Failed to create sales invoice.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-6xl mx-4 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525] sticky top-0 bg-[#1a1a1a] z-10">
          <div>
            <h2 className="text-white text-[16px] font-semibold m-0">
              Create Sales Invoice
            </h2>
            <p className="text-[#555] text-[11px] m-0 mt-0.5">
              Customer sale, service charge, and parts billing
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              close
            </span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Invoice No" icon="receipt">
              <input
                required
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className={inputCls}
              />
            </Field>

            <Field label="Payment Method" icon="payments">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className={inputCls}
              >
                {paymentMethods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Due Date" icon="event">
              <input
                type="date"
                disabled={Number(paymentMethod) !== 2}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`${inputCls} disabled:opacity-40`}
              />
            </Field>
          </div>

          <div className="bg-[#111] border border-[#252525] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-[13px] font-semibold m-0">
                Customer
              </h3>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setSelectedVehicleId("");
                  }}
                  className="text-[#555] hover:text-red-400 text-[12px] bg-transparent border-none cursor-pointer"
                >
                  Change customer
                </button>
              )}
            </div>

            {!selectedCustomer ? (
              <>
                <div className="flex gap-2">
                  <input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearchCustomer();
                      }
                    }}
                    placeholder="Search by name, phone, vehicle..."
                    className={inputCls}
                  />

                  <button
                    type="button"
                    onClick={handleSearchCustomer}
                    disabled={searchLoading}
                    className="px-4 rounded-lg bg-[#e91e8c] text-white text-[13px] font-semibold border-none cursor-pointer disabled:opacity-50"
                  >
                    {searchLoading ? "Searching..." : "Search"}
                  </button>
                </div>

                {customerResults.length > 0 && (
                  <div className="border border-[#252525] rounded-lg overflow-hidden">
                    {customerResults.map((c) => (
                      <button
                        key={c.customerId}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="w-full px-3 py-2 flex items-center justify-between bg-[#151515] hover:bg-[#1f1f1f] border-b border-[#252525] last:border-b-0 cursor-pointer text-left"
                      >
                        <div>
                          <div className="text-white text-[13px] font-medium">
                            {c.fullName ?? c.name}
                          </div>
                          <div className="text-[#555] text-[11px]">
                            {c.phone ?? "No phone"}
                          </div>
                        </div>
                        <span className="text-[#e91e8c] text-[12px] font-semibold">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Info
                  label="Customer"
                  value={selectedCustomer.fullName ?? selectedCustomer.name}
                />
                <Info label="Phone" value={selectedCustomer.phone ?? "—"} />
                <Field label="Vehicle" icon="directions_car">
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">No vehicle selected</option>
                    {selectedVehicleOptions.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber ?? v.registrationNumber ?? "Vehicle"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </div>

          <div className="grid grid-cols-[1fr_220px] gap-4">
            <Field label="Service Description" icon="build">
              <textarea
                rows={3}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="e.g. Brake inspection and fitting..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <Field label="Service Charge" icon="sell">
              <input
                type="number"
                min="0"
                step="0.01"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                placeholder="0"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="bg-[#111] border border-[#252525] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#252525] flex items-center justify-between">
              <h3 className="text-white text-[13px] font-semibold m-0">
                Parts Sold
              </h3>

              <button
                type="button"
                onClick={addItem}
                className="text-[#e91e8c] text-[12px] font-semibold bg-transparent border-none cursor-pointer"
              >
                + Add Part
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {items.map((item, index) => {
                const part = parts.find((p) => p.id === item.partId);
                const qty = Number(item.quantity || 0);
                const subtotal = (part?.unitPrice || 0) * qty;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[1fr_100px_120px_120px_32px] gap-3 items-center"
                  >
                    <select
                      value={item.partId}
                      onChange={(e) =>
                        updateItem(index, "partId", e.target.value)
                      }
                      className={inputCls}
                    >
                      <option value="">Select part</option>
                      {parts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Stock: {p.stockQty}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      className={inputCls}
                    />

                    <div className="text-[#888] text-[12px]">
                      {money(part?.unitPrice)}
                    </div>

                    <div className="text-white text-[13px] font-semibold">
                      {money(subtotal)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="w-8 h-8 rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 bg-transparent border-none cursor-pointer disabled:opacity-30"
                    >
                      <span
                        className="material-icons"
                        style={{ fontSize: "16px" }}
                      >
                        delete
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-4">
            <div>
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <span
                    className="material-icons text-red-400"
                    style={{ fontSize: "15px" }}
                  >
                    error
                  </span>
                  <span className="text-red-400 text-[12px]">{error}</span>
                </div>
              )}
            </div>

            <div className="bg-[#111] border border-[#252525] rounded-xl p-4 flex flex-col gap-2">
              <Summary label="Parts Total" value={money(partsTotal)} />
              <Summary
                label="Service Charge"
                value={money(Number(serviceCharge || 0))}
              />
              <Summary label="Subtotal" value={money(subTotal)} />
              <Summary
                label="Discount"
                value={subTotal > 5000 ? `10% (${money(discount)})` : "—"}
              />
              <div className="border-t border-[#252525] pt-2 mt-1">
                <Summary label="Grand Total" value={money(grandTotal)} strong />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#252525] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors cursor-pointer bg-transparent"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className={labelCls}>
      <span className="material-icons text-[#555]" style={{ fontSize: "13px" }}>
        {icon}
      </span>
      {label}
    </label>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-[#151515] border border-[#252525] rounded-lg px-3 py-2">
    <div className="text-[#555] text-[10px] uppercase font-semibold tracking-wider">
      {label}
    </div>
    <div className="text-white text-[13px] font-medium mt-1">{value}</div>
  </div>
);

const Summary = ({ label, value, strong }) => (
  <div className="flex items-center justify-between">
    <span className="text-[#777] text-[12px]">{label}</span>
    <span
      className={`text-[13px] ${
        strong ? "text-white font-bold" : "text-[#ddd] font-medium"
      }`}
    >
      {value}
    </span>
  </div>
);

const labelCls =
  "flex items-center gap-1.5 text-[#888] text-[11px] font-medium uppercase tracking-wider";

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors duration-150
  placeholder:text-[#444]
`;
