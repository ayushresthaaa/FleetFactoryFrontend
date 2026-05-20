import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyAppointmentHistory } from "../../../api/api";

const STATUS_STYLE = {
  Completed: "bg-green-500/15 text-green-400",
  Cancelled: "bg-red-500/15 text-red-400",
  Pending: "bg-yellow-500/15 text-yellow-400",
  Confirmed: "bg-blue-500/15 text-blue-400",
};

const STATUS_ICON = {
  Completed: "check_circle",
  Cancelled: "cancel",
  Pending: "schedule",
  Confirmed: "event_available",
};

export default function AppointmentHistory() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyAppointmentHistory();
        const data = res.data?.data || res.data;

        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.message ||
            err?.response?.data?.message ||
            "Failed to load appointment history.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const completedCount = appointments.filter(
    (a) => a.status === "Completed",
  ).length;

  const cancelledCount = appointments.filter(
    (a) => a.status === "Cancelled",
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
      {/* HEADER */}
      <div>
        <button
          onClick={() => navigate("/customer/appointments")}
          className="mb-4 flex items-center gap-1 text-[#888] hover:text-[#e91e8c] bg-transparent border-none cursor-pointer text-sm p-0"
        >
          <span className="material-icons text-[18px]">arrow_back</span>
          Back to Appointments
        </button>

        <h1 className="text-white text-4xl font-bold">Appointment History</h1>

        <p className="text-[#777] text-[15px] mt-2">
          View your previous service appointments and leave reviews for
          completed services.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatCard
          label="Completed"
          value={completedCount}
          icon="check_circle"
          color="#22c55e"
        />

        <StatCard
          label="Cancelled"
          value={cancelledCount}
          icon="cancel"
          color="#ef4444"
        />
      </div>

      {/* TABLE CARD */}
      <div className="bg-[#161616] border border-[#252525] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "24px" }}
            >
              refresh
            </span>

            <span className="text-[#666] text-sm">
              Loading appointment history...
            </span>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "48px" }}
            >
              history
            </span>

            <p className="text-[#555] text-sm m-0">
              No appointment history found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525] bg-[#1b1b1b]">
                  {[
                    "Vehicle",
                    "Appointment Date",
                    "Status",
                    "Notes",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#666] text-xs font-semibold uppercase tracking-wider px-8 py-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {appointments.map((appointment) => {
                  const id = appointment.appointmentId;
                  const status = appointment.status || "Pending";

                  return (
                    <tr
                      key={id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1c1c1c] transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="text-white text-[15px] font-semibold">
                          {appointment.vehicleNumber || "No vehicle"}
                        </div>

                        <div className="text-[#666] text-xs mt-1">
                          Service appointment
                        </div>
                      </td>

                      <td className="px-8 py-6 text-[#bbb] text-[14px] whitespace-nowrap">
                        {formatDate(appointment.scheduledAt)}
                      </td>

                      <td className="px-8 py-6">
                        <span
                          className={`flex items-center gap-1.5 w-fit text-xs font-semibold px-3 py-1.5 rounded-full ${
                            STATUS_STYLE[status] ?? "bg-[#333] text-[#888]"
                          }`}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "14px" }}
                          >
                            {STATUS_ICON[status] ?? "help"}
                          </span>

                          {status}
                        </span>
                      </td>

                      <td className="px-8 py-6 text-[#777] text-sm max-w-[350px]">
                        {appointment.notes || "No notes"}
                      </td>

                      <td className="px-8 py-6">
                        {status === "Completed" ? (
                          <button className="bg-[#e91e8c] hover:bg-[#ff2b9f] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                            Elligibele for review
                          </button>
                        ) : (
                          <span className="text-[#555] text-sm">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#161616] border border-[#252525] rounded-2xl px-6 py-5 flex items-center gap-4">
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: color + "18",
        border: `1px solid ${color}30`,
      }}
    >
      <span className="material-icons" style={{ fontSize: "24px", color }}>
        {icon}
      </span>
    </div>

    <div>
      <div className="text-white text-3xl font-bold leading-none">{value}</div>

      <div className="text-[#666] text-sm mt-1">{label}</div>
    </div>
  </div>
);

const formatDate = (date) => {
  if (!date) return "No date";

  return new Date(date).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
