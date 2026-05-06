import { useState } from "react";
import { getFinancialReport } from "../../api/api";

const REPORT_TYPES = [
  { key: "daily", label: "Today", icon: "today" },
  { key: "weekly", label: "This Week", icon: "date_range" },
  { key: "monthly", label: "This Month", icon: "calendar_month" },
  { key: "yearly", label: "This Year", icon: "bar_chart" },
];

export default function Reports() {
  const [reportType, setReportType] = useState("monthly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchReport = async (type) => {
    setLoading(true);
    setError("");
    setReportType(type);
    try {
      const res = await getFinancialReport(type);
      setReport(res.data?.data ?? null);
      setFetched(true);
    } catch {
      setError("Failed to load report. Please try again.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Report type tabs */}
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-1.5 flex gap-1">
        {REPORT_TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => fetchReport(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer border-none
              ${
                reportType === t.key && fetched
                  ? "bg-[#e91e8c] text-white"
                  : "bg-transparent text-[#888] hover:text-[#ccc] hover:bg-[#252525]"
              }`}
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Generate button — shown before first fetch */}
      {!fetched && !loading && (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
            <span
              className="material-icons text-[#e91e8c]"
              style={{ fontSize: "30px" }}
            >
              bar_chart
            </span>
          </div>
          <h2 className="text-white text-[16px] font-semibold m-0">
            Generate Financial Report
          </h2>
          <p className="text-[#555] text-[13px] m-0">
            Select a time period above to view the report
          </p>
          <button
            onClick={() => fetchReport(reportType)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none mt-2"
          >
            <span className="material-icons" style={{ fontSize: "17px" }}>
              play_arrow
            </span>
            Generate Report
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24 gap-3">
          <span
            className="material-icons text-[#e91e8c] animate-spin"
            style={{ fontSize: "22px" }}
          >
            refresh
          </span>
          <span className="text-[#555] text-[13px]">Generating report...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <span
            className="material-icons text-red-400"
            style={{ fontSize: "16px" }}
          >
            error
          </span>
          <span className="text-red-400 text-[13px]">{error}</span>
        </div>
      )}

      {report && !loading && (
        <>
          {/* Date range */}
          <div className="flex items-center gap-2 text-[#555] text-[12px]">
            <span className="material-icons" style={{ fontSize: "14px" }}>
              schedule
            </span>
            {new Date(report.fromDate).toLocaleDateString()} —{" "}
            {new Date(report.toDate).toLocaleDateString()}
          </div>

          {/* Main stat cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Total Sales",
                value: `Rs. ${report.totalSales?.toLocaleString()}`,
                icon: "point_of_sale",
                color: "#22c55e",
              },
              {
                label: "Total Purchases",
                value: `Rs. ${report.totalPurchases?.toLocaleString()}`,
                icon: "receipt_long",
                color: "#3b82f6",
              },
              {
                label: "Net Profit",
                value: `Rs. ${report.netProfit?.toLocaleString()}`,
                icon: "trending_up",
                color: report.netProfit >= 0 ? "#e91e8c" : "#ef4444",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#555] text-[12px] font-medium uppercase tracking-wider">
                    {s.label}
                  </span>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: s.color + "18",
                      border: `1px solid ${s.color}30`,
                    }}
                  >
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px", color: s.color }}
                    >
                      {s.icon}
                    </span>
                  </div>
                </div>
                <div
                  className="text-white text-2xl font-bold"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Invoice counts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <span
                  className="material-icons text-green-400"
                  style={{ fontSize: "22px" }}
                >
                  point_of_sale
                </span>
              </div>
              <div>
                <div className="text-[#555] text-[11px] font-medium uppercase tracking-wider mb-1">
                  Sales Invoices
                </div>
                <div className="text-white text-3xl font-bold">
                  {report.salesInvoiceCount}
                </div>
                <div className="text-[#555] text-[11px] mt-0.5">
                  invoices in period
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <span
                  className="material-icons text-blue-400"
                  style={{ fontSize: "22px" }}
                >
                  receipt_long
                </span>
              </div>
              <div>
                <div className="text-[#555] text-[11px] font-medium uppercase tracking-wider mb-1">
                  Purchase Invoices
                </div>
                <div className="text-white text-3xl font-bold">
                  {report.purchaseInvoiceCount}
                </div>
                <div className="text-[#555] text-[11px] mt-0.5">
                  invoices in period
                </div>
              </div>
            </div>
          </div>

          {/* Profit margin */}
          {report.totalSales > 0 && (
            <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white text-[14px] font-semibold">
                  Profit Margin
                </span>
                <span className="text-[#e91e8c] text-[14px] font-bold">
                  {((report.netProfit / report.totalSales) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-[#252525] rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#c2185b] transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.max((report.netProfit / report.totalSales) * 100, 0), 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[#555] text-[11px]">0%</span>
                <span className="text-[#555] text-[11px]">100%</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
