import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden bg-[#1a1a1a] border border-[#252525] rounded-3xl p-8 md:p-10">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#e91e8c]/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#c2185b]/10 blur-3xl rounded-full" />

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-[#e91e8c] text-xs font-semibold uppercase tracking-wider">
              <span className="material-icons text-[16px]">directions_car</span>
              FleetFactory Customer Portal
            </span>

            <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mt-4 mb-4">
              Manage your vehicle service, parts, and history in one place.
            </h1>

            <p className="text-[#aaa] text-sm md:text-base leading-7 max-w-2xl">
              Book appointments, request unavailable vehicle parts, manage your
              registered vehicles, and view your service or purchase history
              through a simple customer dashboard.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <button
                onClick={() => navigate("/customer/appointments")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white font-semibold px-5 py-3 rounded-xl hover:opacity-90 border-none cursor-pointer"
              >
                <span className="material-icons text-[18px]">event</span>
                Book Appointment
              </button>

              <button
                onClick={() => navigate("/customer/part-requests")}
                className="flex items-center gap-2 bg-[#111] border border-[#333] text-[#ddd] font-semibold px-5 py-3 rounded-xl hover:border-[#e91e8c] hover:text-white cursor-pointer"
              >
                <span className="material-icons text-[18px]">inventory_2</span>
                Request Part
              </button>
            </div>
          </div>

          <div className="bg-[#111] border border-[#292929] rounded-2xl p-5">
            <div className="grid grid-cols-2 gap-3">
              <MiniCard
                icon="event_available"
                label="Appointments"
                value="Book service"
              />
              <MiniCard
                icon="inventory_2"
                label="Parts"
                value="Request items"
              />
              <MiniCard
                icon="directions_car"
                label="Vehicles"
                value="Manage profile"
              />
              <MiniCard
                icon="receipt_long"
                label="History"
                value="Track records"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ActionCard
          icon="event"
          title="Book Appointment"
          text="Schedule a service appointment for your registered vehicle."
          button="Go to Appointments"
          onClick={() => navigate("/customer/appointments")}
        />

        <ActionCard
          icon="search"
          title="Request Unavailable Parts"
          text="Search existing parts first, then request parts that are limited or unavailable."
          button="Request Part"
          onClick={() => navigate("/customer/part-requests")}
        />

        <ActionCard
          icon="receipt_long"
          title="View Purchase History"
          text="Check your previous purchase and service invoice records."
          button="View History"
          onClick={() => navigate("/customer/purchase-history")}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6">
          <span className="material-icons text-[#e91e8c] text-[30px]">
            verified
          </span>

          <h2 className="text-white text-xl font-bold mt-4 mb-2">
            Designed for a smoother garage experience
          </h2>

          <p className="text-[#888] text-sm leading-6">
            FleetFactory connects customers with service booking, part request
            tracking, reviews, purchase history, and vehicle profile management.
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6">
          <h2 className="text-white text-xl font-bold mb-5">What you can do</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Feature
              icon="person"
              title="Manage Profile"
              text="Update your personal details and registered vehicles."
            />
            <Feature
              icon="rate_review"
              title="Service Reviews"
              text="Review completed appointments and view your submitted feedback."
            />
            <Feature
              icon="schedule"
              title="Upcoming Appointments"
              text="View confirmed or pending appointments from your customer portal."
            />
            <Feature
              icon="build"
              title="Part Support"
              text="Request parts that are unavailable or limited in stock."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const MiniCard = ({ icon, label, value }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4">
    <span className="material-icons text-[#e91e8c] text-[22px]">{icon}</span>
    <p className="text-white text-sm font-semibold mt-3 mb-1">{label}</p>
    <p className="text-[#666] text-xs m-0">{value}</p>
  </div>
);

const ActionCard = ({ icon, title, text, button, onClick }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-6 hover:border-[#e91e8c]/40 transition-colors">
    <div className="w-11 h-11 rounded-xl bg-[#e91e8c]/10 border border-[#e91e8c]/20 flex items-center justify-center mb-4">
      <span className="material-icons text-[#e91e8c] text-[22px]">{icon}</span>
    </div>

    <h3 className="text-white text-lg font-bold mb-2">{title}</h3>

    <p className="text-[#888] text-sm leading-6 mb-5">{text}</p>

    <button
      onClick={onClick}
      className="text-[#e91e8c] text-sm font-semibold bg-transparent border-none cursor-pointer hover:underline p-0"
    >
      {button}
    </button>
  </div>
);

const Feature = ({ icon, title, text }) => (
  <div className="flex gap-3 bg-[#111] border border-[#252525] rounded-xl p-4">
    <span className="material-icons text-[#e91e8c] text-[21px] shrink-0">
      {icon}
    </span>

    <div>
      <h3 className="text-white text-sm font-semibold m-0">{title}</h3>
      <p className="text-[#777] text-xs leading-5 mt-1 mb-0">{text}</p>
    </div>
  </div>
);
