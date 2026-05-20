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
    <div className="flex flex-col gap-5">
      <div>
        <button
          onClick={() => navigate("/customer/appointments")}
          className="mb-3 flex items-center gap-1 text-[#888] hover:text-[#e91e8c] bg-transparent border-none cursor-pointer text-[13px] p-0"
        >
          <span className="material-icons" style={{ fontSize: "16px" }}>
            arrow_back
          </span>
          Back to Appointments
        </button>

        <h1 className="text-white text-2xl font-bold m-0">
          Appointment History
        </h1>

        <p className="text-[#666] text-sm mt-1">
          View your previous service appointments and leave reviews for
          completed services.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
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

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div>
          <button
            onClick={() => navigate("/customer/appointments")}
            className="mb-3 flex items-center gap-1 text-[#888] hover:text-[#e91e8c] bg-transparent border-none cursor-pointer text-[13px] p-0"
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>
              arrow_back
            </span>
            Back to Appointments
          </button>

          <h1 className="text-white text-2xl font-bold m-0">
            Appointment History
          </h1>

          <p className="text-[#666] text-sm mt-1">
            View your previous service appointments and leave reviews for
            completed services.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>

            <span className="text-[#555] text-[13px]">
              Loading appointment history...
            </span>
          </div>
        ) : error ? (
          <div className="p-5">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              history
            </span>

            <p className="text-[#555] text-[13px] m-0">
              No appointment history found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Vehicle",
                    "Appointment Date",
                    "Status",
                    "Notes",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-5 py-3"
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
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="text-white text-[13px] font-medium">
                          {appointment.vehicleNumber || "No vehicle"}
                        </div>

                        <div className="text-[#555] text-[11px]">
                          Service appointment
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px]">
                        {formatDate(appointment.scheduledAt)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            STATUS_STYLE[status] ?? "bg-[#333] text-[#888]"
                          }`}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "12px" }}
                          >
                            {STATUS_ICON[status] ?? "help"}
                          </span>

                          {status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[#666] text-[12px] max-w-[280px] truncate">
                        {appointment.notes || "No notes"}
                      </td>

                      <td className="px-5 py-3.5">
                        {status === "Completed" ? (
                          <button
                            onClick={() =>
                              navigate(
                                `/customer/reviews/create?appointmentId=${id}`,
                              )
                            }
                            className="h-8 px-3 flex items-center gap-1 rounded-lg text-[12px] text-[#e91e8c] hover:bg-[#e91e8c]/10 transition-colors cursor-pointer bg-transparent border border-[#e91e8c]/20"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "14px" }}
                            >
                              rate_review
                            </span>
                            Review
                          </button>
                        ) : (
                          <span className="text-[#555] text-[12px]">
                            No action
                          </span>
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
