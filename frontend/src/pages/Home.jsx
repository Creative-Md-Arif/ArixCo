import { useParams } from "react-router-dom";

import NewArrivals from "../components/bannerSection/NewArrivals";
import BestSellers from "../components/bannerSection/BestSellers";
import Category from "../components/Category";
import HeroBanner from "../components/HeroBanner";

const Home = () => {
  const { keyword } = useParams();
  // const { data, isLoading, isError } = useGetProductsQuery({ keyword });

  return (
    <div className="bg-white min-h-screen ">
      {/* Header / Hero Section */}
      <HeroBanner />

      {!keyword ? <Category /> : null}

      {/* New Arrivals Section */}
      {!keyword && <NewArrivals />}

      {/* Best Sellers Section */}
      {!keyword && <BestSellers />}
    </div>
  );
};

export default Home;
