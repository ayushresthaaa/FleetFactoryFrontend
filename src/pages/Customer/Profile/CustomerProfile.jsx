import { useEffect, useState } from "react";
import {
  getMyCustomerProfile,
  updateMyCustomerProfile,
  addMyVehicle,
  updateMyVehicle,
  deleteMyVehicle,
} from "../../../api/api";
import { useNavigate } from "react-router-dom";
const emptyVehicle = {
  vehicleNumber: "",
  make: "",
  model: "",
  year: "",
};

export default function CustomerProfile() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();
  const refetch = () => setRefresh((r) => r + 1);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyCustomerProfile();
        const data = res.data?.data || res.data;

        if (cancelled) return;

        setProfile(data);
        setProfileForm({
          fullName: data?.fullName || "",
          phone: data?.phone || "",
          address: data?.address || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load profile.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!profileForm.fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      await updateMyCustomerProfile({
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        address: profileForm.address.trim(),
      });

      setSuccess("Profile updated successfully.");
      refetch();
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!vehicleForm.vehicleNumber.trim()) {
      setError("Vehicle number is required.");
      return;
    }

    const payload = {
      vehicleNumber: vehicleForm.vehicleNumber.trim(),
      make: vehicleForm.make.trim(),
      model: vehicleForm.model.trim(),
      year: vehicleForm.year ? Number(vehicleForm.year) : null,
    };

    try {
      setSavingVehicle(true);

      if (editingVehicle) {
        await updateMyVehicle(editingVehicle.id, payload);
        setSuccess("Vehicle updated successfully.");
      } else {
        await addMyVehicle(payload);
        setSuccess("Vehicle added successfully.");
      }

      setVehicleForm(emptyVehicle);
      setEditingVehicle(null);
      refetch();
    } catch (err) {
      setError(err.message || "Failed to save vehicle.");
    } finally {
      setSavingVehicle(false);
    }
  };

  const startEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      vehicleNumber: vehicle.vehicleNumber || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
    });
  };

  const handleDeleteVehicle = async (id) => {
    try {
      await deleteMyVehicle(id);
      setDeleteId(null);
      setSuccess("Vehicle deleted successfully.");
      refetch();
    } catch (err) {
      setError(err.message || "Failed to delete vehicle.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <span className="material-icons text-[#e91e8c] animate-spin">
          refresh
        </span>
        <span className="text-[#555] text-[13px]">Loading profile...</span>
      </div>
    );
  }

  const vehicles = profile?.vehicles || [];

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-white text-2xl font-bold m-0">My Profile</h1>

            <p className="text-[#777] text-sm mt-2 leading-6">
              Manage your customer profile and registered vehicles used for
              appointments and part requests.
            </p>
          </div>

          <button
            onClick={() => navigate("/customer/account/settings")}
            className="
      h-fit px-4 py-2 rounded-lg
      bg-[#111] border border-[#2a2a2a]
      text-[#ccc] text-sm
      hover:border-[#e91e8c]
      hover:text-white
      transition-colors
    "
          >
            Account Settings
          </button>
        </div>
      </section>

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

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Vehicles"
          value={vehicles.length}
          icon="directions_car"
          color="#e91e8c"
        />
        <StatCard
          label="Credit Balance"
          value={`Rs. ${profile?.creditBalance || 0}`}
          icon="account_balance_wallet"
          color="#f59e0b"
        />
        <StatCard
          label="Customer ID"
          value="Active"
          icon="verified_user"
          color="#22c55e"
        />
      </div>

      <section className="grid grid-cols-[1fr_360px] gap-5">
        <form
          onSubmit={handleProfileSubmit}
          className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-white text-base font-semibold m-0">
              Profile Information
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Update your contact and address information.
            </p>
          </div>

          <Field label="Full Name *" icon="badge">
            <input
              required
              value={profileForm.fullName}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, fullName: e.target.value }))
              }
              className={inputCls}
            />
          </Field>

          <Field label="Phone" icon="phone">
            <input
              value={profileForm.phone}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, phone: e.target.value }))
              }
              className={inputCls}
            />
          </Field>

          <Field label="Address" icon="location_on">
            <textarea
              rows={4}
              value={profileForm.address}
              onChange={(e) =>
                setProfileForm((p) => ({ ...p, address: e.target.value }))
              }
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex justify-end">
            <button
              disabled={savingProfile}
              className="bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg border-none disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handleVehicleSubmit}
          className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex flex-col gap-4 h-fit"
        >
          <div>
            <h2 className="text-white text-base font-semibold m-0">
              {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Register vehicles for appointments.
            </p>
          </div>

          <Field label="Vehicle Number *" icon="directions_car">
            <input
              required
              value={vehicleForm.vehicleNumber}
              onChange={(e) =>
                setVehicleForm((p) => ({ ...p, vehicleNumber: e.target.value }))
              }
              className={inputCls}
              placeholder="BA 12 PA 1234"
            />
          </Field>

          <Field label="Make" icon="factory">
            <input
              value={vehicleForm.make}
              onChange={(e) =>
                setVehicleForm((p) => ({ ...p, make: e.target.value }))
              }
              className={inputCls}
              placeholder="Toyota"
            />
          </Field>

          <Field label="Model" icon="build">
            <input
              value={vehicleForm.model}
              onChange={(e) =>
                setVehicleForm((p) => ({ ...p, model: e.target.value }))
              }
              className={inputCls}
              placeholder="Corolla"
            />
          </Field>

          <Field label="Year" icon="calendar_today">
            <input
              type="number"
              value={vehicleForm.year}
              onChange={(e) =>
                setVehicleForm((p) => ({ ...p, year: e.target.value }))
              }
              className={inputCls}
              placeholder="2020"
            />
          </Field>

          <div className="flex justify-end gap-2">
            {editingVehicle && (
              <button
                type="button"
                onClick={() => {
                  setEditingVehicle(null);
                  setVehicleForm(emptyVehicle);
                }}
                className="px-4 py-2 rounded-lg bg-transparent border border-[#333] text-[#888] text-sm"
              >
                Cancel
              </button>
            )}

            <button
              disabled={savingVehicle}
              className="bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2 rounded-lg border-none disabled:opacity-50"
            >
              {savingVehicle ? "Saving..." : editingVehicle ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </section>

      <section className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Registered Vehicles
          </h3>
          <span className="text-[#555] text-[12px]">
            {vehicles.length} total
          </span>
        </div>

        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "42px" }}
            >
              directions_car
            </span>
            <p className="text-[#555] text-[13px] m-0">
              No vehicles added yet.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#252525]">
                {["Vehicle Number", "Make", "Model", "Year", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody>
              {vehicles.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f]"
                >
                  <td className="px-5 py-3 text-white text-[13px] font-semibold">
                    {v.vehicleNumber}
                  </td>
                  <td className="px-5 py-3 text-[#888] text-[13px]">
                    {v.make || "—"}
                  </td>
                  <td className="px-5 py-3 text-[#888] text-[13px]">
                    {v.model || "—"}
                  </td>
                  <td className="px-5 py-3 text-[#888] text-[13px]">
                    {v.year || "—"}
                  </td>
                  <td className="px-5 py-3">
                    {deleteId === v.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 text-[11px]">
                          Delete?
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteVehicle(v.id)}
                          className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(null)}
                          className="text-[11px] text-[#555] bg-transparent border-none"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditVehicle(v)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-[#e91e8c] hover:bg-[rgba(233,30,140,0.08)] bg-transparent border-none"
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "16px" }}
                          >
                            edit
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteId(v.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 bg-transparent border-none"
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "16px" }}
                          >
                            delete
                          </span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{
        background: color + "18",
        border: `1px solid ${color}30`,
      }}
    >
      <span className="material-icons" style={{ fontSize: "20px", color }}>
        {icon}
      </span>
    </div>

    <div>
      <div className="text-white text-xl font-bold leading-tight">{value}</div>
      <div className="text-[#555] text-[11px] font-medium">{label}</div>
    </div>
  </div>
);

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;
