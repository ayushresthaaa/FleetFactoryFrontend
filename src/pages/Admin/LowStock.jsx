import { useState, useEffect } from "react";
import { getParts } from "../../api/api";

export default function LowStock() {
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const res = await getParts(1, 100);
        const all = res.data?.data?.items ?? [];

        if (!cancelled) {
          setParts(all.filter((p) => p.stockQty < 10));
        }
      } catch {
        if (!cancelled) setParts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const outOfStock = parts.filter((p) => p.stockQty === 0);
  const critical = parts.filter((p) => p.stockQty > 0 && p.stockQty <= 5);
  const low = parts.filter((p) => p.stockQty > 5 && p.stockQty < 10);

  return (
    <div className="flex flex-col gap-5">
      {parts.length > 0 && (
        <div className="flex items-center gap-3 bg-[rgba(233,30,140,0.08)] border border-[rgba(233,30,140,0.2)] rounded-xl px-5 py-4">
          <span
            className="material-icons text-[#e91e8c]"
            style={{ fontSize: "22px" }}
          >
            warning
          </span>

          <div className="flex-1">
            <div className="text-white text-[14px] font-semibold">
              {parts.length} parts need attention
            </div>

            <div className="text-[#888] text-[12px]">
              {outOfStock.length} out of stock · {critical.length} critical (≤5)
              · {low.length} low (6–9)
            </div>
          </div>

          <button
            onClick={() => setRefresh((r) => r + 1)}
            className="flex items-center gap-2 bg-[#e91e8c] text-white text-[12px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <span className="material-icons" style={{ fontSize: "15px" }}>
              refresh
            </span>
            Refresh
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Out of Stock",
            value: outOfStock.length,
            icon: "remove_circle",
            color: "#ef4444",
          },
          {
            label: "Critical (≤5)",
            value: critical.length,
            icon: "warning",
            color: "#f59e0b",
          },
          {
            label: "Low (6–9)",
            value: low.length,
            icon: "info",
            color: "#3b82f6",
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
            Low Stock Parts
          </h3>

          <button
            onClick={() => setRefresh((r) => r + 1)}
            className="flex items-center gap-1.5 text-[#555] hover:text-[#ccc] text-[12px] transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "15px" }}>
              refresh
            </span>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">Loading...</span>
          </div>
        ) : parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-green-400"
              style={{ fontSize: "40px" }}
            >
              check_circle
            </span>
            <p className="text-white text-[14px] font-semibold m-0">
              All stock levels are healthy!
            </p>
            <p className="text-[#555] text-[13px] m-0">
              No parts below 10 units
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "SKU",
                    "Part Name",
                    "Category",
                    "Vendor",
                    "Stock",
                    "Severity",
                    "Action",
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
                {parts
                  .sort((a, b) => a.stockQty - b.stockQty)
                  .map((part) => {
                    const severity =
                      part.stockQty === 0
                        ? {
                            label: "Out of Stock",
                            cls: "bg-red-500/15 text-red-400",
                            icon: "remove_circle",
                          }
                        : part.stockQty <= 5
                          ? {
                              label: "Critical",
                              cls: "bg-yellow-500/15 text-yellow-400",
                              icon: "warning",
                            }
                          : {
                              label: "Low",
                              cls: "bg-blue-500/15 text-blue-400",
                              icon: "info",
                            };

                    return (
                      <tr
                        key={part.id}
                        className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                            {part.sku}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-white text-[13px] font-medium">
                            {part.name}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-[#888] text-[12px]">
                            {part.categoryName ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="text-[#888] text-[12px]">
                            {part.vendorName ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`text-[15px] font-bold ${
                              part.stockQty === 0
                                ? "text-red-400"
                                : part.stockQty <= 5
                                  ? "text-yellow-400"
                                  : "text-blue-400"
                            }`}
                          >
                            {part.stockQty}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full ${severity.cls}`}
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "12px" }}
                            >
                              {severity.icon}
                            </span>
                            {severity.label}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <a
                            href="/admin/purchase-invoices"
                            className="flex items-center gap-1 text-[11px] font-medium text-[#e91e8c] hover:underline"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "13px" }}
                            >
                              add_shopping_cart
                            </span>
                            Restock
                          </a>
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
