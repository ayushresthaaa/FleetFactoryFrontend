import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/parts": "Parts Management",
  "/admin/purchase-invoices": "Purchase Invoices",
  "/admin/sales-invoices": "Sales Invoices",
  "/admin/vendors": "Vendors",
  "/admin/staff": "Staff Management",
  "/admin/customers": "Customers",
  "/admin/search": "Search Customers",
  "/admin/reports": "Financial Reports",
  "/admin/low-stock": "Low Stock Alerts",
};

export default function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const title = PAGE_TITLES[location.pathname] ?? "Admin Panel";

  // token
  const token = localStorage.getItem("token");

  let role = "User";
  let email = localStorage.getItem("email") ?? "user@fleet.com";

  // decode JWT
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      role =
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] ||
        payload.role ||
        "User";

      email =
        payload.email ||
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] ||
        email;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const initials = email.slice(0, 2).toUpperCase();
  const displayName = email.split("@")[0];

  const handleSearch = (e) => {
    e.preventDefault();

    const q = search.trim();

    if (!q) {
      navigate("/admin/customers");
      return;
    }

    navigate(`/admin/customers?query=${encodeURIComponent(q)}`);
  };

  return (
    <header className="h-[60px] bg-[#141414] border-b border-[#222] flex items-center px-6 gap-4 sticky top-0 z-10">
      <h1 className="text-white text-[15px] font-semibold flex-1 tracking-wide">
        {title}
      </h1>

      <form onSubmit={handleSearch} className="relative">
        <span
          className="material-icons absolute left-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none"
          style={{ fontSize: "17px" }}
        >
          search
        </span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="
            bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg
            pl-8 pr-3 py-[7px] text-[#ccc] text-[13px] w-[220px]
            outline-none transition-colors duration-150
            focus:border-[#e91e8c] placeholder:text-[#444]
          "
        />
      </form>

      <button
        onClick={() => navigate("/admin/low-stock")}
        className="
          relative w-9 h-9 flex items-center justify-center
          bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg
          text-[#888] hover:text-[#e91e8c] hover:border-[#e91e8c33]
          transition-colors duration-150 cursor-pointer
        "
        title="Low Stock Alerts"
      >
        <span className="material-icons" style={{ fontSize: "19px" }}>
          notifications
        </span>

        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e91e8c] rounded-full border-2 border-[#141414]" />
      </button>

      <div className="flex items-center gap-2.5 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-1.5 cursor-pointer hover:border-[#333] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e91e8c] to-[#c2185b] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {initials}
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[#ddd] text-[12px] font-semibold capitalize">
            {displayName}
          </span>

          <span className="text-[#555] text-[10px] capitalize">{role}</span>
        </div>

        <span
          className="material-icons text-[#444] ml-1"
          style={{ fontSize: "16px" }}
        >
          expand_more
        </span>
      </div>
    </header>
  );
}
