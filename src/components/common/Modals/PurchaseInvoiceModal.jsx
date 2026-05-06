import { useState } from "react";
import { createPurchaseInvoice, getVendors, getParts } from "../../../api/api";

function buildForm() {
  return {
    invoiceNo: "",
    vendorId: "",
    items: [],
  };
}

function InvoiceForm({ onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildForm());
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load vendors + parts on mount
  useState(() => {
    getVendors(1, 100)
      .then((r) => setVendors(r.data?.data?.items ?? []))
      .catch(() => {});
    getParts(1, 100)
      .then((r) => setParts(r.data?.data?.items ?? []))
      .catch(() => {});
  });

  const addItem = () =>
    setForm((f) => ({
      ...f,
      items: [...f.items, { partId: "", quantity: 1, unitCost: "" }],
    }));

  const removeItem = (idx) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const updateItem = (idx, field, value) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((item, i) => {
        if (i !== idx) return item;
        // Auto-fill unitCost from part's costPrice when part selected
        if (field === "partId") {
          const part = parts.find((p) => p.id === value);
          return {
            ...item,
            partId: value,
            unitCost: part?.costPrice ?? item.unitCost,
          };
        }
        return { ...item, [field]: value };
      }),
    }));

  const total = form.items.reduce(
    (s, i) => s + (parseFloat(i.unitCost) || 0) * (parseInt(i.quantity) || 0),
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.items.length === 0) {
      setError("Add at least one item");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createPurchaseInvoice({
        invoiceNo: form.invoiceNo.trim(),
        vendorId: form.vendorId,
        items: form.items.map((i) => ({
          partId: i.partId,
          quantity: parseInt(i.quantity),
          unitCost: parseFloat(i.unitCost),
        })),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto"
    >
      {/* Invoice No + Vendor */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Invoice No *" icon="tag">
          <input
            required
            value={form.invoiceNo}
            onChange={(e) =>
              setForm((f) => ({ ...f, invoiceNo: e.target.value }))
            }
            placeholder="e.g. PI-2026-001"
            className={inputCls}
          />
        </Field>
        <Field label="Vendor *" icon="storefront">
          <select
            required
            value={form.vendorId}
            onChange={(e) =>
              setForm((f) => ({ ...f, vendorId: e.target.value }))
            }
            className={inputCls}
          >
            <option value="">Select vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[#888] text-[11px] font-medium uppercase tracking-wider">
            <span
              className="material-icons text-[#555]"
              style={{ fontSize: "13px" }}
            >
              list
            </span>
            Line Items *
          </label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-[11px] text-[#e91e8c] hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "14px" }}>
              add_circle
            </span>
            Add Item
          </button>
        </div>

        {form.items.length === 0 ? (
          <div className="border border-dashed border-[#2a2a2a] rounded-lg py-6 flex flex-col items-center gap-2 text-[#444]">
            <span className="material-icons" style={{ fontSize: "28px" }}>
              add_shopping_cart
            </span>
            <span className="text-[12px]">No items yet — click Add Item</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="grid grid-cols-[1fr_80px_100px_32px] gap-2 px-1">
              {["Part", "Qty", "Unit Cost", ""].map((h) => (
                <span
                  key={h}
                  className="text-[#555] text-[10px] font-semibold uppercase tracking-wider"
                >
                  {h}
                </span>
              ))}
            </div>
            {form.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_80px_100px_32px] gap-2 items-center"
              >
                <select
                  required
                  value={item.partId}
                  onChange={(e) => updateItem(idx, "partId", e.target.value)}
                  className={inputCls}
                >
                  <option value="">Select part</option>
                  {parts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  className={inputCls}
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitCost}
                  onChange={(e) => updateItem(idx, "unitCost", e.target.value)}
                  placeholder="0.00"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <span className="material-icons" style={{ fontSize: "15px" }}>
                    remove_circle
                  </span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      {form.items.length > 0 && (
        <div className="flex justify-between items-center bg-[#111] border border-[#252525] rounded-lg px-4 py-3">
          <span className="text-[#888] text-[13px]">Total Amount</span>
          <span className="text-white text-[16px] font-bold">
            Rs. {total.toLocaleString()}
          </span>
        </div>
      )}

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

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors cursor-pointer bg-transparent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && (
            <span
              className="material-icons animate-spin"
              style={{ fontSize: "14px" }}
            >
              refresh
            </span>
          )}
          {loading ? "Creating..." : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}

export default function PurchaseInvoiceModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(233,30,140,0.12)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
              <span
                className="material-icons text-[#e91e8c]"
                style={{ fontSize: "17px" }}
              >
                receipt_long
              </span>
            </div>
            <div>
              <h2 className="text-white text-[15px] font-semibold m-0">
                New Purchase Invoice
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                Create a vendor purchase order
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              close
            </span>
          </button>
        </div>
        <InvoiceForm key="new" onClose={onClose} onSuccess={onSuccess} />
      </div>
    </div>
  );
}

const Field = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-[#888] text-[11px] font-medium uppercase tracking-wider">
      <span className="material-icons text-[#555]" style={{ fontSize: "13px" }}>
        {icon}
      </span>
      {label}
    </label>
    {children}
  </div>
);

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors duration-150
  placeholder:text-[#444]
`;
