import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminDashboard,
  getStaffDashboard,
  getOverdueCredits,
  sendOverdueCreditReminder,
  sendAllOverdueCreditReminders,
} from "../../api/api";

const money = (v) => `Rs. ${Number(v ?? 0).toLocaleString()}`;

export default function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role;

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const dashboardRes =
          role === "Admin"
            ? await getAdminDashboard()
            : await getStaffDashboard();

        const creditRes = await getOverdueCredits();

        if (cancelled) return;

        setDashboard(dashboardRes.data?.data || dashboardRes.data);
        setCredits(creditRes.data?.data || creditRes.data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [role]);

  const handleSendReminder = async (customerId) => {
    try {
      setSendingId(customerId);
      setError("");
      setSuccess("");

      await sendOverdueCreditReminder(customerId);

      setSuccess("Reminder email sent successfully.");
    } catch (err) {
      setError(err.message || "Failed to send reminder.");
    } finally {
      setSendingId("");
    }
  };

  const handleSendAll = async () => {
    try {
      setSendingAll(true);
      setError("");
      setSuccess("");

      await sendAllOverdueCreditReminders();

      setSuccess("All overdue credit reminders sent successfully.");
    } catch (err) {
      setError(err.message || "Failed to send reminders.");
    } finally {
      setSendingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3">
        <span className="material-icons text-[#e91e8c] animate-spin">
          refresh
        </span>
        <span className="text-[#555] text-sm">Loading dashboard...</span>
      </div>
    );
  }

  const cards = dashboard?.cards || [];
  const charts = dashboard?.charts || [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-[#666] text-sm mt-1">
          Business overview, credit alerts, and quick actions.
        </p>
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={formatValue(card.value, card.label)}
            icon={icons[index % icons.length]}
            color={colors[index % colors.length]}
          />
        ))}
      </div>

      <section className="grid grid-cols-[1fr_360px] gap-5">
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[#252525] flex justify-between">
            <h3 className="text-white text-sm font-semibold">
              Dashboard Chart
            </h3>
            <span className="text-[#555] text-xs">
              {charts.length} point(s)
            </span>
          </div>

          {charts.length === 0 ? (
            <EmptyState icon="bar_chart" text="No chart data available." />
          ) : (
            <div className="p-5 flex flex-col gap-3">
              {charts.map((point) => (
                <div key={point.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#aaa]">{point.label}</span>
                    <span className="text-white font-semibold">
                      {money(point.value)}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-[#111] overflow-hidden">
                    <div
                      className="h-full bg-[#e91e8c]"
                      style={{
                        width: `${getBarWidth(point.value, charts)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit">
          <h3 className="text-white text-sm font-semibold mb-4">
            Quick Actions
          </h3>

          <QuickAction
            icon="receipt_long"
            label="Create Sales Invoice"
            onClick={() => navigate("/admin/sales-invoices/create")}
          />

          <QuickAction
            icon="group"
            label="View Customers"
            onClick={() => navigate("/admin/customers")}
          />

          <QuickAction
            icon="assessment"
            label="Open Reports"
            onClick={() => navigate("/admin/reports")}
          />

          <QuickAction
            icon="inventory_2"
            label="Check Low Stock"
            onClick={() => navigate("/admin/low-stock")}
          />
        </div>
      </section>

      <section className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <div>
            <h3 className="text-white text-sm font-semibold">
              Pending / Overdue Credits
            </h3>
            <p className="text-[#555] text-xs mt-1">
              Customers with unpaid credit balance.
            </p>
          </div>

          <button
            onClick={handleSendAll}
            disabled={sendingAll || credits.length === 0}
            className="px-4 py-2 rounded-lg border border-[#e91e8c]/30 text-[#e91e8c] bg-transparent text-xs font-semibold hover:bg-[#e91e8c]/10 disabled:opacity-50"
          >
            {sendingAll ? "Sending..." : "Send All Reminders"}
          </button>
        </div>

        {credits.length === 0 ? (
          <EmptyState icon="check_circle" text="No pending credits found." />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#252525]">
                {["Customer", "Phone", "Credit Balance", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[#555] text-xs font-semibold uppercase px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {credits.map((c) => (
                <tr
                  key={c.customerId}
                  className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f]"
                >
                  <td className="px-5 py-3 text-white text-sm font-medium">
                    {c.customerName}
                  </td>

                  <td className="px-5 py-3 text-[#888] text-xs">
                    {c.phone || "—"}
                  </td>

                  <td className="px-5 py-3 text-yellow-400 text-sm font-semibold">
                    {money(c.creditBalance)}
                  </td>

                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleSendReminder(c.customerId)}
                      disabled={sendingId === c.customerId}
                      className="px-3 py-1.5 rounded-lg bg-[#e91e8c] text-white text-xs disabled:opacity-50"
                    >
                      {sendingId === c.customerId ? "Sending..." : "Send Email"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center"
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
      <div className="text-white text-xl font-bold">{value}</div>
      <div className="text-[#555] text-xs font-medium">{label}</div>
    </div>
  </div>
);

const QuickAction = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 bg-[#111] border border-[#252525] rounded-lg px-3 py-3 mb-3 text-left hover:border-[#e91e8c]/30"
  >
    <span className="material-icons text-[#e91e8c]" style={{ fontSize: 18 }}>
      {icon}
    </span>
    <span className="text-[#ddd] text-sm font-medium">{label}</span>
  </button>
);

const EmptyState = ({ icon, text }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-2">
    <span className="material-icons text-[#333]" style={{ fontSize: 40 }}>
      {icon}
    </span>
    <p className="text-[#555] text-sm">{text}</p>
  </div>
);

const formatValue = (value, label) => {
  const lower = label.toLowerCase();

  if (
    lower.includes("revenue") ||
    lower.includes("sales") ||
    lower.includes("profit") ||
    lower.includes("credit")
  ) {
    return money(value);
  }

  return Number(value ?? 0).toLocaleString();
};

const getBarWidth = (value, points) => {
  const max = Math.max(...points.map((p) => Number(p.value || 0)), 1);
  return Math.max(8, (Number(value || 0) / max) * 100);
};

const icons = ["payments", "group", "receipt_long", "inventory_2", "event"];
const colors = ["#e91e8c", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
