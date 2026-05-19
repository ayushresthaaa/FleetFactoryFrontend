import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPartRequests,
  searchPartRequests,
  markPartRequestSourced,
  rejectPartRequest,
} from "../../../api/api";

const STATUS_STYLE = {
  Pending: "bg-yellow-500/15 text-yellow-400",
  Sourced: "bg-green-500/15 text-green-400",
  Rejected: "bg-red-500/15 text-red-400",
};

const STATUS_ICON = {
  Pending: "schedule",
  Sourced: "check_circle",
  Rejected: "cancel",
};

const STATUS_ENUM = {
  Pending: 0,
  Sourced: 1,
  Rejected: 2,
};

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
};

export default function PartRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [statusModal, setStatusModal] = useState({
    open: false,
    requestId: null,
    type: "",
  });

  const [note, setNote] = useState("");

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        let res;

        if (!search.trim() && statusFilter === "all") {
          res = await getPartRequests(pageNumber, pageSize);
        } else {
          const status =
            statusFilter === "all" ? null : (STATUS_ENUM[statusFilter] ?? null);

          res = await searchPartRequests({
            query: search.trim(),
            status,
            pageNumber,
            pageSize,
          });
        }

        if (cancelled) return;

        const data = res.data?.data;

        setRequests(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
      } catch {
        if (!cancelled) {
          setRequests([]);
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

  const openStatusModal = (requestId, type) => {
    setStatusModal({
      open: true,
      requestId,
      type,
    });
    setNote("");
  };

  const closeStatusModal = () => {
    setStatusModal({
      open: false,
      requestId: null,
      type: "",
    });
    setNote("");
  };

  const handleStatusUpdate = async () => {
    if (!statusModal.requestId) return;

    const loadingKey =
      statusModal.type === "sourced"
        ? `${statusModal.requestId}_sourced`
        : `${statusModal.requestId}_rejected`;

    setActionLoadingId(loadingKey);

    try {
      const payload = {
        note,
        remarks: note,
        responseNote: note,
      };

      if (statusModal.type === "sourced") {
        await markPartRequestSourced(statusModal.requestId, payload);
      } else {
        await rejectPartRequest(statusModal.requestId, payload);
      }

      closeStatusModal();
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const sourcedCount = requests.filter((r) => r.status === "Sourced").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

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
              placeholder="Search customer, part..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>

          {["all", "Pending", "Sourced", "Rejected"].map((s) => (
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
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Pending",
            value: pendingCount,
            icon: "schedule",
            color: "#f59e0b",
          },
          {
            label: "Sourced",
            value: sourcedCount,
            icon: "check_circle",
            color: "#22c55e",
          },
          {
            label: "Rejected",
            value: rejectedCount,
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
            Part Requests
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
              Loading part requests...
            </span>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              inventory_2
            </span>

            <p className="text-[#555] text-[13px] m-0">
              No part requests found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Customer",
                    "Requested Part",
                    "Vehicle",
                    "Requested Date",
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
                {requests.map((request) => {
                  const id = request.id || request.requestId;
                  const status = request.status || "Pending";

                  const isSourcedLoading = actionLoadingId === id + "_sourced";

                  const isRejectedLoading =
                    actionLoadingId === id + "_rejected";

                  const anyLoading = isSourcedLoading || isRejectedLoading;

                  return (
                    <tr
                      key={id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="text-white text-[13px] font-medium">
                          {request.customerName || "Unknown customer"}
                        </div>

                        <div className="text-[#555] text-[11px]">
                          {request.customerPhone || "No phone"}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="text-white text-[13px] font-medium">
                          {request.partName ||
                            request.requestedPartName ||
                            "No part name"}
                        </div>

                        <div className="text-[#555] text-[11px] max-w-[260px] truncate">
                          {request.description || "No description"}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px]">
                        {request.vehicleNumber || "No vehicle"}
                      </td>

                      <td className="px-5 py-3.5 text-[#555] text-[12px]">
                        {formatDate(request.createdAt || request.requestedAt)}
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

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              navigate(`/admin/part-requests/${id}`)
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

                          {status === "Pending" && (
                            <>
                              <button
                                onClick={() => openStatusModal(id, "sourced")}
                                disabled={anyLoading}
                                className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer bg-transparent border border-green-500/20 disabled:opacity-50"
                              >
                                {isSourcedLoading ? "..." : "Sourced"}
                              </button>

                              <button
                                onClick={() => openStatusModal(id, "rejected")}
                                disabled={anyLoading}
                                className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border border-red-500/20 disabled:opacity-50"
                              >
                                {isRejectedLoading ? "..." : "Reject"}
                              </button>
                            </>
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

      {/* Status Update Modal */}
      {statusModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeStatusModal()}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
              <div>
                <h2 className="text-white text-[15px] font-semibold m-0">
                  {statusModal.type === "sourced"
                    ? "Mark as Sourced"
                    : "Reject Request"}
                </h2>
                <p className="text-[#555] text-[11px] m-0">
                  Add a short note for this part request.
                </p>
              </div>

              <button
                onClick={closeStatusModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors bg-transparent border-none"
              >
                <span className="material-icons" style={{ fontSize: "18px" }}>
                  close
                </span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  statusModal.type === "sourced"
                    ? "Example: Part has been sourced and will be available soon."
                    : "Example: Part is currently unavailable from vendors."
                }
                rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-[13px] outline-none focus:border-[#e91e8c] resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={closeStatusModal}
                  className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors bg-transparent"
                >
                  Close
                </button>

                <button
                  onClick={handleStatusUpdate}
                  disabled={
                    actionLoadingId ===
                    `${statusModal.requestId}_${statusModal.type}`
                  }
                  className={`flex-1 py-2.5 rounded-lg text-white text-[13px] font-semibold hover:opacity-90 transition-opacity border-none disabled:opacity-50 ${
                    statusModal.type === "sourced"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {actionLoadingId ===
                  `${statusModal.requestId}_${statusModal.type}`
                    ? "Saving..."
                    : statusModal.type === "sourced"
                      ? "Mark Sourced"
                      : "Reject"}
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
