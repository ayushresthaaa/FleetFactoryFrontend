import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getFinancialSummary,
  getRevenueTrend,
  getPaymentMethodsReport,
  getProfitEstimate,
  getTopSellingPartsReport,
  getHighSpenders,
  getRegularCustomers,
  getPendingCredits,
  getFrequentVehicles,
  getAppointmentStats,
} from "../../../api/api";

const money = (v) => `Rs. ${Number(v ?? 0).toLocaleString()}`;

export default function Reports() {
  const [from, setFrom] = useState("2026-01-01");
  const [to, setTo] = useState(new Date().toISOString().split("T")[0]);

  const [financial, setFinancial] = useState(null);
  const [profit, setProfit] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [topParts, setTopParts] = useState([]);
  const [highSpenders, setHighSpenders] = useState([]);
  const [regularCustomers, setRegularCustomers] = useState([]);
  const [pendingCredits, setPendingCredits] = useState([]);
  const [frequentVehicles, setFrequentVehicles] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        financialRes,
        profitRes,
        revenueRes,
        paymentRes,
        topPartsRes,
        highSpendersRes,
        regularCustomersRes,
        pendingCreditsRes,
        frequentVehiclesRes,
        appointmentStatsRes,
      ] = await Promise.all([
        getFinancialSummary(from, to),
        getProfitEstimate(from, to),
        getRevenueTrend(from, to, "day"),
        getPaymentMethodsReport(from, to),
        getTopSellingPartsReport(from, to),
        getHighSpenders(from, to),
        getRegularCustomers(from, to),
        getPendingCredits(),
        getFrequentVehicles(from, to),
        getAppointmentStats(from, to),
      ]);

      setFinancial(financialRes.data?.data);
      setProfit(profitRes.data?.data);
      setRevenueTrend(revenueRes.data?.data ?? []);
      setPaymentMethods(paymentRes.data?.data ?? []);
      setTopParts(topPartsRes.data?.data ?? []);
      setHighSpenders(highSpendersRes.data?.data ?? []);
      setRegularCustomers(regularCustomersRes.data?.data ?? []);
      setPendingCredits(pendingCreditsRes.data?.data ?? []);
      setFrequentVehicles(frequentVehiclesRes.data?.data ?? []);
      setAppointmentStats(appointmentStatsRes.data?.data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let cancelled = false;

    const loadInitialReports = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          financialRes,
          profitRes,
          revenueRes,
          paymentRes,
          topPartsRes,
          highSpendersRes,
          regularCustomersRes,
          pendingCreditsRes,
          frequentVehiclesRes,
          appointmentStatsRes,
        ] = await Promise.all([
          getFinancialSummary(from, to),
          getProfitEstimate(from, to),
          getRevenueTrend(from, to, "day"),
          getPaymentMethodsReport(from, to),
          getTopSellingPartsReport(from, to),
          getHighSpenders(from, to),
          getRegularCustomers(from, to),
          getPendingCredits(),
          getFrequentVehicles(from, to),
          getAppointmentStats(from, to),
        ]);

        if (cancelled) return;

        setFinancial(financialRes.data?.data);
        setProfit(profitRes.data?.data);
        setRevenueTrend(revenueRes.data?.data ?? []);
        setPaymentMethods(paymentRes.data?.data ?? []);
        setTopParts(topPartsRes.data?.data ?? []);
        setHighSpenders(highSpendersRes.data?.data ?? []);
        setRegularCustomers(regularCustomersRes.data?.data ?? []);
        setPendingCredits(pendingCreditsRes.data?.data ?? []);
        setFrequentVehicles(frequentVehiclesRes.data?.data ?? []);
        setAppointmentStats(appointmentStatsRes.data?.data ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load reports.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialReports();

    return () => {
      cancelled = true;
    };
  }, []);
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    const pink = [233, 30, 140];
    const dark = [26, 26, 26];
    const grey = [100, 100, 100];
    const light = [240, 240, 240];

    doc.setFillColor(...dark);
    doc.rect(0, 0, pageW, 45, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("FleetFactory", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Vehicle Parts & Inventory Management", 14, 25);

    doc.setTextColor(...pink);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("BUSINESS REPORT", pageW - 14, 18, { align: "right" });

    doc.setTextColor(200, 200, 200);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${from} to ${to}`, pageW - 14, 25, { align: "right" });

    doc.setDrawColor(...pink);
    doc.setLineWidth(0.8);
    doc.line(0, 45, pageW, 45);

    let y = 58;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Total Revenue", money(financial?.totalRevenue)],
        ["Total Purchases", money(financial?.totalPurchases)],
        ["Net Profit", money(financial?.netProfit)],
        ["Sales Invoices", financial?.salesInvoiceCount ?? 0],
        ["Purchase Invoices", financial?.purchaseInvoiceCount ?? 0],
        [profit?.label || "Profit Estimate", money(profit?.value)],
      ],
      theme: "grid",
      headStyles: {
        fillColor: dark,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 9,
      },
      margin: { left: 14, right: 14 },
    });

    const addTable = (title, rows) => {
      if (!rows || rows.length === 0) return;

      const startTitleY = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(12);
      doc.setTextColor(...pink);
      doc.setFont("helvetica", "bold");
      doc.text(title, 14, startTitleY);

      autoTable(doc, {
        startY: startTitleY + 4,
        head: [["Name / Label", "Value", "Count"]],
        body: rows.map((r) => [
          r.name ?? r.label ?? "—",
          money(r.value),
          r.count ?? "—",
        ]),
        theme: "grid",
        headStyles: {
          fillColor: dark,
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8.5,
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [40, 40, 40],
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250],
        },
        margin: { left: 14, right: 14 },
      });
    };

    addTable("Revenue Trend", revenueTrend);
    addTable("Payment Methods", paymentMethods);
    addTable("Appointment Stats", appointmentStats);
    addTable("Top Selling Parts", topParts);
    addTable("High Spenders", highSpenders);
    addTable("Regular Customers", regularCustomers);
    addTable("Frequent Vehicles", frequentVehicles);

    if (pendingCredits.length > 0) {
      const startTitleY = doc.lastAutoTable.finalY + 12;

      doc.setFontSize(12);
      doc.setTextColor(...pink);
      doc.setFont("helvetica", "bold");
      doc.text("Pending Credits", 14, startTitleY);

      autoTable(doc, {
        startY: startTitleY + 4,
        head: [["Customer", "Phone", "Credit Balance"]],
        body: pendingCredits.map((r) => [
          r.customerName ?? "—",
          r.phone ?? "—",
          money(r.creditBalance),
        ]),
        theme: "grid",
        headStyles: {
          fillColor: dark,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          fontSize: 8.5,
        },
        margin: { left: 14, right: 14 },
      });
    }

    const footerY = doc.internal.pageSize.getHeight() - 14;
    doc.setDrawColor(...light);
    doc.setLineWidth(0.3);
    doc.line(14, footerY - 6, pageW - 14, footerY - 6);

    doc.setTextColor(...grey);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "FleetFactory — Vehicle Parts & Inventory Management System",
      14,
      footerY,
    );
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageW - 14, footerY, {
      align: "right",
    });

    doc.save(`FleetFactory-Report-${from}-to-${to}.pdf`);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Reports</h1>
          <p className="text-[#666] text-sm mt-1">
            Financial, customer, sales, vehicle, and appointment analytics.
          </p>
        </div>

        <button
          onClick={handleGeneratePDF}
          className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold"
        >
          Generate PDF
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 flex items-end gap-3">
        <Field label="From">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
        </Field>

        <Field label="To">
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
        </Field>

        <button
          onClick={loadReports}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-[#e91e8c] text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Loading..." : "Generate"}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-white text-lg font-semibold">Report Summary</h2>
          <p className="text-[#777] text-sm">
            Date range: {from} to {to}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <StatCard
            label="Total Revenue"
            value={money(financial?.totalRevenue)}
          />
          <StatCard
            label="Total Purchases"
            value={money(financial?.totalPurchases)}
          />
          <StatCard label="Net Profit" value={money(financial?.netProfit)} />
          <StatCard
            label="Sales Invoices"
            value={financial?.salesInvoiceCount ?? 0}
          />
          <StatCard
            label="Purchase Invoices"
            value={financial?.purchaseInvoiceCount ?? 0}
          />
        </div>

        {profit && (
          <div className="grid grid-cols-1 gap-4">
            <StatCard
              label={profit.label || "Profit Estimate"}
              value={money(profit.value)}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-5">
          <ChartSection title="Revenue Trend" rows={revenueTrend} />
          <ChartSection title="Payment Methods" rows={paymentMethods} />
          <ChartSection title="Appointment Stats" rows={appointmentStats} />
        </div>

        <ReportTable title="Top Selling Parts" rows={topParts} />
        <ReportTable title="High Spenders" rows={highSpenders} />
        <ReportTable title="Regular Customers" rows={regularCustomers} />
        <ReportTable title="Frequent Vehicles" rows={frequentVehicles} />

        <PendingCreditTable rows={pendingCredits} />
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[#888] text-xs font-medium">{label}</label>
    {children}
  </div>
);

const StatCard = ({ label, value }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
    <div className="text-white text-xl font-bold">{value}</div>
    <div className="text-[#555] text-xs font-medium mt-1">{label}</div>
  </div>
);

const ChartSection = ({ title, rows }) => (
  <section className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
    <div className="px-5 py-3 border-b border-[#252525]">
      <h3 className="text-white text-sm font-semibold">{title}</h3>
    </div>

    {rows.length === 0 ? (
      <Empty text="No data available." />
    ) : (
      <div className="p-5 flex flex-col gap-3">
        {rows.map((r, index) => (
          <div key={`${r.label}-${index}`}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#aaa]">{r.label}</span>
              <span className="text-white font-semibold">{money(r.value)}</span>
            </div>

            <div className="h-2 rounded-full bg-[#111] overflow-hidden">
              <div
                className="h-full bg-[#e91e8c]"
                style={{ width: `${getBarWidth(r.value, rows)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

const ReportTable = ({ title, rows }) => (
  <section className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
    <div className="px-5 py-3 border-b border-[#252525]">
      <h3 className="text-white text-sm font-semibold">{title}</h3>
    </div>

    {rows.length === 0 ? (
      <Empty text="No data available." />
    ) : (
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#252525]">
            {["Name", "Value", "Count"].map((h) => (
              <th
                key={h}
                className="text-left text-[#555] text-xs uppercase px-5 py-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, index) => (
            <tr
              key={`${r.name}-${index}`}
              className="border-b border-[#1f1f1f]"
            >
              <td className="px-5 py-3 text-white text-sm">{r.name}</td>
              <td className="px-5 py-3 text-[#ddd] text-sm">
                {money(r.value)}
              </td>
              <td className="px-5 py-3 text-[#888] text-sm">{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
);

const PendingCreditTable = ({ rows }) => (
  <section className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
    <div className="px-5 py-3 border-b border-[#252525]">
      <h3 className="text-white text-sm font-semibold">Pending Credits</h3>
    </div>

    {rows.length === 0 ? (
      <Empty text="No pending credits found." />
    ) : (
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#252525]">
            {["Customer", "Phone", "Credit Balance"].map((h) => (
              <th
                key={h}
                className="text-left text-[#555] text-xs uppercase px-5 py-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.customerId} className="border-b border-[#1f1f1f]">
              <td className="px-5 py-3 text-white text-sm">{r.customerName}</td>
              <td className="px-5 py-3 text-[#888] text-sm">
                {r.phone || "—"}
              </td>
              <td className="px-5 py-3 text-yellow-400 text-sm font-semibold">
                {money(r.creditBalance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </section>
);

const Empty = ({ text }) => (
  <div className="py-12 text-center text-[#555] text-sm">{text}</div>
);

const getBarWidth = (value, rows) => {
  const max = Math.max(...rows.map((r) => Number(r.value || 0)), 1);
  return Math.max(8, (Number(value || 0) / max) * 100);
};

const inputCls =
  "bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#e91e8c]";
