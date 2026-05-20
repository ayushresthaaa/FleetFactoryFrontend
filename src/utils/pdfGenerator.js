import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generatePurchaseInvoicePDF(invoice) {
  const doc = new jsPDF();
  const pink = [233, 30, 140];
  const dark = [26, 26, 26];
  const grey = [100, 100, 100];
  const light = [240, 240, 240];

  const pageW = doc.internal.pageSize.getWidth();

  // ── Background header band ──────────────────────────────
  doc.setFillColor(...dark);
  doc.rect(0, 0, pageW, 45, "F");

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FleetFactory", 14, 18);

  // Subtitle
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Vehicle Parts & Inventory Management", 14, 25);

  // PURCHASE INVOICE label
  doc.setTextColor(...pink);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PURCHASE INVOICE", pageW - 14, 18, { align: "right" });

  // Invoice number
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.invoiceNo ?? "—", pageW - 14, 25, { align: "right" });

  // ── Pink accent line ────────────────────────────────────
  doc.setDrawColor(...pink);
  doc.setLineWidth(0.8);
  doc.line(0, 45, pageW, 45);

  // ── Invoice meta block ──────────────────────────────────
  let y = 55;

  doc.setTextColor(...grey);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("VENDOR", 14, y);
  doc.text("DATE", 80, y);
  doc.text("STATUS", 130, y);

  y += 6;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.vendorName ?? "—", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    new Date(invoice.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    80,
    y,
  );

  // Status pill
  const statusColors = {
    Pending: [245, 158, 11],
    Received: [59, 130, 246],
    Paid: [34, 197, 94],
    Cancelled: [239, 68, 68],
  };
  const sc = statusColors[invoice.status] ?? grey;
  doc.setFillColor(...sc);
  doc.roundedRect(128, y - 5, 28, 7, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.text(invoice.status ?? "—", 142, y, { align: "center" });

  y += 14;

  // ── Divider ─────────────────────────────────────────────
  doc.setDrawColor(...light);
  doc.setLineWidth(0.3);
  doc.line(14, y, pageW - 14, y);
  y += 8;

  // ── Items table ─────────────────────────────────────────
  const items = invoice.items ?? [];

  autoTable(doc, {
    startY: y,
    head: [
      ["#", "Part Name", "SKU", "Qty", "Unit Cost (Rs.)", "Subtotal (Rs.)"],
    ],
    body: items.map((item, idx) => [
      idx + 1,
      item.partName ?? "—",
      item.partSku ?? "—",
      item.quantity,
      Number(item.unitCost).toLocaleString(),
      Number(item.quantity * item.unitCost).toLocaleString(),
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
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Total block ─────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 8;

  doc.setFillColor(...dark);
  doc.roundedRect(pageW - 80, finalY, 66, 16, 2, 2, "F");

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("TOTAL AMOUNT", pageW - 14, finalY + 6, { align: "right" });

  doc.setTextColor(...pink);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rs. ${Number(invoice.totalAmount).toLocaleString()}`,
    pageW - 14,
    finalY + 13,
    { align: "right" },
  );

  // ── Footer ───────────────────────────────────────────────
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

  // ── Save ─────────────────────────────────────────────────
  doc.save(`PurchaseInvoice-${invoice.invoiceNo ?? "export"}.pdf`);
}

export function generateReportsPDF(report) {
  const {
    from,
    to,
    financial,
    profit,
    revenueTrend = [],
    paymentMethods = [],
    topParts = [],
    highSpenders = [],
    regularCustomers = [],
    pendingCredits = [],
    frequentVehicles = [],
    appointmentStats = [],
  } = report;

  const money = (v) => `Rs. ${Number(v ?? 0).toLocaleString()}`;

  const doc = new jsPDF();
  const pink = [233, 30, 140];
  const dark = [26, 26, 26];
  const grey = [100, 100, 100];

  const pageW = doc.internal.pageSize.getWidth();

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
  doc.text(`${from} to ${to}`, pageW - 14, 25, { align: "right" });

  doc.setDrawColor(...pink);
  doc.setLineWidth(0.8);
  doc.line(0, 45, pageW, 45);

  autoTable(doc, {
    startY: 58,
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
  });

  const addTable = (title, rows) => {
    if (!rows || rows.length === 0) return;

    const titleY = doc.lastAutoTable.finalY + 12;

    doc.setTextColor(...pink);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, titleY);

    autoTable(doc, {
      startY: titleY + 4,
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
      },
      bodyStyles: {
        fontSize: 8.5,
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
    const titleY = doc.lastAutoTable.finalY + 12;

    doc.setTextColor(...pink);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Pending Credits", 14, titleY);

    autoTable(doc, {
      startY: titleY + 4,
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
      },
    });
  }

  doc.setTextColor(...grey);
  doc.setFontSize(7.5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 285);

  doc.save(`FleetFactory-Report-${from}-to-${to}.pdf`);
}
