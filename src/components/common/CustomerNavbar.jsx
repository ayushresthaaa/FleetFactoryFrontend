import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", path: "/customer" },
  { label: "Appointments", path: "/customer/appointments" },
  { label: "Part Requests", path: "/customer/part-requests" },
  { label: "Reviews", path: "/customer/reviews" },
];

export default function CustomerNavbar() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div
          onClick={() => navigate("/customer")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e91e8c] to-[#c2185b] flex items-center justify-center">
            <span
              className="material-icons text-white"
              style={{ fontSize: "20px" }}
            >
              directions_car
            </span>
          </div>

          <div>
            <h1 className="text-white text-sm font-bold m-0">FleetFactory</h1>
            <p className="text-[#666] text-[11px] m-0">Customer Portal</p>
          </div>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/customer"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-[13px] font-medium transition-colors no-underline ${
                  isActive
                    ? "text-[#e91e8c] bg-[rgba(233,30,140,0.1)]"
                    : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#888] hover:text-[#e91e8c] hover:bg-[#1a1a1a] bg-transparent border-none cursor-pointer text-[13px]"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            logout
          </span>
          Logout
        </button>
      </div>
    </header>
  );
}
