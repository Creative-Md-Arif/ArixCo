import { memo, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // Existing package for SEO
import NewArrivals from "../components/bannerSection/NewArrivals";
import BestSellers from "../components/bannerSection/BestSellers";
import Category from "../components/Category";
import HeroBanner from "../components/HeroBanner";
import { DoubleBanner, WideBanner } from "../components/bannerSection/PromoBanners";

const Home = () => {
  // ✅ React Router best practice: useSearchParams instead of window.location
  const [searchParams] = useSearchParams();
  
  // ✅ Memoized keyword check to prevent unnecessary calculations on re-renders
  const keyword = useMemo(() => searchParams.get('keyword'), [searchParams]);
  const showHomeSections = !keyword;

  return (
    <>
      {/* ── SEO Optimization using Helmet ── */}
      <Helmet>
        <title>AriX Co - Premium Clothing E-commerce Store | Shop Online Today</title>
        <meta name="description" content="AriX Co is your ultimate online shopping destination. Discover premium quality products, best deals, fast delivery, and secure payment options. Shop now!" />
        <meta name="keywords" content="online shopping, e-commerce, buy online, best deals, premium products, fast delivery, AriX Co, online store" />
        <meta property="og:title" content="AriX Co - Premium Clothing E-commerce Store" />
        <meta property="og:description" content="Discover premium quality products with best deals and fast delivery. Shop online at AriX Co today!" />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── Accessibility: role="main" ── */}
      <div className="bg-[#FFFFFF] min-h-screen" role="main" aria-label="Homepage content">
        <HeroBanner />
        
        {/* ✅ Conditionally rendering sections based on keyword presence */}
        {showHomeSections && <Category />}
        {showHomeSections && <NewArrivals />}
        {showHomeSections && <DoubleBanner />}    
        {showHomeSections && <BestSellers />}
        {showHomeSections && <WideBanner />}  
      </div>
    </>
  );
};

// ✅ Memoized to prevent unnecessary re-renders
export default memo(Home);
