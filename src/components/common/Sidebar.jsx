import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },

  // inventory
  { label: "Parts", path: "/admin/parts", icon: "inventory_2" },

  {
    label: "Part Categories",
    path: "/admin/part-categories",
    icon: "category",
  },

  {
    label: "Purchase Invoices",
    path: "/admin/purchase-invoices",
    icon: "receipt_long",
  },

  {
    label: "Sales Invoices",
    path: "/admin/sales-invoices",
    icon: "point_of_sale",
  },
  {
    label: "Appointments",
    path: "/admin/appointments",
    icon: "event",
  },
  {
    label: "Part Requests",
    path: "/admin/part-requests",
    icon: "assignment",
  },
  {
    label: "Reviews",
    path: "/admin/reviews",
    icon: "rate_review",
  },
  {
    label: "Low Stock",
    path: "/admin/low-stock",
    icon: "warning",
    badge: true,
  },

  // business
  { label: "Vendors", path: "/admin/vendors", icon: "storefront" },

  { label: "Customers", path: "/admin/customers", icon: "group" },

  {
    label: "Search Customers",
    path: "/admin/search",
    icon: "manage_search",
  },

  { label: "Staff", path: "/admin/staff", icon: "badge" },

  // analytics
  {
    label: "Financial Reports",
    path: "/admin/reports",
    icon: "bar_chart",
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <aside
      className={`
        flex flex-col shrink-0 min-h-screen
        bg-[#141414] border-r border-[#222]
        transition-all duration-250 ease-in-out overflow-hidden
        ${collapsed ? "w-[68px]" : "w-[220px]"}
      `}
    >
      {/* Logo */}
      <div
        className={`
          flex items-center gap-3 border-b border-[#222] mb-2
          ${collapsed ? "justify-center px-0 py-5" : "px-[18px] py-5"}
        `}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e91e8c] to-[#c2185b] flex items-center justify-center shrink-0">
          <span
            className="material-icons text-white"
            style={{ fontSize: "18px" }}
          >
            bolt
          </span>
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-[15px] tracking-wide whitespace-nowrap">
            FleetFactory
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex justify-center items-center py-2 text-[#555] hover:text-[#e91e8c] transition-colors cursor-pointer bg-transparent border-none"
        title={collapsed ? "Expand" : "Collapse"}
      >
        <span className="material-icons" style={{ fontSize: "20px" }}>
          {collapsed ? "menu_open" : "menu"}
        </span>
      </button>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={collapsed ? item.label : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-[13.5px] whitespace-nowrap
               border-l-2 transition-all duration-150 no-underline
               ${collapsed ? "justify-center px-0 py-[10px]" : "px-3 py-[10px]"}
               ${
                 isActive
                   ? "text-[#e91e8c] bg-[rgba(233,30,140,0.1)] border-l-[#e91e8c] font-semibold"
                   : "text-[#888] bg-transparent border-l-transparent font-normal hover:text-[#ccc] hover:bg-[rgba(255,255,255,0.04)]"
               }`
            }
          >
            <span
              className="material-icons shrink-0"
              style={{ fontSize: "20px" }}
            >
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-[#e91e8c] text-white text-[10px] font-bold px-1.5 py-px rounded-full leading-none">
                !
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-0.5 px-2 py-3 border-t border-[#222]">
        <button
          className={`
            flex items-center gap-3 rounded-lg text-[13.5px] whitespace-nowrap
            text-[#888] hover:text-[#ccc] bg-transparent border-none cursor-pointer
            transition-colors duration-150 w-full
            ${collapsed ? "justify-center px-0 py-[10px]" : "px-3 py-[10px]"}
          `}
          title={collapsed ? "Settings" : ""}
        >
          <span
            className="material-icons shrink-0"
            style={{ fontSize: "20px" }}
          >
            settings
          </span>
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className={`
            flex items-center gap-3 rounded-lg text-[13.5px] whitespace-nowrap
            text-[#888] hover:text-[#e91e8c] bg-transparent border-none cursor-pointer
            transition-colors duration-150 w-full
            ${collapsed ? "justify-center px-0 py-[10px]" : "px-3 py-[10px]"}
          `}
          title={collapsed ? "Logout" : ""}
        >
          <span
            className="material-icons shrink-0"
            style={{ fontSize: "20px" }}
          >
            logout
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
