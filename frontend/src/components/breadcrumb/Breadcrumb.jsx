/* eslint-disable react/prop-types */
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolder,
  FaFolderOpen,
  FaShoppingCart,
  FaUser,
  FaBox,
  FaStore,
  FaTag,
  FaCog,
  FaHeart,
  FaClipboardList,
} from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";

/**
 * ══════════════════════════════════════════════
 *  Universal Breadcrumb — Premium Minimal Design
 * ══════════════════════════════════════════════
 */

// ─── Page icon map ─────────────────────────────────────────────────────────────
const PAGE_ICONS = {
  shop: <FaStore className="text-[11px] opacity-70" />,
  cart: <FaShoppingCart className="text-[11px] opacity-70" />,
  profile: <FaUser className="text-[11px] opacity-70" />,
  account: <FaUser className="text-[11px] opacity-70" />,
  orders: <FaClipboardList className="text-[11px] opacity-70" />,
  order: <FaBox className="text-[11px] opacity-70" />,
  products: <FaTag className="text-[11px] opacity-70" />,
  product: <FaTag className="text-[11px] opacity-70" />,
  wishlist: <FaHeart className="text-[11px] opacity-70" />,
  settings: <FaCog className="text-[11px] opacity-70" />,
  admin: <FaCog className="text-[11px] opacity-70" />,
};

// ─── Auto-generate crumbs from current URL ─────────────────────────────────────
const useAutoItems = () => {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = decodeURIComponent(seg)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      label,
      href: isLast ? undefined : href,
      _icon: PAGE_ICONS[seg.toLowerCase()] ?? null,
    };
  });
};

// ─── Single crumb renderer ─────────────────────────────────────────────────────
const Crumb = ({ crumb }) => {
  const isCategory = crumb.type === "category";
  const isLeaf = crumb.isLeaf;
  const isActive = !crumb.href;

  // Current page — non-clickable chip
  if (isActive) {
    return (
      <span className="text-[#B88E2F] font-bold truncate max-w-[200px] px-2.5 py-1 bg-[#B88E2F]/10 rounded-md text-[12px]">
        {crumb.label}
      </span>
    );
  }

  // Category link — folder icon style
  if (isCategory) {
    return (
      <Link
        to={crumb.href}
        className={`flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md text-[12px] ${
          isLeaf
            ? "text-[#B88E2F] hover:text-[#9a7828] hover:bg-[#B88E2F]/10 font-semibold"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-medium"
        }`}
      >
        {isLeaf ? (
          <FaFolder className="text-[10px] flex-shrink-0" />
        ) : (
          <FaFolderOpen className="text-[10px] flex-shrink-0" />
        )}
        <span className="truncate max-w-[110px]">{crumb.label}</span>
      </Link>
    );
  }

  // Regular page link
  return (
    <Link
      to={crumb.href}
      className="flex items-center gap-1.5 text-gray-500 hover:text-[#B88E2F] transition-colors px-2 py-1 rounded-md hover:bg-gray-50 text-[12px] font-medium"
    >
      {crumb._icon}
      <span>{crumb.label}</span>
    </Link>
  );
};

// ─── Breadcrumb wrapper ────────────────────────────────────────────────────────
const Breadcrumb = ({ items, className = "" }) => {
  const autoItems = useAutoItems();
  const crumbs = items ?? autoItems;

  if (!crumbs.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex container mx-auto items-center gap-1.5 text-[12px] font-medium flex-wrap py-4 px-6 bg-gray-50/50 border-b border-gray-100 ${className}`}
    >
      <Link
        to="/"
        className="flex items-center gap-1.5 text-gray-500 hover:text-[#B88E2F] transition-colors px-2 py-1 rounded-md hover:bg-white"
      >
        <FaHome className="text-[11px]" />
        <span>Home</span>
      </Link>

      {crumbs.map((crumb, index) => (
        <span key={index} className="contents">
          <HiChevronRight className="text-[12px] text-gray-300 flex-shrink-0" />
          <Crumb crumb={crumb} />
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
