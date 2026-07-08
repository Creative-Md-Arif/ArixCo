import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { LuUsers } from "react-icons/lu";
import { CiShoppingCart } from "react-icons/ci";
import { AiOutlineProduct, AiOutlinePlusSquare } from "react-icons/ai";
import { TbCategory2 } from "react-icons/tb";
import { MdOutlineDashboard } from "react-icons/md";
import { RiImageLine } from "react-icons/ri";
import { FaCreditCard } from "react-icons/fa";

const AdminMenu = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1536) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = isSidebarOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const menuItems = [
    {
      to: "/admin/dashboard",
      icon: <MdOutlineDashboard />,
      label: "Dashboard",
    },
    { to: "/admin/categorylist", icon: <TbCategory2 />, label: "Categories" },
    {
      to: "/admin/allproductslist",
      icon: <AiOutlineProduct />,
      label: "All Products",
    },
    {
      to: "/admin/productlist",
      icon: <AiOutlinePlusSquare />,
      label: "Create Product",
    },
    { to: "/admin/userlist", icon: <LuUsers />, label: "Users" },
    { to: "/admin/orderlist", icon: <CiShoppingCart />, label: "Orders" },
    { to: "/admin/return-management", icon: <CiShoppingCart />, label: "Returns" },
    { to: "/admin/bannerlist", icon: <RiImageLine />, label: "Banners" },
    { to: "/admin/cuppon-manage", icon: <AiOutlinePlusSquare />, label: "Cuppons" },
    { to: "/admin/shipping-manage", icon: <AiOutlinePlusSquare />, label: "Shipping" },
    {
      to: "/admin/payment-settings",
      icon: <FaCreditCard />,
      label: "Payments",
    },
  ];

  return (
    <div className="font-mono">
      {/* Sidebar & Toggle Button Container */}
      <section
        className={`bg-white fixed top-0 left-0 h-screen mt-20 border-r border-gray-100 flex flex-col items-start py-8 w-[240px] z-40 shadow-2xl 2xl:shadow-none transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Toggle Button - Sidebar এর সাথে ফিক্সড এবং স্মুথ */}
        <button
          onClick={toggleSidebar}
          className="absolute top-6 -right-10 p-2 bg-black text-white border-2 border-red-600 rounded-r-md shadow-lg transition-all duration-300 hover:bg-red-600 hover:scale-105 active:scale-90 flex items-center justify-center"
        >
          {isSidebarOpen ? (
            <IoIosArrowBack size={20} />
          ) : (
            <IoIosArrowForward size={20} />
          )}
        </button>

        {/* Header inside Sidebar */}
        <div className="px-6 mb-10 w-full overflow-hidden">
          <p className="text-[10px] font-black text-red-600 tracking-[0.4em] uppercase opacity-60">
            Admin Panel
          </p>
        </div>

        {/* Navigation Links */}
        <ul className="flex flex-col w-full space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.to} className="w-full">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-4 py-3.5 px-4 w-full transition-all duration-300 ease-in-out group relative ${
                    isActive
                      ? "text-black bg-gray-50 border-r-4 border-red-600"
                      : "text-gray-400 hover:text-black hover:bg-gray-50"
                  }`
                }
              >
                <span className="text-xl transition-transform duration-300 group-hover:scale-110 group-active:scale-90">
                  {item.icon}
                </span>
                <span className="text-[12px] font-bold tracking-[0.1em] uppercase">
                  {item.label}
                </span>

                {/* Hover Background - Smooth Slide */}
                <div className="absolute inset-0 bg-red-600/5 origin-left transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -z-10" />
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Footer info */}
        <div className="mt-auto px-6 py-12 w-full text-center opacity-40">
          <p className="text-[8px] font-bold tracking-[0.3em] uppercase">
            AriX GeaR v2.0
          </p>
        </div>
      </section>

      {/* Overlay - Background Blur with Smooth Fade */}
      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity duration-500 2xl:hidden ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
    </div>
  );
};

export default AdminMenu;
