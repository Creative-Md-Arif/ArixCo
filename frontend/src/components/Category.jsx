import PropTypes from "prop-types";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { Link } from "react-router-dom";
import { FaFolder, FaArrowRight } from "react-icons/fa";

const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='none'/%3E%3Cpolygon points='40,4 76,40 40,76 4,40' fill='none' stroke='%23B88E2F' stroke-opacity='0.045' stroke-width='1'/%3E%3Cpolygon points='40,16 64,40 40,64 16,40' fill='none' stroke='%23B88E2F' stroke-opacity='0.035' stroke-width='1'/%3E%3Cpolygon points='40,28 52,40 40,52 28,40' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "80px 80px",
};

const Skeleton = () => (
  <section className="py-10 sm:py-14 font-sans" style={BG}>
    <div className="max-w-screen-xl mx-auto px-4">
      <div className="flex flex-col items-center mb-10 gap-2.5">
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-44 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="w-10 h-[2px] bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-sm bg-gray-100 animate-pulse"
          />
        ))}
        <div className="col-span-1 md:col-span-2 aspect-[3/4] md:aspect-[2/1] rounded-sm bg-gray-100 animate-pulse" />
        <div className="col-span-1 md:col-span-2 aspect-[3/4] md:aspect-[2/1] rounded-sm bg-gray-100 animate-pulse" />
      </div>
    </div>
  </section>
);

const ErrorState = () => (
  <section className="py-10 font-sans" style={BG}>
    <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <FaFolder className="w-8 h-8 text-[#B88E2F] opacity-40" />
      <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">
        Failed to Load
      </p>
    </div>
  </section>
);

const EmptyState = () => (
  <section className="py-10 font-sans" style={BG}>
    <div className="max-w-screen-xl mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <FaFolder className="w-8 h-8 text-[#B88E2F] opacity-40" />
      <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">
        No Categories Found
      </p>
    </div>
  </section>
);

// ── CategoryCard ──
const CategoryCard = ({ category, wide }) => (
  <div className={`${wide ? "col-span-1 md:col-span-2" : "col-span-1"}`}>
    <Link
      to={`/shop?category=${category._id}`}
      aria-label={`Browse ${category.name}`}
      className={`group relative overflow-hidden rounded-sm bg-black border border-transparent hover:border-[#B88E2F] transition-all duration-300 hover:-translate-y-1 block h-full ${
        wide ? "aspect-[3/4] md:aspect-[2/1]" : "aspect-[3/4]"
      }`}
    >
      <img
        src={category.image || "/placeholder.jpg"}
        alt={category.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Top-right arrow badge */}
      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#B88E2F]/15 border border-[#B88E2F]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <FaArrowRight className="text-[#B88E2F] text-[8px] sm:text-[10px]" />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex flex-col gap-0.5 sm:gap-1">
        <p className="text-white text-[10px] sm:text-xs font-black uppercase tracking-widest">
          {category.name}
        </p>
        {category.productCount && (
          <p className="text-white/50 text-[8px] sm:text-[10px] tracking-wide">
            {category.productCount}+ items
          </p>
        )}
        <span className="text-[#B88E2F] text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1">
          Shop Now <FaArrowRight className="text-[6px] sm:text-[8px]" />
        </span>
      </div>
    </Link>
  </div>
);

// ── PropTypes ──
CategoryCard.propTypes = {
  category: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string,
    productCount: PropTypes.number,
  }).isRequired,
  wide: PropTypes.bool,
};

CategoryCard.defaultProps = {
  wide: false,
};

// ── Main Component ──
const Category = () => {
  const { data, error, isLoading } = useFetchCategoriesQuery();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!Array.isArray(data) || data.length === 0) return <EmptyState />;

  // Extract only main categories (no parents)
  const mainCategories = data.filter((c) => {
    const parentId =
      c.parent && typeof c.parent === "object" ? c.parent._id : c.parent;
    return !parentId;
  });

  // Limit to 6 categories for the specific layout (4 top, 2 bottom)
  const featuredCategories = mainCategories.slice(0, 6);

  return (
    <section
      aria-labelledby="category-heading"
      className="py-10 sm:py-14 font-sans"
      style={BG}
    >
      <div className="max-w-screen-xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <span className="text-[9px] sm:text-[10px] font-black text-[#B88E2F] uppercase tracking-[0.25em] sm:tracking-[0.3em]">
            Browse by
          </span>
          <h2
            id="category-heading"
            className="text-xl sm:text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-wider sm:tracking-widest"
          >
            Featured <span className="text-[#B88E2F]">Category</span>
          </h2>
          <div className="h-[2px] w-8 sm:w-10 bg-[#B88E2F] rounded-full" />
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {featuredCategories.map((cat, i) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              wide={i >= 4} // Indices 4 and 5 will be wide (col-span-2 on md+ screens)
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;
