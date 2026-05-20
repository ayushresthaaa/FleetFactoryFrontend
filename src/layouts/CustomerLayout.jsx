import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/common/CustomerNavbar";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <CustomerNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="border-t border-[#222] bg-[#111] py-4">
        <div className="max-w-6xl mx-auto px-6 text-sm text-gray-400 flex items-center justify-between">
          <p>© 2026 FleetFactory</p>
          <p>Vehicle Parts Management System</p>
        </div>
      </footer>
    </div>
  );
}
