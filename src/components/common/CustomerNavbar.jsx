import { NavLink, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", path: "/customer" },
  { label: "Appointments", path: "/customer/appointments" },
  { label: "Part Requests", path: "/customer/part-requests" },
  { label: "Reviews", path: "/customer/reviews" },
  { label: "Purchase History", path: "/customer/purchase-history" },
];

const getCustomerName = () => {
  const token = localStorage.getItem("token");

  if (!token) return "Customer";

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    const firstName = payload.firstName || "";
    const lastName = payload.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Customer";
  } catch {
    return "Customer";
  }
};

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const customerName = getCustomerName();

  return (
    <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur-md border-b border-[#222]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div
          onClick={() => navigate("/customer")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e91e8c] to-[#c2185b] flex items-center justify-center">
            <span className="material-icons text-white text-[20px]">
              directions_car
            </span>
          </div>

          <span className="text-white font-bold text-[15px]">FleetFactory</span>
        </div>

        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm no-underline transition-colors ${
                  isActive
                    ? "text-[#e91e8c] font-semibold"
                    : "text-[#888] hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/customer/profile")}
            className="flex flex-col items-end bg-transparent border-none cursor-pointer"
          >
            <span className="text-white text-sm font-semibold leading-tight">
              {customerName}
            </span>
            <span className="text-[#777] text-[11px] hover:text-[#e91e8c]">
              Manage Profile
            </span>
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="text-[#888] hover:text-[#e91e8c] bg-transparent border border-[#333] rounded-lg px-3 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
