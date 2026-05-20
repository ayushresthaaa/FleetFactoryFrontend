import { useEffect, useState } from "react";
import { createMyReview, getMyAppointmentHistory } from "../../../api/api";
import { AppointmentStatus } from "../../../constants/constantsHelpers";

export default function CreateReview() {
  const [form, setForm] = useState({
    appointmentId: "",
    rating: 5,
    comment: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const res = await getMyAppointmentHistory();
        const data = res.data?.data || res.data;

        const list = Array.isArray(data) ? data : data?.items || [];
        console.log("Fetched appointments:", list);
        setAppointments(
          list.filter((a) => a.status === AppointmentStatus.Completed),
        );
      } catch {
        setError("Failed to load completed appointments.");
      } finally {
        setLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!form.appointmentId) {
      setError("Please select a completed appointment.");
      return;
    }

    if (form.rating < 1 || form.rating > 5) {
      setError("Rating must be between 1 and 5.");
      return;
    }

    setLoading(true);

    try {
      await createMyReview({
        appointmentId: form.appointmentId,
        rating: Number(form.rating),
        comment: form.comment.trim(),
      });

      setSuccess("Review submitted successfully.");
      setForm({
        appointmentId: "",
        rating: 5,
        comment: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.title ||
          "Failed to submit review.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-[#1a1a1a] border border-[#252525] rounded-2xl p-8">
        <div className="max-w-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(233,30,140,0.1)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center mb-4">
            <span
              className="material-icons text-[#e91e8c]"
              style={{ fontSize: "28px" }}
            >
              rate_review
            </span>
          </div>

          <h1 className="text-white text-2xl font-bold m-0">Review Service</h1>

          <p className="text-[#777] text-sm mt-2 leading-6">
            Leave a review for a completed appointment. Your feedback helps us
            improve our service.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-[1fr_340px] gap-5">
        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-6 flex flex-col gap-4"
        >
          <div>
            <h2 className="text-white text-base font-semibold m-0">
              Service Review
            </h2>
            <p className="text-[#666] text-sm mt-1">
              Select a completed appointment and give your rating.
            </p>
          </div>

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

          <Field label="Completed Appointment *" icon="event_available">
            <select
              required
              name="appointmentId"
              value={form.appointmentId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  appointmentId: e.target.value,
                }))
              }
              disabled={loadingAppointments}
              className={inputCls}
            >
              <option value="">
                {loadingAppointments
                  ? "Loading appointments..."
                  : "Select completed appointment"}
              </option>

              {appointments.map((a) => (
                <option
                  key={a.id || a.appointmentId}
                  value={a.id || a.appointmentId}
                >
                  {formatDate(a.scheduledAt || a.appointmentDate)}{" "}
                  {a.vehicleNumber ? `- ${a.vehicleNumber}` : ""}
                </option>
              ))}
            </select>

            {!loadingAppointments && appointments.length === 0 && (
              <p className="text-red-400 text-[11px] mt-1">
                No completed appointments available for review.
              </p>
            )}
          </Field>

          <Field label="Rating *" icon="star">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      rating: star,
                    }))
                  }
                  className="bg-transparent border-none cursor-pointer p-0"
                >
                  <span
                    className={`material-icons ${
                      star <= form.rating ? "text-[#e91e8c]" : "text-[#333]"
                    }`}
                    style={{ fontSize: "30px" }}
                  >
                    star
                  </span>
                </button>
              ))}

              <span className="text-[#777] text-sm ml-2">{form.rating}/5</span>
            </div>
          </Field>

          <Field label="Comment" icon="description">
            <textarea
              name="comment"
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              placeholder="Write your experience with the service..."
              rows={6}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={
                loading || loadingAppointments || appointments.length === 0
              }
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity border-none disabled:opacity-50"
            >
              {loading && (
                <span
                  className="material-icons animate-spin"
                  style={{ fontSize: "17px" }}
                >
                  refresh
                </span>
              )}
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>

        <aside className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-5 h-fit">
          <h3 className="text-white text-sm font-semibold mb-4">Review Info</h3>

          <Info
            icon="check_circle"
            title="Completed Only"
            text="Only completed appointments can be reviewed."
          />

          <Info
            icon="star"
            title="Rating"
            text="Choose a rating from 1 to 5 based on your service experience."
          />

          <Info
            icon="visibility"
            title="Visibility"
            text="Staff may hide inappropriate reviews if needed."
          />
        </aside>
      </section>
    </div>
  );
}

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

const Info = ({ icon, title, text }) => (
  <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-3 mb-3">
    <div className="flex items-center gap-2">
      <span
        className="material-icons text-[#e91e8c]"
        style={{ fontSize: "17px" }}
      >
        {icon}
      </span>
      <span className="text-white text-sm font-medium">{title}</span>
    </div>
    <p className="text-[#666] text-xs leading-5 mt-2 mb-0">{text}</p>
  </div>
);

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
};

const inputCls = `
  w-full bg-[#111] border border-[#2a2a2a] rounded-lg
  px-3 py-2.5 text-white text-[13px] outline-none
  focus:border-[#e91e8c] transition-colors
  placeholder:text-[#444]
`;
