import { Link } from "react-router-dom";
import { useGetBestSellersQuery } from "../../redux/api/productApiSlice";
import Product from "../../pages/Products/Product";
import Message from "../Message";
import { FaLongArrowAltRight, FaFire, FaShoppingBag } from "react-icons/fa";

const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none'/%3E%3Crect x='2' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3Crect x='2' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "60px 60px",
};

const ProductSkeleton = () => (
  <div
    className="bg-white rounded-md border border-gray-200 overflow-hidden flex flex-col h-full"
    aria-hidden="true"
  >
    <div className="aspect-square bg-gray-50 flex items-center justify-center animate-pulse">
      <FaShoppingBag className="text-gray-200 text-3xl" />
    </div>
    <div className="p-3 space-y-2 flex-1">
      <div className="w-14 h-2.5 bg-gray-200 rounded animate-pulse" />
      <div className="w-full h-3.5 bg-gray-200 rounded animate-pulse" />
      <div className="w-3/4 h-3.5 bg-gray-200 rounded animate-pulse" />
      <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mt-2" />
    </div>
  </div>
);

const BestSellers = () => {
  const { data: products, isLoading, isError } = useGetBestSellersQuery(10);

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16 font-sans" style={BG} aria-busy="true">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col items-center mb-8 gap-2.5">
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
            <div className="w-40 h-7 bg-gray-200 rounded animate-pulse" />
            <div className="w-12 h-[2px] bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="py-10 sm:py-14 font-sans"
      style={BG}
      aria-labelledby="best-sellers-heading"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <div className="flex items-center gap-1.5">
            <FaFire className="w-[10px] h-[10px] text-[#B88E2F]" />
            <span className="text-[10px] sm:text-[11px] font-black text-[#B88E2F] uppercase tracking-[0.3em]">
              Top Performing
            </span>
            <FaFire className="w-[10px] h-[10px] text-[#B88E2F]" />
          </div>
          <h2
            id="best-sellers-heading"
            className="text-xl sm:text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-[0.1em] leading-tight"
          >
            Best <span className="text-[#B88E2F]">Sellers</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-gray-500 max-w-xs sm:max-w-sm leading-relaxed">
            Most loved items by our customers — proven quality and style.
          </p>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </div>

        {isError ? (
          <Message variant="danger">
            Failed to load best sellers. Please try again.
          </Message>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products?.slice(0, 10).map((product) => (
                <Product key={product._id} product={product} />
              ))}
            </div>
            <div className="flex justify-center mt-10">
              <Link
                to="/shop?sort=top-rated"
                className="group inline-flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-sm text-[11px] font-black uppercase tracking-widest text-gray-800 hover:border-[#B88E2F] hover:text-[#B88E2F] transition-colors duration-200 bg-white"
              >
                View All Best Sellers
                <FaLongArrowAltRight className="w-[12px] h-[12px] shrink-0 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BestSellers;
