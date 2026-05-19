
import { useState, useEffect } from "react";
import { createVehicle, updateVehicle, getCustomers } from "../../../api/api";

const MAKES = [
  "Toyota", "Honda", "Suzuki", "Hyundai", "Nissan",
  "Mitsubishi", "Ford", "Isuzu", "Tata", "Mahindra", "Other",
];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"];
const COLORS = [
  "White", "Silver", "Black", "Red", "Blue",
  "Grey", "Brown", "Green", "Yellow", "Orange", "Other",
];

const EMPTY = {
  customerId: "",
  vehicleNumber: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  color: "",
  fuelType: "Petrol",
  engineCC: "",
  vin: "",
  mileage: "",
  lastService: "",
  notes: "",
};

export default function VehicleModal({ open, vehicle, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [custLoading, setCustLoading] = useState(false);

  const isEdit = Boolean(vehicle);

  // Load customers for dropdown
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function loadCustomers() {
      setCustLoading(true);
      try {
        const res = await getCustomers(1, 100);
        const items = res.data?.data?.items ?? [];
        if (!cancelled) setCustomers(items);
      } catch {
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setCustLoading(false);
      }
    }
    loadCustomers();
    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (open) {
      setErrors({});
      setApiError("");
      setForm(
        vehicle
          ? {
              customerId:    vehicle.customerId    ?? "",
              vehicleNumber: vehicle.vehicleNumber ?? "",
              make:          vehicle.make          ?? "",
              model:         vehicle.model         ?? "",
              year:          vehicle.year          ?? new Date().getFullYear(),
              color:         vehicle.color         ?? "",
              fuelType:      vehicle.fuelType      ?? "Petrol",
              engineCC:      vehicle.engineCC      ?? "",
              vin:           vehicle.vin           ?? "",
              mileage:       vehicle.mileage       ?? "",
              lastService:   vehicle.lastService   ?? "",
              notes:         vehicle.notes         ?? "",
            }
          : EMPTY
      );
    }
  }, [open, vehicle]);

  if (!open) return null;

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.customerId)             errs.customerId    = "Please select a customer.";
    if (!form.vehicleNumber.trim())   errs.vehicleNumber = "Vehicle number plate is required.";
    if (!form.make.trim())            errs.make          = "Make is required.";
    if (!form.model.trim())           errs.model         = "Model is required.";
    const yr = Number(form.year);
    if (!yr || yr < 1980 || yr > new Date().getFullYear() + 1)
      errs.year = "Enter a valid year.";
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    setApiError("");
    try {
      const payload = {
        ...form,
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        vin:           form.vin.trim().toUpperCase(),
        year:          Number(form.year)     || null,
        engineCC:      Number(form.engineCC) || null,
        mileage:       Number(form.mileage)  || null,
        lastService:   form.lastService || null,
        color:         form.color  || null,
        notes:         form.notes  || null,
      };
      if (isEdit) {
        await updateVehicle(vehicle.vehicleId ?? vehicle.id, payload);
      } else {
        await createVehicle(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      // client.js interceptor puts the message directly on err.message
      setApiError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg mx-4 shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(233,30,140,0.12)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
              <span className="material-icons text-[#e91e8c]" style={{ fontSize: "17px" }}>
                {isEdit ? "edit" : "directions_car"}
              </span>
            </div>
            <div>
              <h2 className="text-white text-[15px] font-semibold m-0">
                {isEdit ? "Edit Vehicle" : "Register Vehicle"}
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                {isEdit ? "Update vehicle information" : "Add vehicle to a customer"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

          {apiError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              <span className="material-icons text-red-400" style={{ fontSize: "15px" }}>error</span>
              <span className="text-red-400 text-[12px]">{apiError}</span>
            </div>
          )}

          {/* Owner */}
          <SectionHeader icon="person" label="Owner" />
          <Field label="Customer *" icon="group" error={errors.customerId}>
            <select
              value={form.customerId}
              onChange={set("customerId")}
              disabled={custLoading}
              className={inputCls(errors.customerId)}
            >
              <option value="">
                {custLoading ? "Loading customers..." : "— Select customer —"}
              </option>
              {customers.map((c) => (
                <option key={c.customerId ?? c.id} value={c.customerId ?? c.id}>
                  {c.fullName} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* Vehicle Identity */}
          <SectionHeader icon="directions_car" label="Vehicle Details" />
          <Field label="Number Plate *" icon="pin" error={errors.vehicleNumber}>
            <input
              value={form.vehicleNumber}
              onChange={set("vehicleNumber")}
              placeholder="e.g. BA 1 PA 2345"
              className={`${inputCls(errors.vehicleNumber)} uppercase font-mono tracking-widest`}
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Make *" icon="directions_car" error={errors.make}>
              <select value={form.make} onChange={set("make")} className={inputCls(errors.make)}>
                <option value="">— Select —</option>
                {MAKES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Model *" icon="time_to_leave" error={errors.model}>
              <input
                value={form.model}
                onChange={set("model")}
                placeholder="e.g. Hilux"
                className={inputCls(errors.model)}
              />
            </Field>
            <Field label="Year *" icon="calendar_today" error={errors.year}>
              <input
                type="number"
                value={form.year}
                onChange={set("year")}
                min={1980}
                max={new Date().getFullYear() + 1}
                className={inputCls(errors.year)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Color" icon="palette">
              <select value={form.color} onChange={set("color")} className={inputCls()}>
                <option value="">— Select —</option>
                {COLORS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Fuel Type" icon="local_gas_station">
              <select value={form.fuelType} onChange={set("fuelType")} className={inputCls()}>
                {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Engine CC" icon="settings">
              <input
                type="number"
                value={form.engineCC}
                onChange={set("engineCC")}
                placeholder="e.g. 2800"
                className={inputCls()}
              />
            </Field>
            <Field label="Mileage (km)" icon="speed">
              <input
                type="number"
                value={form.mileage}
                onChange={set("mileage")}
                placeholder="e.g. 45000"
                className={inputCls()}
              />
            </Field>
          </div>

          {/* Registration & Service */}
          <SectionHeader icon="assignment" label="Registration & Service" />
          <Field label="VIN / Chassis No." icon="tag">
            <input
              value={form.vin}
              onChange={set("vin")}
              placeholder="e.g. JTFBT22P100123456"
              className={`${inputCls()} uppercase font-mono tracking-wider`}
            />
          </Field>

          <Field label="Last Service Date" icon="build">
            <input
              type="date"
              value={form.lastService}
              onChange={set("lastService")}
              className={inputCls()}
            />
          </Field>

          <Field label="Notes" icon="notes">
            <textarea
              value={form.notes}
              onChange={set("notes")}
              placeholder="Any relevant notes about this vehicle..."
              rows={3}
              className={`${inputCls()} resize-none`}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#252525]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && (
              <span className="material-icons animate-spin" style={{ fontSize: "14px" }}>refresh</span>
            )}
            {saving ? "Saving..." : isEdit ? "Save Changes" : "Register Vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-[#252525]">
      <span className="material-icons text-[#e91e8c]" style={{ fontSize: "16px" }}>{icon}</span>
      <span className="text-white text-[12px] font-semibold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Field({ label, icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[#888] text-[11px] font-medium uppercase tracking-wider">
        {icon && (
          <span className="material-icons text-[#555]" style={{ fontSize: "13px" }}>{icon}</span>
        )}
        {label}
      </label>
      {children}
      {error && (
        <span className="text-red-400 text-[11px] flex items-center gap-1">
          <span className="material-icons" style={{ fontSize: "12px" }}>error_outline</span>
          {error}
        </span>
      )}
    </div>
  );
}

const inputCls = (hasError) => `
  w-full bg-[#111] border ${hasError ? "border-red-500 focus:border-red-400" : "border-[#2a2a2a] focus:border-[#e91e8c]"}
  rounded-lg px-3 py-2 text-white text-[13px] outline-none
  transition-colors duration-150 placeholder:text-[#444] font-[inherit]
`;