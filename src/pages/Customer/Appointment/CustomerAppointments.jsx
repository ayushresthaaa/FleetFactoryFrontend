import { useEffect, useState } from "react";
import { createMyAppointment, getMyCustomerProfile } from "../../../api/api";

export default function CustomerAppointments() {
  const [form, setForm] = useState({
    vehicleId: "",
    scheduledAt: "",
    notes: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyCustomerProfile();
        const profile = res.data?.data || res.data;

        setVehicles(profile?.vehicles || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load your vehicles.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!form.vehicleId) {
      setError("Please select a vehicle.");
      return;
    }

    setLoading(true);

    try {
      await createMyAppointment({
        vehicleId: form.vehicleId,
        scheduledAt: form.scheduledAt,
        notes: form.notes.trim(),
      });

      setSuccess("Appointment request submitted successfully.");
      setForm({
        vehicleId: "",
        scheduledAt: "",
        notes: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Failed to submit appointment request.",
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
            <span
              className="material-icons text-[#e91e8c]"
              style={{ fontSize: "28px" }}
            >
              event
            </span>
          </div>

          <h1 className="text-white text-2xl font-bold m-0">
            Book an Appointment
          </h1>

          <p className="text-[#777] text-sm mt-2 leading-6">
            Request a service appointment for your registered vehicle. Staff
            will review your request and confirm the schedule.
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
              Appointment Request
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Fill in the appointment details below.
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

          <Field label="Select Vehicle *" icon="directions_car">
            <select
              required
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              disabled={profileLoading}
              className={inputCls}
            >
              <option value="">
                {profileLoading ? "Loading vehicles..." : "Select your vehicle"}
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

            {!profileLoading && vehicles.length === 0 && (
              <p className="text-red-400 text-[11px] mt-1">
                No vehicle found. Please add a vehicle in your profile first.
              </p>
            )}
          </Field>

          <Field label="Preferred Date & Time *" icon="calendar_today">
            <input
              required
              type="datetime-local"
              name="scheduledAt"
              value={form.scheduledAt}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>

          <Field label="Issue Description *" icon="description">
            <textarea
              required
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Example: Brake noise, engine issue, regular servicing..."
              rows={6}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || profileLoading || vehicles.length === 0}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity border-none disabled:opacity-50"
            >
              {loading && (
                <span
                  className="material-icons animate-spin"
                  style={{ fontSize: "17px" }}
                >
                  refresh
                </span>
              )}
              {loading ? "Submitting..." : "Submit Appointment"}
            </button>
          </div>
        </form>

        <aside className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit">
          <h3 className="text-white text-sm font-semibold mb-4">
            Appointment Info
          </h3>

          <Info
            icon="schedule"
            title="Pending Review"
            text="Your appointment request will be reviewed by staff."
          />

          <Info
            icon="event_available"
            title="Confirmation"
            text="Staff will confirm the appointment after checking availability."
          />

          <Info
            icon="build"
            title="Service Details"
            text="Describe the issue clearly so staff can prepare properly."
          />
        </aside>
      </section>

      <section className="grid grid-cols-2 gap-5">
        <PlaceholderCard title="Upcoming Appointments" icon="event_available" />
        <PlaceholderCard title="Appointment History" icon="history" />
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
      <span
        className="material-icons text-[#e91e8c]"
        style={{ fontSize: "17px" }}
      >
        {icon}
      </span>
      <span className="text-white text-sm font-medium">{title}</span>
    </div>
    <p className="text-[#666] text-xs leading-5 mt-2 mb-0">{text}</p>
  </div>
);

const PlaceholderCard = ({ title, icon }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl bg-[#111] border border-[#252525] flex items-center justify-center">
      <span className="material-icons text-[#555]" style={{ fontSize: "22px" }}>
        {icon}
      </span>
    </div>

    <div>
      <h3 className="text-white text-sm font-semibold m-0">{title}</h3>
      <p className="text-[#555] text-xs mt-1 mb-0">
        This section will be connected later.
      </p>
    </div>
  </div>
);

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;
