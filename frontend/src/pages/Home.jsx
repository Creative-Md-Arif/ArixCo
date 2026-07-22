import { memo, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NewArrivals from "../components/bannerSection/NewArrivals";
import BestSellers from "../components/bannerSection/BestSellers";
import Category from "../components/Category";
import HeroBanner from "../components/HeroBanner";
import { DoubleBanner, WideBanner } from "../components/bannerSection/PromoBanners";
import FeaturedReviews from "../pages/User/FeaturedReviews"; // 🆕 ইম্পোর্ট করা হয়েছে

const Home = () => {
  const [searchParams] = useSearchParams();
  
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

      <div className="bg-[#FFFFFF] min-h-screen" role="main" aria-label="Homepage content">
        <HeroBanner />
        
        {showHomeSections && <Category />}
        {showHomeSections && <NewArrivals />}
        {showHomeSections && <DoubleBanner />}    
        {showHomeSections && <BestSellers />}
        
        {/* 🆕 ফিচার্ড রিভিউ স্লাইডার যুক্ত করা হলো */}
        {showHomeSections && <FeaturedReviews />}
        
        {showHomeSections && <WideBanner />}  
      </div>
    </>
  );
};

export default memo(Home);