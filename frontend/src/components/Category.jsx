import PropTypes from "prop-types";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { Link } from "react-router-dom";
import { FaFolder, FaArrowRight } from "react-icons/fa";

// Single source of truth: top-level squares + bottom wide cards must sum to this
const FEATURED_CATEGORIES_LIMIT = 6;
const WIDE_CARDS_COUNT = 2;
const SQUARE_CARDS_COUNT = FEATURED_CATEGORIES_LIMIT - WIDE_CARDS_COUNT;

const Skeleton = () => (
  <section className="py-10 sm:py-14 font-sans">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center mb-10 gap-2.5">
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-44 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="w-10 h-[2px] bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: SQUARE_CARDS_COUNT }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-sm bg-gray-100 animate-pulse"
          />
        ))}
        {Array.from({ length: WIDE_CARDS_COUNT }).map((_, i) => (
          <div
            key={`wide-${i}`}
            className="col-span-1 md:col-span-2 aspect-[3/4] md:aspect-[2/1] rounded-sm bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    </div>
  </section>
);

const ErrorState = () => (
  <section className="py-10 font-sans">
    <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-center">
      <FaFolder className="w-8 h-8 text-[#B88E2F] opacity-40" />
      <p className="text-xs font-bold text-gray-800 uppercase tracking-widest">
        Failed to Load
      </p>
    </div>
  </section>
);

const EmptyState = () => (
  <section className="py-10 font-sans">
    <div className="container mx-auto px-4 flex flex-col items-center gap-3 text-center">
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
      className={`group relative overflow-hidden bg-black transition-all duration-300 hover:-translate-y-1 block h-full ${
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

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex flex-col gap-0.5 sm:gap-1">
        <p className="text-white text-xs font-trebuchet font-normal uppercase tracking-px">
          {category.name}
        </p>
        {category.productCount && (
          <p className="text-white/50 text-[10px] tracking-wide">
            {category.productCount}+ items
          </p>
        )}
        <span className="text-[#B88E2F] text-[10px] font-trebuchet font-normal uppercase tracking-px opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 underline transition-all duration-300 flex items-center gap-1">
          Shop Now <FaArrowRight className="text-[8px]" />
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

  // Limit categories for the specific layout (top squares + bottom wide)
  const featuredCategories = mainCategories.slice(0, FEATURED_CATEGORIES_LIMIT);

  return (
    <section aria-labelledby="category-heading" className="py-10 sm:py-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2">
          <h2
            id="category-heading"
            className="font-trebuchet text-[24px] font-bold tracking-px text-gray-900 uppercase"
          >
            Featured Category
          </h2>
          <div className="h-[2px] w-8 sm:w-10 bg-[#B88E2F] rounded-full" />
        </div>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {featuredCategories.map((cat, i) => (
            <CategoryCard
              key={cat._id}
              category={cat}
              wide={i >= SQUARE_CARDS_COUNT} // Last WIDE_CARDS_COUNT items will be wide (col-span-2 on md+ screens)
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Category;