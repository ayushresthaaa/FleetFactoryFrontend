import { useEffect, useState } from "react";
import StaffModal from "./StaffModal";
import { getStaff, deactivateStaff } from "../../../api/api";

const formatDate = (date) => {
  if (!date) return "No hired date";
  return new Date(date).toLocaleDateString();
};

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    staff: null,
  });

  const [actionLoading, setActionLoading] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getStaff(pageNumber, pageSize);
        const data = res.data?.data;

        if (cancelled) return;

        setStaff(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
      } catch {
        if (!cancelled) {
          setStaff([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, refresh]);

  const refetch = () => setRefresh((r) => r + 1);

  const openCreateModal = () => {
    setEditStaff(null);
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setEditStaff(member);
    setModalOpen(true);
  };

  const openDeleteModal = (member) => {
    setDeleteModal({
      open: true,
      staff: member,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      staff: null,
    });
  };

  const handleDeactivate = async () => {
    const id = deleteModal.staff?.staffProfileId;
    if (!id) return;

    setActionLoading(true);

    try {
      await deactivateStaff(id);
      closeDeleteModal();
      refetch();
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = search
    ? staff.filter((s) => {
        const text = `${s.fullName ?? ""} ${s.email ?? ""} ${s.phone ?? ""}`;
        return text.toLowerCase().includes(search.toLowerCase());
      })
    : staff;

  const totalPages = Math.ceil(totalCount / pageSize);
  const activeCount = staff.filter((s) => s.isActive).length;
  const inactiveCount = staff.filter((s) => !s.isActive).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="relative w-[340px]">
          <span
            className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
            style={{ fontSize: "18px" }}
          >
            search
          </span>

          <input
            type="text"
            placeholder="Search staff name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
          />
        </div>

        <div className="flex-1" />

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            person_add
          </span>
          Add Staff
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Staff" value={totalCount} icon="badge" />
        <StatCard label="Active" value={activeCount} icon="check_circle" />
        <StatCard label="Inactive" value={inactiveCount} icon="cancel" />
      </div>

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Staff Members
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
              {search ? "No staff match your search." : "No staff found."}
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
                {filtered.map((member) => (
                  <tr
                    key={member.staffProfileId}
                    className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.15)] flex items-center justify-center text-[#e91e8c] text-[12px] font-bold shrink-0">
                          {member.fullName?.[0]?.toUpperCase() || "S"}
                        </div>

                        <span className="text-white text-[13px] font-medium">
                          {member.fullName || "Unknown staff"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-[#888] text-[12px]">
                      {member.email || "No email"}
                    </td>

                    <td className="px-5 py-3.5 text-[#888] text-[12px]">
                      {member.phone || "No phone"}
                    </td>

                    <td className="px-5 py-3.5 text-[#555] text-[12px] max-w-[150px] truncate">
                      {member.address || "No address"}
                    </td>

                    <td className="px-5 py-3.5 text-[#555] text-[12px]">
                      {formatDate(member.hiredAt)}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          member.isActive
                            ? "bg-green-500/15 text-green-400"
                            : "bg-red-500/15 text-red-400"
                        }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(member)}
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
                            onClick={() => openDeleteModal(member)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border-none"
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
                    </td>
                  </tr>
                ))}
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

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && closeDeleteModal()}
        >
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
              <div>
                <h2 className="text-white text-[15px] font-semibold m-0">
                  Deactivate Staff
                </h2>
                <p className="text-[#555] text-[11px] m-0">
                  This staff account will no longer be active.
                </p>
              </div>

              <button
                onClick={closeDeleteModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors bg-transparent border-none"
              >
                <span className="material-icons" style={{ fontSize: "18px" }}>
                  close
                </span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="bg-[#111] border border-[#252525] rounded-lg px-4 py-3">
                <div className="text-[#666] text-xs">Staff Member</div>
                <div className="text-white text-sm font-semibold mt-1">
                  {deleteModal.staff?.fullName || "Unknown staff"}
                </div>
                <div className="text-[#555] text-xs mt-1">
                  {deleteModal.staff?.email || "No email"}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 py-2.5 rounded-lg border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#444] text-[13px] font-medium transition-colors bg-transparent"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeactivate}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-[13px] font-semibold hover:opacity-90 transition-opacity border-none disabled:opacity-50"
                >
                  {actionLoading ? "Deactivating..." : "Deactivate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const StatCard = ({ label, value, icon }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-[rgba(233,30,140,0.08)] border border-[rgba(233,30,140,0.18)] flex items-center justify-center shrink-0">
      <span
        className="material-icons text-[#e91e8c]"
        style={{ fontSize: "20px" }}
      >
        {icon}
      </span>
    </div>

    <div>
      <div className="text-white text-xl font-bold leading-tight">{value}</div>
      <div className="text-[#555] text-[11px] font-medium">{label}</div>
    </div>
  </div>
);

const PageBtn = ({ children, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium cursor-pointer border transition-colors bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);
