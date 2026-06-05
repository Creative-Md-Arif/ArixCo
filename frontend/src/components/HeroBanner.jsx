import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetHeroBannersQuery,
  useIncrementBannerClicksMutation,
} from "@redux/api/bannerApiSlice";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

/* ─── Badge config ───────────────────────────────────────── */
const BADGE = {
  default: { text: "SHOP NOW", icon: "" },
  "weekend-deal": { text: "WEEKEND DEAL", icon: "🔥" },
  "flash-sale": { text: "FLASH SALE", icon: "⚡" },
  "big-sale": { text: "BIG SALE", icon: "💥" },
  "limited-offer": { text: "LIMITED OFFER", icon: "⏰" },
  "special-offer": { text: "SPECIAL OFFER", icon: "🎁" },
  clearance: { text: "CLEARANCE", icon: "🏷️" },
  "new-arrival": { text: "NEW ARRIVAL", icon: "✨" },
  "best-seller": { text: "BEST SELLER", icon: "⭐" },
  "trending-now": { text: "TRENDING NOW", icon: "📈" },
  "hot-deal": { text: "HOT DEAL", icon: "🌶️" },
  "mega-sale": { text: "MEGA SALE", icon: "🎉" },
  "seasonal-offer": { text: "SEASONAL OFFER", icon: "🌸" },
  exclusive: { text: "EXCLUSIVE", icon: "💎" },
  "last-chance": { text: "LAST CHANCE", icon: "⚠️" },
  doorbuster: { text: "DOORBUSTER", icon: "🚪" },
  "early-bird": { text: "EARLY BIRD", icon: "🐦" },
  "member-exclusive": { text: "MEMBER EXCLUSIVE", icon: "👤" },
  "bundle-deal": { text: "BUNDLE DEAL", icon: "📦" },
  "buy-one-get-one": { text: "BUY 1 GET 1", icon: "🎊" },
};

/* ─── Offer badge text ───────────────────────────────────── */
function offerLabel(offerSettings) {
  if (!offerSettings || offerSettings.offerValue <= 0) return null;
  const { offerType, offerValue } = offerSettings;
  if (offerType === "percentage") return `${offerValue}% OFF`;
  if (offerType === "bogo") return "BUY 1 GET 1 FREE";
  if (offerType === "fixed") return `৳${offerValue} OFF`;
  if (offerType === "free-shipping") return "FREE SHIPPING";
  return null;
}

/* ─── Simple & Fixed Skeleton ────────────────────────────── */
const Skeleton = () => (
  <div className="w-full h-[240px] sm:h-[340px] md:h-[440px] lg:h-[540px] xl:h-[580px] bg-gray-100 animate-pulse flex items-center px-6 md:px-16 lg:px-24">
    <div className="space-y-3 sm:space-y-4 w-full max-w-sm">
      <div className="h-3 w-20 bg-gray-200/80 rounded" />
      <div className="h-7 w-3/4 bg-gray-200/80 rounded" />
      <div className="h-9 w-1/3 bg-gray-200/80 rounded-md" />
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward

  const { data: banners, isLoading, error } = useGetHeroBannersQuery();
  const [incrementClicks] = useIncrementBannerClicksMutation();

  /* auto-advance */
  useEffect(() => {
    if (!autoPlay || !banners?.length) return;
    const t = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [autoPlay, banners]);

  const prev = useCallback(() => {
    if (!banners?.length) return;
    setAutoPlay(false);
    setDirection(-1);
    setCurrent((p) => (p - 1 + banners.length) % banners.length);
  }, [banners]);

  const next = useCallback(() => {
    if (!banners?.length) return;
    setAutoPlay(false);
    setDirection(1);
    setCurrent((p) => (p + 1) % banners.length);
  }, [banners]);

  const goTo = useCallback(
    (i) => {
      setAutoPlay(false);
      setDirection(i > current ? 1 : -1);
      setCurrent(i);
    },
    [current]
  );

  const handleClick = async (banner) => {
    try {
      await incrementClicks(banner._id);
    } catch {
      /* silent */
    }
  };

  /* keyboard navigation */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (error) {
    console.error(error);
    return null;
  }
  if (isLoading) return <Skeleton />;
  if (!banners?.length) return null;

  const b = banners[current];
  const badge = BADGE[b.buttonType] ?? BADGE.default;
  const offer = offerLabel(b.offerSettings);
  const multi = banners.length > 1;

  /* slide variants */
  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  return (
    <section
      aria-label="Hero banner"
      className="font-figtree"
    >
      {/* Height matches the Skeleton perfectly to prevent layout shift */}
      <div className="relative w-full h-[240px] sm:h-[340px] md:h-[440px] lg:h-[540px] xl:h-[580px] overflow-hidden bg-gray-100">
        
        {/* ── Slide ── */}
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* Image with responsive src */}
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet={b.mobileImage || b.image}
              />
              <img
                src={b.image}
                alt={b.headline}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </picture>

            {/* Gradient overlay */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, ${b.backgroundColor}e0 0%, ${b.backgroundColor}60 35%, ${b.backgroundColor}10 65%, transparent 100%)`,
              }}
            />

            {/* Content container - Responsive padding and width */}
            <div className="absolute inset-0 flex items-center px-4 sm:px-8 md:px-16 lg:px-24">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="max-w-[90%] sm:max-w-[450px] md:max-w-[480px] lg:max-w-[520px] space-y-2 sm:space-y-3 md:space-y-4"
              >
                {/* Badges row */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {b.buttonType && b.buttonType !== "default" && (
                    <motion.span
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 border border-white/40 bg-white/15 backdrop-blur-sm text-black text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] rounded"
                    >
                      <span>{badge.icon}</span>
                      {badge.text}
                    </motion.span>
                  )}
                  {offer && (
                    <motion.span
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-white/90 text-gray-900 text-[7px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] rounded"
                    >
                      {offer}
                    </motion.span>
                  )}
                </div>

                {/* Headline */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-xl sm:text-3xl md:text-5xl lg:text-[3.25rem] font-black leading-[1.1] tracking-tight"
                  style={{ color: b.textColor }}
                >
                  {b.headline}
                </motion.h2>

                {/* Sub-headline */}
                {b.subHeadline && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="text-[10px] sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3"
                    style={{ color: b.textColor, opacity: 0.8 }}
                  >
                    {b.subHeadline}
                  </motion.p>
                )}

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                >
                  <Link
                    to={b.link || "/shop"}
                    onClick={() => handleClick(b)}
                    aria-label={`${b.buttonText} — ${b.headline}`}
                    className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 md:px-7 md:py-3 text-[8px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] rounded transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: b.buttonColor,
                      color: b.buttonTextColor,
                    }}
                  >
                    {b.buttonText}
                    <FaArrowRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3" />
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Arrow buttons ── */}
        {multi && (
          <>
            <button
              onClick={prev}
              aria-label="Previous banner"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 border border-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <FaArrowLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
            </button>
            <button
              onClick={next}
              aria-label="Next banner"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-white/20 hover:bg-white/40 border border-white/20 text-white rounded-full backdrop-blur-sm transition-colors"
            >
              <FaArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
            </button>
          </>
        )}

        {/* ── Progress dots ── */}
        {multi && (
          <div
            role="tablist"
            aria-label="Banner navigation"
            className="absolute bottom-3 sm:bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2"
          >
            {banners.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-[3px] sm:h-[4px] rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-5 sm:w-7 md:w-8 bg-white"
                    : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Slide counter (top-right) ── */}
        {multi && (
          <div
            aria-hidden="true"
            className="absolute top-2 right-3 sm:top-3 sm:right-4 z-10 text-white/60 text-[8px] sm:text-[10px] md:text-[11px] font-bold tracking-widest select-none"
          >
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(banners.length).padStart(2, "0")}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;