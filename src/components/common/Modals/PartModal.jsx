import { useState } from "react";
import { createPart, updatePart, getVendors } from "../../../api/api";

const CATEGORIES = [
  "Brakes",
  "Engine",
  "Transmission",
  "Suspension",
  "Electrical",
  "Tyres",
  "Body",
  "Filters",
  "Exhaust",
  "Cooling",
  "Other",
];

// Build initial form from editPart or empty
function buildForm(editPart) {
  if (!editPart)
    return {
      sku: "",
      name: "",
      description: "",
      unitPrice: "",
      costPrice: "",
      stockQty: "",
      categoryId: "",
      vendorId: "",
    };
  return {
    sku: editPart.sku ?? "",
    name: editPart.name ?? "",
    description: editPart.description ?? "",
    unitPrice: editPart.unitPrice ?? "",
    costPrice: editPart.costPrice ?? "",
    stockQty: editPart.stockQty ?? "",
    categoryId: editPart.categoryId ?? "",
    vendorId: editPart.vendorId ?? "",
  };
}

// Inner form — remounts fresh every time via key prop, so no sync effect needed
function PartForm({ editPart, onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildForm(editPart));
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editPart;

  // Load vendors once on mount — no setState cascade, this is a genuine side effect
  useState(() => {
    getVendors()
      .then((res) => setVendors(res.data?.data?.items ?? []))
      .catch(() => {});
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      sku: form.sku.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      unitPrice: parseFloat(form.unitPrice),
      costPrice: parseFloat(form.costPrice),
      stockQty: parseInt(form.stockQty),
      categoryId: form.categoryId || null,
      vendorId: form.vendorId || null,
    };
    try {
      if (isEdit) await updatePart(editPart.id, payload);
      else await createPart(payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ??
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU *" icon="tag">
          <input
            required
            value={form.sku}
            onChange={set("sku")}
            placeholder="e.g. BR-001"
            className={inputCls}
          />
        </Field>
        <Field label="Part Name *" icon="inventory_2">
          <input
            required
            value={form.name}
            onChange={set("name")}
            placeholder="e.g. Brake Pad"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Unit Price (Rs.) *" icon="sell">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.unitPrice}
            onChange={set("unitPrice")}
            placeholder="0.00"
            className={inputCls}
          />
        </Field>
        <Field label="Cost Price (Rs.) *" icon="sell">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.costPrice}
            onChange={set("costPrice")}
            placeholder="0.00"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Stock Quantity *" icon="warehouse">
        <input
          required
          type="number"
          min="0"
          value={form.stockQty}
          onChange={set("stockQty")}
          placeholder="0"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" icon="category">
          <select
            value={form.categoryId}
            onChange={set("categoryId")}
            className={inputCls}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Vendor" icon="storefront">
          <select
            value={form.vendorId}
            onChange={set("vendorId")}
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

      <Field label="Description" icon="notes">
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Optional description..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>

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
          className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span
              className="material-icons animate-spin"
              style={{ fontSize: "14px" }}
            >
              refresh
            </span>
          )}
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Part"}
        </button>
      </div>
    </form>
  );
}

// Outer shell — controls backdrop + header, uses key to remount PartForm fresh each open
export default function PartModal({ open, onClose, onSuccess, editPart }) {
  if (!open) return null;

  const isEdit = !!editPart;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(233,30,140,0.12)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
              <span
                className="material-icons text-[#e91e8c]"
                style={{ fontSize: "17px" }}
              >
                {isEdit ? "edit" : "add"}
              </span>
            </div>
            <div>
              <h2 className="text-white text-[15px] font-semibold m-0">
                {isEdit ? "Edit Part" : "Add New Part"}
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                {isEdit
                  ? `Editing: ${editPart.name}`
                  : "Fill in the details below"}
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

        {/* Form remounts fresh on every open/editPart change via key */}
        <PartForm
          key={editPart?.id ?? "new"}
          editPart={editPart}
          onClose={onClose}
          onSuccess={onSuccess}
        />
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
