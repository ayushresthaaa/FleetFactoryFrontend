import { Outlet } from "react-router-dom";
import CustomerNavbar from "../components/common/CustomerNavbar";

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <CustomerNavbar />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
