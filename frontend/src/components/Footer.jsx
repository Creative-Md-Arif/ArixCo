/* eslint-disable react/prop-types */
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa6";
import { MdOutlineEmail, MdLocationOn } from "react-icons/md";
import { IoCallOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import FooterBottom from "./FooterBottom";
import Whatsapp from "./Whatsapp";

/* ─── Background: pure white + ultra-subtle neutral top glow ─── */
const FOOTER_BG = {
  backgroundColor: "#FFFFFF",
  backgroundImage: `
    radial-gradient(ellipse 80% 30% at 50% 0%, #F9FAFB 0%, transparent 80%),
    linear-gradient(180deg, #F9FAFB03 0%, transparent 40%)
  `,
};

/* ─── data ───────────────────────────────────────────────── */
const LINKS = {
  shop: [
    { name: "All Products", path: "/shop" },
    { name: "New Arrivals", path: "/shop" },
    { name: "Best Sellers", path: "/shop" },
    { name: "Discounted Items", path: "/shop" },
    { name: "Categories", path: "/shop" },
  ],
  support: [
    { name: "Help Center", path: "#" },
    { name: "Track Order", path: "#" },
    { name: "Returns & Refunds", path: "#" },
    { name: "Shipping Info", path: "#" },
    { name: "FAQ", path: "#" },
  ],
  company: [
    { name: "About Us", path: "/about" },
    { name: "Careers", path: "#" },
    { name: "Press", path: "#" },
    { name: "Terms of Service", path: "#" },
    { name: "Privacy Policy", path: "#" },
  ],
};

const SOCIAL = [
  { Icon: FaFacebook, href: "#", label: "Facebook" },
  { Icon: FaInstagram, href: "#", label: "Instagram" },
  { Icon: FaYoutube, href: "#", label: "YouTube" },
  { Icon: FaTwitter, href: "#", label: "Twitter" },
  { Icon: FaLinkedin, href: "#", label: "LinkedIn" },
];

const CONTACT = [
  {
    Icon: MdOutlineEmail,
    text: "support@arixgear.com",
    href: "mailto:support@arixgear.com",
  },
  { Icon: IoCallOutline, text: "+880 17100000000", href: "tel:+8801710000000" },
  { Icon: MdLocationOn, text: "Dhaka, Bangladesh", href: "#" },
];

const TRUST = [
  {
    label: "Secure Payment",
    bg: "bg-gray-50",
    color: "text-[#B88E2F]",
    path: "M5 13l4 4L19 7",
  },
  {
    label: "24/7 Support",
    bg: "bg-blue-50",
    color: "text-blue-700",
    path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    label: "Quality Guarantee",
    bg: "bg-gray-50",
    color: "text-[#B88E2F]",
    path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
];

/* ─── Section heading ────────────────────────────────────── */
const Heading = ({ children }) => (
  <h3 className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4 border-l-2 border-[#B88E2F] pl-2.5">
    {children}
  </h3>
);

/* ─── Footer ─────────────────────────────────────────────── */
const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Thank you for subscribing!");
  };

  return (
    <footer className="border-t border-gray-200 font-figtree" style={FOOTER_BG}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* ── Brand + Newsletter ── */}
          <motion.div
            className="col-span-2 lg:col-span-4 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
          >
            <Logo />
            <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed max-w-xs">
              Your trusted destination for premium quality products. We deliver
              excellence with every order, ensuring customer satisfaction
              through innovation and reliability.
            </p>

            {/* Newsletter */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-[10px] sm:text-[11px] font-black text-gray-900 uppercase tracking-[0.18em] mb-1">
                Newsletter
              </h4>
              <p className="text-[9px] sm:text-[10px] text-gray-500 mb-3">
                Get exclusive deals and updates
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  required
                  className="
                    flex-1 min-w-0 px-3 py-2
                    text-[11px] text-gray-700
                    border border-gray-200 rounded
                    focus:outline-none focus:border-[#B88E2F] focus:ring-1 focus:ring-[#B88E2F]/20
                    transition-colors placeholder:text-gray-400 bg-white
                  "
                />
                <button
                  type="submit"
                  className="
                    px-3 py-2 shrink-0
                    bg-[#B88E2F] text-white
                    text-[10px] font-black uppercase tracking-widest
                    rounded hover:bg-[#9E7A26]
                    transition-colors duration-200
                  "
                >
                  Join
                </button>
              </form>
            </div>
          </motion.div>

          {/* ── Shop ── */}
          <motion.div
            className="col-span-1 lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.08 }}
          >
            <Heading>Shop</Heading>
            <ul className="space-y-2.5">
              {LINKS.shop.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-[11px] sm:text-xs text-gray-600 hover:text-[#B88E2F] transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Support ── */}
          <motion.div
            className="col-span-1 lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.13 }}
          >
            <Heading>Support</Heading>
            <ul className="space-y-2.5">
              {LINKS.support.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-[11px] sm:text-xs text-gray-600 hover:text-[#B88E2F] transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Company ── */}
          <motion.div
            className="col-span-1 lg:col-span-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.18 }}
          >
            <Heading>Company</Heading>
            <ul className="space-y-2.5">
              {LINKS.company.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.path}
                    className="text-[11px] sm:text-xs text-gray-600 hover:text-[#B88E2F] transition-colors duration-150"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Contact + Social ── */}
          <motion.div
            className="col-span-2 sm:col-span-1 lg:col-span-2 space-y-4"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.22 }}
          >
            <div>
              <Heading>Contact</Heading>
              <ul className="space-y-2.5">
                {CONTACT.map(({ Icon, text, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="flex items-start gap-2 text-gray-600 hover:text-[#B88E2F] transition-colors duration-150 group"
                    >
                      <Icon
                        className="w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] shrink-0 mt-[1px]"
                        aria-hidden="true"
                      />
                      <span className="text-[11px] sm:text-xs leading-snug">
                        {text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <p className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-2.5">
                Follow Us
              </p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="
                      w-7 h-7 sm:w-8 sm:h-8
                      flex items-center justify-center
                      border border-gray-200 rounded
                      text-gray-500 hover:text-[#B88E2F] hover:border-[#B88E2F]
                      transition-colors duration-200
                    "
                  >
                    <Icon
                      className="w-[12px] h-[12px] sm:w-[13px] sm:h-[13px] shrink-0"
                      aria-hidden="true"
                    />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom bar — trust + payment ── */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.28 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Trust badges */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {TRUST.map(({ label, bg, color, path }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded ${bg} flex items-center justify-center shrink-0`}
                  >
                    <svg
                      className={`w-3 h-3 ${color}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={path}
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div
              className="flex items-center gap-2"
              aria-label="Accepted payment methods"
            >
              {["VISA", "MC", "AMEX", "bKash"].map((method) => (
                <div
                  key={method}
                  className="w-10 h-6 sm:w-11 sm:h-7 bg-gray-50 border border-gray-200 rounded flex items-center justify-center"
                >
                  <span className="text-[8px] sm:text-[9px] font-black text-gray-700 tracking-tight">
                    {method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <Whatsapp />
      <FooterBottom />
    </footer>
  );
};

export default Footer;
