import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyReviews } from "../../../api/api";

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
};

export default function CustomerReviews() {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const res = await getMyReviews();
        const data = res.data?.data || res.data;
        setReviews(Array.isArray(data) ? data : data?.items || []);
      } catch {
        setError("Failed to load your reviews.");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold m-0">My Reviews</h1>
          <p className="text-[#666] text-sm mt-1">
            View feedback you submitted for completed appointments.
          </p>
        </div>

        <button
          onClick={() => navigate("/customer/reviews/create")}
          className="flex items-center gap-2 bg-gradient-to-r from-[#e91e8c] to-[#c2185b] text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity border-none"
        >
          <span className="material-icons" style={{ fontSize: "17px" }}>
            add
          </span>
          New Review
        </button>
      </div>

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Review History
          </h3>
          <span className="text-[#555] text-[12px]">
            {reviews.length} total
          </span>
        </div>

        {error && (
          <div className="m-5 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">
              Loading your reviews...
            </span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "42px" }}
            >
              rate_review
            </span>
            <p className="text-[#555] text-[13px] m-0">
              You have not submitted any reviews yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#111] border border-[#252525] rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white text-sm font-semibold m-0">
                      Appointment on {formatDate(review.appointmentDate)}
                    </h3>

                    <p className="text-[#666] text-xs mt-1">
                      Submitted on {formatDate(review.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      review.isVisible
                        ? "bg-green-500/15 text-green-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {review.isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-icons ${
                        star <= review.rating ? "text-[#e91e8c]" : "text-[#333]"
                      }`}
                      style={{ fontSize: "20px" }}
                    >
                      star
                    </span>
                  ))}

                  <span className="text-[#777] text-xs ml-2">
                    {review.rating}/5
                  </span>
                </div>

                <p className="text-[#aaa] text-sm leading-6 mt-3 mb-0">
                  {review.comment || "No comment provided."}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
