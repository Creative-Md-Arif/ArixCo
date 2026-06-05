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

const STATIC_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
];

const MOBILE_MENU_SECTIONS = [
  { to: "/", icon: <SlHome size={18} />, label: "Home" },
  { to: "/shop", icon: <CiShop size={20} />, label: "Shop" },
  { to: "/cart", icon: null, label: "My Cart", renderIcon: "cart" },
  { to: "/favorite", icon: null, label: "Wishlist", renderIcon: "favorite" },
];

const Navigation = ({ isMenuOpen, setIsMenuOpen }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const cartItemsCount = useSelector(
    (state) => state.cart?.cartItems?.length ?? 0
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [tabOpen, setTabOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mobileOpenCatId, setMobileOpenCatId] = useState(null);
  const [logoutApiCall] = useLogoutMutation();
  const sidebarRef = useRef(null);

  const { data: categories, isLoading: categoriesLoading } = useFetchCategoriesQuery();

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
    [location.pathname]
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
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* ── Fixed Header ── */}
      <header
        className={`fixed top-0 left-0 w-full z-[1000] bg-[#1A1A1A] transition-shadow duration-300 ${
          scrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.4)]" : ""
        }`}
      >
        <div className="container mx-auto flex items-center justify-between h-[50px] sm:h-[56px] md:h-[60px] lg:h-[64px] relative">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex-shrink-0 scale-90 sm:scale-100 origin-left z-10"
          >
            <Logo />
          </Link>

          {/* Desktop Links & Mega Menu */}
          <ul className="hidden md:flex items-center gap-1 lg:gap-2 h-full">
            {STATIC_NAV_LINKS.map((link) => (
              <li key={link.to} className="h-full flex items-center">
                <Link
                  to={link.to}
                  className={`relative px-2 py-1 lg:px-3 text-[10px] lg:text-[11px] font-extrabold tracking-[0.12em] lg:tracking-[0.14em] uppercase rounded transition-colors ${
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

            {/* Dynamic Category Links - Image Removed */}
            {!categoriesLoading &&
              categories?.map((cat) => (
                <li key={cat._id} className="h-full flex items-center group relative">
                  <Link
                    to={`/shop?category=${cat._id}`}
                    className={`relative px-2 py-1 lg:px-3 text-[10px] lg:text-[11px] font-extrabold tracking-[0.12em] lg:tracking-[0.14em] uppercase rounded transition-colors flex items-center gap-1 ${
                      isActive(`/shop?category=${cat._id}`)
                        ? "text-[#D4A843]"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat.name}
                    {cat.children?.length > 0 && (
                      <IoChevronDownOutline size={10} className="mt-0.5 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>

                  {/* ── MEGA MENU DROPDOWN (Without Image) ── */}
                  {cat.children?.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-screen max-w-7xl bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 mt-0 rounded-b-lg border-t-2 border-[#D4A843] z-50">
                      <div className="container mx-auto p-8 grid grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-6">
                        {cat.children.map((subCat) => (
                          <div key={subCat._id}>
                            <Link
                              to={`/shop?category=${subCat._id}`}
                              className="text-[12px] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-200 pb-2 mb-3 block hover:text-[#D4A843] transition-colors"
                            >
                              {subCat.name}
                            </Link>
                            {subCat.children?.length > 0 && (
                              <ul className="space-y-2 mt-3">
                                {subCat.children.map((subSubCat) => (
                                  <li key={subSubCat._id}>
                                    <Link
                                      to={`/shop?category=${subSubCat._id}`}
                                      className="text-[13px] text-gray-600 hover:text-[#D4A843] transition-colors font-medium"
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
              ))}
          </ul>

          {/* Actions (Right Side) */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 z-10">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="relative group block p-1"
            >
              <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full transition-all duration-300 group-hover:bg-white/10">
                <IoSearchOutline className="text-gray-400 group-hover:text-[#D4A843] transition-colors" size={18} />
              </div>
            </button>

            <div className="scale-90 sm:scale-100 text-gray-300 hover:text-[#D4A843] transition-colors">
              <FavoriteIcon onClick={handleNavClick} />
            </div>
            <div className="scale-90 sm:scale-100 text-gray-300 hover:text-[#D4A843] transition-colors">
              <CartIcon cartCount={cartItemsCount} onClick={handleNavClick} />
            </div>
            {userInfo && (
              <div className="scale-90 sm:scale-100 text-gray-300 hover:text-[#D4A843] transition-colors">
                <NotificationBell />
              </div>
            )}

            {userInfo ? (
              <div className="relative">
                <button
                  className="profile-btn flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/10 border border-white/10 rounded-md hover:border-[#D4A843] transition-colors text-white"
                  onClick={toggleTab}
                >
                  <span className="hidden sm:block text-[10px] lg:text-[11px] font-extrabold text-gray-200 max-w-[70px] lg:max-w-[90px] truncate">
                    {userInfo.username}
                  </span>
                  <CiUser size={15} className="text-[#D4A843]" />
                </button>

                <div
                  className={`dropdown-menu absolute top-full right-0 mt-2 w-48 sm:w-52 bg-[#252525] border border-white/10 rounded-lg shadow-2xl overflow-hidden transition-all duration-200 ${
                    tabOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                  }`}
                >
                  <div className="p-3 bg-[#2A2A2A] border-b border-white/10">
                    <span className="block text-[11px] font-black text-white">{userInfo.username}</span>
                    <span className="block text-[9px] text-gray-400 truncate">{userInfo.email}</span>
                  </div>
                  <div className="p-1.5">
                    {userInfo.isAdmin && (
                      <Link to="/admin/dashboard" onClick={handleNavClick} className="flex items-center gap-2 p-2 rounded-md text-[10px] sm:text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-[#D4A843]">
                        <MdOutlineDashboard size={14} /> <span>Dashboard</span>
                      </Link>
                    )}
                    <Link to="/profile" onClick={handleNavClick} className="flex items-center gap-2 p-2 rounded-md text-[10px] sm:text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-[#D4A843]">
                      <CgProfile size={14} /> <span>Profile</span>
                    </Link>
                    <Link to="/user-orders" onClick={handleNavClick} className="flex items-center gap-2 p-2 rounded-md text-[10px] sm:text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-[#D4A843]">
                      <LiaClipboardListSolid size={14} /> <span>My Orders</span>
                    </Link>
                  </div>
                  <div className="p-1.5 border-t border-white/10">
                    <button onClick={logoutHandler} className="flex items-center gap-2 w-full p-2 rounded-md text-[10px] sm:text-[11px] font-bold text-red-400 hover:bg-red-900/20">
                      <IoIosLogOut size={14} /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] lg:text-[11px] font-extrabold tracking-wider uppercase text-[#D4A843] border border-[#D4A843] rounded-md hover:bg-[#D4A843] hover:text-[#1A1A1A] transition-colors"
              >
                Login
              </Link>
            )}

            {/* Hamburger */}
            <button
              className="flex flex-col justify-center gap-[5px] w-9 h-9 sm:w-10 sm:h-10 p-2 border border-white/10 rounded-md md:hidden hover:border-[#D4A843] transition-all"
              onClick={toggleMenu}
            >
              <span className={`block h-[1.5px] w-full bg-gray-300 rounded transition-all ${isMenuOpen ? "translate-y-[6.5px] rotate-45 !bg-[#D4A843]" : ""}`}></span>
              <span className={`block h-[1.5px] w-full bg-gray-300 rounded transition-all ${isMenuOpen ? "opacity-0 w-0" : ""}`}></span>
              <span className={`block h-[1.5px] w-full bg-gray-300 rounded transition-all ${isMenuOpen ? "-translate-y-[6.5px] -rotate-45 !bg-[#D4A843]" : ""}`}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going under the fixed navbar */}
      <div className="h-[50px] sm:h-[56px] md:h-[60px] lg:h-[64px]"></div>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeAll}
      />

      {/* ── Mobile Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-[1200] w-[85vw] sm:w-[300px] bg-[#1A1A1A] border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col overflow-y-auto ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        ref={sidebarRef}
      >
        <div className="p-4 border-b border-white/10 bg-[#252525]">
          <Logo />
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <ul>
            {MOBILE_MENU_SECTIONS.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 p-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors min-h-[44px] ${
                    isActive(item.to)
                      ? "bg-white/10 text-[#D4A843] border-l-2 border-[#D4A843]"
                      : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.renderIcon === "cart" ? (
                    <CartIcon cartCount={cartItemsCount} />
                  ) : item.renderIcon === "favorite" ? (
                    <FavoriteIcon />
                  ) : (
                    item.icon
                  )}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}

            <li className="mt-4 border-t border-white/10 pt-4">
              <p className="px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500 mb-2">
                Categories
              </p>
            </li>
            {!categoriesLoading &&
              categories?.map((cat) => (
                <li key={cat._id}>
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors min-h-[44px] cursor-pointer ${
                      mobileOpenCatId === cat._id
                        ? "bg-white/10 text-[#D4A843]"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                    onClick={() =>
                      setMobileOpenCatId(mobileOpenCatId === cat._id ? null : cat._id)
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
                        mobileOpenCatId === cat._id ? "max-h-[1000px]" : "max-h-0"
                      }`}
                    >
                      <ul className="pl-4 py-1 space-y-1">
                        {cat.children.map((subCat) => (
                          <React.Fragment key={subCat._id}>
                            <li>
                              <Link
                                to={`/shop?category=${subCat._id}`}
                                onClick={handleNavClick}
                                className="block p-2.5 rounded-md text-[11px] font-bold text-gray-400 hover:bg-white/10 hover:text-[#D4A843] min-h-[40px]"
                              >
                                {subCat.name}
                              </Link>
                            </li>
                            {subCat.children?.map((subSubCat) => (
                              <li key={subSubCat._id}>
                                <Link
                                  to={`/shop?category=${subSubCat._id}`}
                                  onClick={handleNavClick}
                                  className="block pl-4 p-2 rounded-md text-[10px] font-medium text-gray-500 hover:bg-white/10 hover:text-white min-h-[36px]"
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
              ))}
          </ul>
        </nav>

        <div className="p-2 border-t border-white/10">
          {userInfo ? (
            <div>
              <button
                className="flex items-center gap-3 w-full p-3 bg-white/5 border border-white/10 rounded-lg min-h-[44px] text-white"
                onClick={toggleTab}
              >
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#B88E2F] to-[#D4A843] flex items-center justify-center text-white flex-shrink-0">
                  <CiUser size={15} />
                </span>
                <span className="flex-1 text-left text-[12px] font-extrabold text-gray-200 truncate">
                  {userInfo.username}
                </span>
                <span className={`text-[8px] text-gray-400 transition-transform ${tabOpen ? "rotate-180" : ""}`}>
                  &#9660;
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${tabOpen ? "max-h-[300px] mt-2" : "max-h-0"}`}>
                <ul className="pl-4 space-y-1">
                  {userInfo.isAdmin && (
                    <li>
                      <Link to="/admin/dashboard" onClick={handleNavClick} className="flex items-center gap-2 p-2.5 rounded-md text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-[#D4A843] min-h-[40px]">
                        <MdOutlineDashboard size={13} /> <span>Dashboard</span>
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/profile" onClick={handleNavClick} className="flex items-center gap-2 p-2.5 rounded-md text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-[#D4A843] min-h-[40px]">
                      <CgProfile size={13} /> <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/user-orders" onClick={handleNavClick} className="flex items-center gap-2 p-2.5 rounded-md text-[11px] font-bold text-gray-300 hover:bg-white/10 hover:text-[#D4A843] min-h-[40px]">
                      <LiaClipboardListSolid size={13} /> <span>My Orders</span>
                    </Link>
                  </li>
                  <li>
                    <button onClick={logoutHandler} className="flex items-center gap-2 w-full p-2.5 rounded-md text-[11px] font-bold text-red-400 hover:bg-red-900/20 min-h-[40px]">
                      <IoIosLogOut size={13} /> <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/login" onClick={handleNavClick} className="block text-center p-2.5 border border-[#D4A843] text-[#D4A843] rounded-lg text-[12px] font-extrabold uppercase tracking-wider hover:bg-[#D4A843] hover:text-[#1A1A1A] transition-colors">
                Login
              </Link>
              <Link to="/register" onClick={handleNavClick} className="block text-center p-2.5 bg-gradient-to-r from-[#B88E2F] to-[#D4A843] text-white rounded-lg text-[12px] font-extrabold uppercase tracking-wider hover:opacity-90 transition-opacity">
                Register
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ── Search Overlay ── */}
      <SearchOverlay open={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navigation;