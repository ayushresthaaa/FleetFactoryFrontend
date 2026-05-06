import { useState, useEffect } from "react";
import { getCustomerHistory } from "../../../api/api";

const STATUS_STYLE = {
  Paid: { cls: "bg-green-500/15 text-green-400" },
  Pending: { cls: "bg-yellow-500/15 text-yellow-400" },
  Cancelled: { cls: "bg-red-500/15 text-red-400" },
  Overdue: { cls: "bg-red-500/15 text-red-400" },
};

export default function CustomerHistoryModal({ open, onClose, customer }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("vehicles"); // "vehicles" | "purchases"

  useEffect(() => {
    if (!open || !customer?.id) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await getCustomerHistory(customer.id);
        if (!cancelled) setHistory(res.data?.data ?? null);
      } catch {
        if (!cancelled) setHistory(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, customer?.id]);

  if (!open) return null;

  const totalSpent =
    history?.purchaseHistory
      ?.filter((p) => p.status === "Paid")
      ?.reduce((s, p) => s + (p.totalAmount ?? 0), 0) ?? 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center text-[#e91e8c] text-[14px] font-bold">
              {customer?.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-white text-[15px] font-semibold m-0">
                {customer?.fullName}
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                {customer?.phone ?? "No phone"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Total spent badge */}
            <div className="bg-[rgba(233,30,140,0.08)] border border-[rgba(233,30,140,0.15)] rounded-lg px-3 py-1.5 text-right">
              <div className="text-[10px] text-[#555] font-medium uppercase tracking-wider">
                Total Spent
              </div>
              <div className="text-[#e91e8c] text-[13px] font-bold">
                Rs. {totalSpent.toLocaleString()}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
            >
              <span className="material-icons" style={{ fontSize: "18px" }}>
                close
              </span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#252525] shrink-0">
          {[
            { key: "vehicles", label: "Vehicles", icon: "directions_car" },
            {
              key: "purchases",
              label: "Purchase History",
              icon: "receipt_long",
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer bg-transparent
                ${
                  tab === t.key
                    ? "text-[#e91e8c] border-[#e91e8c]"
                    : "text-[#555] border-transparent hover:text-[#888]"
                }`}
            >
              <span className="material-icons" style={{ fontSize: "15px" }}>
                {t.icon}
              </span>
              {t.label}
              {t.key === "purchases" &&
                history?.purchaseHistory?.length > 0 && (
                  <span className="bg-[#e91e8c] text-white text-[10px] font-bold px-1.5 py-px rounded-full">
                    {history.purchaseHistory.length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <span
                className="material-icons text-[#e91e8c] animate-spin"
                style={{ fontSize: "22px" }}
              >
                refresh
              </span>
              <span className="text-[#555] text-[13px]">
                Loading history...
              </span>
            </div>
          ) : tab === "vehicles" ? (
            <div className="flex flex-col gap-3">
              {history?.vehicles?.length > 0 ? (
                history.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="bg-[#111] border border-[#252525] rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <span
                        className="material-icons text-blue-400"
                        style={{ fontSize: "20px" }}
                      >
                        directions_car
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-[14px] font-semibold">
                        {v.vehicleNumber}
                      </div>
                      <div className="text-[#555] text-[12px]">
                        {[v.make, v.model, v.year]
                          .filter(Boolean)
                          .join(" · ") || "No details"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span
                    className="material-icons text-[#333]"
                    style={{ fontSize: "36px" }}
                  >
                    directions_car
                  </span>
                  <p className="text-[#555] text-[13px] m-0">
                    No vehicles registered
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {history?.purchaseHistory?.length > 0 ? (
                <>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#252525]">
                        {[
                          "Invoice No",
                          "Status",
                          "Subtotal",
                          "Discount",
                          "Total",
                          "Date",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider py-2 pr-4"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.purchaseHistory.map((p) => {
                        const st =
                          STATUS_STYLE[p.status] ?? STATUS_STYLE.Pending;
                        return (
                          <tr
                            key={p.salesInvoiceId}
                            className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                          >
                            <td className="py-3 pr-4">
                              <span className="text-[#e91e8c] text-[12px] font-mono font-semibold">
                                {p.invoiceNo}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.cls}`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-[#888] text-[12px]">
                                Rs. {p.subtotal?.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={`text-[12px] font-medium ${p.discountPct > 0 ? "text-green-400" : "text-[#555]"}`}
                              >
                                {p.discountPct > 0 ? `-${p.discountPct}%` : "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <span className="text-white text-[13px] font-semibold">
                                Rs. {p.totalAmount?.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="text-[#555] text-[12px]">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Credit balance warning */}
                  {history?.creditBalance > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-500/08 border border-yellow-500/20 rounded-lg px-4 py-3 mt-2">
                      <span
                        className="material-icons text-yellow-400"
                        style={{ fontSize: "16px" }}
                      >
                        warning
                      </span>
                      <span className="text-yellow-400 text-[12px] font-medium">
                        Outstanding credit balance: Rs.{" "}
                        {history.creditBalance?.toLocaleString()}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <span
                    className="material-icons text-[#333]"
                    style={{ fontSize: "36px" }}
                  >
                    receipt_long
                  </span>
                  <p className="text-[#555] text-[13px] m-0">
                    No purchase history yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
