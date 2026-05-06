import { useState, useEffect } from "react";
import { getStaff, deactivateStaff } from "../../api/api";
import StaffModal from "../../components/common/Modals/StaffModal";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [deactivateId, setDeactivateId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getStaff(pageNumber, pageSize);
        const data = res.data?.data;
        if (!cancelled) {
          setStaff(data?.items ?? []);
          setTotalCount(data?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) setStaff([]);
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

  const handleDeactivate = async (id) => {
    setActionLoading(true);
    try {
      await deactivateStaff(id);
      setDeactivateId(null);
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const activeCount = staff.filter((s) => s.isActive).length;
  const inactiveCount = staff.filter((s) => !s.isActive).length;

  const filtered = search
    ? staff.filter(
        (s) =>
          s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
          s.email?.toLowerCase().includes(search.toLowerCase()) ||
          s.phone?.toLowerCase().includes(search.toLowerCase()),
      )
    : staff;

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
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-9 pr-3 py-2 text-[#ccc] text-[13px] outline-none focus:border-[#e91e8c] placeholder:text-[#444] transition-colors"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => {
            setEditStaff(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            person_add
          </span>
          Add Staff
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Staff",
            value: totalCount,
            icon: "badge",
            color: "#e91e8c",
          },
          {
            label: "Active",
            value: activeCount,
            icon: "check_circle",
            color: "#22c55e",
          },
          {
            label: "Inactive",
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
            All Staff
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
            <span className="text-[#555] text-[13px]">Loading staff...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              badge
            </span>
            <p className="text-[#555] text-[13px] m-0">
              {search ? "No staff match your search" : "No staff yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Staff Member",
                    "Email",
                    "Phone",
                    "Address",
                    "Hired",
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
                {filtered.map((member) => {
                  const isDeactivating = deactivateId === member.staffProfileId;
                  return (
                    <tr
                      key={member.staffProfileId}
                      className={`border-b border-[#1f1f1f] transition-colors ${isDeactivating ? "bg-red-500/5" : "hover:bg-[#1f1f1f]"}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.15)] flex items-center justify-center text-[#e91e8c] text-[12px] font-bold shrink-0">
                            {member.fullName?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-white text-[13px] font-medium">
                            {member.fullName}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {member.email}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {member.phone ?? "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[#555] text-[12px] truncate max-w-[120px] block">
                          {member.address ?? "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[#555] text-[12px]">
                          {member.hiredAt
                            ? new Date(member.hiredAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${member.isActive ? "bg-green-500/15 text-green-400" : "bg-[#333] text-[#888]"}`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {isDeactivating ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 text-[11px] font-medium">
                              Deactivate?
                            </span>
                            <button
                              onClick={() =>
                                handleDeactivate(member.staffProfileId)
                              }
                              disabled={actionLoading}
                              className="text-[11px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded cursor-pointer hover:bg-red-500/30 disabled:opacity-50"
                            >
                              {actionLoading ? "..." : "Yes"}
                            </button>
                            <button
                              onClick={() => setDeactivateId(null)}
                              className="text-[11px] text-[#555] hover:text-white cursor-pointer bg-transparent border-none"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditStaff(member);
                                setModalOpen(true);
                              }}
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
                            {member.isActive && (
                              <button
                                onClick={() =>
                                  setDeactivateId(member.staffProfileId)
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/08 transition-colors cursor-pointer bg-transparent border-none"
                                title="Deactivate"
                              >
                                <span
                                  className="material-icons"
                                  style={{ fontSize: "16px" }}
                                >
                                  person_off
                                </span>
                              </button>
                            )}
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

      <StaffModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        editStaff={editStaff}
      />
    </div>
  );
}

const PageBtn = ({ children, active, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium cursor-pointer border transition-colors
      ${active ? "bg-[#e91e8c] text-white border-[#e91e8c]" : "bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444]"}
      disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);
