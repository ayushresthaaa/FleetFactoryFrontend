import { useEffect, useState } from "react";
import {
  createMyPartRequest,
  getMyCustomerProfile,
  searchParts,
} from "../../../api/api";
import { useNavigate } from "react-router-dom";

const REQUEST_THRESHOLD = 10;

export default function CreatePartRequest() {
  const [form, setForm] = useState({
    vehicleId: "",
    description: "",
    manualPartName: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [parts, setParts] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
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

  const handleSearch = async () => {
    setSuccess("");
    setError("");
    setSelectedPart(null);
    setManualMode(false);

    if (!keyword.trim()) {
      setError("Please enter a part name to search.");
      return;
    }

    setSearchLoading(true);

    try {
      const res = await searchParts(keyword.trim(), 1, 10);
      const data = res.data?.data || res.data;
      setParts(data?.items || data || []);
    } catch {
      setError("Failed to search parts.");
      setParts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getAvailabilityText = (part) => {
    if (part.stockQty <= 0) return "Currently unavailable";
    if (part.stockQty < REQUEST_THRESHOLD) return "Limited availability";
    return "Available";
  };

  const canRequest = (part) => part.stockQty < REQUEST_THRESHOLD;

  const handleSelectPart = (part) => {
    setSelectedPart(part);
    setManualMode(false);
    setForm((prev) => ({ ...prev, manualPartName: "" }));
  };

  const handleManualMode = () => {
    setSelectedPart(null);
    setManualMode(true);
    setParts([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!selectedPart && !manualMode) {
      setError("Please search and select a part, or use manual request.");
      return;
    }

    if (manualMode && !form.manualPartName.trim()) {
      setError("Please enter the part name.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        vehicleId: form.vehicleId || null,
        description: form.description.trim(),
      };

      if (selectedPart) {
        payload.partId = selectedPart.id;
      } else {
        payload.partName = form.manualPartName.trim();
      }

      await createMyPartRequest(payload);

      setSuccess("Request submitted successfully.");

      setTimeout(() => {
        navigate("/customer/part-requests");
      }, 1000);
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
        <h1 className="text-white text-2xl font-bold m-0">
          Request Unavailable Part
        </h1>
        <p className="text-[#777] text-sm mt-2 leading-6">
          Search for a part first. If it is unavailable or limited, you can
          request it.
        </p>
      </section>

      <section className="grid grid-cols-[1fr_340px] gap-5">
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex flex-col gap-4"
        >
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

          <Field label="Search Part" icon="search">
            <div className="flex gap-2">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Example: brake pad, headlight, clutch plate..."
                className={inputCls}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searchLoading}
                className="bg-[#e91e8c] text-white px-4 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </Field>

          {parts.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {parts.map((part) => {
                const requestAllowed = canRequest(part);

                return (
                  <div
                    key={part.id}
                    className={`bg-[#111] border rounded-xl p-3 flex gap-3 ${
                      selectedPart?.id === part.id
                        ? "border-[#e91e8c]"
                        : "border-[#252525]"
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-[#1f1f1f] overflow-hidden flex items-center justify-center shrink-0">
                      {part.imageUrl ? (
                        <img
                          src={part.imageUrl}
                          alt={part.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-icons text-[#444]">
                          inventory_2
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-white text-sm font-semibold m-0">
                        {part.name}
                      </h3>
                      <p className="text-[#666] text-xs mt-1">
                        {part.categoryName || "No category"} • Rs.{" "}
                        {part.unitPrice}
                      </p>

                      <span
                        className={`inline-flex mt-2 text-[11px] px-2 py-1 rounded-full ${
                          requestAllowed
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-green-500/15 text-green-400"
                        }`}
                      >
                        {getAvailabilityText(part)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!requestAllowed}
                      onClick={() => handleSelectPart(part)}
                      className="h-fit bg-[#e91e8c] text-white text-xs font-semibold px-3 py-2 rounded-lg disabled:bg-[#333] disabled:text-[#777]"
                    >
                      {requestAllowed ? "Select" : "Available"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleManualMode}
            className="text-[#e91e8c] text-sm font-medium w-fit bg-transparent border-none cursor-pointer"
          >
            Can’t find your part? Request manually
          </button>

          {manualMode && (
            <Field label="Manual Part Name" icon="build">
              <input
                name="manualPartName"
                value={form.manualPartName}
                onChange={handleChange}
                placeholder="Enter the part name..."
                className={inputCls}
              />
            </Field>
          )}

          {selectedPart && (
            <div className="bg-[#111] border border-[#e91e8c]/40 rounded-lg px-3 py-2 text-sm text-white">
              Selected Part:{" "}
              <span className="text-[#e91e8c] font-semibold">
                {selectedPart.name}
              </span>
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
                {profileLoading
                  ? "Loading vehicles..."
                  : "Select vehicle optional"}
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

          <Field label="Description" icon="description">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue or extra details..."
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || profileLoading}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 border-none disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>

        <aside className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit">
          <h3 className="text-white text-sm font-semibold mb-4">
            Request Info
          </h3>

          <Info
            icon="search"
            title="Search First"
            text="Search existing inventory before creating a request."
          />
          <Info
            icon="inventory_2"
            title="Limited or Unavailable"
            text="Only limited or unavailable parts can be requested."
          />
          <Info
            icon="edit"
            title="Manual Request"
            text="If the part is not listed, you can request it manually."
          />
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

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;
