import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  searchSalesInvoices,
  markSalesInvoicePaid,
  cancelSalesInvoice,
} from "../../../api/api";
import {
  InvoiceStatus,
  SalesInvoiceMode,
} from "../../../constants/constantsHelpers";

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const statusStyle = (status) => {
  if (status === "Paid") return "bg-green-500/15 text-green-400";
  if (status === "Pending") return "bg-yellow-500/15 text-yellow-400";
  if (status === "Overdue") return "bg-orange-500/15 text-orange-400";
  if (status === "Cancelled") return "bg-red-500/15 text-red-400";
  return "bg-[#333] text-[#888]";
};

export default function SalesInvoice() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const loadInvoices = async () => {
      try {
        setLoading(true);

        const status =
          statusFilter === "all" ? null : InvoiceStatus[statusFilter];

        const mode = modeFilter === "all" ? null : SalesInvoiceMode[modeFilter];

        const r = await searchSalesInvoices({
          query: search.trim(),
          status,
          mode,
          pageNumber,
          pageSize,
        });

        if (cancelled) return;

        const d = r.data?.data;
        setInvoices(d?.items ?? []);
        setTotalCount(d?.totalCount ?? 0);
      } catch {
        if (!cancelled) {
          setInvoices([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInvoices();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, refresh, search, statusFilter, modeFilter]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleMarkPaid = async (id) => {
    setActionLoadingId(id);

    try {
      await markSalesInvoicePaid(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    setActionLoadingId(id);

    try {
      await cancelSalesInvoice(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const shownTotal = invoices.reduce(
    (sum, i) => sum + Number(i.totalAmount ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
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
              placeholder="Search invoice, customer, phone, vehicle..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
              }}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>

          {["all", "Paid", "Pending", "Overdue", "Cancelled"].map((s) => (
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

          {["all", "Direct", "Appointment"].map((m) => (
            <FilterBtn
              key={m}
              active={modeFilter === m}
              onClick={() => {
                setModeFilter(m);
                setPageNumber(1);
              }}
            >
              {m === "all" ? "All Modes" : m}
            </FilterBtn>
          ))}
        </div>

        <button
          onClick={() => navigate("/admin/sales-invoices/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Shown Sales",
            value: money(shownTotal),
            icon: "payments",
            color: "#e91e8c",
          },
          {
            label: "Paid",
            value: paidCount,
            icon: "check_circle",
            color: "#22c55e",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: "schedule",
            color: "#f59e0b",
          },
          {
            label: "Overdue",
            value: overdueCount,
            icon: "warning",
            color: "#fb923c",
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

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Sales Invoices
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
              Loading sales invoices...
            </span>
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
              No sales invoices found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Invoice No",
                    "Customer",
                    "Vehicle",
                    "Mode",
                    "Payment",
                    "Status",
                    "Total",
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
                {invoices.map((invoice) => {
                  const loadingAction = actionLoadingId === invoice.id;
                  const mode = invoice.appointmentId ? "Appointment" : "Direct";

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                          {invoice.invoiceNo}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-white text-[13px] font-medium">
                        {invoice.customerName || "No Name"}
                      </td>

                      <td className="px-5 py-3 text-[#888] text-[12px]">
                        {invoice.vehicleNumber || "No vehicle Number Provided"}
                      </td>

                      <td className="px-5 py-3">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#252525] text-[#aaa]">
                          {mode}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-[#888] text-[12px]">
                        {invoice.paymentMethod || "No Method Selected"}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle(
                            invoice.status,
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-white text-[13px] font-semibold">
                        {money(invoice.totalAmount)}
                      </td>

                      <td className="px-5 py-3 text-[#555] text-[12px]">
                        {invoice.createdAt
                          ? new Date(invoice.createdAt).toLocaleDateString()
                          : "Can't Find Date"}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              navigate(`/admin/sales-invoices/${invoice.id}`)
                            }
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "16px" }}
                            >
                              visibility
                            </span>
                          </button>

                          {(invoice.status === "Pending" ||
                            invoice.status === "Overdue") && (
                            <button
                              onClick={() => handleMarkPaid(invoice.id)}
                              disabled={loadingAction}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer bg-transparent border border-green-500/20 disabled:opacity-50"
                            >
                              {loadingAction ? "..." : "Mark Paid"}
                            </button>
                          )}

                          {invoice.status !== "Cancelled" &&
                            invoice.status !== "Paid" && (
                              <button
                                onClick={() => handleCancel(invoice.id)}
                                disabled={loadingAction}
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
