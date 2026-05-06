import { useState, useEffect } from "react";
import {
  getPurchaseInvoices,
  receivePurchaseInvoice,
  payPurchaseInvoice,
} from "../../api/api";
import PurchaseInvoiceModal from "../../components/common/Modals/PurchaseInvoiceModal";
import { generatePurchaseInvoicePDF } from "../../utils/pdfGenerator";

const STATUS_STYLE = {
  Pending: { cls: "bg-yellow-500/15 text-yellow-400", icon: "schedule" },
  Received: { cls: "bg-blue-500/15 text-blue-400", icon: "inventory" },
  Paid: { cls: "bg-green-500/15 text-green-400", icon: "check_circle" },
  Cancelled: { cls: "bg-red-500/15 text-red-400", icon: "cancel" },
};

export default function PurchaseInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // invoice id being acted on

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getPurchaseInvoices(pageNumber, pageSize);
        const data = res.data?.data;
        if (!cancelled) {
          setInvoices(data?.items ?? []);
          setTotalCount(data?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) setInvoices([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, pageSize, refresh]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleReceive = async (id) => {
    setActionLoading(id + "_receive");
    try {
      await receivePurchaseInvoice(id);
      refetch();
    } finally {
      setActionLoading(null);
    }
  };

  const handlePay = async (id) => {
    setActionLoading(id + "_pay");
    try {
      await payPurchaseInvoice(id);
      refetch();
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const receivedCount = invoices.filter((i) => i.status === "Received").length;
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const totalValue = invoices.reduce((s, i) => s + (i.totalAmount ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1" />
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          New Invoice
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Invoices",
            value: totalCount,
            icon: "receipt_long",
            color: "#e91e8c",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: "schedule",
            color: "#f59e0b",
          },
          {
            label: "Received",
            value: receivedCount,
            icon: "inventory",
            color: "#3b82f6",
          },
          {
            label: "Paid",
            value: paidCount,
            icon: "check_circle",
            color: "#22c55e",
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
            All Purchase Invoices
          </h3>
          <span className="text-[#555] text-[12px]">
            Total value:{" "}
            <span className="text-white font-semibold">
              Rs. {totalValue.toLocaleString()}
            </span>
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">Loading invoices...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              receipt_long
            </span>
            <p className="text-[#555] text-[13px] m-0">
              No purchase invoices yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Invoice No",
                    "Vendor",
                    "Items",
                    "Total Amount",
                    "Status",
                    "Created",
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
                {invoices.map((inv) => {
                  const status =
                    STATUS_STYLE[inv.status] ?? STATUS_STYLE.Pending;
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      {/* Invoice No */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                          {inv.invoiceNo}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="px-5 py-3.5">
                        <span className="text-white text-[13px] font-medium">
                          {inv.vendorName}
                        </span>
                      </td>

                      {/* Items count */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {inv.items?.length ?? 0} item(s)
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-3.5">
                        <span className="text-white text-[13px] font-semibold">
                          Rs. {inv.totalAmount?.toLocaleString()}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.cls}`}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "12px" }}
                          >
                            {status.icon}
                          </span>
                          {inv.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#555] text-[12px]">
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* Receive — only if Pending */}
                          {inv.status === "Pending" && (
                            <button
                              onClick={() => handleReceive(inv.id)}
                              disabled={actionLoading === inv.id + "_receive"}
                              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 transition-colors cursor-pointer disabled:opacity-50"
                              title="Mark as Received (updates stock)"
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: "13px" }}
                              >
                                {actionLoading === inv.id + "_receive"
                                  ? "refresh"
                                  : "inventory"}
                              </span>
                              Receive
                            </button>
                          )}

                          {/* Mark Paid — only if Received */}
                          {inv.status === "Received" && (
                            <button
                              onClick={() => handlePay(inv.id)}
                              disabled={actionLoading === inv.id + "_pay"}
                              className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-colors cursor-pointer disabled:opacity-50"
                              title="Mark as Paid"
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: "13px" }}
                              >
                                {actionLoading === inv.id + "_pay"
                                  ? "refresh"
                                  : "payments"}
                              </span>
                              Mark Paid
                            </button>
                          )}

                          {/* PDF */}
                          <button
                            onClick={() => generatePurchaseInvoicePDF(inv)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/08 transition-colors cursor-pointer bg-transparent border-none"
                            title="Download PDF"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "16px" }}
                            >
                              picture_as_pdf
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - pageNumber) <= 1,
                )
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span
                      key={`e-${i}`}
                      className="text-[#555] px-1 text-[12px]"
                    >
                      ...
                    </span>
                  ) : (
                    <PageBtn
                      key={item}
                      active={item === pageNumber}
                      onClick={() => setPageNumber(item)}
                    >
                      {item}
                    </PageBtn>
                  ),
                )}
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

      <PurchaseInvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium
      cursor-pointer border transition-colors
      ${active ? "bg-[#e91e8c] text-white border-[#e91e8c]" : "bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444]"}
      disabled:opacity-30 disabled:cursor-not-allowed
    `}
  >
    {children}
  </button>
);
