/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Ratings from "./Ratings";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product]);

  const [activeTab, setActiveTab] = useState(1);
  const sanitizedDescription = DOMPurify.sanitize(product.description);
  const tabs = ["Description", "Write Review", "Reviews"];

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ── Tab Headers ── */}
        <div className="flex justify-center bg-gray-50 border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`relative px-5 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors duration-200 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B88E2F]/50 ${
                activeTab === index + 1
                  ? "text-[#B88E2F]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              onClick={() => setActiveTab(index + 1)}
            >
              {tab}
              {activeTab === index + 1 && (
                <motion.div
                  layoutId="activeProductTabIndicator"
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#B88E2F] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div className="p-5 sm:p-8 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* 1. Description */}
              {activeTab === 1 && (
                <div className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                  <div
                    dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                  />
                </div>
              )}

              {/* 2. Write Review */}
              {activeTab === 2 && (
                <div className="max-w-2xl mx-auto">
                  {userInfo ? (
                    <form
                      onSubmit={submitHandler}
                      className="space-y-5 bg-[#FFFBF4] p-5 sm:p-6 rounded-xl border border-[#EDE4D4] shadow-sm"
                    >
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-800 mb-2">
                          Select Rating
                        </label>
                        <select
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full sm:w-64 p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F] outline-none text-sm transition-colors text-gray-800"
                        >
                          <option value="">Choose...</option>
                          <option value="1">1 - Inferior</option>
                          <option value="2">2 - Decent</option>
                          <option value="3">3 - Great</option>
                          <option value="4">4 - Excellent</option>
                          <option value="5">5 - Exceptional</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-800 mb-2">
                          Your Experience
                        </label>
                        <textarea
                          rows="4"
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What did you like or dislike?"
                          className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#B88E2F]/30 focus:border-[#B88E2F] outline-none text-sm transition-colors resize-none text-gray-800 placeholder:text-gray-400"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingProductReview}
                        className="bg-[#1A1A1A] hover:bg-[#B88E2F] text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A1A1A]"
                      >
                        {loadingProductReview
                          ? "Submitting..."
                          : "Submit Review"}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-700 text-sm font-medium">
                        Please{" "}
                        <Link
                          to="/login"
                          className="text-[#B88E2F] font-bold hover:underline underline-offset-4"
                        >
                          Login
                        </Link>{" "}
                        to share your thoughts.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 3. All Reviews */}
              {activeTab === 3 && (
                <div className="space-y-4">
                  {!product.reviews || product.reviews.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium">
                      No reviews yet. Be the first one!
                    </div>
                  ) : (
                    product.reviews?.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1.5">
                            <span className="font-bold text-[#1A1A1A] text-sm">
                              {review.name}
                            </span>
                            <span className="text-[10px] text-gray-500 font-medium">
                              {review.createdAt.substring(0, 10)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {review.comment}
                          </p>
                        </div>
                        <div className="bg-[#B88E2F]/5 px-3 py-1.5 rounded-lg border border-[#B88E2F]/10 self-start sm:self-center">
                          <Ratings value={review.rating} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductTabs;
