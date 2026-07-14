import { useState, useEffect, useCallback } from "react";
import {
  useGetHeroBannersQuery,
  useIncrementBannerClicksMutation,
} from "@redux/api/bannerApiSlice";
import { FaArrowRight } from "react-icons/fa";
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
  <div className="w-full h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px] xl:h-[600px] bg-gray-100 animate-pulse flex items-center justify-center">
    <div className="space-y-3 sm:space-y-4 w-full max-w-xs text-center px-4">
      <div className="h-3 w-20 bg-gray-200/80 rounded mx-auto" />
      <div className="h-8 w-3/4 bg-gray-200/80 rounded mx-auto" />
      <div className="h-4 w-1/2 bg-gray-200/80 rounded mx-auto" />
      <div className="h-10 w-1/3 bg-gray-200/80 rounded-md mx-auto" />
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────── */
const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: banners, isLoading, error } = useGetHeroBannersQuery();
  const [incrementClicks] = useIncrementBannerClicksMutation();

  /* Change slide function (Smooth CSS Fade) */
  const changeSlide = useCallback(
    (newIndex) => {
      if (isTransitioning || !banners?.length) return;
      setIsTransitioning(true); // Start fade out
      setAutoPlay(false);

      setTimeout(() => {
        setCurrent(newIndex);
        setIsTransitioning(false); // Start fade in
      }, 400); // Time matches CSS transition duration
    },
    [isTransitioning, banners],
  );

  /* auto-advance */
  useEffect(() => {
    if (!autoPlay || !banners?.length) return;
    const t = setInterval(() => {
      changeSlide((current + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [autoPlay, banners, current, changeSlide]);

  const prev = useCallback(() => {
    if (!banners?.length) return;
    changeSlide((current - 1 + banners.length) % banners.length);
  }, [banners, current, changeSlide]);

  const next = useCallback(() => {
    if (!banners?.length) return;
    changeSlide((current + 1) % banners.length);
  }, [banners, current, changeSlide]);

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

  return (
    <section aria-label="Hero banner" className="font-sans">
      <div className="relative w-full h-[260px] sm:h-[360px] md:h-[460px] lg:h-[540px] xl:h-[600px] overflow-hidden bg-gray-900">
        {/* ── Slide Container ── */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
            isTransitioning ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
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

          {/* Optimized Radial Overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.6) 100%)`,
            }}
          />

          {/* Centered Content Container */}
          <div className="absolute inset-0 flex items-center justify-center text-center px-6 sm:px-12 md:px-20">
            <div className="max-w-3xl w-full space-y-3 sm:space-y-4 md:space-y-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {/* Badges row */}
              <div className="flex justify-center flex-wrap gap-2 sm:gap-3">
                {b.buttonType && b.buttonType !== "default" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[8px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-sm">
                    <span>{badge.icon}</span>
                    {badge.text}
                  </span>
                )}
                {offer && (
                  <span className="inline-flex items-center px-2.5 py-1 sm:px-4 sm:py-1.5 bg-red-600 text-white text-[8px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-sm">
                    {offer}
                  </span>
                )}
              </div>

              {/* ✅ Headline - Fixed Text Color for Maximum Visibility */}
              <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-playfair leading-[1.05] tracking-px uppercase text-white">
                {b.headline}
              </h2>

              {/* ✅ Sub-headline - Fixed Text Color */}
              {b.subHeadline && (
                <p className="text-sm sm:text-base font-light font-poppins leading-relaxed mx-auto max-w-xl text-gray-200 mb-8 italic">
                  {b.subHeadline}
                </p>
              )}

              {/* CTA Button */}
              <div>
                <Link
                  to={b.link || "/shop"}
                  onClick={() => handleClick(b)}
                  aria-label={`${b.buttonText} — ${b.headline}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-[10px] sm:text-[11px] md:text-[12px] font-bold font-poppins uppercase tracking-[0.2em] rounded-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                  style={{
                    backgroundColor: b.buttonColor || "#B88E2F",
                    color: b.buttonTextColor || "#FFFFFF",
                  }}
                >
                  <span className="leading-none mt-[1px]">{b.buttonText}</span>

                  <FaArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Progress dots ── */}
        {multi && (
          <div
            role="tablist"
            aria-label="Banner navigation"
            className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2"
          >
            {banners.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => changeSlide(i)}
                className={`h-[3px] sm:h-[4px] rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 sm:w-8 md:w-10 bg-white"
                    : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Slide counter (top-right) ── */}
        {multi && (
          <div
            aria-hidden="true"
            className="absolute top-3 right-4 sm:top-4 sm:right-6 z-10 text-white/50 text-[8px] sm:text-[10px] font-mono font-bold tracking-widest select-none"
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
