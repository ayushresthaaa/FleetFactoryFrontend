import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchCustomers,
  searchParts,
  getCustomerAppointmentsForInvoice,
  createSalesInvoice,
} from "../../../api/api";
import {
  PaymentMethod,
  paymentMethodOptions,
} from "../../../constants/constantsHelpers";

const money = (v) => `Rs. ${Number(v || 0).toLocaleString()}`;

export default function CreateSalesInvoice() {
  const navigate = useNavigate();

  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState("");

  const [partQuery, setPartQuery] = useState("");
  const [partResults, setPartResults] = useState([]);
  const [items, setItems] = useState([]);

  const [serviceCharge, setServiceCharge] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");

  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.Cash);
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [searchingPart, setSearchingPart] = useState(false);
  const [error, setError] = useState("");

  const partsTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
        0,
      ),
    [items],
  );

  const subtotal = partsTotal + Number(serviceCharge || 0);
  const discount = subtotal > 5000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const handleCustomerSearch = async () => {
    if (!customerQuery.trim()) return;

    setSearchingCustomer(true);
    setError("");

    try {
      const res = await searchCustomers(customerQuery.trim());
      setCustomerResults(res.data?.data ?? []);
    } catch (err) {
      setError(err.message || "Customer search failed.");
      setCustomerResults([]);
    } finally {
      setSearchingCustomer(false);
    }
  };

  const selectCustomer = async (customer) => {
    const selected = {
      id: customer.customerId,
      fullName: customer.fullName,
      phone: customer.phone,
      vehicles: customer.vehicles ?? [],
    };

    setSelectedCustomer(selected);
    setSelectedVehicleId(customer.vehicles?.[0]?.id ?? "");
    setCustomerResults([]);
    setCustomerQuery("");
    setAppointmentId("");

    try {
      const res = await getCustomerAppointmentsForInvoice(customer.customerId);
      setAppointments(res.data?.data ?? []);
    } catch {
      setAppointments([]);
    }
  };

  const handlePartSearch = async () => {
    if (!partQuery.trim()) return;

    setSearchingPart(true);
    setError("");

    try {
      const res = await searchParts(partQuery.trim(), 1, 10);
      setPartResults(res.data?.data?.items ?? res.data?.data ?? []);
    } catch (err) {
      setError(err.message || "Part search failed.");
      setPartResults([]);
    } finally {
      setSearchingPart(false);
    }
  };

  const addPart = (part) => {
    const exists = items.some((i) => i.partId === part.id);

    if (exists) {
      setItems((prev) =>
        prev.map((i) =>
          i.partId === part.id ? { ...i, quantity: Number(i.quantity) + 1 } : i,
        ),
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          partId: part.id,
          partName: part.name,
          unitPrice: part.unitPrice,
          stockQty: part.stockQty,
          quantity: 1,
        },
      ]);
    }

    setPartQuery("");
    setPartResults([]);
  };

  const updateQty = (partId, quantity) => {
    setItems((prev) =>
      prev.map((i) =>
        i.partId === partId
          ? { ...i, quantity: Math.max(1, Number(quantity || 1)) }
          : i,
      ),
    );
  };

  const removePart = (partId) => {
    setItems((prev) => prev.filter((i) => i.partId !== partId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCustomer?.id) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0 && Number(serviceCharge || 0) <= 0) {
      setError("Add at least one part or service charge.");
      return;
    }

    if (Number(paymentMethod) === PaymentMethod.Credit && !dueDate) {
      setError("Due date is required for credit invoices.");
      return;
    }

    const payload = {
      customerId: selectedCustomer.id,
      vehicleId: selectedVehicleId || null,
      appointmentId: appointmentId || null,
      paymentMethod: Number(paymentMethod),
      serviceCharge: Number(serviceCharge || 0),
      serviceDescription: serviceDescription.trim() || null,
      dueDate: Number(paymentMethod) === PaymentMethod.Credit ? dueDate : null,
      items: items.map((i) => ({
        partId: i.partId,
        quantity: Number(i.quantity),
      })),
    };

    setLoading(true);

    try {
      const res = await createSalesInvoice(payload);
      const createdId = res.data?.data?.id;

      if (createdId) {
        navigate(`/admin/sales-invoices/${createdId}`);
      } else {
        navigate("/admin/sales-invoices");
      }
    } catch (err) {
      setError(err.message || "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-bold">Create Sales Invoice</h1>
          <p className="text-[#777] text-sm">
            Direct sale or appointment/service billing
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/sales-invoices")}
          className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-white bg-transparent"
        >
          Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-[1fr_340px] gap-5"
      >
        <div className="flex flex-col gap-5">
          <Section title="1. Select Customer">
            {!selectedCustomer ? (
              <>
                <div className="flex gap-2">
                  <input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCustomerSearch();
                      }
                    }}
                    placeholder="Search customer by name, phone, vehicle..."
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={handleCustomerSearch}
                    className={primaryBtn}
                  >
                    {searchingCustomer ? "Searching..." : "Search"}
                  </button>
                </div>

                {customerResults.map((c) => (
                  <button
                    key={c.customerId}
                    type="button"
                    onClick={() => selectCustomer(c)}
                    className="w-full text-left bg-[#151515] hover:bg-[#202020] border border-[#292929] rounded-lg px-4 py-3"
                  >
                    <div className="text-white text-sm font-semibold">
                      {c.fullName}
                    </div>
                    <div className="text-[#777] text-xs">
                      {c.phone || "No phone"}
                    </div>
                  </button>
                ))}
              </>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <Info label="Customer" value={selectedCustomer.fullName} />
                <Info label="Phone" value={selectedCustomer.phone || "—"} />

                <Field label="Vehicle">
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className={inputCls}
                  >
                    <option value="">No vehicle selected</option>
                    {selectedCustomer.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber || v.registrationNumber || "Vehicle"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            )}
          </Section>

          <Section title="2. Appointment / Direct Sale">
            <select
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              className={inputCls}
              disabled={!selectedCustomer}
            >
              <option value="">Direct sale / No appointment</option>
              {appointments.map((a) => (
                <option key={a.id} value={a.id}>
                  {new Date(a.scheduledAt).toLocaleString()} —{" "}
                  {a.vehicleNumber || "No vehicle"} — {a.status}
                </option>
              ))}
            </select>
          </Section>

          <Section title="3. Service Information">
            <div className="grid grid-cols-[1fr_180px] gap-3">
              <textarea
                rows={3}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                placeholder="Service description..."
                className={`${inputCls} resize-none`}
              />
              <input
                type="number"
                min="0"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(e.target.value)}
                placeholder="Service charge"
                className={inputCls}
              />
            </div>
          </Section>

          <Section title="4. Add Parts">
            <div className="flex gap-2">
              <input
                value={partQuery}
                onChange={(e) => setPartQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handlePartSearch();
                  }
                }}
                placeholder="Search part..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={handlePartSearch}
                className={primaryBtn}
              >
                {searchingPart ? "Searching..." : "Search"}
              </button>
            </div>

            {partResults.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addPart(p)}
                className="w-full flex justify-between bg-[#151515] hover:bg-[#202020] border border-[#292929] rounded-lg px-4 py-3 text-left"
              >
                <div>
                  <div className="text-white text-sm font-semibold">
                    {p.name}
                  </div>
                  <div className="text-[#777] text-xs">Stock: {p.stockQty}</div>
                </div>
                <div className="text-[#e91e8c] text-sm font-semibold">
                  {money(p.unitPrice)}
                </div>
              </button>
            ))}

            {items.length > 0 && (
              <div className="border border-[#292929] rounded-xl overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.partId}
                    className="grid grid-cols-[1fr_90px_120px_40px] gap-3 items-center px-4 py-3 border-b border-[#222] last:border-b-0"
                  >
                    <div>
                      <div className="text-white text-sm">{item.partName}</div>
                      <div className="text-[#777] text-xs">
                        Stock: {item.stockQty} • {money(item.unitPrice)}
                      </div>
                    </div>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQty(item.partId, e.target.value)}
                      className={inputCls}
                    />

                    <div className="text-white text-sm font-semibold">
                      {money(item.unitPrice * item.quantity)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePart(item.partId)}
                      className="text-red-400 bg-transparent border-none"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="5. Payment">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment Method">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(Number(e.target.value))}
                  className={inputCls}
                >
                  {paymentMethodOptions.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              {Number(paymentMethod) === PaymentMethod.Credit && (
                <Field label="Due Date">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputCls}
                  />
                </Field>
              )}
            </div>
          </Section>
        </div>

        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit sticky top-5">
          <h3 className="text-white text-sm font-semibold mb-4">
            Invoice Summary
          </h3>

          <Summary label="Parts Total" value={money(partsTotal)} />
          <Summary label="Service Charge" value={money(serviceCharge)} />
          <Summary label="Subtotal" value={money(subtotal)} />
          <Summary
            label="Loyalty Discount"
            value={subtotal > 5000 ? `10% (${money(discount)})` : "—"}
          />

          <div className="border-t border-[#2a2a2a] mt-3 pt-3">
            <Summary label="Estimated Total" value={money(total)} strong />
          </div>

          <p className="text-[#666] text-xs mt-3">
            Backend will confirm stock, discount, and final total.
          </p>

          {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white font-semibold disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
}

const Section = ({ title, children }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 flex flex-col gap-3">
    <h2 className="text-white text-sm font-semibold">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[#888] text-xs font-medium">{label}</label>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2">
    <div className="text-[#666] text-xs">{label}</div>
    <div className="text-white text-sm font-medium">{value}</div>
  </div>
);

const Summary = ({ label, value, strong }) => (
  <div className="flex justify-between py-1.5">
    <span className="text-[#777] text-sm">{label}</span>
    <span className={strong ? "text-white font-bold" : "text-[#ddd] text-sm"}>
      {value}
    </span>
  </div>
);

const inputCls =
  "w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#e91e8c] placeholder:text-[#444]";

const primaryBtn =
  "px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold disabled:opacity-50";
