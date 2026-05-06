import { useState, useEffect } from "react";
import { getVendors, deleteVendor } from "../../api/api";
import VendorModal from "../../components/common/Modals/VendorModal";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getVendors(pageNumber, pageSize);
        const data = res.data?.data;
        if (!cancelled) {
          setVendors(data?.items ?? []);
          setTotalCount(data?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) setVendors([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, pageSize, refresh]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleDelete = async (id) => {
    setDeleteLoading(true);
    try {
      await deleteVendor(id);
      setDeleteId(null);
      refetch();
    } finally {
      setDeleteLoading(false);
    }
  };

  const openAdd = () => {
    setEditVendor(null);
    setModalOpen(true);
  };
  const openEdit = (v) => {
    setEditVendor(v);
    setModalOpen(true);
  };
  const totalPages = Math.ceil(totalCount / pageSize);

  const filtered = search
    ? vendors.filter(
        (v) =>
          v.name?.toLowerCase().includes(search.toLowerCase()) ||
          v.contactName?.toLowerCase().includes(search.toLowerCase()) ||
          v.email?.toLowerCase().includes(search.toLowerCase()) ||
          v.phone?.toLowerCase().includes(search.toLowerCase()),
      )
    : vendors;

  const activeCount = vendors.filter((v) => v.isActive).length;
  const inactiveCount = vendors.filter((v) => !v.isActive).length;

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <span
            className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
            style={{ fontSize: "17px" }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, contact, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-9 pr-3 py-2 text-[#ccc] text-[13px] outline-none focus:border-[#e91e8c] placeholder:text-[#444] transition-colors"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          Add Vendor
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Vendors",
            value: totalCount,
            icon: "storefront",
            color: "#e91e8c",
          },
          {
            label: "Active Vendors",
            value: activeCount,
            icon: "check_circle",
            color: "#22c55e",
          },
          {
            label: "Inactive Vendors",
            value: inactiveCount,
            icon: "cancel",
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
            All Vendors
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
            <span className="text-[#555] text-[13px]">Loading vendors...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              storefront
            </span>
            <p className="text-[#555] text-[13px] m-0">
              {search
                ? "No vendors match your search"
                : "No vendors yet — add your first vendor!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Vendor",
                    "Contact",
                    "Phone",
                    "Email",
                    "Address",
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
                {filtered.map((vendor) => {
                  const isDeleting = deleteId === vendor.id;
                  return (
                    <tr
                      key={vendor.id}
                      className={`border-b border-[#1f1f1f] transition-colors ${isDeleting ? "bg-red-500/5" : "hover:bg-[#1f1f1f]"}`}
                    >
                      {/* Vendor name + avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.15)] flex items-center justify-center text-[#e91e8c] text-[12px] font-bold shrink-0">
                            {vendor.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-white text-[13px] font-medium">
                            {vendor.name}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {vendor.contactName ?? "—"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {vendor.phone ?? "—"}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {vendor.email ?? "—"}
                        </span>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-3.5">
                        <span className="text-[#555] text-[12px] truncate max-w-[140px] block">
                          {vendor.address ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            vendor.isActive
                              ? "bg-green-500/15 text-green-400"
                              : "bg-[#333] text-[#888]"
                          }`}
                        >
                          {vendor.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        {isDeleting ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 text-[11px] font-medium">
                              Delete?
                            </span>
                            <button
                              onClick={() => handleDelete(vendor.id)}
                              disabled={deleteLoading}
                              className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer hover:bg-red-500/30 transition-colors disabled:opacity-50"
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
                              onClick={() => openEdit(vendor)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-[#e91e8c] hover:bg-[rgba(233,30,140,0.08)] transition-colors cursor-pointer bg-transparent border-none"
                              title="Edit"
                            >
                              <span
                                className="material-icons"
                                style={{ fontSize: "16px" }}
                              >
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => setDeleteId(vendor.id)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/08 transition-colors cursor-pointer bg-transparent border-none"
                              title="Delete"
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

        {/* Pagination */}
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

      <VendorModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        editVendor={editVendor}
      />
    </div>
  );
}

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium
      cursor-pointer border transition-colors
      ${active ? "bg-[#e91e8c] text-white border-[#e91e8c]" : "bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444]"}
      disabled:opacity-30 disabled:cursor-not-allowed
    `}
  >
    {children}
  </button>
);
