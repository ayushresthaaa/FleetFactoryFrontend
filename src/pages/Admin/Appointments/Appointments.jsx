import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAppointments,
  searchAppointments,
  confirmAppointment,
  cancelAppointment,
} from "../../../api/api";

const STATUS_STYLE = {
  Pending: "bg-yellow-500/15 text-yellow-400",
  Confirmed: "bg-blue-500/15 text-blue-400",
  Completed: "bg-green-500/15 text-green-400",
  Cancelled: "bg-red-500/15 text-red-400",
};

const STATUS_ICON = {
  Pending: "schedule",
  Confirmed: "event_available",
  Completed: "check_circle",
  Cancelled: "cancel",
};

const STATUS_ENUM = {
  Pending: 0,
  Confirmed: 1,
  Completed: 2,
  Cancelled: 3,
};

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString();
};

export default function Appointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [cancelModal, setCancelModal] = useState({
    open: false,
    appointmentId: null,
  });

  const [cancelReason, setCancelReason] = useState("");

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        let res;

        if (!search.trim() && statusFilter === "all") {
          res = await getAppointments(pageNumber, pageSize);
        } else {
          const status =
            statusFilter === "all" ? null : (STATUS_ENUM[statusFilter] ?? null);

          res = await searchAppointments({
            query: search.trim(),
            status,
            pageNumber,
            pageSize,
          });
        }

        if (cancelled) return;

        const data = res.data?.data;

        setAppointments(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
      } catch {
        if (!cancelled) {
          setAppointments([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, refresh, search, statusFilter]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleConfirm = async (id) => {
    setActionLoadingId(id + "_confirm");

    try {
      await confirmAppointment(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal.appointmentId) return;

    setActionLoadingId(cancelModal.appointmentId + "_cancel");

    try {
      await cancelAppointment(cancelModal.appointmentId, {
        reason: cancelReason,
      });

      setCancelModal({
        open: false,
        appointmentId: null,
      });

      setCancelReason("");

      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const pendingCount = appointments.filter(
    (a) => a.status === "Pending",
  ).length;

  const confirmedCount = appointments.filter(
    (a) => a.status === "Confirmed",
  ).length;

  const completedCount = appointments.filter(
    (a) => a.status === "Completed",
  ).length;

  const cancelledCount = appointments.filter(
    (a) => a.status === "Cancelled",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-[340px]">
            <span
              className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
              style={{ fontSize: "18px" }}
            >
              search
            </span>

            <input
              type="text"
              placeholder="Search customer, vehicle..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>

          {["all", "Pending", "Confirmed", "Completed", "Cancelled"].map(
            (s) => (
              <FilterBtn
                key={s}
                active={statusFilter === s}
                onClick={() => {
                  setStatusFilter(s);
                  setPageNumber(1);
                }}
              >
                {s === "all" ? "All" : s}
              </FilterBtn>
            ),
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Pending",
            value: pendingCount,
            icon: "schedule",
            color: "#f59e0b",
          },
          {
            label: "Confirmed",
            value: confirmedCount,
            icon: "event_available",
            color: "#3b82f6",
          },
          {
            label: "Completed",
            value: completedCount,
            icon: "check_circle",
            color: "#22c55e",
          },
          {
            label: "Cancelled",
            value: cancelledCount,
            icon: "cancel",
            color: "#ef4444",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: s.color + "18",
                border: `1px solid ${s.color}30`,
              }}
            >
              <span
                className="material-icons"
                style={{ fontSize: "20px", color: s.color }}
              >
                {s.icon}
              </span>
            </div>

            <div>
              <div className="text-white text-xl font-bold leading-tight">
                {s.value}
              </div>

              <div className="text-[#555] text-[11px] font-medium">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Appointments
          </h3>

          <span className="text-[#555] text-[12px]">{totalCount} total</span>
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
              Loading appointments...
            </span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              event_busy
            </span>

            <p className="text-[#555] text-[13px] m-0">
              No appointments found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Customer",
                    "Vehicle",
                    "Scheduled",
                    "Issue",
                    "Status",
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
                  const id = appointment.id;

                  const isConfirmLoading = actionLoadingId === id + "_confirm";

                  const isCancelLoading = actionLoadingId === id + "_cancel";

                  const anyLoading = isConfirmLoading || isCancelLoading;

                  return (
                    <tr
                      key={id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="text-white text-[13px] font-medium">
                          {appointment.customerName || "Unknown"}
                        </div>

                        <div className="text-[#555] text-[11px]">
                          {appointment.customerPhone || ""}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px]">
                        {appointment.vehicleNumber || "—"}
                      </td>

                      <td className="px-5 py-3.5 text-[#555] text-[12px]">
                        {formatDate(appointment.scheduledAt)}
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px] max-w-[240px] truncate">
                        {appointment.issueDescription || "No issue"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            STATUS_STYLE[appointment.status] ??
                            "bg-[#333] text-[#888]"
                          }`}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "12px" }}
                          >
                            {STATUS_ICON[appointment.status] ?? "help"}
                          </span>

                          {appointment.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button
                            onClick={() =>
                              navigate(`/admin/appointments/${id}`)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
                            title="View details"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "16px" }}
                            >
                              visibility
                            </span>
                          </button>

                          {/* Confirm */}
                          {appointment.status === "Pending" && (
                            <button
                              onClick={() => handleConfirm(id)}
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer bg-transparent border border-blue-500/20 disabled:opacity-50"
                            >
                              {isConfirmLoading ? "..." : "Confirm"}
                            </button>
                          )}

                          {/* Cancel */}
                          {(appointment.status === "Pending" ||
                            appointment.status === "Confirmed") && (
                            <button
                              onClick={() =>
                                setCancelModal({
                                  open: true,
                                  appointmentId: id,
                                })
                              }
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border border-red-500/20 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#252525]">
            <span className="text-[#555] text-[12px]">
              Showing {(pageNumber - 1) * pageSize + 1}–
              {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
            </span>

            <div className="flex items-center gap-1">
              <PageBtn
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>
                  chevron_left
                </span>
              </PageBtn>

              <PageBtn
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>
                  chevron_right
                </span>
              </PageBtn>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
              <div>
                <h2 className="text-white text-[15px] font-semibold">
                  Cancel Appointment
                </h2>

                <p className="text-[#555] text-[11px]">
                  Provide cancellation reason
                </p>
              </div>

              <button
                onClick={() =>
                  setCancelModal({
                    open: false,
                    appointmentId: null,
                  })
                }
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors bg-transparent border-none"
              >
                <span className="material-icons" style={{ fontSize: "18px" }}>
                  close
                </span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-[13px] outline-none focus:border-[#e91e8c] resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setCancelModal({
                      open: false,
                      appointmentId: null,
                    })
                  }
                  className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors bg-transparent"
                >
                  Close
                </button>

                <button
                  onClick={handleCancel}
                  disabled={
                    actionLoadingId === cancelModal.appointmentId + "_cancel"
                  }
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-[13px] font-semibold hover:opacity-90 transition-opacity border-none disabled:opacity-50"
                >
                  {actionLoadingId === cancelModal.appointmentId + "_cancel"
                    ? "Cancelling..."
                    : "Cancel Appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterBtn = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg border text-[12px] font-medium cursor-pointer transition-colors ${
      active
        ? "bg-[#e91e8c] border-[#e91e8c] text-white"
        : "bg-[#1a1a1a] border-[#252525] text-[#888] hover:text-white hover:border-[#444]"
    }`}
  >
    {children}
  </button>
);

const PageBtn = ({ children, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium cursor-pointer border transition-colors bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);
