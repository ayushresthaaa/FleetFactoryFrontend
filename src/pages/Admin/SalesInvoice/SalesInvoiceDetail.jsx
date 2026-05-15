import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSalesInvoiceById,
  markSalesInvoicePaid,
  cancelSalesInvoice,
} from "../../../api/api";

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const formatDate = (date) => {
  if (!date) return "No credit date";
  return new Date(date).toLocaleString();
};

const statusStyle = (status) => {
  if (status === "Paid") return "bg-green-500/15 text-green-400";
  if (status === "Pending") return "bg-yellow-500/15 text-yellow-400";
  if (status === "Overdue") return "bg-orange-500/15 text-orange-400";
  if (status === "Cancelled") return "bg-red-500/15 text-red-400";
  return "bg-[#333] text-[#888]";
};

export default function SalesInvoiceDetail() {
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

        const res = await getSalesInvoiceById(id);

        if (cancelled) return;

        setInvoice(res.data?.data ?? null);
      } catch (err) {
        if (cancelled) return;

        setInvoice(null);
        setError(err.message || "Failed to load invoice.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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

  const discountAmount = useMemo(() => {
    if (!invoice) return 0;

    return (
      Number(invoice.subtotal || 0) * (Number(invoice.discountPct || 0) / 100)
    );
  }, [invoice]);

  const handleMarkPaid = async () => {
    setActionLoading(true);
    setError("");

    try {
      await markSalesInvoicePaid(id);
      setRefresh((r) => r + 1);
    } catch (err) {
      setError(err.message || "Failed to mark invoice as paid.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    setError("");

    try {
      await cancelSalesInvoice(id);
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
          onClick={() => navigate("/admin/sales-invoices")}
          className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold"
        >
          Back to invoices
        </button>
      </div>
    );
  }

  const mode = invoice.appointmentId ? "Appointment Billing" : "Direct Sale";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white text-xl font-bold m-0">
              {invoice.invoiceNo}
            </h1>

            <span
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle(
                invoice.status,
              )}`}
            >
              {invoice.status}
            </span>

            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#252525] text-[#aaa]">
              {mode}
            </span>
          </div>

          <p className="text-[#777] text-sm mt-1">
            Created {formatDate(invoice.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/sales-invoices")}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-white bg-transparent text-sm"
          >
            Back
          </button>

          {(invoice.status === "Pending" || invoice.status === "Overdue") && (
            <button
              onClick={handleMarkPaid}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 bg-transparent text-sm disabled:opacity-50"
            >
              {actionLoading ? "..." : "Mark Paid"}
            </button>
          )}

          {invoice.status !== "Cancelled" && invoice.status !== "Paid" && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent text-sm disabled:opacity-50"
            >
              {actionLoading ? "..." : "Cancel"}
            </button>
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
          <Section title="Customer & Vehicle">
            <div className="grid grid-cols-3 gap-3">
              <Info
                label="Customer"
                value={invoice.customerName || "No customer name"}
              />
              <Info
                label="Vehicle"
                value={invoice.vehicleNumber || "Vehicle Number not provided"}
              />
              <Info
                label="Payment Method"
                value={invoice.paymentMethod || "—"}
              />
            </div>
          </Section>

          {invoice.appointmentId && (
            <Section title="Appointment / Service">
              <div className="grid grid-cols-3 gap-3">
                <Info label="Appointment" value="Linked" />
                <Info
                  label="Service Charge"
                  value={money(invoice.serviceCharge)}
                />
                <Info
                  label="Service Description"
                  value={
                    invoice.serviceDescription || "No Description provided"
                  }
                />
              </div>
            </Section>
          )}

          {!invoice.appointmentId &&
            (Number(invoice.serviceCharge || 0) > 0 ||
              invoice.serviceDescription) && (
              <Section title="Service Information">
                <div className="grid grid-cols-2 gap-3">
                  <Info
                    label="Service Charge"
                    value={money(invoice.serviceCharge)}
                  />
                  <Info
                    label="Service Description"
                    value={
                      invoice.serviceDescription || "No Description provided"
                    }
                  />
                </div>
              </Section>
            )}

          <Section title="Parts">
            {invoice.items?.length > 0 ? (
              <div className="border border-[#292929] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#252525]">
                      {["Part", "Qty", "Unit Price", "Subtotal"].map((h) => (
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
                    {invoice.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#1f1f1f] last:border-b-0"
                      >
                        <td className="px-4 py-3 text-white text-sm font-medium">
                          {item.partName || "No part selected"}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3 text-[#aaa] text-sm">
                          {money(item.unitPrice)}
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
                No parts added. This invoice only contains service charge.
              </div>
            )}
          </Section>
        </div>

        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit sticky top-5">
          <h3 className="text-white text-sm font-semibold mb-4">
            Billing Summary
          </h3>

          <Summary label="Parts Total" value={money(partsTotal)} />
          <Summary
            label="Service Charge"
            value={money(invoice.serviceCharge)}
          />
          <Summary label="Subtotal" value={money(invoice.subtotal)} />
          <Summary
            label="Discount"
            value={
              Number(invoice.discountPct || 0) > 0
                ? `${invoice.discountPct}% (${money(discountAmount)})`
                : "No Discount"
            }
          />

          {invoice.discountReason && (
            <div className="text-[#666] text-xs mt-1">
              Reason: {invoice.discountReason}
            </div>
          )}

          <div className="border-t border-[#2a2a2a] mt-3 pt-3">
            <Summary
              label="Total Amount"
              value={money(invoice.totalAmount)}
              strong
            />
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Info label="Due Date" value={formatDate(invoice.dueDate)} />

            <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2">
              <div className="text-[#666] text-xs">Payment Status</div>

              <div className="flex items-center gap-2 mt-1">
                {invoice.status === "Paid" && (
                  <span
                    className="material-icons text-green-400"
                    style={{ fontSize: "16px" }}
                  >
                    check_circle
                  </span>
                )}

                {invoice.status === "Pending" && (
                  <span
                    className="material-icons text-yellow-400"
                    style={{ fontSize: "16px" }}
                  >
                    schedule
                  </span>
                )}

                {invoice.status === "Overdue" && (
                  <span
                    className="material-icons text-orange-400"
                    style={{ fontSize: "16px" }}
                  >
                    warning
                  </span>
                )}

                {invoice.status === "Cancelled" && (
                  <span
                    className="material-icons text-red-400"
                    style={{ fontSize: "16px" }}
                  >
                    cancel
                  </span>
                )}

                <span className="text-white text-sm font-medium">
                  {invoice.status === "Paid"
                    ? `Paid at ${formatDate(invoice.paidAt)}`
                    : invoice.status}
                </span>
              </div>
            </div>
          </div>
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
