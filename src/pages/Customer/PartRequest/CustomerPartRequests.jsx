import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPartRequests } from "../../../api/api";

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

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
};

export default function CustomerPartRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        setLoading(true);
        const res = await getMyPartRequests();
        const data = res.data?.data || res.data;
        setRequests(Array.isArray(data) ? data : data?.items || []);
      } catch {
        setError("Failed to load your part requests.");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const sourcedCount = requests.filter((r) => r.status === "Sourced").length;
  const rejectedCount = requests.filter((r) => r.status === "Rejected").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold m-0">
            My Part Requests
          </h1>
          <p className="text-[#666] text-sm mt-1">
            Track unavailable parts you have requested.
          </p>
        </div>

        <button
          onClick={() => navigate("/customer/part-requests/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          New Request
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Stat
          label="Pending"
          value={pendingCount}
          icon="schedule"
          color="#f59e0b"
        />
        <Stat
          label="Sourced"
          value={sourcedCount}
          icon="check_circle"
          color="#22c55e"
        />
        <Stat
          label="Rejected"
          value={rejectedCount}
          icon="cancel"
          color="#ef4444"
        />
      </div>

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Request History
          </h3>
          <span className="text-[#555] text-[12px]">
            {requests.length} total
          </span>
        </div>

        {error && (
          <div className="m-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">
              Loading your requests...
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
              You have not requested any parts yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Part",
                    "Vehicle",
                    "Description",
                    "Requested Date",
                    "Status",
                    "Staff Note",
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

                  return (
                    <tr
                      key={id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5 text-white text-[13px] font-medium">
                        {request.partName ||
                          request.requestedPartName ||
                          "No part name"}
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px]">
                        {request.vehicleNumber || "No vehicle"}
                      </td>

                      <td className="px-5 py-3.5 text-[#555] text-[12px] max-w-[280px] truncate">
                        {request.description || "No description"}
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

                      <td className="px-5 py-3.5 text-[#888] text-[12px] max-w-[260px] truncate">
                        {request.adminNote || request.note || "No note yet"}
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

const Stat = ({ label, value, icon, color }) => (
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
