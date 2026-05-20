import { useEffect, useState } from "react";
import { getReviews, hideReview, showReview } from "../../../api/api";

const formatDate = (date) => {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString();
};

const renderStars = (rating) => {
  const value = Number(rating ?? 0);

  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`material-icons ${
        i < value ? "text-yellow-400" : "text-[#333]"
      }`}
      style={{ fontSize: "16px" }}
    >
      star
    </span>
  ));
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);

        const res = await getReviews(pageNumber, pageSize);

        if (cancelled) return;

        const data = res.data?.data;

        setReviews(data?.items ?? []);
        setTotalCount(data?.totalCount ?? 0);
      } catch {
        if (!cancelled) {
          setReviews([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pageNumber, refresh]);

  const refetch = () => setRefresh((r) => r + 1);

  const handleHide = async (id) => {
    setActionLoadingId(id + "_hide");

    try {
      await hideReview(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleShow = async (id) => {
    setActionLoadingId(id + "_show");

    try {
      await showReview(id);
      refetch();
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const visibleCount = reviews.filter((r) => r.isVisible !== false).length;
  const hiddenCount = reviews.filter((r) => r.isVisible === false).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-white text-xl font-bold m-0">Reviews</h1>
        <p className="text-[#666] text-sm mt-1">
          Manage customer service reviews and visibility.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Reviews" value={totalCount} icon="rate_review" />
        <StatCard label="Visible" value={visibleCount} icon="visibility" />
        <StatCard label="Hidden" value={hiddenCount} icon="visibility_off" />
      </div>

      <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#252525] flex items-center justify-between">
          <h3 className="text-white text-[14px] font-semibold m-0">
            Customer Reviews
          </h3>

          <span className="text-[#555] text-[12px]">{totalCount} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#e91e8c] animate-spin"
              style={{ fontSize: "22px" }}
            >
              refresh
            </span>
            <span className="text-[#555] text-[13px]">Loading reviews...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span
              className="material-icons text-[#333]"
              style={{ fontSize: "40px" }}
            >
              rate_review
            </span>
            <p className="text-[#555] text-[13px] m-0">No reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#252525]">
                  {[
                    "Customer",
                    "Rating",
                    "Review",
                    "Date",
                    "Visibility",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[#555] text-[11px] font-semibold uppercase tracking-wider px-5 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {reviews.map((review) => {
                  const id = review.id || review.reviewId;
                  const isHidden = review.isVisible === false;

                  const isHideLoading = actionLoadingId === id + "_hide";
                  const isShowLoading = actionLoadingId === id + "_show";
                  const anyLoading = isHideLoading || isShowLoading;

                  return (
                    <tr
                      key={id}
                      className="border-b border-[#1f1f1f] hover:bg-[#1f1f1f] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="text-white text-[13px] font-medium">
                          {review.customerName || "Unknown customer"}
                        </div>
                        <div className="text-[#555] text-[11px]">
                          {review.customerPhone || "No phone"}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-0.5">
                          {renderStars(review.rating)}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-[#aaa] text-[13px] max-w-[320px] truncate">
                        {review.comment ||
                          review.reviewText ||
                          "No review text"}
                      </td>

                      <td className="px-5 py-3.5 text-[#555] text-[12px]">
                        {formatDate(review.createdAt)}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            isHidden
                              ? "bg-red-500/15 text-red-400"
                              : "bg-green-500/15 text-green-400"
                          }`}
                        >
                          <span
                            className="material-icons"
                            style={{ fontSize: "12px" }}
                          >
                            {isHidden ? "visibility_off" : "visibility"}
                          </span>
                          {isHidden ? "Hidden" : "Visible"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors cursor-pointer bg-transparent border-none"
                            title="View details"
                          >
                            <span
                              className="material-icons"
                              style={{ fontSize: "16px" }}
                            >
                              visibility
                            </span>
                          </button>

                          {isHidden ? (
                            <button
                              onClick={() => handleShow(id)}
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-green-400 hover:bg-green-500/10 transition-colors cursor-pointer bg-transparent border border-green-500/20 disabled:opacity-50"
                            >
                              {isShowLoading ? "..." : "Show"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleHide(id)}
                              disabled={anyLoading}
                              className="h-7 px-2 flex items-center justify-center rounded-lg text-[11px] text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer bg-transparent border border-red-500/20 disabled:opacity-50"
                            >
                              {isHideLoading ? "..." : "Hide"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#252525]">
            <span className="text-[#555] text-[12px]">
              Showing {(pageNumber - 1) * pageSize + 1}–
              {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
            </span>

            <div className="flex items-center gap-1">
              <PageBtn
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>
                  chevron_left
                </span>
              </PageBtn>

              <PageBtn
                disabled={pageNumber === totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
              >
                <span className="material-icons" style={{ fontSize: "16px" }}>
                  chevron_right
                </span>
              </PageBtn>
            </div>
          </div>
        )}
      </div>

      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}

const StatCard = ({ label, value, icon }) => (
  <div className="bg-[#1a1a1a] border border-[#252525] rounded-xl p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-lg bg-[rgba(233,30,140,0.08)] border border-[rgba(233,30,140,0.18)] flex items-center justify-center shrink-0">
      <span
        className="material-icons text-[#e91e8c]"
        style={{ fontSize: "20px" }}
      >
        {icon}
      </span>
    </div>

    <div>
      <div className="text-white text-xl font-bold leading-tight">{value}</div>
      <div className="text-[#555] text-[11px] font-medium">{label}</div>
    </div>
  </div>
);

const PageBtn = ({ children, disabled, onClick }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="min-w-[28px] h-7 flex items-center justify-center rounded-lg text-[12px] font-medium cursor-pointer border transition-colors bg-transparent text-[#888] border-[#252525] hover:text-white hover:border-[#444] disabled:opacity-30 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const Info = ({ label, value }) => (
  <div className="bg-[#111] border border-[#252525] rounded-lg px-3 py-2">
    <div className="text-[#666] text-xs">{label}</div>
    <div className="text-white text-sm font-medium mt-1 break-words">
      {value}
    </div>
  </div>
);

const ReviewDetailModal = ({ review, onClose }) => {
  const isHidden = review.isVisible === false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[rgba(233,30,140,0.12)] border border-[rgba(233,30,140,0.2)] flex items-center justify-center">
              <span
                className="material-icons text-[#e91e8c]"
                style={{ fontSize: "17px" }}
              >
                rate_review
              </span>
            </div>

            <div>
              <h2 className="text-white text-[15px] font-semibold m-0">
                Review Details
              </h2>
              <p className="text-[#555] text-[11px] m-0">
                Full customer review information
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555] hover:text-white hover:bg-[#252525] transition-colors bg-transparent border-none"
          >
            <span className="material-icons" style={{ fontSize: "18px" }}>
              close
            </span>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Info
              label="Customer"
              value={review.customerName || "Unknown customer"}
            />
            <Info label="Phone" value={review.customerPhone || "No phone"} />
            <Info label="Email" value={review.customerEmail || "No email"} />
            <Info label="Visibility" value={isHidden ? "Hidden" : "Visible"} />
          </div>

          <div className="bg-[#111] border border-[#252525] rounded-lg px-4 py-3">
            <div className="text-[#666] text-xs mb-2">Rating</div>
            <div className="flex items-center gap-0.5">
              {renderStars(review.rating)}
            </div>
          </div>

          <div className="bg-[#111] border border-[#252525] rounded-lg px-4 py-3 min-h-[120px]">
            <div className="text-[#666] text-xs mb-2">Review</div>
            <p className="text-[#ddd] text-sm leading-6 m-0">
              {review.comment || review.reviewText || "No review text"}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] hover:text-white bg-transparent text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
