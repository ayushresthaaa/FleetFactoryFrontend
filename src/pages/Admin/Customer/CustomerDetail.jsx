import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addVehicle, getCustomerHistory } from "../../../api/api";

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleString();
};

const statusStyle = (status) => {
  if (status === "Paid" || status === "Completed")
    return "bg-green-500/15 text-green-400";
  if (status === "Pending") return "bg-yellow-500/15 text-yellow-400";
  if (status === "Confirmed") return "bg-blue-500/15 text-blue-400";
  if (status === "Overdue") return "bg-orange-500/15 text-orange-400";
  if (status === "Cancelled") return "bg-red-500/15 text-red-400";
  return "bg-[#333] text-[#888]";
};

const emptyVehicle = {
  vehicleNumber: "",
  make: "",
  model: "",
  year: "",
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);

  const [loading, setLoading] = useState(true);
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const [error, setError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [success, setSuccess] = useState("");

  const refetch = () => setRefresh((r) => r + 1);

  useEffect(() => {
    let cancelled = false;

    const loadCustomer = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getCustomerHistory(id);

        if (cancelled) return;

        setCustomer(res.data?.data ?? null);
      } catch (err) {
        if (cancelled) return;

        setCustomer(null);
        setError(err.message || "Failed to load customer details.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomer();

    return () => {
      cancelled = true;
    };
  }, [id, refresh]);

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;

    setVehicleForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setVehicleError("");
    setSuccess("");

    if (!vehicleForm.vehicleNumber.trim()) {
      setVehicleError("Vehicle number is required.");
      return;
    }

    try {
      setVehicleLoading(true);

      await addVehicle(id, {
        vehicleNumber: vehicleForm.vehicleNumber.trim(),
        make: vehicleForm.make.trim() || null,
        model: vehicleForm.model.trim() || null,
        year: vehicleForm.year ? Number(vehicleForm.year) : null,
      });

      setSuccess("Vehicle added successfully.");
      setVehicleForm(emptyVehicle);
      setShowVehicleForm(false);
      refetch();
    } catch (err) {
      setVehicleError(err.message || "Failed to add vehicle.");
    } finally {
      setVehicleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <span
          className="material-icons text-[#e91e8c] animate-spin"
          style={{ fontSize: "22px" }}
        >
          refresh
        </span>
        <span className="text-[#555] text-[13px]">
          Loading customer details...
        </span>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-8 flex flex-col items-center gap-3">
        <span
          className="material-icons text-[#333]"
          style={{ fontSize: "44px" }}
        >
          person_off
        </span>

        <p className="text-red-400 text-sm">{error || "Customer not found."}</p>

        <button
          onClick={() => navigate("/admin/customers")}
          className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold border-none"
        >
          Back to customers
        </button>
      </div>
    );
  }

  const vehicles = customer.vehicles ?? [];
  const purchaseHistory = customer.purchaseHistory ?? [];
  const appointmentHistory = customer.appointmentHistory ?? [];

  const totalSpent = purchaseHistory.reduce(
    (sum, item) => sum + Number(item.totalAmount ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-xl font-bold m-0">
              {customer.fullName}
            </h1>

            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#252525] text-[#aaa]">
              Customer
            </span>
          </div>

          <p className="text-[#777] text-sm mt-1">
            Customer ID: {customer.customerId}
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/customers")}
          className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-white bg-transparent text-sm"
        >
          Back
        </button>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Vehicles"
          value={vehicles.length}
          icon="directions_car"
          color="#3b82f6"
        />

        <StatCard
          label="Purchases"
          value={purchaseHistory.length}
          icon="receipt_long"
          color="#e91e8c"
        />

        <StatCard
          label="Appointments"
          value={appointmentHistory.length}
          icon="event_available"
          color="#22c55e"
        />

        <StatCard
          label="Total Spent"
          value={money(totalSpent)}
          icon="payments"
          color="#f59e0b"
        />
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-5">
          <Section title="Customer Information">
            <div className="grid grid-cols-3 gap-3">
              <Info label="Full Name" value={customer.fullName || "—"} />
              <Info label="Phone" value={customer.phone || "—"} />
              <Info
                label="Credit Balance"
                value={money(customer.creditBalance)}
              />
            </div>

            <Info label="Address" value={customer.address || "—"} />
          </Section>

          <Section
            title="Registered Vehicles"
            action={
              <button
                onClick={() => setShowVehicleForm((v) => !v)}
                className="px-3 py-1.5 rounded-lg bg-[rgba(233,30,140,0.08)] border border-[rgba(233,30,140,0.18)] text-[#e91e8c] text-[12px] font-medium cursor-pointer"
              >
                {showVehicleForm ? "Cancel" : "Add Vehicle"}
              </button>
            }
          >
            {showVehicleForm && (
              <form
                onSubmit={handleAddVehicle}
                className="bg-[#111] border border-[#252525] rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="grid grid-cols-4 gap-3">
                  <Field label="Vehicle Number *">
                    <input
                      required
                      name="vehicleNumber"
                      value={vehicleForm.vehicleNumber}
                      onChange={handleVehicleChange}
                      className={inputCls}
                      placeholder="BA 1 PA 2345"
                    />
                  </Field>

                  <Field label="Make">
                    <input
                      name="make"
                      value={vehicleForm.make}
                      onChange={handleVehicleChange}
                      className={inputCls}
                      placeholder="Toyota"
                    />
                  </Field>

                  <Field label="Model">
                    <input
                      name="model"
                      value={vehicleForm.model}
                      onChange={handleVehicleChange}
                      className={inputCls}
                      placeholder="Corolla"
                    />
                  </Field>

                  <Field label="Year">
                    <input
                      type="number"
                      name="year"
                      value={vehicleForm.year}
                      onChange={handleVehicleChange}
                      className={inputCls}
                      placeholder="2020"
                    />
                  </Field>
                </div>

                {vehicleError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2">
                    {vehicleError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    disabled={vehicleLoading}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[12px] font-semibold border-none disabled:opacity-50"
                  >
                    {vehicleLoading ? "Saving..." : "Save Vehicle"}
                  </button>
                </div>
              </form>
            )}

            {vehicles.length === 0 ? (
              <EmptyState
                icon="directions_car"
                text="No vehicles registered."
              />
            ) : (
              <div className="border border-[#292929] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      {["Vehicle Number", "Make", "Model", "Year"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {vehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className="border-b border-[#1f1f1f] last:border-b-0"
                      >
                        <td className="px-4 py-3 text-white text-sm font-medium">
                          {vehicle.vehicleNumber}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {vehicle.make || "—"}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {vehicle.model || "—"}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {vehicle.year || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Purchase History">
            {purchaseHistory.length === 0 ? (
              <EmptyState icon="receipt_long" text="No purchase history." />
            ) : (
              <div className="border border-[#292929] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      {[
                        "Invoice No",
                        "Status",
                        "Subtotal",
                        "Discount",
                        "Total",
                        "Created",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {purchaseHistory.map((invoice) => (
                      <tr
                        key={invoice.salesInvoiceId}
                        className="border-b border-[#1f1f1f] last:border-b-0"
                      >
                        <td className="px-4 py-3">
                          <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                            {invoice.invoiceNo}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={invoice.status} />
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {money(invoice.subtotal)}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {Number(invoice.discountPct || 0)}%
                        </td>

                        <td className="px-4 py-3 text-white text-sm font-semibold">
                          {money(invoice.totalAmount)}
                        </td>

                        <td className="px-4 py-3 text-[#555] text-xs">
                          {formatDate(invoice.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Appointment History">
            {appointmentHistory.length === 0 ? (
              <EmptyState icon="event_busy" text="No appointment history." />
            ) : (
              <div className="border border-[#292929] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      {["Vehicle", "Scheduled At", "Status", "Notes"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-4 py-3"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {appointmentHistory.map((appointment) => (
                      <tr
                        key={appointment.appointmentId}
                        className="border-b border-[#1f1f1f] last:border-b-0"
                      >
                        <td className="px-4 py-3 text-white text-sm font-medium">
                          {appointment.vehicleNumber || "—"}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {formatDate(appointment.scheduledAt)}
                        </td>

                        <td className="px-4 py-3">
                          <StatusBadge status={appointment.status} />
                        </td>

                        <td className="px-4 py-3 text-[#666] text-xs max-w-[280px] truncate">
                          {appointment.notes || "No notes"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit sticky top-5">
          <h3 className="text-white text-sm font-semibold mb-4">
            Customer Summary
          </h3>

          <Summary label="Name" value={customer.fullName || "—"} />
          <Summary label="Phone" value={customer.phone || "—"} />
          <Summary label="Vehicles" value={vehicles.length} />
          <Summary label="Invoices" value={purchaseHistory.length} />
          <Summary label="Appointments" value={appointmentHistory.length} />

          <div className="border-t border-[#2a2a2a] mt-3 pt-3">
            <Summary
              label="Credit Balance"
              value={money(customer.creditBalance)}
            />
            <Summary label="Total Spent" value={money(totalSpent)} strong />
          </div>
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, action, children }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h2 className="text-white text-sm font-semibold m-0">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const Info = ({ label, value }) => (
  <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2">
    <div className="text-[#666] text-xs">{label}</div>
    <div className="text-white text-sm font-medium mt-1 break-words">
      {value}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[#888] text-xs font-medium">{label}</label>
    {children}
  </div>
);

const Summary = ({ label, value, strong }) => (
  <div className="flex justify-between py-1.5 gap-4">
    <span className="text-[#777] text-sm">{label}</span>
    <span className={strong ? "text-white font-bold" : "text-[#ddd] text-sm"}>
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => (
  <span
    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle(
      status,
    )}`}
  >
    {status || "Unknown"}
  </span>
);

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-2 border border-[#252525] rounded-xl">
    <span className="material-icons text-[#333]" style={{ fontSize: "34px" }}>
      {icon}
    </span>
    <p className="text-[#555] text-[13px] m-0">{text}</p>
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

const inputCls =
  "w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#e91e8c] placeholder:text-[#444]";
