import { useEffect, useState } from "react";
import { createMyPartRequest, getMyCustomerProfile } from "../../../api/api";

export default function CreatePartRequest() {
  const [form, setForm] = useState({
    vehicleId: "",
    partName: "",
    description: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyCustomerProfile();
        const profile = res.data?.data || res.data;
        setVehicles(profile?.vehicles || []);
      } catch {
        setError("Failed to load your vehicles.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!form.partName.trim()) {
      setError("Please enter the part name.");
      return;
    }

    setLoading(true);

    try {
      await createMyPartRequest({
        vehicleId: form.vehicleId || null,
        partName: form.partName.trim(),
        description: form.description.trim(),
      });

      setSuccess("Part request submitted successfully.");
      setForm({ vehicleId: "", partName: "", description: "" });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to submit part request.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-8">
        <div className="max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center mb-4">
            <span className="material-icons text-[#e91e8c]" style={{ fontSize: "28px" }}>
              inventory_2
            </span>
          </div>

          <h1 className="text-white text-2xl font-bold m-0">
            Request Unavailable Part
          </h1>

          <p className="text-[#777] text-sm mt-2 leading-6">
            Request a vehicle part that is not currently available. Staff will review it and update the status.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-[1fr_340px] gap-5">
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-white text-base font-semibold m-0">
              Part Request Form
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Fill in the part details below.
            </p>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-3 py-2">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <Field label="Select Vehicle" icon="directions_car">
            <select
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              disabled={profileLoading}
              className={inputCls}
            >
              <option value="">
                {profileLoading ? "Loading vehicles..." : "Select vehicle optional"}
              </option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicleNumber}
                  {vehicle.make || vehicle.model
                    ? ` - ${vehicle.make || ""} ${vehicle.model || ""}`
                    : ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Part Name *" icon="build">
            <input
              required
              name="partName"
              value={form.partName}
              onChange={handleChange}
              placeholder="Example: Toyota brake pad, headlight, clutch plate..."
              className={inputCls}
            />
          </Field>

          <Field label="Description" icon="description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the part, vehicle model, issue, or any extra details..."
              rows={6}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || profileLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity border-none disabled:opacity-50"
            >
              {loading && (
                <span className="material-icons animate-spin" style={{ fontSize: "17px" }}>
                  refresh
                </span>
              )}
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        <aside className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit">
          <h3 className="text-white text-sm font-semibold mb-4">
            Request Info
          </h3>

          <Info icon="schedule" title="Pending Review" text="Staff will review your request first." />
          <Info icon="check_circle" title="Sourced" text="If available, staff will mark it as sourced." />
          <Info icon="cancel" title="Rejected" text="If unavailable, staff may reject with a note." />
        </aside>
      </section>
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

const Info = ({ icon, title, text }) => (
  <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-3 mb-3">
    <div className="flex items-center gap-2">
      <span className="material-icons text-[#e91e8c]" style={{ fontSize: "17px" }}>
        {icon}
      </span>
      <span className="text-white text-sm font-medium">{title}</span>
    </div>
    <p className="text-[#666] text-xs leading-5 mt-2 mb-0">{text}</p>
  </div>
);

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;