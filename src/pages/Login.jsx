import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(form);

      const token =
        res.data?.data?.token ||
        res.data?.token ||
        res.data?.data?.accessToken ||
        res.data?.accessToken;

      if (!token) {
        throw new Error("Login successful, but token was not found.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data?.data ?? {}));

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-[430px]">
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-8 flex flex-col gap-5 shadow-2xl"
        >
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
              <span
                className="material-icons text-[#e91e8c]"
                style={{ fontSize: "32px" }}
              >
                directions_car
              </span>
            </div>

            <div className="text-center">
              <h1 className="text-white text-2xl font-bold m-0">
                FleetFactory
              </h1>
              <p className="text-[#666] text-sm mt-1">
                Vehicle Parts & Inventory Management
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[#888] text-sm font-medium">Email</label>
            <div className="relative">
              <span
                className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
                style={{ fontSize: "18px" }}
              >
                mail
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full bg-[#111] border border-[#252525] rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#e91e8c] transition-colors"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#888] text-sm font-medium">Password</label>
            <div className="relative">
              <span
                className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[#555]"
                style={{ fontSize: "18px" }}
              >
                lock
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full bg-[#111] border border-[#252525] rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#e91e8c] transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-4 py-3 rounded-xl hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span
                  className="material-icons animate-spin"
                  style={{ fontSize: "18px" }}
                >
                  refresh
                </span>
                Logging in...
              </>
            ) : (
              <>
                <span className="material-icons" style={{ fontSize: "18px" }}>
                  login
                </span>
                Login
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[#555] text-xs mt-4">
          Admin and staff access only
        </p>
      </div>
    </div>
  );
}
