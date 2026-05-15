import { useEffect, useState } from "react";
import { getPartStockMovements } from "../../../api/api";

const money = (value) => `Rs. ${Number(value ?? 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString();
};

export default function PartDetailModal({ open, part, onClose }) {
  const [movements, setMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  useEffect(() => {
    if (!open || !part?.id) return;

    let cancelled = false;

    const loadMovements = async () => {
      try {
        setLoadingMovements(true);

        const r = await getPartStockMovements(part.id);

        if (cancelled) return;

        setMovements(r.data?.data ?? []);
      } catch {
        if (!cancelled) {
          setMovements([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingMovements(false);
        }
      }
    };

    loadMovements();

    return () => {
      cancelled = true;
    };
  }, [open, part?.id]);
  if (!open || !part) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525] sticky top-0 bg-[#1a1a1a] z-10">
          <div>
            <h2 className="text-white text-[16px] font-semibold m-0">
              {part.name}
            </h2>
            <p className="text-[#555] text-[11px] m-0 mt-0.5">
              SKU: {part.sku}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              close
            </span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-[180px_1fr] gap-5">
            <div className="w-full h-[180px] rounded-xl overflow-hidden bg-[#111] border border-[#2a2a2a] flex items-center justify-center">
              {part.imageUrl ? (
                <img
                  src={part.imageUrl}
                  alt={part.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="material-icons text-[#444]"
                  style={{ fontSize: "42px" }}
                >
                  image
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Info label="Category" value={part.categoryName ?? "—"} />
              <Info label="Vendor" value={part.vendorName ?? "—"} />
              <Info label="Unit Price" value={money(part.unitPrice)} />
              <Info label="Cost Price" value={money(part.costPrice)} />
              <Info label="Stock Qty" value={part.stockQty} />
              <Info
                label="Status"
                value={part.isActive ? "Active" : "Inactive"}
                tone={part.isActive ? "green" : "red"}
              />
              <Info label="Created At" value={formatDate(part.createdAt)} />
            </div>
          </div>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4">
            <h3 className="text-white text-[13px] font-semibold m-0 mb-2">
              Description
            </h3>
            <p className="text-[#888] text-[13px] m-0 leading-relaxed">
              {part.description || "No description provided."}
            </p>
          </div>

          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#252525] flex items-center justify-between">
              <h3 className="text-white text-[13px] font-semibold m-0">
                Stock Movements
              </h3>
              <span className="text-[#555] text-[11px]">
                {movements.length} records
              </span>
            </div>

            {loadingMovements ? (
              <div className="py-8 flex items-center justify-center gap-2">
                <span
                  className="material-icons text-[#e91e8c] animate-spin"
                  style={{ fontSize: "18px" }}
                >
                  refresh
                </span>
                <span className="text-[#555] text-[12px]">Loading...</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="py-8 text-center text-[#555] text-[12px]">
                No stock movements found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#252525]">
                    {["Type", "Qty", "Note", "Date"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[#555] text-[10px] font-semibold uppercase tracking-wider px-4 py-2"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-[#1f1f1f]">
                      <td className="px-4 py-2 text-[#e91e8c] text-[12px] font-semibold">
                        {m.movementType ?? m.type ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-white text-[12px]">
                        {m.quantity ?? m.qty ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-[#888] text-[12px]">
                        {m.note ?? m.reason ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-[#555] text-[12px]">
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Info = ({ label, value, tone }) => {
  const toneCls =
    tone === "green"
      ? "text-green-400"
      : tone === "red"
        ? "text-red-400"
        : "text-white";

  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-3">
      <div className="text-[#555] text-[10px] uppercase font-semibold tracking-wider">
        {label}
      </div>
      <div className={`text-[13px] font-medium mt-1 ${toneCls}`}>{value}</div>
    </div>
  );
};
