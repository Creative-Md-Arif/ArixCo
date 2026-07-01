import NewArrivals from "../components/bannerSection/NewArrivals";
import BestSellers from "../components/bannerSection/BestSellers";
import Category from "../components/Category";
import HeroBanner from "../components/HeroBanner";
import { DoubleBanner, WideBanner } from "../components/bannerSection/PromoBanners";

const Home = () => {
  const keyword = window.location.search.includes('keyword') ? new URLSearchParams(window.location.search).get('keyword') : null;

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <HeroBanner />
      {!keyword && <Category />}
      {!keyword && <NewArrivals />}
      {!keyword && <DoubleBanner />}    
      {!keyword && <BestSellers />}
      {!keyword && <WideBanner />}  
    </div>
  );
};

export default Home;