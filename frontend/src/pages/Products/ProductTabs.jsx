/* eslint-disable react/prop-types */
import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState(1);
  const sanitizedDescription = DOMPurify.sanitize(product.description);
  const tabs = ["Description", "Write Review", "Reviews"];

  return (
    <div className="flex flex-col space-y-6 sm:space-y-8">
      {/* ── Modern Segmented Tab Control ── */}
      <div className="bg-gray-100 p-1.5 rounded-xl flex gap-1.5 overflow-x-auto no-scrollbar border border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index + 1)}
            className={`relative flex-1 min-w-[100px] px-3 py-2.5 sm:px-5 sm:py-3 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap outline-none focus:outline-none ${
              activeTab === index + 1
                ? "bg-[#1A1A1A] text-white"
                : "text-gray-500 hover:bg-gray-200 hover:text-gray-800 active:scale-95"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {/* 1. Description */}
              {activeTab === 1 && (
                <div className="prose max-w-none text-gray-700 leading-relaxed text-[13px] sm:text-base font-medium">
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
                      className="space-y-5 bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200"
                    >
                      <div>
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-800 mb-2">
                          Select Rating
                        </label>
                        <select
                          required
                          value={rating}
                          onChange={(e) => setRating(e.target.value)}
                          className="w-full sm:w-64 p-2.5 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] outline-none text-sm transition-colors text-gray-800"
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
                        <label className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-gray-800 mb-2">
                          Your Experience
                        </label>
                        <textarea
                          rows="4"
                          required
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What did you like or dislike?"
                          className="w-full p-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1A1A1A]/10 focus:border-[#1A1A1A] outline-none text-sm transition-colors resize-none text-gray-800 placeholder:text-gray-400"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={loadingProductReview}
                        className="bg-[#1A1A1A] hover:bg-[#B88E2F] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold uppercase tracking-wider text-[11px] sm:text-xs transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed outline-none focus:outline-none active:scale-95 border border-[#1A1A1A] hover:border-[#B88E2F]"
                      >
                        {loadingProductReview
                          ? "Submitting..."
                          : "Submit Review"}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center py-10 sm:py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-700 text-sm font-medium">
                        Please{" "}
                        <Link
                          to="/login"
                          className="text-[#B88E2F] font-bold hover:underline underline-offset-4 transition-all"
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
                <div className="space-y-3 sm:space-y-4">
                  {!product.reviews || product.reviews.length === 0 ? (
                    <div className="text-center py-10 sm:py-12 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium bg-gray-50">
                      No reviews yet. Be the first one!
                    </div>
                  ) : (
                    product.reviews?.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 hover:border-gray-400 transition-colors duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {/* Simple Interactive Avatar */}
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs sm:text-sm font-bold border-2 border-gray-200 group-hover:border-[#B88E2F] transition-colors">
                              {review.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-[#1A1A1A] text-sm block leading-tight">
                                {review.name}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium">
                                {review.createdAt.substring(0, 10)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-[13px] sm:text-sm leading-relaxed mt-2 ml-11 sm:ml-12">
                            {review.comment}
                          </p>
                        </div>
                        <div className="ml-11 sm:ml-0 bg-[#B88E2F]/5 px-3 py-1.5 rounded-lg border border-[#B88E2F]/10 self-start sm:self-center">
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
