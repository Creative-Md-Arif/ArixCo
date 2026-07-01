/* eslint-disable react/prop-types */
import { useEffect, useState, useCallback, useRef } from "react";
import { SlHome } from "react-icons/sl";
import { MdOutlineDashboard } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import { LiaClipboardListSolid } from "react-icons/lia";
import { IoIosLogOut } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "@redux/api/usersApiSlice";
import { logout } from "@redux/features/auth/authSlice";
import { CiShop, CiUser } from "react-icons/ci";
import NotificationBell from "../../components/NotificationBell";
import Logo from "../../components/Logo";
import CartIcon from "../../components/CartIcon";
import FavoriteIcon from "../../components/FavoriteIcon";
import SearchOverlay from "../Auth/SearchOverlay";
import { useFetchCategoriesQuery } from "@redux/api/categoryApiSlice";
import React from "react";
import { IoChevronDownOutline } from "react-icons/io5";
import { toggleCartSidebar } from "@redux/features/cart/cartSlice";

const STATIC_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
];

const MOBILE_MENU_SECTIONS = [
  { to: "/", icon: <SlHome size={18} />, label: "Home" },
  { to: "/shop", icon: <CiShop size={18} />, label: "Shop" },
];

const Navigation = ({ isMenuOpen, setIsMenuOpen }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(
    (state) => state.cart?.cartItems?.length ?? 0,
  );
  const isCartOpen = useSelector((state) => state.cart?.isCartOpen ?? false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabOpen, setTabOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpenCatId, setMobileOpenCatId] = useState(null);
  const [logoutApiCall] = useLogoutMutation();
  const sidebarRef = useRef(null);

  const { data: categories, isLoading: categoriesLoading } =
    useFetchCategoriesQuery();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = useCallback(
    (path) => {
      if (path === "/") return location.pathname === "/";
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  const closeAll = useCallback(() => {
    setIsMenuOpen(false);
    setTabOpen(false);
    setMobileOpenCatId(null);
  }, [setIsMenuOpen]);

  const handleNavClick = useCallback(() => closeAll(), [closeAll]);
  const toggleMenu = useCallback(() => {
    setIsMenuOpen((p) => !p);
    setTabOpen(false);
  }, [setIsMenuOpen]);

  const toggleTab = useCallback((e) => {
    e.stopPropagation();
    setTabOpen((p) => !p);
  }, []);

  const logoutHandler = useCallback(async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
      closeAll();
    } catch (err) {
      console.error(err);
    }
  }, [logoutApiCall, dispatch, navigate, closeAll]);

  useEffect(() => {
    setTabOpen(false);
    setMobileOpenCatId(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!tabOpen) return;
    const handle = (e) => {
      const d = document.querySelector(".dropdown-menu");
      const t = document.querySelector(".profile-btn");
      if (d && t && !d.contains(e.target) && !t.contains(e.target))
        setTabOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [tabOpen]);

  useEffect(() => {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const headerEl = document.getElementById("main-header-nav");

    if (isMenuOpen || isCartOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (headerEl) headerEl.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (headerEl) headerEl.style.paddingRight = "0px";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      if (headerEl) headerEl.style.paddingRight = "0px";
    };
  }, [isMenuOpen, isCartOpen]);

  return (
    <>
      {/* ── Fixed Header ── */}
      <header
        id="main-header-nav"
        className={`fixed top-0 left-0 w-full z-[1000] py-3 bg-[#1A1A1A] transition-all duration-300 ${
          scrolled ? "lg:bg-[#1A1A1A]/95 lg:backdrop-blur-md" : ""
        }`}
      >
        <div className="container mx-auto h-14 sm:h-16 lg:h-[68px] relative px-4">
          {/* ── MOBILE/TABLET BAR (white bg — matches reference image, shows up to lg) ── */}
          <div className="flex lg:hidden items-center justify-between h-full">
            <div className="flex items-center gap-5">
              <button
                className="relative flex flex-col items-center justify-center gap-[6px] w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 hover:bg-white group"
                onClick={toggleMenu}
                aria-label="Toggle Menu"
              >
                <span
                  className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 ease-in-out group-hover:bg-[#D4A843] ${
                    isMenuOpen
                      ? "translate-y-[7.5px] rotate-45 !bg-[#D4A843]"
                      : ""
                  }`}
                ></span>
                <span
                  className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 ease-in-out group-hover:bg-[#D4A843] ${
                    isMenuOpen ? "opacity-0 translate-x-2" : ""
                  }`}
                ></span>
                <span
                  className={`block h-[1.5px] w-5 rounded-full bg-white transition-all duration-300 ease-in-out group-hover:bg-[#D4A843] ${
                    isMenuOpen
                      ? "-translate-y-[7.5px] -rotate-45 !bg-[#D4A843]"
                      : ""
                  }`}
                ></span>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="relative group block"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ">
                  <IoSearchOutline
                    className="text-white group-hover:text-[#D4A843] transition-colors"
                    size={17}
                  />
                </div>
              </button>
            </div>
            {/* Hamburger — pinned left */}

            {/* Search + Logo + User + Cart — clustered together */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Search */}

              {/* Logo — centered between search & user/cart */}
              <Link
                to="/"
                onClick={handleNavClick}
                className="flex-shrink-0 scale-90 origin-center"
              >
                <Logo />
              </Link>

              {/* User */}
            </div>

            <div className="flex items-center gap-5">
              <Link
                to={userInfo ? "/profile" : "/login"}
                onClick={handleNavClick}
                className="relative group block"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 group-hover:bg-black/5">
                  <CiUser
                    className="text-white group-hover:text-[#D4A843] transition-colors"
                    size={17}
                  />
                </div>
              </Link>

              <div
                onClick={() => dispatch(toggleCartSidebar(true))}
                className="cursor-pointer"
              >
                <CartIcon cartCount={cartItemsCount} />
              </div>
            </div>
            {/* Cart — pinned right */}
          </div>

          {/* ── DESKTOP BAR (dark theme — shows from lg) ── */}
          <div className="hidden lg:flex items-center justify-between h-full">
            {/* Logo */}
            <Link
              to="/"
              onClick={handleNavClick}
              className="flex-shrink-0 z-10"
            >
              <Logo />
            </Link>

            {/* Desktop Links & Mega Menu */}
            <ul className="flex items-center gap-1 lg:gap-2 h-full">
              {STATIC_NAV_LINKS.map((link) => (
                <li key={link.to} className="h-full flex items-center">
                  <Link
                    to={link.to}
                    className={`relative px-2 py-1 lg:px-3 text-[14px] font-trebuchet text-white font-semibold tracking-px uppercase rounded transition-colors whitespace-nowrap ${
                      isActive(link.to)
                        ? "text-[#D4A843]"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                    {isActive(link.to) && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#D4A843] rounded-full"></span>
                    )}
                  </Link>
                </li>
              ))}

              {categoriesLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <li
                      key={`skel-top-${i}`}
                      className="h-full flex items-center group relative"
                    >
                      <div className="relative px-2 py-1 lg:px-3 flex items-center gap-1 whitespace-nowrap">
                        <div className="w-16 lg:w-20 h-3 bg-white/20 animate-pulse rounded"></div>
                        <div className="w-2 h-2 bg-white/20 animate-pulse rounded-full"></div>
                      </div>
                      <div className="fixed top-14 sm:top-16 lg:top-[68px] left-0 right-0 w-full bg-white border-t border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="container mx-auto p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
                          {[1, 2, 3, 4].map((j) => (
                            <div key={`skel-mega-${j}`} className="space-y-3">
                              <div className="w-24 h-3 bg-gray-200 animate-pulse rounded"></div>
                              <div className="space-y-2 pt-2">
                                <div className="w-full h-2 bg-gray-100 animate-pulse rounded"></div>
                                <div className="w-3/4 h-2 bg-gray-100 animate-pulse rounded"></div>
                                <div className="w-5/6 h-2 bg-gray-100 animate-pulse rounded"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                categories?.map((cat) => (
                  <li
                    key={cat._id}
                    className="h-full flex items-center group relative"
                  >
                    <Link
                      to={`/shop?category=${cat._id}`}
                      className={`relative px-2 py-1 lg:px-3 font-trebuchet text-[14px] font-semibold uppercase tracking-px rounded transition-colors flex items-center gap-1 whitespace-nowrap ${
                        isActive(`/shop?category=${cat._id}`)
                          ? "text-[#D4A843]"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {cat.name}
                      {cat.children?.length > 0 && (
                        <IoChevronDownOutline
                          size={10}
                          className="mt-0.5 transition-transform duration-200 group-hover:rotate-180"
                        />
                      )}
                    </Link>

                    {cat.children?.length > 0 && (
                      <div className="fixed top-14 sm:top-16 lg:top-[90px] left-0 right-0 w-full bg-white border-t-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="container mx-auto p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-6">
                          {cat.children.map((subCat) => (
                            <div key={subCat._id}>
                              <Link
                                to={`/shop?category=${subCat._id}`}
                                className="text-[14px] font-trebuchet font-medium uppercase tracking-px text-gray-900 border-b border-gray-200 pb-2 mb-3 block"
                              >
                                {subCat.name}
                              </Link>
                              {subCat.children?.length > 0 && (
                                <ul className="space-y-2 mt-3">
                                  {subCat.children.map((subSubCat) => (
                                    <li key={subSubCat._id}>
                                      <Link
                                        to={`/shop?category=${subSubCat._id}`}
                                        className="text-[14px] text-gray-700 font-trebuchet tracking-px font-normal hover:text-black hover:underline transition-colors"
                                      >
                                        {subSubCat.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>

            {/* Desktop Actions */}
            <div className="flex items-center z-10">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="relative group block p-0.5 sm:p-1"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 group-hover:bg-white/10">
                  <IoSearchOutline
                    className="text-gray-400 group-hover:text-[#D4A843] transition-colors"
                    size={17}
                  />
                </div>
              </button>

              <div className="text-gray-300 hover:text-[#D4A843] transition-colors">
                <FavoriteIcon onClick={handleNavClick} />
              </div>
              <div
                onClick={() => dispatch(toggleCartSidebar(true))}
                className="cursor-pointer"
              >
                <CartIcon cartCount={cartItemsCount} />
              </div>
              {userInfo && (
                <div className="text-gray-300 hover:text-[#D4A843] transition-colors">
                  <NotificationBell />
                </div>
              )}

              {userInfo ? (
                <div className="relative">
                  <button
                    className="profile-btn flex items-center ml-2 px-2 py-1 bg-white/10 border border-white/10 rounded-md hover:border-[#D4A843] transition-colors text-white"
                    onClick={toggleTab}
                  >
                    <CiUser size={17} className="text-[#D4A843]" />
                  </button>

                  <div
                    className={`dropdown-menu absolute top-full right-0 mt-2 w-44 sm:w-52 bg-[#252525] border border-white/10 rounded-lg overflow-hidden transition-all duration-200 ${
                      tabOpen
                        ? "opacity-100 visible translate-y-0"
                        : "opacity-0 invisible -translate-y-2"
                    }`}
                  >
                    <div className="p-3 bg-[#2A2A2A] border-b border-white/10">
                      <span className="block font-poppins text-sm font-medium tracking-px text-white">
                        {userInfo.username}
                      </span>
                      <span className="block font-poppins text-xs font-medium tracking-px text-gray-400 truncate">
                        {userInfo.email}
                      </span>
                    </div>
                    <div className="p-1.5">
                      {userInfo.isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={handleNavClick}
                          className="flex items-center gap-2 p-2 rounded-md font-poppins text-sm font-medium tracking-px text-white hover:bg-white/10 hover:text-[#D4A843]"
                        >
                          <MdOutlineDashboard size={14} />{" "}
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 p-2 rounded-md font-poppins text-sm font-medium tracking-px text-white hover:bg-white/10 hover:text-[#D4A843]"
                      >
                        <CgProfile size={14} /> <span>Profile</span>
                      </Link>
                      <Link
                        to="/user-orders"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 p-2 rounded-md font-poppins text-sm font-medium tracking-px text-white hover:bg-white/10 hover:text-[#D4A843]"
                      >
                        <LiaClipboardListSolid size={14} />{" "}
                        <span>My Orders</span>
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-white/10">
                      <button
                        onClick={logoutHandler}
                        className="flex items-center gap-2 w-full p-2 rounded-md font-poppins text-sm font-medium tracking-px text-red-400 hover:bg-red-900/20"
                      >
                        <IoIosLogOut size={14} /> <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className="px-2 py-1 sm:px-3 sm:py-1.5 ml-2 text-[14px] font-poppins font-medium tracking-px uppercase text-[#D4A843] border border-[#D4A843] rounded-md hover:bg-[#D4A843] hover:text-[#1A1A1A] transition-colors whitespace-nowrap"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14 sm:h-16 lg:h-[68px]"></div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeAll}
      />

      {/* ── Mobile Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[1200] w-[80vw] sm:w-[300px] bg-[#1A1A1A] border-r border-white/10 transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        ref={sidebarRef}
      >
        <div className="p-3 sm:p-4 border-b border-white/10 bg-[#252525]">
          <Logo />
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <ul>
            {MOBILE_MENU_SECTIONS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 p-2 rounded-lg text-[14px] font-normal font-trebuchet tracking-px text-white uppercase transition-colors min-h-[40px] sm:min-h-[44px] ${
                    isActive(item.to)
                      ? "bg-white/10 text-[#D4A843] border-l-2 border-[#D4A843]"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            <li className="mt-3 sm:mt-4 border-t border-white/10 pt-3 sm:pt-4">
              <p className="px-3 text-[12px] font-extrabold font-trebuchet uppercase text-brand/50 mb-2">
                Categories
              </p>
            </li>

            {/* Mobile Category Skeleton Loading */}
            {categoriesLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <li key={`skel-mob-${i}`} className="p-2.5">
                    <div className="flex justify-between items-center">
                      <div className="w-24 h-3 bg-white/20 animate-pulse rounded"></div>
                      <div className="w-3 h-3 bg-white/10 animate-pulse rounded-full"></div>
                    </div>
                  </li>
                ))}
              </>
            ) : (
              categories?.map((cat) => (
                <li key={cat._id}>
                  <div
                    className={`flex items-center justify-between p-2.5 sm:p-3 rounded-lg font-trebuchet text-[14px] font-semibold text-white tracking-px uppercase transition-colors min-h-[40px] sm:min-h-[44px] cursor-pointer ${
                      mobileOpenCatId === cat._id
                        ? "bg-white/10 text-[#D4A843]"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() =>
                      setMobileOpenCatId(
                        mobileOpenCatId === cat._id ? null : cat._id,
                      )
                    }
                  >
                    <span>{cat.name}</span>
                    {cat.children?.length > 0 && (
                      <IoChevronDownOutline
                        size={12}
                        className={`transition-transform duration-200 ${
                          mobileOpenCatId === cat._id ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </div>

                  {cat.children?.length > 0 && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${
                        mobileOpenCatId === cat._id
                          ? "max-h-[1000px]"
                          : "max-h-0"
                      }`}
                    >
                      <ul className="pl-4 py-1 space-y-1">
                        {cat.children.map((subCat) => (
                          <React.Fragment key={subCat._id}>
                            <li>
                              <Link
                                to={`/shop?category=${subCat._id}`}
                                onClick={handleNavClick}
                                className="block p-2 sm:p-2.5 rounded-md text-[14px] font-trebuchet font-medium tracking-px text-white hover:bg-white/10 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px]"
                              >
                                {subCat.name}
                              </Link>
                            </li>
                            {subCat.children?.map((subSubCat) => (
                              <li key={subSubCat._id}>
                                <Link
                                  to={`/shop?category=${subSubCat._id}`}
                                  onClick={handleNavClick}
                                  className="block pl-4 p-2 rounded-md text-[14px] font-normal font-trebuchet tracking-px text-gray-400 hover:bg-white/10 hover:text-red-500 min-h-[32px] sm:min-h-[36px]"
                                >
                                  {subSubCat.name}
                                </Link>
                              </li>
                            ))}
                          </React.Fragment>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              ))
            )}
          </ul>
        </nav>

        <div className="p-2 border-t border-white/10 font-poppins">
          {userInfo ? (
            <div>
              <button
                className="flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 bg-white/5 border border-white/10 rounded-lg min-h-[40px] sm:min-h-[44px] text-white hover:bg-white/10 transition-colors"
                onClick={toggleTab}
              >
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#B88E2F] to-[#D4A843] flex items-center justify-center text-white flex-shrink-0">
                  <CiUser size={14} />
                </span>

                <span className="flex-1 text-left text-[14px] font-semibold text-gray-200 tracking-px truncate">
                  {userInfo.username}
                </span>
                <span
                  className={`text-[8px] text-gray-400 transition-transform duration-200 ${tabOpen ? "rotate-180" : ""}`}
                >
                  &#9660;
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${tabOpen ? "max-h-[300px] mt-2" : "max-h-0"}`}
              >
                <ul className="pl-4 space-y-1">
                  {userInfo.isAdmin && (
                    <li>
                      <Link
                        to="/admin/dashboard"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-300 tracking-px hover:bg-white/10 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors"
                      >
                        <MdOutlineDashboard size={14} /> <span>Dashboard</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      to="/profile"
                      onClick={handleNavClick}
                      className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-300 tracking-px hover:bg-white/10 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors"
                    >
                      <CgProfile size={14} /> <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/user-orders"
                      onClick={handleNavClick}
                      className="flex items-center gap-2 p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-gray-300 tracking-px hover:bg-white/10 hover:text-[#D4A843] min-h-[36px] sm:min-h-[40px] transition-colors"
                    >
                      <LiaClipboardListSolid size={14} /> <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 w-full p-2 sm:p-2.5 rounded-md text-[14px] font-medium text-red-400 tracking-px hover:bg-red-950/30 min-h-[36px] sm:min-h-[40px] transition-colors"
                    >
                      <IoIosLogOut size={14} /> <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="block text-center p-2 sm:p-2.5 border border-[#D4A843] text-[#D4A843] rounded-lg text-[14px] font-semibold uppercase tracking-px hover:bg-[#D4A843] hover:text-[#1A1A1A] transition-all"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="block text-center p-2 sm:p-2.5 bg-gradient-to-r from-[#B88E2F] to-[#D4A843] text-white rounded-lg text-[14px] font-semibold uppercase tracking-px hover:opacity-90 transition-all shadow-md shadow-black/10"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Search Overlay ── */}
      <SearchOverlay
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navigation;
