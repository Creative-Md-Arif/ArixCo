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
  const tabs = ["Specification", "Description", "Questions (0)", "Reviews (0)"];

  return (
    <div className="flex flex-col space-y-4 font-sans text-gray-900 w-full ">
      {/* Navigation Headers Row */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-gray-200 pb-px">
        {tabs.map((tab, index) => {
          const currentTabIdx = index + 1;
          const isSelected = activeTab === currentTabIdx;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(currentTabIdx)}
              className={`px-4 py-2 text-[13px] font-bold rounded-t transition-all border-x border-t whitespace-nowrap outline-none focus:outline-none ${
                isSelected
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {tab === "Reviews (0)" && product.reviews?.length > 0
                ? `Reviews (${product.reviews.length})`
                : tab}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Contents Wrapper */}
      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <div className="p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
            >
              {/* 1. Technical Specifications Grid Tab */}
              {activeTab === 1 && (
                <div className="space-y-4">
                  <h3 className="text-[16px] font-bold text-gray-900">Specification</h3>
                  {product.specifications?.length > 0 ? (
                    <div className="border border-gray-100 rounded overflow-hidden divide-y divide-gray-100">
                      {product.specifications.map((spec, idx) => (
                        <div key={idx} className="flex text-[14px] bg-white hover:bg-gray-50 transition-colors">
                          <div className="w-1/3 p-3 bg-gray-50 font-medium text-blue-900 border-r border-gray-100 capitalize">
                            {spec.label}
                          </div>
                          <div className="w-2/3 p-3 text-gray-800 capitalize">
                            {spec.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-[14px]">No explicit technical specification schema listed.</p>
                  )}
                </div>
              )}

              {/* 2. Pure Description Display Container */}
              {activeTab === 2 && (
                <div className="prose max-w-none text-gray-800 text-[14px] leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                </div>
              )}

              {/* 3. Customer Inquiry / Question Panel Dummy Content placeholder */}
              {activeTab === 3 && (
                <div className="text-center py-8 text-gray-500 text-[14px]">
                  No questions have been asked about this product yet. Be the first to ask!
                </div>
              )}

              {/* 4. Complete Review Form + Feedback Feeds Panel */}
              {activeTab === 4 && (
                <div className="space-y-6">
                  {/* Reviews Stream Container */}
                  <div className="space-y-3">
                    {!product.reviews || product.reviews.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-gray-200 rounded text-gray-500 text-[14px] bg-gray-50">
                        There are no reviews for this product yet.
                      </div>
                    ) : (
                      product.reviews.map((review) => (
                        <div
                          key={review._id}
                          className="bg-white p-4 rounded border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded bg-blue-900 text-white flex items-center justify-center text-[14px] font-bold">
                                {review.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 text-[14px] block leading-tight">
                                  {review.name}
                                </span>
                                <span className="text-[11px] text-gray-400">
                                  {review.createdAt.substring(0, 10)}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-[14px] leading-relaxed mt-2 pl-12">
                              {review.comment}
                            </p>
                          </div>
                          <div className="pl-12 sm:pl-0 self-start sm:self-center">
                            <Ratings value={review.rating} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Input Feedback Box Area */}
                  <div className="border-t border-gray-100 pt-6">
                    {userInfo ? (
                      <form onSubmit={submitHandler} className="space-y-4 max-w-xl bg-gray-50 p-4 rounded border border-gray-200">
                        <h4 className="text-[15px] font-bold text-gray-900">Write a Review</h4>
                        <div>
                          <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                            Select Rating
                          </label>
                          <select
                            required
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="w-full sm:w-64 h-9 px-3 bg-white border border-gray-200 rounded outline-none text-[14px] text-gray-800 focus:border-blue-700"
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
                          <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                            Your Experience
                          </label>
                          <textarea
                            rows="3"
                            required
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts about the product..."
                            className="w-full p-3 bg-white border border-gray-200 rounded outline-none text-[14px] resize-none text-gray-800 placeholder:text-gray-400 focus:border-blue-700"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          disabled={loadingProductReview}
                          className="bg-blue-700 hover:bg-blue-800 text-white px-5 h-9 rounded font-medium text-[13px] transition-all disabled:opacity-50"
                        >
                          {loadingProductReview ? "Submitting..." : "Submit Review"}
                        </button>
                      </form>
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200">
                        <p className="text-gray-600 text-[14px]">
                          Please{" "}
                          <Link to="/login" className="text-blue-700 font-bold hover:underline">
                            Login
                          </Link>{" "}
                          to share your experience.
                        </p>
                      </div>
                    )}
                  </div>
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