import { useState } from "react";
import { createVendor, updateVendor } from "../../../api/api";

function buildForm(editVendor) {
  if (!editVendor)
    return {
      name: "",
      contactName: "",
      phone: "",
      email: "",
      address: "",
      isActive: true,
    };
  return {
    name: editVendor.name ?? "",
    contactName: editVendor.contactName ?? "",
    phone: editVendor.phone ?? "",
    email: editVendor.email ?? "",
    address: editVendor.address ?? "",
    isActive: editVendor.isActive ?? true,
  };
}

function VendorForm({ editVendor, onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildForm(editVendor));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editVendor;
  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      contactName: form.contactName.trim() || null,
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      isActive: form.isActive,
    };
    try {
      if (isEdit) await updateVendor(editVendor.id, payload);
      else await createVendor(payload);
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
      {/* Name */}
      <Field label="Vendor Name *" icon="storefront">
        <input
          required
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. AutoParts Nepal Pvt. Ltd."
          className={inputCls}
        />
      </Field>

      {/* Contact + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact Person" icon="person">
          <input
            value={form.contactName}
            onChange={set("contactName")}
            placeholder="e.g. Ram Sharma"
            className={inputCls}
          />
        </Field>
        <Field label="Phone" icon="phone">
          <input
            value={form.phone}
            onChange={set("phone")}
            placeholder="e.g. 9841000000"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email" icon="email">
        <input
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="e.g. vendor@example.com"
          className={inputCls}
        />
      </Field>

      {/* Address */}
      <Field label="Address" icon="location_on">
        <textarea
          value={form.address}
          onChange={set("address")}
          placeholder="e.g. Kathmandu, Nepal"
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </Field>

      {/* Active toggle — only show on edit */}
      {isEdit && (
        <div className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="material-icons text-[#555]"
              style={{ fontSize: "16px" }}
            >
              toggle_on
            </span>
            <span className="text-[#888] text-[13px]">Active Status</span>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer border-none relative ${
              form.isActive ? "bg-[#e91e8c]" : "bg-[#333]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                form.isActive ? "left-5" : "left-0.5"
              }`}
            />
          </button>
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
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Vendor"}
        </button>
      </div>
    </form>
  );
}

export default function VendorModal({ open, onClose, onSuccess, editVendor }) {
  if (!open) return null;
  const isEdit = !!editVendor;

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
                {isEdit ? "Edit Vendor" : "Add New Vendor"}
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                {isEdit
                  ? `Editing: ${editVendor.name}`
                  : "Fill in the vendor details"}
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

        <VendorForm
          key={editVendor?.id ?? "new"}
          editVendor={editVendor}
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
