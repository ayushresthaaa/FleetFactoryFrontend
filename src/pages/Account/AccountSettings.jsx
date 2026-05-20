import { useEffect, useState } from "react";
import {
  getMyAccount,
  changeEmail,
  changeName,
  changePassword,
} from "../../api/api";

export default function AccountSettings() {
  const [nameForm, setNameForm] = useState({
    firstName: "",
    lastName: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const refetch = () => setRefresh((r) => r + 1);

  useEffect(() => {
    let cancelled = false;

    const loadAccount = async () => {
      try {
        setPageLoading(true);
        setError("");

        const res = await getMyAccount();
        const data = res.data?.data || res.data;

        if (cancelled) return;

        setNameForm({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
        });

        setEmailForm({
          newEmail: data?.email || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load account details.");
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    loadAccount();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const clearMessages = () => {
    setSuccess("");
    setError("");
  };

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!nameForm.firstName.trim() || !nameForm.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    try {
      setLoading("name");

      await changeName({
        firstName: nameForm.firstName.trim(),
        lastName: nameForm.lastName.trim(),
      });

      setSuccess("Name changed successfully.");
      refetch();
    } catch (err) {
      setError(err.message || "Failed to change name.");
    } finally {
      setLoading("");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!emailForm.newEmail.trim()) {
      setError("Email is required.");
      return;
    }

    try {
      setLoading("email");

      await changeEmail({
        newEmail: emailForm.newEmail.trim(),
      });

      setSuccess("Email changed successfully.");
      refetch();
    } catch (err) {
      setError(err.message || "Failed to change email.");
    } finally {
      setLoading("");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Current password and new password are required.");
      return;
    }

    try {
      setLoading("password");

      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setSuccess("Password changed successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading("");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <span className="material-icons text-[#e91e8c] animate-spin">
          refresh
        </span>
        <span className="text-[#555] text-[13px]">
          Loading account settings...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-8">
        <div className="max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center mb-4">
            <span
              className="material-icons text-[#e91e8c]"
              style={{ fontSize: "28px" }}
            >
              manage_accounts
            </span>
          </div>

          <h1 className="text-white text-2xl font-bold m-0">
            Account Settings
          </h1>

          <p className="text-[#777] text-sm mt-2 leading-6">
            Manage your login details, account name, email address and password.
          </p>
        </div>
      </section>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-lg px-3 py-2">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <section className="grid grid-cols-3 gap-5">
        <form onSubmit={handleNameSubmit} className={cardCls}>
          <FormHeader
            icon="badge"
            title="Change Name"
            text="Update the name shown on your account."
          />

          <Field label="First Name" icon="person">
            <input
              required
              value={nameForm.firstName}
              onChange={(e) =>
                setNameForm((p) => ({
                  ...p,
                  firstName: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>

          <Field label="Last Name" icon="person">
            <input
              required
              value={nameForm.lastName}
              onChange={(e) =>
                setNameForm((p) => ({
                  ...p,
                  lastName: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>

          <button
            type="submit"
            disabled={loading === "name"}
            className={primaryBtnCls}
          >
            {loading === "name" ? "Saving..." : "Save Name"}
          </button>
        </form>

        <form onSubmit={handleEmailSubmit} className={cardCls}>
          <FormHeader
            icon="email"
            title="Change Email"
            text="Update the email address used for login."
          />

          <Field label="New Email" icon="email">
            <input
              required
              type="email"
              value={emailForm.newEmail}
              onChange={(e) =>
                setEmailForm((p) => ({
                  ...p,
                  newEmail: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>

          <button
            type="submit"
            disabled={loading === "email"}
            className={primaryBtnCls}
          >
            {loading === "email" ? "Saving..." : "Save Email"}
          </button>
        </form>

        <form onSubmit={handlePasswordSubmit} className={cardCls}>
          <FormHeader
            icon="lock"
            title="Change Password"
            text="Update your password to keep your account secure."
          />

          <Field label="Current Password" icon="key">
            <input
              required
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  currentPassword: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>

          <Field label="New Password" icon="lock_reset">
            <input
              required
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((p) => ({
                  ...p,
                  newPassword: e.target.value,
                }))
              }
              className={inputCls}
            />
          </Field>

          <button
            type="submit"
            disabled={loading === "password"}
            className={primaryBtnCls}
          >
            {loading === "password" ? "Saving..." : "Save Password"}
          </button>
        </form>
      </section>
    </div>
  );
}

const FormHeader = ({ icon, title, text }) => (
  <div>
    <div className="w-10 h-10 rounded-xl bg-[#111] border border-[#252525] flex items-center justify-center mb-3">
      <span
        className="material-icons text-[#e91e8c]"
        style={{ fontSize: "20px" }}
      >
        {icon}
      </span>
    </div>

    <h2 className="text-white text-base font-semibold m-0">{title}</h2>
    <p className="text-[#666] text-sm mt-1 leading-5">{text}</p>
  </div>
);

const Field = ({ label, icon, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="flex items-center gap-1.5 text-[#888] text-[11px] font-medium uppercase tracking-wider">
      <span className="material-icons text-[#555]" style={{ fontSize: "13px" }}>
        {icon}
      </span>
      {label}
    </label>
    {children}
  </div>
);

const cardCls =
  "bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex flex-col gap-4";

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;

const primaryBtnCls =
  "mt-auto bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg border-none disabled:opacity-50 cursor-pointer";
