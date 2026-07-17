import { useState, useEffect, memo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { IoIosMenu, IoIosClose } from "react-icons/io";
import { LuUsers } from "react-icons/lu";
import { CiShoppingCart } from "react-icons/ci";
import { AiOutlineProduct, AiOutlinePlusSquare } from "react-icons/ai";
import { TbCategory2 } from "react-icons/tb";
import { MdEmail, MdOutlineDashboard } from "react-icons/md";
import { RiImageLine } from "react-icons/ri";
import { FaCreditCard, FaArrowLeft, FaCog, FaSearchengin, FaBlog } from "react-icons/fa";

const menuItems = [
  { to: "/admin/dashboard", icon: <MdOutlineDashboard />, label: "Dashboard" },
  { to: "/admin/categorylist", icon: <TbCategory2 />, label: "Categories" },
  { to: "/admin/allproductslist", icon: <AiOutlineProduct />, label: "All Products" },
  { to: "/admin/productlist", icon: <AiOutlinePlusSquare />, label: "Create Product" },
  { to: "/admin/userlist", icon: <LuUsers />, label: "Users" },
  { to: "/admin/orderlist", icon: <CiShoppingCart />, label: "Orders" },
  { to: "/admin/return-management", icon: <CiShoppingCart />, label: "Returns" },
  { to: "/admin/bannerlist", icon: <RiImageLine />, label: "Banners" },
  { to: "/admin/campaign-manage", icon: <AiOutlinePlusSquare />, label: "Campaigns" },
  { to: "/admin/cuppon-manage", icon: <AiOutlinePlusSquare />, label: "Cuppons" },
  { to: "/admin/shipping-manage", icon: <AiOutlinePlusSquare />, label: "Shipping" },
  { to: "/admin/payment-settings", icon: <FaCreditCard />, label: "Payments" },
  { to: "/admin/site-settings", icon: <FaCog />, label: "Site Settings" },
  { to: "/admin/newsletter", icon: <MdEmail />, label: "Newsletter" },
  { to: "/admin/seo-settings", icon: <FaSearchengin />, label: "SEO Settings" }, 
  { to: "/admin/blog-manage", icon: <FaBlog />, label: "Blogs" },
];

const AdminMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.documentElement.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isSidebarOpen]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Dynamic Page Title based on current route
  const currentItem = menuItems.find((item) => location.pathname.startsWith(item.to));
  const pageTitle = currentItem ? currentItem.label : "Dashboard";

  return (
    <>
      {/* ✅ Dynamic Top Header handled here */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-100 z-50 flex items-center px-4 lg:pl-[260px] shadow-sm font-['Trebuchet_MS']">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="lg:hidden p-2 mr-2 text-black hover:bg-gray-100 rounded-sm transition-colors"
        >
          {isSidebarOpen ? <IoIosClose size={28} /> : <IoIosMenu size={28} />}
        </button>
        <div className="border-l-4 border-black pl-4 py-1">
          <h1 className="text-base sm:text-xl md:text-2xl font-black text-black tracking-tight uppercase font-['Playfair_Display']">
            {pageTitle} <span className="text-red-600">Panel</span>
          </h1>
          <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-1 hidden sm:block">
            System Analytics & Management
          </p>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`bg-white fixed top-20 left-0 h-[calc(100vh-5rem)] border-r border-gray-100 flex flex-col items-start py-8 w-[240px] z-40 shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } font-['Trebuchet_MS']`}
      >
        <div className="px-6 mb-10 w-full overflow-hidden">
          <p className="text-sm font-black text-red-600 tracking-[0.4em] uppercase opacity-60">
            Admin Panel
          </p>
        </div>

        <nav className="flex flex-col w-full px-3 overflow-y-auto flex-1 pb-10">
          <ul className="flex flex-col w-full space-y-1">
            {menuItems.map((item) => (
              <li key={item.to} className="w-full">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-4 py-3.5 px-4 w-full transition-all duration-300 ease-in-out group relative ${
                      isActive
                        ? "text-black bg-gray-50 border-r-4 border-red-600"
                        : "text-gray-500 hover:text-black hover:bg-gray-50"
                    }`
                  }
                >
                  <span className="text-xl transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-wider uppercase">
                    {item.label}
                  </span>
                  <div className="absolute inset-0 bg-red-600/5 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -z-10" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Section with Back to Home Button */}
        <div className="mt-auto px-6 py-8 w-full border-t border-gray-100">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors rounded-sm mb-6"
          >
            <FaArrowLeft size={12} /> Back to Home
          </Link>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-center opacity-40">
            AriX Co v2.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default memo(AdminMenu);