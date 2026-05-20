import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#101010] text-white">
      <header className="h-[70px] flex items-center justify-between px-10 border-b border-[#222] bg-[#141414]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e91e8c] to-[#c2185b] flex items-center justify-center">
            <span className="material-icons text-white">bolt</span>
          </div>
          <span className="font-bold text-lg tracking-wide">FleetFactory</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg border border-[#333] text-[#ccc] hover:text-white hover:border-[#e91e8c]"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 rounded-lg bg-[#e91e8c] text-white font-semibold hover:opacity-90"
          >
            Register
          </button>
        </div>
      </header>

      <main className="px-10 py-14">
        <section className="max-w-6xl mx-auto grid grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#e91e8c] text-sm font-semibold">
              Vehicle Parts & Service Management
            </span>

            <h1 className="text-5xl font-bold leading-tight mt-4 mb-5">
              Smart vehicle service and parts support in one place.
            </h1>

            <p className="text-[#aaa] text-[15px] leading-7 mb-8 max-w-xl">
              FleetFactory helps customers book appointments, request
              unavailable parts, manage vehicles, and view purchase or service
              history with a smooth digital experience.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/customer/book-appointment")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white font-semibold hover:opacity-90"
              >
                Book Now
              </button>

              <button
                onClick={() => navigate("/customer/part-request")}
                className="px-6 py-3 rounded-xl border border-[#333] text-[#ddd] hover:border-[#e91e8c] hover:text-white"
              >
                Request Part
              </button>
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6 shadow-xl">
            <div className="grid grid-cols-2 gap-4">
              <Feature
                icon="event"
                title="Book Service"
                text="Schedule vehicle appointments easily."
              />
              <Feature
                icon="inventory_2"
                title="Parts Support"
                text="Request unavailable vehicle parts."
              />
              <Feature
                icon="directions_car"
                title="Vehicle Profile"
                text="Manage your registered vehicles."
              />
              <Feature
                icon="receipt_long"
                title="History"
                text="View service and purchase records."
              />
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto mt-16 grid grid-cols-3 gap-5">
          <ActionCard
            icon="event_available"
            title="Book Appointment"
            text="Choose your vehicle and request a service appointment."
            button="Book Now"
            onClick={() => navigate("/customer/book-appointment")}
          />

          <ActionCard
            icon="search"
            title="Request Parts"
            text="Tell us what part you need if it is not available."
            button="Request"
            onClick={() => navigate("/customer/part-request")}
          />

          <ActionCard
            icon="person"
            title="Customer Portal"
            text="Login to view your profile, vehicles and history."
            button="Go to Portal"
            onClick={() => navigate("/login")}
          />
        </section>
      </main>
    </div>
  );
}

const Feature = ({ icon, title, text }) => (
  <div className="bg-[#141414] border border-[#292929] rounded-xl p-5">
    <span className="material-icons text-[#e91e8c] mb-3">{icon}</span>
    <h3 className="text-white font-semibold text-[15px] mb-1">{title}</h3>
    <p className="text-[#777] text-[13px] leading-5">{text}</p>
  </div>
);

const ActionCard = ({ icon, title, text, button, onClick }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6">
    <span className="material-icons text-[#e91e8c] mb-4">{icon}</span>
    <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
    <p className="text-[#888] text-[14px] leading-6 mb-5">{text}</p>
    <button
      onClick={onClick}
      className="text-[#e91e8c] text-sm font-semibold hover:underline"
    >
      {button}
    </button>
  </div>
);
