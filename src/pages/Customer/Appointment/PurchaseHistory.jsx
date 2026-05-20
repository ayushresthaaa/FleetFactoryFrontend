import { useEffect, useState } from "react";
import { getMyPurchaseHistory } from "../../../api/api";

const STATUS_STYLE = {
  Paid: "bg-green-500/15 text-green-400",
  Pending: "bg-yellow-500/15 text-yellow-400",
  Overdue: "bg-orange-500/15 text-orange-400",
  Cancelled: "bg-red-500/15 text-red-400",
};

const STATUS_ICON = {
  Paid: "check_circle",
  Pending: "schedule",
  Overdue: "warning",
  Cancelled: "cancel",
};

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPurchaseHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getMyPurchaseHistory();
        const data = res.data?.data || res.data;

        setPurchases(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(
          err?.message ||
            err?.response?.data?.message ||
            "Failed to load purchase history.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseHistory();
  }, []);

  const totalSpent = purchases.reduce(
    (sum, p) => sum + Number(p.totalAmount ?? 0),
    0,
  );

  const paidCount = purchases.filter((p) => p.status === "Paid").length;
  const pendingCount = purchases.filter((p) => p.status === "Pending").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-white text-2xl font-bold m-0">Purchase History</h1>
        <p className="text-[#666] text-sm mt-1">
          View your previous invoices and service purchases.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Spent"
          value={money(totalSpent)}
          icon="payments"
          color="#e91e8c"
        />
        <StatCard
          label="Paid"
          value={paidCount}
          icon="check_circle"
          color="#22c55e"
        />
        <StatCard
          label="Pending"
          value={pendingCount}
          icon="schedule"
          color="#f59e0b"
        />
      </div>

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Purchase Records
          </h3>
          <span className="text-[#555] text-[12px]">
            {purchases.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span className="material-icons text-[#e91e8c] animate-spin">
              refresh
            </span>
            <span className="text-[#555] text-[13px]">
              Loading purchase history...
            </span>
          </div>
        ) : error ? (
          <div className="p-5">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              receipt_long
            </span>
            <p className="text-[#555] text-[13px] m-0">
              No purchase history found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Invoice",
                    "Vehicle",
                    "Items",
                    "Status",
                    "Total",
                    "Date",
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
                {purchases.map((purchase) => {
                  const status = purchase.status || "Pending";

                  return (
                    <tr
                      key={purchase.salesInvoiceId}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                          {purchase.invoiceNo}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px]">
                        {purchase.vehicleNumber || "No vehicle"}
                      </td>

                      <td className="px-5 py-3.5 text-[#888] text-[13px]">
                        {purchase.itemCount ?? 0}
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

                      <td className="px-5 py-3.5 text-white text-[13px] font-semibold">
                        {money(purchase.totalAmount)}
                      </td>

                      <td className="px-5 py-3.5 text-[#555] text-[12px]">
                        {formatDate(purchase.createdAt)}
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

const StatCard = ({ label, value, icon, color }) => (
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

const formatDate = (date) => {
  if (!date) return "No date";

  return new Date(date).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
