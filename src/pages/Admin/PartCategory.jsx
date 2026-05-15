import { useEffect, useMemo, useState } from "react";
import { deletePartCategory, getPartCategories } from "../../api/api";
import CategoryModal from "../../components/common/Modals/CategoryModal";

export default function PartCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        setLoading(true);

        const r = await getPartCategories();
        if (cancelled) return;

        setCategories(r.data?.data ?? []);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const refetch = () => setRefresh((r) => r + 1);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return categories;

    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(keyword) ||
        c.description?.toLowerCase().includes(keyword),
    );
  }, [categories, search]);

  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  const handleDelete = async (id) => {
    setDeleteLoading(true);

    try {
      await deletePartCategory(id);
      setDeleteId(null);
      refetch();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center">
          <div className="relative w-[320px]">
            <span
              className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
              style={{ fontSize: "18px" }}
            >
              search
            </span>

            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>
        </div>

        <button
          onClick={() => {
            setEditCategory(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Categories",
            value: totalCount,
            icon: "category",
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

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Part Categories
          </h3>
          <span className="text-[#555] text-[12px]">
            {filteredCategories.length} shown
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">
              Loading categories...
            </span>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              category
            </span>
            <p className="text-[#555] text-[13px] m-0">No categories found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 p-5">
            {filteredCategories.map((category) => {
              const isDeleting = deleteId === category.id;

              return (
                <div
                  key={category.id}
                  className={`bg-[#111] border rounded-xl p-4 flex flex-col gap-4 transition-colors ${
                    isDeleting
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-[#252525] hover:border-[#333]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[rgba(233,30,140,0.08)] border border-[rgba(233,30,140,0.18)] flex items-center justify-center shrink-0">
                      <span
                        className="material-icons text-[#e91e8c]"
                        style={{ fontSize: "20px" }}
                      >
                        category
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-white text-[14px] font-semibold m-0 truncate">
                        {category.name}
                      </h4>

                      <p className="text-[#555] text-[12px] m-0 mt-1 line-clamp-2 min-h-[36px]">
                        {category.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#202020]">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        category.isActive
                          ? "bg-green-500/15 text-green-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>

                    {isDeleting ? (
                      <div className="flex items-center gap-2">
                        <span className="text-red-400 text-[11px] font-medium">
                          Delete?
                        </span>

                        <button
                          onClick={() => handleDelete(category.id)}
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
                          onClick={() => {
                            setEditCategory(category);
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
                          onClick={() => setDeleteId(category.id)}
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <CategoryModal
        key={editCategory?.id ?? "new"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
        editCategory={editCategory}
      />
    </div>
  );
}
