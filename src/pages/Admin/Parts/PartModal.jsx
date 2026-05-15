import { useState, useEffect } from "react";
import {
  createPart,
  updatePart,
  getPartCategories,
  getVendors,
} from "../../../api/api";

const empty = {
  sku: "",
  name: "",
  description: "",
  unitPrice: "",
  costPrice: "",
  stockQty: "",
  categoryId: "",
  vendorId: "",
  isActive: true,
  image: null,
};

function buildForm(part) {
  if (!part) return empty;
  return {
    sku: part.sku ?? "",
    name: part.name ?? "",
    description: part.description ?? "",
    unitPrice: part.unitPrice ?? "",
    costPrice: part.costPrice ?? "",
    stockQty: part.stockQty ?? "",
    categoryId: part.categoryId ?? "",
    vendorId: part.vendorId ?? "",
    isActive: part.isActive ?? true,
    image: null,
  };
}

function PartForm({ editPart, onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildForm(editPart));
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [preview, setPreview] = useState(editPart?.imageUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const isEdit = !!editPart;

  useEffect(() => {
    getPartCategories()
      .then((r) => setCategories(r.data?.data ?? []))
      .catch(() => {});
    getVendors()
      .then((r) => setVendors(r.data?.data?.items ?? []))
      .catch(() => {});
  }, []);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((p) => ({ ...p, image: file }));
    setPreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  const removeImage = () => {
    setForm((p) => ({ ...p, image: null }));
    setPreview(null);

    if (isEdit) {
      setRemoveExistingImage(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("sku", form.sku.trim());
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("unitPrice", parseFloat(form.unitPrice));
      formData.append("costPrice", parseFloat(form.costPrice));
      formData.append("stockQty", parseInt(form.stockQty));
      formData.append("isActive", form.isActive);
      formData.append("removeImage", removeExistingImage);
      if (form.categoryId) formData.append("categoryId", form.categoryId);

      if (form.vendorId) formData.append("vendorId", form.vendorId);

      if (form.image) formData.append("image", form.image);

      if (isEdit) await updatePart(editPart.id, formData);
      else await createPart(formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
      {/* Image upload */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          <span
            className="material-icons text-[#555]"
            style={{ fontSize: "13px" }}
          >
            image
          </span>
          Part Image
        </label>
        {preview ? (
          <div className="relative w-full h-36 rounded-lg overflow-hidden border border-[#2a2a2a]">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-white border-none cursor-pointer hover:bg-red-500/80 transition-colors"
            >
              <span className="material-icons" style={{ fontSize: "14px" }}>
                close
              </span>
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border border-dashed border-[#2a2a2a] cursor-pointer hover:border-[#e91e8c] transition-colors bg-[#111]">
            <span
              className="material-icons text-[#444]"
              style={{ fontSize: "22px" }}
            >
              upload
            </span>
            <span className="text-[#555] text-[11px] mt-1">
              Click to upload image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* SKU + Name */}
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

      {/* Prices */}
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

      {/* Stock */}
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

      {/* Category + Vendor */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category" icon="category">
          <select
            value={form.categoryId}
            onChange={set("categoryId")}
            className={inputCls}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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

      {/* Description */}
      <Field label="Description" icon="notes">
        <textarea
          value={form.description}
          onChange={set("description")}
          placeholder="Optional..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* isActive toggle — edit only */}
      {isEdit && (
        <div className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
          <span className="text-[#888] text-[12px] font-medium flex items-center gap-1.5">
            <span
              className="material-icons text-[#555]"
              style={{ fontSize: "13px" }}
            >
              toggle_on
            </span>
            Active
          </span>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`w-10 h-5 rounded-full transition-colors border-none cursor-pointer relative ${form.isActive ? "bg-[#e91e8c]" : "bg-[#2a2a2a]"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.isActive ? "left-5" : "left-0.5"}`}
            />
          </button>
        </div>
      )}

      {/* Error */}
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

      {/* Actions */}
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
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Part"}
        </button>
      </div>
    </form>
  );
}

export default function PartModal({ open, onClose, onSuccess, editPart }) {
  if (!open) return null;
  const isEdit = !!editPart;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525] sticky top-0 bg-[#1a1a1a] z-10">
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
    <label className={labelCls}>
      <span className="material-icons text-[#555]" style={{ fontSize: "13px" }}>
        {icon}
      </span>
      {label}
    </label>
    {children}
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
