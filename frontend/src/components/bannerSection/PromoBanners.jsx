import { Link } from "react-router-dom";

// Shared Pattern Background
const BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none'/%3E%3Crect x='2' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.04' stroke-width='1'/%3E%3Crect x='32' y='2' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3Crect x='2' y='32' width='26' height='26' rx='2' fill='none' stroke='%23B88E2F' stroke-opacity='0.025' stroke-width='1'/%3E%3C/svg%3E")`,
  backgroundSize: "60px 60px",
};

// Shared Button Style
const btnClass =
  "inline-flex items-center gap-2 px-5 py-2 border border-white/40 rounded-sm text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white bg-white/10 backdrop-blur-sm hover:bg-[#B88E2F] hover:border-[#B88E2F] transition-all duration-200";


export const DoubleBanner = () => {
  // ✅ _id যোগ করা হয়েছে (আপনার ব্যাকএন্ড থেকে আসা আসল _id দিয়ে এগুলো রিপ্লেস করে দিবেন)
  const banners = [
    {
      _id: "mens_category_id", 
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
      eyebrow: "Men's",
      title: "Fresh Footwear",
      btn: "Shop",
    },
    {
      _id: "womens_category_id",
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
      eyebrow: "Women's",
      title: "New In",
      btn: "Explore",
    },
    {
      _id: "kids_category_id",
      img: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
      eyebrow: "Kid's",
      title: "Cute Styles",
      btn: "Shop",
    },
  ];

  return (
    <section className="py-10 sm:py-14 font-sans" style={BG}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center mb-8 text-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-black text-[#B88E2F] uppercase tracking-[0.3em]">
            Categories
          </span>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-gray-900 uppercase tracking-[0.1em]">
            Shop By <span className="text-[#B88E2F]">Department</span>
          </h2>
          <div className="h-[2px] w-12 bg-[#B88E2F] rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {banners.map((b, i) => (
            <Link
              key={i}
              to={`/shop?category=${b._id}`} // ✅ ডাইনামিক ক্যাটাগরি আইডি দিয়ে লিংক
              className="group relative rounded-sm overflow-hidden h-56 sm:h-72 bg-black cursor-pointer border border-transparent hover:border-[#B88E2F] transition-all duration-300 flex items-end"
            >
              <img
                src={b.img}
                alt={b.eyebrow}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-2">
                <p className="text-[#B88E2F] text-[10px] sm:text-[11px] font-black tracking-[0.3em] uppercase">
                  {b.eyebrow}
                </p>
                <p className="text-white font-black text-lg sm:text-xl uppercase tracking-tight">
                  {b.title}
                </p>
                <span
                  className={`w-fit ${btnClass} opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0`}
                >
                  {b.btn} <span className="text-[8px]">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const WideBanner = () => {
  return (
    <section className="py-10 sm:py-14 font-sans" style={BG}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <Link
          to="/shop" // এটি সাইটওয়াইড সেল, তাই এখানে ক্যাটাগরি আইডি লাগানো হয়নি, চাইলে এখানেও দিতে পারেন
          className="group relative rounded-sm overflow-hidden h-48 sm:h-64 bg-black cursor-pointer border border-transparent hover:border-[#B88E2F] transition-all duration-300 flex items-center"
        >
          <img
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-25 group-hover:scale-105 transition-all duration-500"
            alt="Sale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between w-full px-6 sm:px-10 gap-4">
            <div>
              <p className="text-[#B88E2F] text-[10px] sm:text-[11px] font-black tracking-[0.3em] uppercase mb-1">
                Flash Sale · Ends Tonight
              </p>
              <p className="text-white text-xl sm:text-2xl font-black uppercase tracking-tight">
                Extra 20% Off Sitewide
              </p>
            </div>
            <span className="bg-[#B88E2F] group-hover:bg-black text-white text-[11px] uppercase tracking-widest px-6 py-2.5 font-black rounded-sm flex-shrink-0 transition-colors duration-200">
              Claim Offer
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
};