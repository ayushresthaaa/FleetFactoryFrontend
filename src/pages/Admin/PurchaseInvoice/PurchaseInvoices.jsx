import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchPurchaseInvoices,
  getPurchaseInvoices,
  receivePurchaseInvoice,
  payPurchaseInvoice,
  cancelPurchaseInvoice,
} from "../../../api/api";
import PurchaseInvoiceModal from "./PurchaseInvoiceModal";

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const STATUS_STYLE = {
  Pending: "bg-yellow-500/15 text-yellow-400",
  Received: "bg-blue-500/15 text-blue-400",
  Paid: "bg-green-500/15 text-green-400",
  Cancelled: "bg-red-500/15 text-red-400",
};

const STATUS_ICON = {
  Pending: "schedule",
  Received: "inventory",
  Paid: "check_circle",
  Cancelled: "cancel",
};

// backend enum values
const STATUS_ENUM = {
  Pending: 0,
  Received: 1,
  Paid: 2,
  Cancelled: 3,
};

export default function PurchaseInvoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        let res;

        // use base endpoint when no filters active (search endpoint may not be implemented yet)
        if (!search.trim() && statusFilter === "all") {
          res = await getPurchaseInvoices(pageNumber, pageSize);
        } else {
          const status =
            statusFilter === "all" ? null : (STATUS_ENUM[statusFilter] ?? null);

          res = await searchPurchaseInvoices({
            query: search.trim(),
            status,
            pageNumber,
            pageSize,
          });
        }

        if (cancelled) return;

        const data = res.data?.data;
        setInvoices(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
      } catch {
        if (!cancelled) {
          setInvoices([]);
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

  const handleReceive = async (id) => {
    setActionLoadingId(id + "_receive");
    try {
      await receivePurchaseInvoice(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePay = async (id) => {
    setActionLoadingId(id + "_pay");
    try {
      await payPurchaseInvoice(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    setActionLoadingId(id + "_cancel");
    try {
      await cancelPurchaseInvoice(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const receivedCount = invoices.filter((i) => i.status === "Received").length;
  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const totalValue = invoices.reduce(
    (s, i) => s + Number(i.totalAmount ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
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
              placeholder="Search invoice, vendor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>

          {["all", "Pending", "Received", "Paid", "Cancelled"].map((s) => (
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
            label: "Shown Value",
            value: money(totalValue),
            icon: "payments",
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
            Purchase Invoices
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
              No purchase invoices found.
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
                  const isReceiveLoading =
                    actionLoadingId === inv.id + "_receive";
                  const isPayLoading = actionLoadingId === inv.id + "_pay";
                  const isCancelLoading =
                    actionLoadingId === inv.id + "_cancel";
                  const anyLoading =
                    isReceiveLoading || isPayLoading || isCancelLoading;

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                          {inv.invoiceNo}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-white text-[13px] font-medium">
                        {inv.vendorName || "No Vendor"}
                      </td>

                      <td className="px-5 py-3.5 text-[#888] text-[12px]">
                        {inv.items?.length ?? 0} item(s)
                      </td>

                      <td className="px-5 py-3.5 text-white text-[13px] font-semibold">
                        {money(inv.totalAmount)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            STATUS_STYLE[inv.status] ?? "bg-[#333] text-[#888]"
                          }`}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "12px" }}
                          >
                            {STATUS_ICON[inv.status] ?? "help"}
                          </span>
                          {inv.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[#555] text-[12px]">
                        {inv.createdAt
                          ? new Date(inv.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button
                            onClick={() =>
                              navigate(`/admin/purchase-invoices/${inv.id}`)
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

                          {/* Receive — only Pending */}
                          {inv.status === "Pending" && (
                            <button
                              onClick={() => handleReceive(inv.id)}
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer bg-transparent border border-blue-500/20 disabled:opacity-50"
                            >
                              {isReceiveLoading ? "..." : "Receive"}
                            </button>
                          )}

                          {/* Mark Paid — only Received */}
                          {inv.status === "Received" && (
                            <button
                              onClick={() => handlePay(inv.id)}
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer bg-transparent border border-green-500/20 disabled:opacity-50"
                            >
                              {isPayLoading ? "..." : "Mark Paid"}
                            </button>
                          )}

                          {/* Cancel — only Pending (backend enforces this) */}
                          {inv.status === "Pending" && (
                            <button
                              onClick={() => handleCancel(inv.id)}
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border border-red-500/20 disabled:opacity-50"
                            >
                              {isCancelLoading ? "..." : "Cancel"}
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

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium cursor-pointer border transition-colors
      ${
        active
          ? "bg-[#e91e8c] text-white border-[#e91e8c]"
          : "bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444]"
      }
      disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);
