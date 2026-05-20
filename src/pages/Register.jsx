import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        password: form.password,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors ||
          err.response?.data?.title ||
          "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] bg-[#1a1a1a] border border-[#252525] rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#e91e8c] to-[#4a102f]">
          <div>
            <h1 className="text-white text-3xl font-bold mb-3">
              Join FleetFactory
            </h1>
            <p className="text-white/80 text-sm leading-6">
              Create your customer account to manage your profile, register
              vehicles, book service appointments, request unavailable parts,
              and view your purchase history.
            </p>
          </div>

          <div className="grid gap-3">
            <Feature
              icon="directions_car"
              text="Register and manage vehicles"
            />
            <Feature icon="event_available" text="Book service appointments" />
            <Feature icon="build" text="Request unavailable parts" />
            <Feature
              icon="receipt_long"
              text="View service and purchase history"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <div className="mb-7">
            <h2 className="text-white text-2xl font-bold m-0">
              Customer Registration
            </h2>
            <p className="text-[#777] text-sm mt-2">
              Create your FleetFactory customer account.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-3 py-2 mb-4">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <input
                required
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={inputCls}
                placeholder="Aayush"
              />
            </Field>

            <Field label="Last Name">
              <input
                required
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={inputCls}
                placeholder="Shrestha"
              />
            </Field>

            <Field label="Email">
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputCls}
                placeholder="example@email.com"
              />
            </Field>

            <Field label="Phone">
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputCls}
                placeholder="98XXXXXXXX"
              />
            </Field>

            <Field label="Password">
              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={inputCls}
                placeholder="Enter password"
              />
            </Field>

            <Field label="Confirm Password">
              <input
                required
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputCls}
                placeholder="Confirm password"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Address">
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className={`${inputCls} resize-none`}
                rows={3}
                placeholder="Enter your address"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Customer Account"}
          </button>

          <p className="text-[#777] text-sm text-center mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-[#e91e8c] font-medium">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[#888] text-[11px] font-medium uppercase tracking-wider">
      {label}
    </span>
    {children}
  </label>
);

const Feature = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-white/90 text-sm">
    <span className="material-icons text-white">{icon}</span>
    <span>{text}</span>
  </div>
);

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;
