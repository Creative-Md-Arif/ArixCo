const FooterBottom = () => {
  const year = new Date().getFullYear();

  return (
    <div className="border-t border-neutral-900 bg-neutral-950 font-figtree">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col items-center gap-2.5">

          {/* motion রিমুভ করে সাধারণ ক্লিন ডিভ দেওয়া হয়েছে */}
          <div className="w-12 h-[2px] bg-[#B88E2F] rounded-full" />

          {/* সব ডিভাইসে টেক্সট সাইজ 14px এবং ডার্ক থিম কালার সেট করা হয়েছে */}
          <p className="text-[14px] font-bold text-neutral-400 text-center tracking-[0.15em] uppercase">
            &copy; {year}{" "}
            <span className="text-[#B88E2F]">AriX co</span>
            {" "}— All rights reserved.
          </p>

        </div>
      </div>
    </div>
  );
};

export default FooterBottom;