import { useState } from "react";
import { createCustomer } from "../../../api/api";

function buildForm() {
  return {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    vehicleNumber: "",
    make: "",
    model: "",
    year: "",
  };
}

function CustomerForm({ onClose, onSuccess }) {
  const [form, setForm] = useState(() => buildForm());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createCustomer({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        vehicleNumber: form.vehicleNumber.trim(),
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        year: form.year ? parseInt(form.year) : null,
      });
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
    <form
      onSubmit={handleSubmit}
      className="px-6 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto"
    >
      {/* Customer section */}
      <div className="flex items-center gap-2 pb-1 border-b border-[#252525]">
        <span
          className="material-icons text-[#e91e8c]"
          style={{ fontSize: "16px" }}
        >
          person
        </span>
        <span className="text-white text-[12px] font-semibold uppercase tracking-wider">
          Customer Details
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name *" icon="badge">
          <input
            required
            value={form.fullName}
            onChange={set("fullName")}
            placeholder="e.g. Ram Sharma"
            className={inputCls}
          />
        </Field>
        <Field label="Email *" icon="email">
          <input
            required
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="e.g. ram@email.com"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone" icon="phone">
          <input
            value={form.phone}
            onChange={set("phone")}
            placeholder="e.g. 9841000000"
            className={inputCls}
          />
        </Field>
        <Field label="Address" icon="location_on">
          <input
            value={form.address}
            onChange={set("address")}
            placeholder="e.g. Kathmandu"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Vehicle section */}
      <div className="flex items-center gap-2 pb-1 border-b border-[#252525] mt-1">
        <span
          className="material-icons text-[#e91e8c]"
          style={{ fontSize: "16px" }}
        >
          directions_car
        </span>
        <span className="text-white text-[12px] font-semibold uppercase tracking-wider">
          Vehicle Details
        </span>
      </div>

      <Field label="Vehicle Number *" icon="pin">
        <input
          required
          value={form.vehicleNumber}
          onChange={set("vehicleNumber")}
          placeholder="e.g. BA 1 PA 2345"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Make" icon="directions_car">
          <input
            value={form.make}
            onChange={set("make")}
            placeholder="e.g. Toyota"
            className={inputCls}
          />
        </Field>
        <Field label="Model" icon="time_to_leave">
          <input
            value={form.model}
            onChange={set("model")}
            placeholder="e.g. Hilux"
            className={inputCls}
          />
        </Field>
        <Field label="Year" icon="calendar_today">
          <input
            type="number"
            min="1990"
            max={new Date().getFullYear()}
            value={form.year}
            onChange={set("year")}
            placeholder="2020"
            className={inputCls}
          />
        </Field>
      </div>

      {/* Note about default password */}
      <div className="flex items-start gap-2 bg-[rgba(233,30,140,0.06)] border border-[rgba(233,30,140,0.15)] rounded-lg px-3 py-2.5">
        <span
          className="material-icons text-[#e91e8c]"
          style={{ fontSize: "14px" }}
        >
          info
        </span>
        <span className="text-[#888] text-[11px]">
          Default password{" "}
          <span className="text-white font-mono">Customer@123</span> will be
          assigned. Customer can change it later.
        </span>
      </div>

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
          {loading ? "Registering..." : "Register Customer"}
        </button>
      </div>
    </form>
  );
}

export default function CustomerModal({ open, onClose, onSuccess }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(233,30,140,0.12)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
              <span
                className="material-icons text-[#e91e8c]"
                style={{ fontSize: "17px" }}
              >
                person_add
              </span>
            </div>
            <div>
              <h2 className="text-white text-[15px] font-semibold m-0">
                Register Customer
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                Create customer account with vehicle
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
        <CustomerForm key="new" onClose={onClose} onSuccess={onSuccess} />
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
