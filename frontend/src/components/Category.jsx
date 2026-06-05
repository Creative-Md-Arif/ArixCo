import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFolder } from "react-icons/fa";

/*
  SECTION IDENTITY: Category
  BG: Pure white #FFFFFF with ultra-subtle concentric diamond rings
  PATTERN: Minimal — premium jewellery-store feel
  ACCENT: #B88E2F gold
  Optimized for: white-bg readability, WCAG AA contrast, visual hierarchy
*/

const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='none'/%3E%3Cpolygon points='40,4 76,40 40,76 4,40' fill='none' stroke='%23B88E2F' stroke-opacity='0.045' stroke-width='1'/%3E%3Cpolygon points='40,16 64,40 40,64 16,40' fill='none' stroke='%23B88E2F' stroke-opacity='0.035' stroke-width='1'/%3E%3Cpolygon points='40,28 52,40 40,52 28,40' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Ccircle cx='40' cy='4' r='1.2' fill='%23B88E2F' fill-opacity='0.08'/%3E%3Ccircle cx='76' cy='40' r='1.2' fill='%23B88E2F' fill-opacity='0.08'/%3E%3Ccircle cx='40' cy='76' r='1.2' fill='%23B88E2F' fill-opacity='0.08'/%3E%3Ccircle cx='4' cy='40' r='1.2' fill='%23B88E2F' fill-opacity='0.08'/%3E%3C/svg%3E")`,
  backgroundSize: "80px 80px",
};

const Skeleton = () => (
  <section
    aria-label="Loading categories"
    className="py-10 sm:py-14 font-figtree"
    style={BG}
  >
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8 sm:mb-10 gap-2.5">
        <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-44 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="w-10 h-[2px] bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex flex-wrap justify-center gap-5 sm:gap-7">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2.5">
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-gray-100 border border-gray-200 animate-pulse" />
            <div className="w-14 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ErrorState = () => (
  <section className="py-10 font-figtree" style={BG}>
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
        <FaFolder
          className="w-5 h-5 text-[#B88E2F] opacity-50"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.18em]">
        Failed to Load Categories
      </h3>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Please try refreshing the page
      </p>
    </div>
  </section>
);

const EmptyState = () => (
  <section className="py-10 font-figtree" style={BG}>
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-3 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center">
        <FaFolder
          className="w-5 h-5 text-[#B88E2F] opacity-50"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.18em]">
        No Categories Found
      </h3>
      <p className="text-[11px] text-gray-500 leading-relaxed">
        Check back later for new categories
      </p>
    </div>
  </section>
);

const Category = () => {
  const { data, error, isLoading } = useFetchCategoriesQuery();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState />;
  if (!Array.isArray(data) || data.length === 0) return <EmptyState />;

  const mainCategories = data.filter((c) => {
    const parentId =
      c.parent && typeof c.parent === "object" ? c.parent._id : c.parent;
    return !parentId;
  });

  return (
    <section
      aria-labelledby="category-heading"
      className="py-10 sm:py-14 font-figtree"
      style={BG}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35 }}
          className="flex flex-col items-center mb-8 sm:mb-10 text-center gap-2"
        >
          <span className="text-[10px] sm:text-[11px] font-black text-[#B88E2F] uppercase tracking-[0.3em]">
            Browse by
          </span>
          <h2
            id="category-heading"
            className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-[0.1em] leading-tight"
          >
            Featured <span className="text-[#B88E2F]">Category</span>
          </h2>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </motion.div>

        {/* ── Category Grid ── */}
        <ul
          role="list"
          className="flex flex-wrap justify-center gap-x-5 gap-y-6 sm:gap-x-7 sm:gap-y-8 lg:gap-x-9 lg:gap-y-9"
        >
          {mainCategories.map((category, index) => (
            <li key={category._id}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <Link
                  to={`/shop?category=${category._id}`}
                  aria-label={`Browse ${category.name} category`}
                  className="group flex flex-col items-center gap-2.5"
                >
                  {/* Circle thumbnail with hover ring */}
                  <div className="relative p-1">
                    {/* Outer hover ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#B88E2F] opacity-0 group-hover:opacity-25 scale-[1.18] transition-all duration-300" />

                    <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-[#B88E2F] transition-all duration-250 bg-white shadow-sm group-hover:shadow-md group-hover:shadow-[#B88E2F]/10 shrink-0">
                      <img
                        src={category.image || "/placeholder.jpg"}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-400"
                      />
                    </div>
                  </div>

                  <h3 className="text-[11px] sm:text-xs font-bold text-gray-700 group-hover:text-[#B88E2F] tracking-[0.08em] text-center capitalize transition-colors duration-200 max-w-[80px] leading-snug">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Category;
