import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPartRequestById,
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

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleString();
};

export default function PartRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const [modal, setModal] = useState({
    open: false,
    type: "",
  });

  const [note, setNote] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getPartRequestById(id);

        if (cancelled) return;

        setRequest(res.data?.data ?? null);
      } catch (err) {
        if (cancelled) return;
        setRequest(null);
        setError(err.message || "Failed to load part request.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id, refresh]);

  const openModal = (type) => {
    setModal({ open: true, type });
    setNote("");
  };

  const closeModal = () => {
    setModal({ open: false, type: "" });
    setNote("");
  };

  const handleStatusUpdate = async () => {
    setActionLoading(true);
    setError("");

    try {
      const payload = {
        note,
        remarks: note,
        responseNote: note,
      };

      if (modal.type === "sourced") {
        await markPartRequestSourced(id, payload);
      } else {
        await rejectPartRequest(id, payload);
      }

      closeModal();
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || "Failed to update part request.");
    } finally {
      setActionLoading(false);
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
        <span className="text-[#555] text-[13px]">Loading part request...</span>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-8 flex flex-col items-center gap-3">
        <span
          className="material-icons text-[#333]"
          style={{ fontSize: "44px" }}
        >
          inventory_2
        </span>

        <p className="text-red-400 text-sm">
          {error || "Part request not found."}
        </p>

        <button
          onClick={() => navigate("/admin/part-requests")}
          className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold"
        >
          Back to requests
        </button>
      </div>
    );
  }

  const status = request.status || "Pending";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-xl font-bold m-0">
              Part Request Details
            </h1>

            <span
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                STATUS_STYLE[status] ?? "bg-[#333] text-[#888]"
              }`}
            >
              <span className="material-icons" style={{ fontSize: "12px" }}>
                {STATUS_ICON[status] ?? "help"}
              </span>
              {status}
            </span>
          </div>

          <p className="text-[#777] text-sm mt-1">
            Requested {formatDate(request.createdAt || request.requestedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/part-requests")}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-white bg-transparent text-sm"
          >
            Back
          </button>

          {status === "Pending" && (
            <>
              <button
                onClick={() => openModal("sourced")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent text-sm disabled:opacity-50"
              >
                Mark Sourced
              </button>

              <button
                onClick={() => openModal("rejected")}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent text-sm disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-5">
          <Section title="Customer Information">
            <div className="grid grid-cols-2 gap-3">
              <Info
                label="Customer Name"
                value={request.customerName || "Unknown customer"}
              />
              <Info label="Phone" value={request.customerPhone || "No phone"} />
              <Info label="Email" value={request.customerEmail || "No email"} />
              <Info
                label="Customer ID"
                value={request.customerId || "No customer ID"}
              />
            </div>
          </Section>

          <Section title="Requested Part">
            <div className="grid grid-cols-2 gap-3">
              <Info
                label="Part Name"
                value={
                  request.partName ||
                  request.requestedPartName ||
                  "No part name"
                }
              />
              <Info
                label="Vehicle"
                value={request.vehicleNumber || "No vehicle"}
              />
            </div>
          </Section>

          <Section title="Request Description">
            <div className="bg-[#111] border border-[#252525] rounded-lg px-4 py-3 min-h-[110px]">
              <p className="text-[#ddd] text-sm leading-6 m-0">
                {request.description || "No description"}
              </p>
            </div>
          </Section>

          {(request.note || request.remarks || request.responseNote) && (
            <Section title="Staff Response">
              <div className="bg-[#111] border border-[#252525] rounded-lg px-4 py-3">
                <p className="text-[#ddd] text-sm leading-6 m-0">
                  {request.note || request.remarks || request.responseNote}
                </p>
              </div>
            </Section>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit sticky top-5">
          <h3 className="text-white text-sm font-semibold mb-4">
            Request Summary
          </h3>

          <Summary label="Status" value={status} strong />
          <Summary
            label="Requested At"
            value={formatDate(request.createdAt || request.requestedAt)}
          />
          <Summary label="Updated At" value={formatDate(request.updatedAt)} />

          <div className="mt-5 bg-[#111] border border-[#252525] rounded-lg px-3 py-3">
            <div className="text-[#666] text-xs">Current Status</div>

            <div className="flex items-center gap-2 mt-2">
              <span
                className={`material-icons ${
                  status === "Sourced"
                    ? "text-green-400"
                    : status === "Pending"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
                style={{ fontSize: "18px" }}
              >
                {STATUS_ICON[status] ?? "help"}
              </span>

              <span className="text-white text-sm font-medium">{status}</span>
            </div>
          </div>

          {status === "Pending" && (
            <>
              <button
                onClick={() => openModal("sourced")}
                disabled={actionLoading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent text-sm transition-colors disabled:opacity-50"
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>
                  check_circle
                </span>
                Mark as Sourced
              </button>

              <button
                onClick={() => openModal("rejected")}
                disabled={actionLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent text-sm transition-colors disabled:opacity-50"
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>
                  cancel
                </span>
                Reject Request
              </button>
            </>
          )}
        </div>
      </div>

      {modal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
              <div>
                <h2 className="text-white text-[15px] font-semibold m-0">
                  {modal.type === "sourced"
                    ? "Mark as Sourced"
                    : "Reject Request"}
                </h2>
                <p className="text-[#555] text-[11px] m-0">
                  Add a short staff response.
                </p>
              </div>

              <button
                onClick={closeModal}
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
                  modal.type === "sourced"
                    ? "Example: Part has been sourced and will be available soon."
                    : "Example: Part is currently unavailable from vendors."
                }
                rows={4}
                className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-[13px] outline-none focus:border-[#e91e8c] resize-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors bg-transparent"
                >
                  Close
                </button>

                <button
                  onClick={handleStatusUpdate}
                  disabled={actionLoading}
                  className={`flex-1 py-2.5 rounded-lg text-white text-[13px] font-semibold hover:opacity-90 transition-opacity border-none disabled:opacity-50 ${
                    modal.type === "sourced" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {actionLoading
                    ? "Saving..."
                    : modal.type === "sourced"
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

const Section = ({ title, children }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 flex flex-col gap-3">
    <h2 className="text-white text-sm font-semibold m-0">{title}</h2>
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

const Summary = ({ label, value, strong }) => (
  <div className="flex justify-between py-1.5 gap-4">
    <span className="text-[#777] text-sm">{label}</span>
    <span className={strong ? "text-white font-bold" : "text-[#ddd] text-sm"}>
      {value || "No data"}
    </span>
  </div>
);
