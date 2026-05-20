import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers, customerLookup } from "../../../api/api";
import CustomerModal from "./CustomerModal";

const LOOKUP_TYPES = [
  { label: "All", value: 0 },
  { label: "Name", value: 1 },
  { label: "Phone", value: 2 },
  { label: "Email", value: 3 },
  { label: "Vehicle", value: 4 },
  { label: "Customer ID", value: 5 },
];

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [refresh, setRefresh] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [lookupType, setLookupType] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const loadCustomers = async () => {
      try {
        setLoading(true);

        if (isSearchMode && searchInput.trim()) {
          const res = await customerLookup(searchInput.trim(), lookupType);
          const data = res.data?.data ?? [];

          if (cancelled) return;

          setCustomers(Array.isArray(data) ? data : []);
          setTotalCount(Array.isArray(data) ? data.length : 0);
        } else {
          const res = await getCustomers(pageNumber, pageSize);
          const data = res.data?.data;

          if (cancelled) return;

          setCustomers(data?.items ?? []);
          setTotalCount(data?.totalCount ?? 0);
        }
      } catch {
        if (!cancelled) {
          setCustomers([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCustomers();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, refresh, isSearchMode, searchInput, lookupType]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchInput.trim()) return;

    setPageNumber(1);
    setIsSearchMode(true);
  };

  const clearSearch = () => {
    setSearchInput("");
    setLookupType(0);
    setIsSearchMode(false);
    setPageNumber(1);
  };

  const totalPages = isSearchMode ? 1 : Math.ceil(totalCount / pageSize);

  const totalVehicles = customers.reduce(
    (sum, c) => sum + (c.vehicles?.length ?? 0),
    0,
  );

  const creditCustomers = customers.filter(
    (c) => Number(c.creditBalance || 0) > 0,
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-1 min-w-[380px]"
        >
          <div className="relative w-[320px]">
            <span
              className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
              style={{ fontSize: "18px" }}
            >
              search
            </span>

            <input
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (!e.target.value.trim()) clearSearch();
              }}
              placeholder="Search customer..."
              className="w-full bg-[#1a1a1a] border border-[#252525] rounded-lg pl-10 pr-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
            />
          </div>

          <select
            value={lookupType}
            onChange={(e) => setLookupType(Number(e.target.value))}
            className="bg-[#1a1a1a] border border-[#252525] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#e91e8c]"
          >
            {LOOKUP_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <button type="submit" className={secondaryBtn}>
            Search
          </button>

          {isSearchMode && (
            <button type="button" onClick={clearSearch} className={outlineBtn}>
              Clear
            </button>
          )}
        </form>

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

      {isSearchMode && (
        <div className="flex items-center gap-2 bg-[rgba(233,30,140,0.06)] border border-[rgba(233,30,140,0.15)] rounded-lg px-4 py-2.5">
          <span
            className="material-icons text-[#e91e8c]"
            style={{ fontSize: "15px" }}
          >
            manage_search
          </span>

          <span className="text-[#888] text-[12px]">
            Showing lookup results for{" "}
            <span className="text-white font-semibold">"{searchInput}"</span> —{" "}
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

      {!isSearchMode && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Total Customers"
            value={totalCount}
            icon="group"
            color="#e91e8c"
          />

          <StatCard
            label="Shown Vehicles"
            value={totalVehicles}
            icon="directions_car"
            color="#3b82f6"
          />

          <StatCard
            label="With Credit"
            value={creditCustomers}
            icon="account_balance_wallet"
            color="#f59e0b"
          />
        </div>
      )}

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            {isSearchMode ? "Customer Lookup Results" : "All Customers"}
          </h3>

          <span className="text-[#555] text-[12px]">
            {isSearchMode ? customers.length : totalCount} total
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
              Loading customers...
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
                ? "No customers found."
                : "No customers registered yet."}
            </p>
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
                {customers.map((customer) => {
                  const id = customer.customerId ?? customer.id;

                  return (
                    <tr
                      key={id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.15)] flex items-center justify-center text-[#e91e8c] text-[12px] font-bold shrink-0">
                            {customer.fullName?.[0]?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <div className="text-white text-[13px] font-medium">
                              {customer.fullName || "No name"}
                            </div>

                            <div className="text-[#555] text-[11px]">
                              ID: {id?.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#888] text-[12px]">
                        {customer.phone || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-[#555] text-[12px] truncate max-w-[140px] block">
                          {customer.address || "—"}
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
                          className={`text-[13px] font-semibold ${
                            Number(customer.creditBalance || 0) > 0
                              ? "text-yellow-400"
                              : "text-[#555]"
                          }`}
                        >
                          {Number(customer.creditBalance || 0) > 0
                            ? `Rs. ${Number(
                                customer.creditBalance,
                              ).toLocaleString()}`
                            : "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => navigate(`/admin/customers/${id}`)}
                          className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[rgba(233,30,140,0.08)] text-[#e91e8c] border border-[rgba(233,30,140,0.15)] hover:bg-[rgba(233,30,140,0.15)] transition-colors cursor-pointer"
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "13px" }}
                          >
                            visibility
                          </span>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

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
    </div>
  );
}

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
      style={{
        background: color + "18",
        border: `1px solid ${color}30`,
      }}
    >
      <span className="material-icons" style={{ fontSize: "20px", color }}>
        {icon}
      </span>
    </div>

    <div>
      <div className="text-white text-xl font-bold leading-tight">{value}</div>
      <div className="text-[#555] text-[11px] font-medium">{label}</div>
    </div>
  </div>
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

const secondaryBtn =
  "px-4 py-2 rounded-lg bg-[#252525] text-[#ccc] text-[12px] font-medium border border-[#333] hover:text-white hover:bg-[#2a2a2a] cursor-pointer";

const outlineBtn =
  "px-4 py-2 rounded-lg bg-transparent text-[#888] text-[12px] font-medium border border-[#333] hover:text-white hover:border-[#444] cursor-pointer";
