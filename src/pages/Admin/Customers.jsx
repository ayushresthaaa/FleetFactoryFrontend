import { useState, useEffect } from "react";
import { getCustomers, searchCustomers } from "../../api/api";
import CustomerModal from "../../components/common/Modals/CustomerModal";
import CustomerHistoryModal from "../../components/common/Modals/CustomerHistoryModal";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Normal paginated load
  useEffect(() => {
    if (isSearchMode) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getCustomers(pageNumber, pageSize);
        const data = res.data?.data;
        if (!cancelled) {
          setCustomers(data?.items ?? []);
          setTotalCount(data?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pageNumber, pageSize, refresh, isSearchMode]);

  // Search via API
  useEffect(() => {
    if (!searchQuery) return;
    let cancelled = false;
    async function doSearch() {
      setSearchLoading(true);
      try {
        const res = await searchCustomers(searchQuery);
        if (!cancelled) {
          setCustomers(res.data?.data ?? []);
          setTotalCount(res.data?.data?.length ?? 0);
        }
      } catch {
        if (!cancelled) setCustomers([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }
    doSearch();
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val.trim() === "") {
      setIsSearchMode(false);
      setSearchQuery("");
      setPageNumber(1);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setIsSearchMode(true);
    setSearchQuery(searchInput.trim());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearchMode(false);
    setPageNumber(1);
  };

  const refetch = () => setRefresh((r) => r + 1);
  const totalPages = Math.ceil(totalCount / pageSize);

  const openHistory = (customer) => {
    setSelectedCustomer(customer);
    setHistoryOpen(true);
  };

  const isLoading = loading || searchLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 min-w-[200px] max-w-md flex gap-2"
        >
          <div className="relative flex-1">
            <span
              className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
              style={{ fontSize: "17px" }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Search by name, phone, ID, vehicle number..."
              value={searchInput}
              onChange={handleSearchInput}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-9 pr-3 py-2 text-[#ccc] text-[13px] outline-none focus:border-[#e91e8c] placeholder:text-[#444] transition-colors"
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-[#333] rounded-lg text-[#ccc] text-[12px] font-medium transition-colors cursor-pointer"
          >
            <span className="material-icons" style={{ fontSize: "15px" }}>
              manage_search
            </span>
            Search
          </button>
          {isSearchMode && (
            <button
              type="button"
              onClick={clearSearch}
              className="flex items-center gap-1 px-3 py-2 bg-transparent border border-[#333] rounded-lg text-[#888] hover:text-white text-[12px] transition-colors cursor-pointer"
            >
              <span className="material-icons" style={{ fontSize: "15px" }}>
                close
              </span>
              Clear
            </button>
          )}
        </form>

        <div className="flex-1" />

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            person_add
          </span>
          Register Customer
        </button>
      </div>

      {/* Search mode banner */}
      {isSearchMode && (
        <div className="flex items-center gap-2 bg-[rgba(233,30,140,0.06)] border border-[rgba(233,30,140,0.15)] rounded-lg px-4 py-2.5">
          <span
            className="material-icons text-[#e91e8c]"
            style={{ fontSize: "15px" }}
          >
            manage_search
          </span>
          <span className="text-[#888] text-[12px]">
            Showing search results for{" "}
            <span className="text-white font-semibold">"{searchQuery}"</span> —{" "}
            {customers.length} result(s)
          </span>
          <button
            onClick={clearSearch}
            className="ml-auto text-[#555] hover:text-[#e91e8c] text-[12px] cursor-pointer bg-transparent border-none flex items-center gap-1"
          >
            <span className="material-icons" style={{ fontSize: "14px" }}>
              close
            </span>
            Show all
          </button>
        </div>
      )}

      {/* Stat cards — only in normal mode */}
      {!isSearchMode && (
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Customers",
              value: totalCount,
              icon: "group",
              color: "#e91e8c",
            },
            {
              label: "Total Vehicles",
              value: customers.reduce(
                (s, c) => s + (c.vehicles?.length ?? 0),
                0,
              ),
              icon: "directions_car",
              color: "#3b82f6",
            },
            {
              label: "With Credit",
              value: customers.filter((c) => c.creditBalance > 0).length,
              icon: "account_balance_wallet",
              color: "#f59e0b",
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
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            {isSearchMode ? "Search Results" : "All Customers"}
          </h3>
          <span className="text-[#555] text-[12px]">
            {customers.length} {isSearchMode ? "found" : "total"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">
              {searchLoading ? "Searching..." : "Loading customers..."}
            </span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              {isSearchMode ? "search_off" : "group"}
            </span>
            <p className="text-[#555] text-[13px] m-0">
              {isSearchMode
                ? `No customers found for "${searchQuery}"`
                : "No customers yet — register your first customer!"}
            </p>
            {isSearchMode && (
              <button
                onClick={clearSearch}
                className="text-[#e91e8c] text-[12px] cursor-pointer bg-transparent border-none hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Customer",
                    "Phone",
                    "Address",
                    "Vehicles",
                    "Credit Balance",
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
                {customers.map((customer) => (
                  <tr
                    key={customer.customerId ?? customer.id}
                    className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.15)] flex items-center justify-center text-[#e91e8c] text-[12px] font-bold shrink-0">
                          {customer.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-[13px] font-medium">
                            {customer.fullName}
                          </div>
                          <div className="text-[#555] text-[11px]">
                            ID:{" "}
                            {(customer.customerId ?? customer.id)?.slice(0, 8)}
                            ...
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[#888] text-[12px]">
                        {customer.phone ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-[#555] text-[12px] truncate max-w-[120px] block">
                        {customer.address ?? "—"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        {customer.vehicles?.length > 0 ? (
                          customer.vehicles.slice(0, 2).map((v) => (
                            <span
                              key={v.id}
                              className="flex items-center gap-1 text-[11px] text-[#888]"
                            >
                              <span
                                className="material-icons text-[#444]"
                                style={{ fontSize: "12px" }}
                              >
                                directions_car
                              </span>
                              {v.vehicleNumber}
                              {v.make && (
                                <span className="text-[#555]">
                                  ({v.make} {v.model})
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#555] text-[12px]">
                            No vehicles
                          </span>
                        )}
                        {customer.vehicles?.length > 2 && (
                          <span className="text-[#e91e8c] text-[11px]">
                            +{customer.vehicles.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[13px] font-semibold ${customer.creditBalance > 0 ? "text-yellow-400" : "text-[#555]"}`}
                      >
                        {customer.creditBalance > 0
                          ? `Rs. ${customer.creditBalance?.toLocaleString()}`
                          : "—"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => openHistory(customer)}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[rgba(233,30,140,0.08)] text-[#e91e8c] border border-[rgba(233,30,140,0.15)] hover:bg-[rgba(233,30,140,0.15)] transition-colors cursor-pointer"
                      >
                        <span
                          className="material-icons"
                          style={{ fontSize: "13px" }}
                        >
                          history
                        </span>
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination — only in normal mode */}
        {!isSearchMode && totalPages > 1 && (
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

      <CustomerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={refetch}
      />
      <CustomerHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        customer={selectedCustomer}
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
