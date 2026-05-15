import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPurchaseInvoiceById,
  receivePurchaseInvoice,
  payPurchaseInvoice,
  cancelPurchaseInvoice,
} from "../../../api/api";
import { generatePurchaseInvoicePDF } from "../../../utils/pdfGenerator";

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

// just return what the backend sends, show — if null
const formatDate = (date) => {
  if (!date) return "—";
  return date;
};

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

export default function PurchaseInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getPurchaseInvoiceById(id);
        if (cancelled) return;
        setInvoice(res.data?.data ?? null);
      } catch (err) {
        if (cancelled) return;
        setInvoice(null);
        setError(err.message || "Failed to load invoice.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, refresh]);

  const partsTotal = useMemo(() => {
    return (invoice?.items ?? []).reduce(
      (sum, item) => sum + Number(item.subtotal ?? 0),
      0,
    );
  }, [invoice]);

  const handleReceive = async () => {
    setActionLoading(true);
    setError("");
    try {
      await receivePurchaseInvoice(id);
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || "Failed to mark as received.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = async () => {
    setActionLoading(true);
    setError("");
    try {
      await payPurchaseInvoice(id);
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || "Failed to mark as paid.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError("");
    try {
      await cancelPurchaseInvoice(id);
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || "Failed to cancel invoice.");
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
        <span className="text-[#555] text-[13px]">Loading invoice...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-8 flex flex-col items-center gap-3">
        <span
          className="material-icons text-[#333]"
          style={{ fontSize: "44px" }}
        >
          receipt_long
        </span>
        <p className="text-red-400 text-sm">{error || "Invoice not found."}</p>
        <button
          onClick={() => navigate("/admin/purchase-invoices")}
          className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold"
        >
          Back to invoices
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-xl font-bold m-0">
              {invoice.invoiceNo}
            </h1>
            <span
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                STATUS_STYLE[invoice.status] ?? "bg-[#333] text-[#888]"
              }`}
            >
              <span className="material-icons" style={{ fontSize: "12px" }}>
                {STATUS_ICON[invoice.status] ?? "help"}
              </span>
              {invoice.status}
            </span>
          </div>
          <p className="text-[#777] text-sm mt-1">
            Created {formatDate(invoice.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/purchase-invoices")}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-white bg-transparent text-sm"
          >
            Back
          </button>

          {/* Receive — only Pending */}
          {invoice.status === "Pending" && (
            <button
              onClick={handleReceive}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent text-sm disabled:opacity-50"
            >
              {actionLoading ? "..." : "Mark Received"}
            </button>
          )}

          {/* Mark Paid — only Received */}
          {invoice.status === "Received" && (
            <button
              onClick={handlePay}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent text-sm disabled:opacity-50"
            >
              {actionLoading ? "..." : "Mark Paid"}
            </button>
          )}

          {/* Cancel — only Pending (backend enforces this) */}
          {invoice.status === "Pending" && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent text-sm disabled:opacity-50"
            >
              {actionLoading ? "..." : "Cancel"}
            </button>
          )}

          {/* PDF */}
          <button
            onClick={() => generatePurchaseInvoicePDF(invoice)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-red-400 hover:border-red-500/30 bg-transparent text-sm transition-colors"
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>
              picture_as_pdf
            </span>
            PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[1fr_340px] gap-5">
        <div className="flex flex-col gap-5">
          {/* Vendor info — only fields that exist in DTO */}
          <Section title="Vendor & Invoice Info">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Vendor" value={invoice.vendorName || "—"} />
              <Info label="Invoice No" value={invoice.invoiceNo || "—"} />
            </div>
          </Section>

          {/* Items table */}
          <Section title="Parts / Items">
            {invoice.items?.length > 0 ? (
              <div className="border border-[#292929] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      {["Part", "Qty", "Unit Cost", "Subtotal"].map((h) => (
                        <th
                          key={h}
                          className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item, idx) => (
                      <tr
                        key={item.id ?? idx}
                        className="border-b border-[#1f1f1f] last:border-b-0"
                      >
                        <td className="px-4 py-3 text-white text-sm font-medium">
                          {item.partName || "—"}
                        </td>
                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {money(item.unitCost)}
                        </td>
                        <td className="px-4 py-3 text-white text-sm font-semibold">
                          {money(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-[#666] text-sm border border-[#252525] rounded-xl px-4 py-6 text-center">
                No items on this invoice.
              </div>
            )}
          </Section>
        </div>

        {/* Summary sidebar */}
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit sticky top-5">
          <h3 className="text-white text-sm font-semibold mb-4">
            Invoice Summary
          </h3>

          <Summary
            label="Items"
            value={`${invoice.items?.length ?? 0} item(s)`}
          />
          <Summary label="Parts Total" value={money(partsTotal)} />

          <div className="border-t border-[#2a2a2a] mt-3 pt-3">
            <Summary
              label="Total Amount"
              value={money(invoice.totalAmount)}
              strong
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            {/* Status block */}
            <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2">
              <div className="text-[#666] text-xs">Status</div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`material-icons ${
                    invoice.status === "Paid"
                      ? "text-green-400"
                      : invoice.status === "Received"
                        ? "text-blue-400"
                        : invoice.status === "Pending"
                          ? "text-yellow-400"
                          : "text-red-400"
                  }`}
                  style={{ fontSize: "16px" }}
                >
                  {STATUS_ICON[invoice.status] ?? "help"}
                </span>
                <span className="text-white text-sm font-medium">
                  {invoice.status}
                </span>
              </div>
            </div>

            <Info label="Created At" value={formatDate(invoice.createdAt)} />
          </div>

          {/* PDF download */}
          <button
            onClick={() => generatePurchaseInvoicePDF(invoice)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#333] text-[#aaa] hover:text-red-400 hover:border-red-500/30 bg-transparent text-sm transition-colors"
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>
              picture_as_pdf
            </span>
            Download PDF
          </button>
        </div>
      </div>
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
      {value}
    </span>
  </div>
);
