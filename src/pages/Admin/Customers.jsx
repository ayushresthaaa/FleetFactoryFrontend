import { useState, useEffect } from "react";
import { getCustomers, searchCustomers, getVehicles, searchVehicles } from "../../api/api";
import CustomerModal from "../../components/common/Modals/CustomerModal";
import CustomerHistoryModal from "../../components/common/Modals/CustomerHistoryModal";
import VehicleModal from "../../components/common/Modals/VehicleModal";

const FUEL_COLOR = {
  Petrol:   { text: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)"  },
  Diesel:   { text: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.2)"   },
  Electric: { text: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.2)"  },
  Hybrid:   { text: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)" },
  CNG:      { text: "#06b6d4", bg: "rgba(6,182,212,0.1)",   border: "rgba(6,182,212,0.2)"   },
};

const svcStatus = (lastService) => {
  if (!lastService) return { label: "Unknown", color: "#555" };
  const months = (Date.now() - new Date(lastService)) / (1000 * 60 * 60 * 24 * 30);
  if (months < 3)  return { label: "Recent",   color: "#22c55e" };
  if (months < 6)  return { label: "Due Soon", color: "#f59e0b" };
  return               { label: "Overdue",  color: "#ef4444" };
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMERS TAB
// ─────────────────────────────────────────────────────────────────────────────
function CustomersTab() {
  const [customers, setCustomers]       = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [pageNumber, setPageNumber]     = useState(1);
  const pageSize = 10;
  const [loading, setLoading]           = useState(true);
  const [refresh, setRefresh]           = useState(0);

  const [searchInput, setSearchInput]   = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [modalOpen, setModalOpen]             = useState(false);
  const [historyOpen, setHistoryOpen]         = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
    return () => { cancelled = true; };
  }, [pageNumber, pageSize, refresh, isSearchMode]);

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
    return () => { cancelled = true; };
  }, [searchQuery]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val.trim() === "") { setIsSearchMode(false); setSearchQuery(""); setPageNumber(1); }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setIsSearchMode(true);
    setSearchQuery(searchInput.trim());
  };
  const clearSearch = () => {
    setSearchInput(""); setSearchQuery(""); setIsSearchMode(false); setPageNumber(1);
  };

  const refetch = () => setRefresh((r) => r + 1);
  const totalPages = Math.ceil(totalCount / pageSize);
  const isLoading = loading || searchLoading;

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-md flex gap-2">
          <div className="relative flex-1">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" style={{ fontSize: "17px" }}>search</span>
            <input
              type="text"
              placeholder="Search by name, phone, ID, vehicle number..."
              value={searchInput}
              onChange={handleSearchInput}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-9 pr-3 py-2 text-[#ccc] text-[13px] outline-none focus:border-[#e91e8c] placeholder:text-[#444] transition-colors"
            />
          </div>
          <button type="submit" className="flex items-center gap-1.5 px-3 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-[#333] rounded-lg text-[#ccc] text-[12px] font-medium transition-colors cursor-pointer">
            <span className="material-icons" style={{ fontSize: "15px" }}>manage_search</span>
            Search
          </button>
          {isSearchMode && (
            <button type="button" onClick={clearSearch} className="flex items-center gap-1 px-3 py-2 bg-transparent border border-[#333] rounded-lg text-[#888] hover:text-white text-[12px] transition-colors cursor-pointer">
              <span className="material-icons" style={{ fontSize: "15px" }}>close</span>
              Clear
            </button>
          )}
        </form>
        <div className="flex-1" />
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>person_add</span>
          Register Customer
        </button>
      </div>

      {/* Search banner */}
      {isSearchMode && (
        <div className="flex items-center gap-2 bg-[rgba(233,30,140,0.06)] border border-[rgba(233,30,140,0.15)] rounded-lg px-4 py-2.5">
          <span className="material-icons text-[#e91e8c]" style={{ fontSize: "15px" }}>manage_search</span>
          <span className="text-[#888] text-[12px]">
            Showing search results for <span className="text-white font-semibold">"{searchQuery}"</span> — {customers.length} result(s)
          </span>
          <button onClick={clearSearch} className="ml-auto text-[#555] hover:text-[#e91e8c] text-[12px] cursor-pointer bg-transparent border-none flex items-center gap-1">
            <span className="material-icons" style={{ fontSize: "14px" }}>close</span>
            Show all
          </button>
        </div>
      )}

      {/* Stat cards */}
      {!isSearchMode && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Customers", value: totalCount, icon: "group", color: "#e91e8c" },
            { label: "Total Vehicles",  value: customers.reduce((s, c) => s + (c.vehicles?.length ?? 0), 0), icon: "directions_car", color: "#3b82f6" },
            { label: "With Credit",     value: customers.filter((c) => c.creditBalance > 0).length, icon: "account_balance_wallet", color: "#f59e0b" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + "18", border: `1px solid ${s.color}30` }}>
                <span className="material-icons" style={{ fontSize: "20px", color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <div className="text-white text-xl font-bold leading-tight">{s.value}</div>
                <div className="text-[#555] text-[11px] font-medium">{s.label}</div>
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
          <span className="text-[#555] text-[12px]">{customers.length} {isSearchMode ? "found" : "total"}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span className="material-icons text-[#e91e8c] animate-spin" style={{ fontSize: "22px" }}>refresh</span>
            <span className="text-[#555] text-[13px]">{searchLoading ? "Searching..." : "Loading customers..."}</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="material-icons text-[#333]" style={{ fontSize: "40px" }}>{isSearchMode ? "search_off" : "group"}</span>
            <p className="text-[#555] text-[13px] m-0">
              {isSearchMode ? `No customers found for "${searchQuery}"` : "No customers yet — register your first customer!"}
            </p>
            {isSearchMode && (
              <button onClick={clearSearch} className="text-[#e91e8c] text-[12px] cursor-pointer bg-transparent border-none hover:underline">Clear search</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {["Customer", "Phone", "Address", "Vehicles", "Credit Balance", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customerId ?? customer.id} className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.15)] flex items-center justify-center text-[#e91e8c] text-[12px] font-bold shrink-0">
                          {customer.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white text-[13px] font-medium">{customer.fullName}</div>
                          <div className="text-[#555] text-[11px]">ID: {(customer.customerId ?? customer.id)?.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[#888] text-[12px]">{customer.phone ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[#555] text-[12px] truncate max-w-[120px] block">{customer.address ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1">
                        {customer.vehicles?.length > 0 ? (
                          customer.vehicles.slice(0, 2).map((v) => (
                            <span key={v.id} className="flex items-center gap-1 text-[11px] text-[#888]">
                              <span className="material-icons text-[#444]" style={{ fontSize: "12px" }}>directions_car</span>
                              {v.vehicleNumber}
                              {v.make && <span className="text-[#555]">({v.make} {v.model})</span>}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#555] text-[12px]">No vehicles</span>
                        )}
                        {customer.vehicles?.length > 2 && (
                          <span className="text-[#e91e8c] text-[11px]">+{customer.vehicles.length - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[13px] font-semibold ${customer.creditBalance > 0 ? "text-yellow-400" : "text-[#555]"}`}>
                        {customer.creditBalance > 0 ? `Rs. ${customer.creditBalance?.toLocaleString()}` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { setSelectedCustomer(customer); setHistoryOpen(true); }}
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[rgba(233,30,140,0.08)] text-[#e91e8c] border border-[rgba(233,30,140,0.15)] hover:bg-[rgba(233,30,140,0.15)] transition-colors cursor-pointer"
                      >
                        <span className="material-icons" style={{ fontSize: "13px" }}>history</span>
                        History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isSearchMode && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#252525]">
            <span className="text-[#555] text-[12px]">
              Showing {(pageNumber - 1) * pageSize + 1}–{Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <PageBtn disabled={pageNumber === 1} onClick={() => setPageNumber((p) => p - 1)}>
                <span className="material-icons" style={{ fontSize: "16px" }}>chevron_left</span>
              </PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`e-${i}`} className="text-[#555] px-1 text-[12px]">...</span>
                  ) : (
                    <PageBtn key={item} active={item === pageNumber} onClick={() => setPageNumber(item)}>{item}</PageBtn>
                  )
                )}
              <PageBtn disabled={pageNumber === totalPages} onClick={() => setPageNumber((p) => p + 1)}>
                <span className="material-icons" style={{ fontSize: "16px" }}>chevron_right</span>
              </PageBtn>
            </div>
          </div>
        )}
      </div>

      <CustomerModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={refetch} />
      <CustomerHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} customer={selectedCustomer} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VEHICLES TAB
// ─────────────────────────────────────────────────────────────────────────────
function VehiclesTab() {
  const [vehicles, setVehicles]         = useState([]);
  const [totalCount, setTotalCount]     = useState(0);
  const [pageNumber, setPageNumber]     = useState(1);
  const pageSize = 10;
  const [loading, setLoading]           = useState(true);
  const [refresh, setRefresh]           = useState(0);

  const [searchInput, setSearchInput]   = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [fuelFilter, setFuelFilter]     = useState("All");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editVehicle, setEditVehicle]   = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (isSearchMode) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await getVehicles(pageNumber, pageSize);
        const data = res.data?.data;
        if (!cancelled) {
          setVehicles(data?.items ?? []);
          setTotalCount(data?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) setVehicles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [pageNumber, pageSize, refresh, isSearchMode]);

  useEffect(() => {
    if (!searchQuery) return;
    let cancelled = false;
    async function doSearch() {
      setSearchLoading(true);
      try {
        const res = await searchVehicles(searchQuery);
        if (!cancelled) {
          setVehicles(res.data?.data ?? []);
          setTotalCount(res.data?.data?.length ?? 0);
        }
      } catch {
        if (!cancelled) setVehicles([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }
    doSearch();
    return () => { cancelled = true; };
  }, [searchQuery]);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    if (val.trim() === "") { setIsSearchMode(false); setSearchQuery(""); setPageNumber(1); }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setIsSearchMode(true);
    setSearchQuery(searchInput.trim());
  };
  const clearSearch = () => {
    setSearchInput(""); setSearchQuery(""); setIsSearchMode(false); setPageNumber(1);
  };

  const refetch = () => setRefresh((r) => r + 1);
  const totalPages = Math.ceil(totalCount / pageSize);
  const isLoading = loading || searchLoading;
  const displayed = fuelFilter === "All" ? vehicles : vehicles.filter((v) => v.fuelType === fuelFilter);

  return (
    <div className="flex flex-col gap-5">
      {/* Top bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-md flex gap-2">
          <div className="relative flex-1">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" style={{ fontSize: "17px" }}>search</span>
            <input
              type="text"
              placeholder="Search by plate, make, model, customer..."
              value={searchInput}
              onChange={handleSearchInput}
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-9 pr-3 py-2 text-[#ccc] text-[13px] outline-none focus:border-[#e91e8c] placeholder:text-[#444] transition-colors"
            />
          </div>
          <button type="submit" className="flex items-center gap-1.5 px-3 py-2 bg-[#252525] hover:bg-[#2a2a2a] border border-[#333] rounded-lg text-[#ccc] text-[12px] font-medium transition-colors cursor-pointer">
            <span className="material-icons" style={{ fontSize: "15px" }}>manage_search</span>
            Search
          </button>
          {isSearchMode && (
            <button type="button" onClick={clearSearch} className="flex items-center gap-1 px-3 py-2 bg-transparent border border-[#333] rounded-lg text-[#888] hover:text-white text-[12px] transition-colors cursor-pointer">
              <span className="material-icons" style={{ fontSize: "15px" }}>close</span>
              Clear
            </button>
          )}
        </form>

        {/* Fuel filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["All", "Petrol", "Diesel", "Electric", "Hybrid", "CNG"].map((f) => (
            <button
              key={f}
              onClick={() => setFuelFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer
                ${fuelFilter === f
                  ? "bg-[rgba(233,30,140,0.1)] text-[#e91e8c] border-[rgba(233,30,140,0.3)]"
                  : "bg-transparent text-[#555] border-[#252525] hover:text-[#888] hover:border-[#333]"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1" />
        <button
          onClick={() => { setEditVehicle(null); setModalOpen(true); }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>add</span>
          Register Vehicle
        </button>
      </div>

      {/* Search banner */}
      {isSearchMode && (
        <div className="flex items-center gap-2 bg-[rgba(233,30,140,0.06)] border border-[rgba(233,30,140,0.15)] rounded-lg px-4 py-2.5">
          <span className="material-icons text-[#e91e8c]" style={{ fontSize: "15px" }}>manage_search</span>
          <span className="text-[#888] text-[12px]">
            Showing results for <span className="text-white font-semibold">"{searchQuery}"</span> — {vehicles.length} result(s)
          </span>
          <button onClick={clearSearch} className="ml-auto text-[#555] hover:text-[#e91e8c] text-[12px] cursor-pointer bg-transparent border-none flex items-center gap-1">
            <span className="material-icons" style={{ fontSize: "14px" }}>close</span>
            Show all
          </button>
        </div>
      )}

      {/* Stat cards */}
      {!isSearchMode && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Vehicles", value: totalCount,                                                  icon: "directions_car",    color: "#e91e8c" },
            { label: "Petrol",         value: vehicles.filter((v) => v.fuelType === "Petrol").length,   icon: "local_gas_station", color: "#f59e0b" },
            { label: "Diesel",         value: vehicles.filter((v) => v.fuelType === "Diesel").length,   icon: "local_gas_station", color: "#22c55e" },
            { label: "Electric",       value: vehicles.filter((v) => v.fuelType === "Electric").length, icon: "bolt",              color: "#3b82f6" },
          ].map((s) => (
            <div key={s.label} className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.color + "18", border: `1px solid ${s.color}30` }}>
                <span className="material-icons" style={{ fontSize: "20px", color: s.color }}>{s.icon}</span>
              </div>
              <div>
                <div className="text-white text-xl font-bold leading-tight">{s.value}</div>
                <div className="text-[#555] text-[11px] font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            {isSearchMode ? "Search Results" : "All Vehicles"}
          </h3>
          <span className="text-[#555] text-[12px]">{displayed.length} {isSearchMode ? "found" : "shown"}</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span className="material-icons text-[#e91e8c] animate-spin" style={{ fontSize: "22px" }}>refresh</span>
            <span className="text-[#555] text-[13px]">{searchLoading ? "Searching..." : "Loading vehicles..."}</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="material-icons text-[#333]" style={{ fontSize: "40px" }}>{isSearchMode ? "search_off" : "directions_car"}</span>
            <p className="text-[#555] text-[13px] m-0">
              {isSearchMode ? `No vehicles found for "${searchQuery}"` : "No vehicles yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {["Vehicle", "Plate / VIN", "Owner", "Mileage", "Last Service", "Actions"].map((h) => (
                    <th key={h} className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((v) => {
                  const id  = v.vehicleId ?? v.id;
                  const fc  = FUEL_COLOR[v.fuelType] ?? { text: "#888", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.1)" };
                  const svc = svcStatus(v.lastService);
                  return (
                    <tr key={id} className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#252525] border border-[#333] flex items-center justify-center shrink-0">
                            <span className="material-icons text-[#555]" style={{ fontSize: "17px" }}>directions_car</span>
                          </div>
                          <div>
                            <div className="text-white text-[13px] font-medium">{v.year} {v.make} {v.model}</div>
                            <span className="text-[10px] font-semibold px-1.5 py-px rounded" style={{ background: fc.bg, color: fc.text, border: `1px solid ${fc.border}` }}>
                              {v.fuelType}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[#ccc] text-[12px] font-mono font-semibold tracking-wide">{v.vehicleNumber}</div>
                        {v.vin && <div className="text-[#555] text-[11px] font-mono">{v.vin?.slice(0, 10)}...</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-[#888] text-[12px]">{v.customerName ?? "—"}</div>
                        <div className="text-[#555] text-[11px]">{v.customerPhone ?? ""}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[#888] text-[12px]">
                          {v.mileage ? `${v.mileage?.toLocaleString()} km` : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: svc.color }} />
                          <span className="text-[11px] font-semibold" style={{ color: svc.color }}>{svc.label}</span>
                        </div>
                        <div className="text-[#555] text-[11px] mt-0.5">{v.lastService ?? "Not recorded"}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditVehicle(v); setModalOpen(true); }}
                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[rgba(233,30,140,0.08)] text-[#e91e8c] border border-[rgba(233,30,140,0.15)] hover:bg-[rgba(233,30,140,0.15)] transition-colors cursor-pointer"
                          >
                            <span className="material-icons" style={{ fontSize: "13px" }}>edit</span>
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(v)}
                            className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[rgba(239,68,68,0.08)] text-red-400 border border-[rgba(239,68,68,0.15)] hover:bg-[rgba(239,68,68,0.15)] transition-colors cursor-pointer"
                          >
                            <span className="material-icons" style={{ fontSize: "13px" }}>delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isSearchMode && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#252525]">
            <span className="text-[#555] text-[12px]">
              Showing {(pageNumber - 1) * pageSize + 1}–{Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-1">
              <PageBtn disabled={pageNumber === 1} onClick={() => setPageNumber((p) => p - 1)}>
                <span className="material-icons" style={{ fontSize: "16px" }}>chevron_left</span>
              </PageBtn>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - pageNumber) <= 1)
                .reduce((acc, p, i, arr) => { if (i > 0 && p - arr[i - 1] > 1) acc.push("..."); acc.push(p); return acc; }, [])
                .map((item, i) =>
                  item === "..." ? (
                    <span key={`e-${i}`} className="text-[#555] px-1 text-[12px]">...</span>
                  ) : (
                    <PageBtn key={item} active={item === pageNumber} onClick={() => setPageNumber(item)}>{item}</PageBtn>
                  )
                )}
              <PageBtn disabled={pageNumber === totalPages} onClick={() => setPageNumber((p) => p + 1)}>
                <span className="material-icons" style={{ fontSize: "16px" }}>chevron_right</span>
              </PageBtn>
            </div>
          </div>
        )}
      </div>

      <VehicleModal
        open={modalOpen}
        vehicle={editVehicle}
        onClose={() => { setModalOpen(false); setEditVehicle(null); }}
        onSuccess={refetch}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 w-[360px] shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center mb-4">
              <span className="material-icons text-red-400" style={{ fontSize: "22px" }}>no_crash</span>
            </div>
            <h3 className="text-white text-[15px] font-semibold m-0 mb-2">Remove Vehicle?</h3>
            <p className="text-[#555] text-[13px] m-0 mb-5 leading-relaxed">
              Remove <span className="text-white font-semibold font-mono">{deleteConfirm.vehicleNumber}</span> ({deleteConfirm.year} {deleteConfirm.make} {deleteConfirm.model}) from the system? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-lg bg-transparent border border-[#333] text-[#888] hover:text-white text-[13px] font-medium cursor-pointer transition-colors">
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: call deleteVehicle(deleteConfirm.vehicleId ?? deleteConfirm.id) then refetch()
                  setDeleteConfirm(null);
                  refetch();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold cursor-pointer border-none transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE — tabs
// ─────────────────────────────────────────────────────────────────────────────
export default function Customers() {
  const [tab, setTab] = useState("customers");

  return (
    <div className="flex flex-col gap-5">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#252525] rounded-xl p-1 w-fit">
        {[
          { key: "customers", label: "Customers", icon: "group" },
          { key: "vehicles",  label: "Vehicles",  icon: "directions_car" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all cursor-pointer border-none
              ${tab === t.key
                ? "bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white shadow"
                : "bg-transparent text-[#555] hover:text-[#888]"}`}
          >
            <span className="material-icons" style={{ fontSize: "16px" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "customers" ? <CustomersTab /> : <VehiclesTab />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED
// ─────────────────────────────────────────────────────────────────────────────
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