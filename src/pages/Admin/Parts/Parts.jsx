import { useState, useEffect } from "react";
import {
  getParts,
  deletePart,
  searchParts,
  getLowStockParts,
  getAvailableParts,
} from "../../../api/api";
import PartModal from "./PartModal";
import PartDetailModal from "./PartDetailModal";

const stockStatus = (qty) => {
  if (qty === 0) return { label: "Out of Stock", cls: "bg-[#333] text-[#888]" };
  if (qty < 10)
    return { label: "Low Stock", cls: "bg-red-500/15 text-red-400" };
  return { label: "In Stock", cls: "bg-green-500/15 text-green-400" };
};

export default function Parts() {
  const [parts, setParts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPart, setEditPart] = useState(null);
  const [detailPart, setDetailPart] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const loadParts = async () => {
      try {
        setLoading(true);

        let r;

        if (search.trim()) {
          r = await searchParts(search.trim(), pageNumber, pageSize);
          const d = r.data?.data;
          if (cancelled) return;

          setParts(d?.items ?? []);
          setTotalCount(d?.totalCount ?? 0);
        } else if (filter === "low") {
          r = await getLowStockParts(10);
          const d = r.data?.data ?? [];
          if (cancelled) return;

          setParts(d);
          setTotalCount(d.length);
        } else if (filter === "available") {
          r = await getAvailableParts();
          const d = r.data?.data ?? [];
          if (cancelled) return;

          setParts(d);
          setTotalCount(d.length);
        } else {
          r = await getParts(pageNumber, pageSize);
          const d = r.data?.data;
          if (cancelled) return;

          setParts(d?.items ?? []);
          setTotalCount(d?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) {
          setParts([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadParts();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, refresh, search, filter]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleDelete = async (id) => {
    setDeleteLoading(true);

    try {
      await deletePart(id);
      setDeleteId(null);
      refetch();
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPages =
    filter === "all" && !search.trim() ? Math.ceil(totalCount / pageSize) : 1;

  const activeCount = parts.filter((p) => p.isActive).length;
  const lowStockCount = parts.filter(
    (p) => p.stockQty < 10 && p.stockQty > 0,
  ).length;
  const outOfStock = parts.filter((p) => p.stockQty === 0).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative w-[320px]">
            <span
              className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
              style={{ fontSize: "18px" }}
            >
              search
            </span>

            <input
              type="text"
              placeholder="Search parts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(1);
                setFilter("all");
              }}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>

          <FilterBtn active={filter === "all"} onClick={() => setFilter("all")}>
            All
          </FilterBtn>

          <FilterBtn active={filter === "low"} onClick={() => setFilter("low")}>
            Low Stock
          </FilterBtn>

          <FilterBtn
            active={filter === "available"}
            onClick={() => setFilter("available")}
          >
            Available
          </FilterBtn>
        </div>

        <button
          onClick={() => {
            setEditPart(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          Add Part
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Shown Parts",
            value: totalCount,
            icon: "inventory_2",
            color: "#e91e8c",
          },
          {
            label: "Active",
            value: activeCount,
            icon: "check_circle",
            color: "#22c55e",
          },
          {
            label: "Low Stock",
            value: lowStockCount,
            icon: "warning",
            color: "#f59e0b",
          },
          {
            label: "Out of Stock",
            value: outOfStock,
            icon: "remove_circle",
            color: "#ef4444",
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

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            All Parts
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
            <span className="text-[#555] text-[13px]">Loading parts...</span>
          </div>
        ) : parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              inventory_2
            </span>
            <p className="text-[#555] text-[13px] m-0">No parts found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Image",
                    "SKU",
                    "Name",
                    "Category",
                    "Vendor",
                    "Unit Price",
                    "Cost Price",
                    "Stock",
                    "Status",
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
                {parts.map((part) => {
                  const s = stockStatus(part.stockQty);
                  const isDeleting = deleteId === part.id;

                  return (
                    <tr
                      key={part.id}
                      className={`border-b border-[#1f1f1f] transition-colors ${
                        isDeleting ? "bg-red-500/5" : "hover:bg-[#1f1f1f]"
                      }`}
                    >
                      <td className="px-5 py-3">
                        {part.imageUrl ? (
                          <img
                            src={part.imageUrl}
                            alt={part.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#2a2a2a]"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[#252525] border border-[#2a2a2a] flex items-center justify-center">
                            <span
                              className="material-icons text-[#444]"
                              style={{ fontSize: "16px" }}
                            >
                              image
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <span className="text-[#e91e8c] text-[12px] font-mono font-semibold bg-[rgba(233,30,140,0.08)] px-2 py-0.5 rounded">
                          {part.sku}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className="text-white text-[13px] font-medium">
                          {part.name}
                        </span>
                        {part.description && (
                          <p className="text-[#555] text-[11px] m-0 mt-0.5 truncate max-w-[140px]">
                            {part.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3 text-[#888] text-[12px]">
                        {part.categoryName ?? "—"}
                      </td>

                      <td className="px-5 py-3 text-[#888] text-[12px]">
                        {part.vendorName ?? "—"}
                      </td>

                      <td className="px-5 py-3 text-white text-[13px] font-medium">
                        Rs. {part.unitPrice?.toLocaleString()}
                      </td>

                      <td className="px-5 py-3 text-[#888] text-[12px]">
                        Rs. {part.costPrice?.toLocaleString()}
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`text-[13px] font-bold ${
                            part.stockQty === 0
                              ? "text-[#555]"
                              : part.stockQty < 10
                                ? "text-red-400"
                                : "text-white"
                          }`}
                        >
                          {part.stockQty}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.cls}`}
                        >
                          {s.label}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        {isDeleting ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 text-[11px] font-medium">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(part.id)}
                              disabled={deleteLoading}
                              className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer hover:bg-red-500/30 disabled:opacity-50"
                            >
                              {deleteLoading ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={() => setDeleteId(null)}
                              className="text-[11px] text-[#555] hover:text-white cursor-pointer bg-transparent border-none"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDetailPart(part)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: "16px" }}
                              >
                                visibility
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setEditPart(part);
                                setModalOpen(true);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-[#e91e8c] hover:bg-[rgba(233,30,140,0.08)] transition-colors cursor-pointer bg-transparent border-none"
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: "16px" }}
                              >
                                edit
                              </span>
                            </button>

                            <button
                              onClick={() => setDeleteId(part.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none"
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: "16px" }}
                              >
                                delete
                              </span>
                            </button>
                          </div>
                        )}
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

      <PartModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        editPart={editPart}
      />

      <PartDetailModal
        open={!!detailPart}
        part={detailPart}
        onClose={() => setDetailPart(null)}
      />
    </div>
  );
}

const FilterBtn = ({ children, active, onClick }) => (
  <button
    onClick={() => {
      onClick();
    }}
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
